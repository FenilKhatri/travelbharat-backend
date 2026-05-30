import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Blog from "./blog.model.js";
import Comment from "./comment.model.js";
import Like from "./like.model.js";
import SavedBlog from "./savedBlog.model.js";
import Notification from "../notification/notification.model.js";

// Helper to populate author
const populateAuthor = {
    path: "author",
    select: "name username profileImage bio",
};

// ============ PUBLIC ============

export const getAllBlogs = asyncHandler(async (req, res) => {
    const { search, category, tag, stateId, featured, page = 1, limit = ITEMS_PER_PAGE } = req.query;

    const query = { isActive: true, isPublished: true };
    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (stateId) query.stateId = stateId;
    if (featured === "true") query.featured = true;

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate(populateAuthor)
        .populate("stateId", "name slug")
        .sort("-priority -publishedAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-content -travelTips -faqs");

    return successResponse(res, 200, "Blogs fetched", {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const getFeaturedBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ isActive: true, isPublished: true, featured: true })
        .populate(populateAuthor)
        .sort("-priority -publishedAt")
        .limit(6)
        .select("-content -travelTips -faqs");

    return successResponse(res, 200, "Featured blogs fetched", { blogs });
});

export const getPopularBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ isActive: true, isPublished: true })
        .sort("-views -likes")
        .populate(populateAuthor)
        .limit(6)
        .select("-content -travelTips -faqs");

    return successResponse(res, 200, "Popular blogs fetched", { blogs });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, isActive: true, isPublished: true })
        .populate(populateAuthor)
        .populate("stateId", "name slug")
        .populate("relatedCities", "name slug")
        .populate("relatedDestinations", "name slug");

    if (!blog) return errorResponse(res, 404, "Blog not found");

    // Fetch related blogs
    const relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        isActive: true,
        isPublished: true,
        $or: [
            { category: blog.category },
            { tags: { $in: blog.tags } }
        ]
    })
    .populate(populateAuthor)
    .sort("-priority -publishedAt")
    .limit(3)
    .select("-content -travelTips -faqs");

    return successResponse(res, 200, "Blog fetched", {
        blog,
        relatedBlogs
    });
});

export const getRelatedBlogs = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return errorResponse(res, 404, "Blog not found");

    const relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        isActive: true,
        isPublished: true,
        $or: [
            { category: blog.category },
            { tags: { $in: blog.tags } }
        ]
    })
    .populate(populateAuthor)
    .sort("-priority -publishedAt")
    .limit(6)
    .select("-content -travelTips -faqs");

    return successResponse(res, 200, "Related blogs fetched", { blogs: relatedBlogs });
});

export const getBlogsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = ITEMS_PER_PAGE } = req.query;

    const query = { isActive: true, isPublished: true, category };
    const total = await Blog.countDocuments(query);
    
    const blogs = await Blog.find(query)
        .populate(populateAuthor)
        .sort("-priority -publishedAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-content -travelTips -faqs");

    return successResponse(res, 200, `Blogs for category ${category} fetched`, {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const getBlogsByTag = asyncHandler(async (req, res) => {
    const { tag } = req.params;
    const { page = 1, limit = ITEMS_PER_PAGE } = req.query;

    const query = { isActive: true, isPublished: true, tags: { $in: [tag] } };
    const total = await Blog.countDocuments(query);
    
    const blogs = await Blog.find(query)
        .populate(populateAuthor)
        .sort("-priority -publishedAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-content -travelTips -faqs");

    return successResponse(res, 200, `Blogs for tag ${tag} fetched`, {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const incrementBlogViews = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    // Basic IP-based prevention of refresh abuse using cookies
    const viewedBlogs = req.cookies?.viewedBlogs ? JSON.parse(req.cookies.viewedBlogs) : [];
    
    if (!viewedBlogs.includes(slug)) {
        await Blog.findOneAndUpdate(
            { slug, isActive: true, isPublished: true },
            { $inc: { views: 1 } }
        );
        viewedBlogs.push(slug);
        res.cookie('viewedBlogs', JSON.stringify(viewedBlogs), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        return successResponse(res, 200, "View incremented");
    }
    
    return successResponse(res, 200, "Already viewed");
});

export const getBlogCategories = asyncHandler(async (req, res) => {
    const categories = await Blog.aggregate([
        { $match: { isActive: true, isPublished: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    return successResponse(res, 200, "Blog categories fetched", { categories });
});

export const getBlogTags = asyncHandler(async (req, res) => {
    const tags = await Blog.aggregate([
        { $match: { isActive: true, isPublished: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
    ]);
    return successResponse(res, 200, "Blog tags fetched", { tags });
});

// ============ ADMIN / CRUD ============

export const createBlog = asyncHandler(async (req, res) => {
    let slug = req.body.slug;
    if (!slug) {
        slug = await generateUniqueSlug(Blog, req.body.title);
    }
    const blogData = {
        ...req.body,
        slug,
        author: req.user.id,
        publishedAt: req.body.isPublished ? new Date() : null,
    };
    const blog = await Blog.create(blogData);
    return successResponse(res, 201, "Blog created", { blog });
});

export const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.title && !req.body.slug) {
        req.body.slug = await generateUniqueSlug(Blog, req.body.title, id);
    }
    if (req.body.isPublished) {
        const existing = await Blog.findById(id);
        if (!existing.publishedAt) req.body.publishedAt = new Date();
    }
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!blog) return errorResponse(res, 404, "Blog not found");
    return successResponse(res, 200, "Blog updated", { blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return errorResponse(res, 404, "Blog not found");
    return successResponse(res, 200, "Blog deleted");
});

export const adminGetAllBlogs = asyncHandler(async (req, res) => {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate(populateAuthor)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Blogs fetched", {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const adminGetBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate(populateAuthor);
    if (!blog) return errorResponse(res, 404, "Blog not found");
    return successResponse(res, 200, "Blog fetched", { blog });
});

// ============ INTERACTIONS ============

export const addComment = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) return errorResponse(res, 404, "Blog not found");

    const comment = await Comment.create({ 
        blogId, 
        text, 
        author: {
            userId: req.user.id,
            name: req.user.name,
            profilePic: req.user.profileImage
        } 
    });
    
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    await Notification.create({
        title: "New Blog Comment",
        message: `A new comment has been posted on "${blog.title}".`,
        type: "system"
    });

    return successResponse(res, 201, "Comment added", { comment });
});

export const getComments = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const comments = await Comment.find({ blogId })
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const total = await Comment.countDocuments({ blogId });
    
    return successResponse(res, 200, "Comments fetched", { 
        comments,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    
    if (!comment) return errorResponse(res, 404, "Comment not found");
    
    if (comment.author.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 403, "Not authorized to delete this comment");
    }
    
    await Comment.findByIdAndDelete(id);
    await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentCount: -1 } });
    
    return successResponse(res, 200, "Comment deleted");
});

export const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params; // referenceId
    const { referenceType } = req.body; // 'blog' or 'comment'
    const userId = req.user.id;

    if (!["blog", "comment"].includes(referenceType)) {
        return errorResponse(res, 400, "Invalid referenceType");
    }

    const existingLike = await Like.findOne({ referenceId: id, "author.userId": userId, referenceType });
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        if (referenceType === 'blog') await Blog.findByIdAndUpdate(id, { $inc: { likes: -1 } });
        if (referenceType === 'comment') await Comment.findByIdAndUpdate(id, { $inc: { likes: -1 } });
        return successResponse(res, 200, "Unliked successfully", { isLiked: false });
    } else {
        await Like.create({ 
            referenceId: id, 
            referenceType, 
            author: {
                userId: req.user.id,
                name: req.user.name,
                profilePic: req.user.profileImage
            }
        });
        if (referenceType === 'blog') await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } });
        if (referenceType === 'comment') await Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } });
        return successResponse(res, 200, "Liked successfully", { isLiked: true });
    }
});

export const toggleSaveBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const userId = req.user.id;

    const existingSave = await SavedBlog.findOne({ blogId, userId });

    if (existingSave) {
        await SavedBlog.findByIdAndDelete(existingSave._id);
        return successResponse(res, 200, "Blog removed from saved", { isSaved: false });
    } else {
        await SavedBlog.create({ blogId, userId });
        return successResponse(res, 200, "Blog saved", { isSaved: true });
    }
});

export const getSavedBlogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const saved = await SavedBlog.find({ userId }).populate({
        path: "blogId",
        populate: populateAuthor
    }).sort("-createdAt");

    const blogs = saved.map(s => s.blogId);
    return successResponse(res, 200, "Saved blogs fetched", { blogs });
});

