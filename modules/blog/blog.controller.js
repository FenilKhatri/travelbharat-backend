import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Blog from "./blog.model.js";

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
        .populate("author", "name profileImage")
        .populate("stateId", "name slug")
        .sort("-priority -publishedAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("title slug excerpt category tags images.thumbnail readTime views publishedAt author stateId");

    return successResponse(res, 200, "Blogs fetched", {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const getFeaturedBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ isActive: true, isPublished: true, featured: true })
        .populate("author", "name profileImage")
        .sort("-priority -publishedAt")
        .limit(6)
        .select("title slug excerpt category images.thumbnail readTime publishedAt author");

    return successResponse(res, 200, "Featured blogs fetched", { blogs });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOneAndUpdate(
        { slug: req.params.slug, isActive: true, isPublished: true },
        { $inc: { views: 1 } },
        { new: true }
    )
        .populate("author", "name profileImage bio")
        .populate("stateId", "name slug");

    if (!blog) return errorResponse(res, 404, "Blog not found");
    return successResponse(res, 200, "Blog fetched", { blog });
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

// ============ ADMIN ============

export const createBlog = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Blog, req.body.title);
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
    if (req.body.title) {
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
        .populate("author", "name")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Blogs fetched", {
        blogs,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const adminGetBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("author", "name");
    if (!blog) return errorResponse(res, 404, "Blog not found");
    return successResponse(res, 200, "Blog fetched", { blog });
});
