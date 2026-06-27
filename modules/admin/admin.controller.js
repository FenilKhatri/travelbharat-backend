import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import User from "../user/user.model.js";
import State from "../state/state.model.js";
import City from "../city/city.model.js";
import TouristPlace from "../place/place.model.js";
import Blog from "../blog/blog.model.js";
import Festival from "../festival/festival.model.js";
import Review from "../review/review.model.js";
import ContactInquiry from "../contact/contact.model.js";
import NewsletterSubscriber from "../newsletter/newsletter.model.js";
import HeroBanner from "./heroBanner.model.js";
import SiteSetting from "./siteSetting.model.js";
import Category from "../category/category.model.js";
import Hotel from "../hotel/hotel.model.js";
import Restaurant from "../restaurant/restaurant.model.js";
import Activity from "../activity/activity.model.js";
import Food from "../food/food.model.js";

//  DASHBOARD ANALYTICS 

export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers, totalStates, totalCities, totalPlaces,
        totalBlogs, totalFestivals, totalReviews,
        pendingReviews, newInquiries, totalSubscribers,
        totalHotels, totalRestaurants, totalActivities, totalFoods
    ] = await Promise.all([
        User.countDocuments({ role: "user" }),
        State.countDocuments(),
        City.countDocuments(),
        TouristPlace.countDocuments(),
        Blog.countDocuments(),
        Festival.countDocuments(),
        Review.countDocuments(),
        Review.countDocuments({ isApproved: false }),
        ContactInquiry.countDocuments({ status: "new" }),
        NewsletterSubscriber.countDocuments({ isActive: true }),
        Hotel.countDocuments(),
        Restaurant.countDocuments(),
        Activity.countDocuments(),
        Food.countDocuments(),
    ]);

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, role: "user" });

    // User growth chart (last 7 months)
    const userGrowth = await User.aggregate([
        { $match: { role: "user" } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 7 },
    ]);

    // Top rated places
    const topPlaces = await TouristPlace.find({ isActive: true })
        .sort("-rating -reviewCount")
        .limit(5)
        .select("name slug rating reviewCount images.thumbnail");

    // Recent inquiries
    const recentInquiries = await ContactInquiry.find()
        .sort("-createdAt")
        .limit(5)
        .select("name email subject status createdAt");

    return successResponse(res, 200, "Dashboard stats", {
        stats: {
            totalUsers, totalStates, totalCities, totalPlaces,
            totalBlogs, totalFestivals, totalReviews,
            pendingReviews, newInquiries, totalSubscribers, recentUsers,
            totalHotels, totalRestaurants, totalActivities, totalFoods,
        },
        userGrowth,
        topPlaces,
        recentInquiries,
    });
});

//  USER MANAGEMENT 

export const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-__v");

    return successResponse(res, 200, "Users fetched", {
        users,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "User fetched", { user });
});

export const updateUser = asyncHandler(async (req, res) => {
    const { role, isActive } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof isActive === "boolean") update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "User updated", { user });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "User deleted");
});

//  HERO BANNERS 

export const getHeroBanners = asyncHandler(async (req, res) => {
    const { page: pageParam } = req.query;
    const query = {};
    if (pageParam) query.page = pageParam;

    const banners = await HeroBanner.find(query).sort("-priority -createdAt");
    return successResponse(res, 200, "Banners fetched", { banners });
});

export const getActiveHeroBanners = asyncHandler(async (req, res) => {
    const { page: pageParam = "home" } = req.query;
    const banners = await HeroBanner.find({ page: pageParam, isActive: true })
        .sort("-priority")
        .limit(5);
    return successResponse(res, 200, "Active banners fetched", { banners });
});

export const createHeroBanner = asyncHandler(async (req, res) => {
    const banner = await HeroBanner.create(req.body);
    return successResponse(res, 201, "Banner created", { banner });
});

export const updateHeroBanner = asyncHandler(async (req, res) => {
    const banner = await HeroBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return errorResponse(res, 404, "Banner not found");
    return successResponse(res, 200, "Banner updated", { banner });
});

export const deleteHeroBanner = asyncHandler(async (req, res) => {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) return errorResponse(res, 404, "Banner not found");
    return successResponse(res, 200, "Banner deleted");
});

//  SITE SETTINGS 

export const getSettings = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;

    const settings = await SiteSetting.find(query).sort("category key");
    return successResponse(res, 200, "Settings fetched", { settings });
});

export const getPublicSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSetting.find({
        category: { $in: ["general", "social", "seo", "contact"] },
    });

    // Convert to key-value map
    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    return successResponse(res, 200, "Settings fetched", { settings: settingsMap });
});

export const upsertSetting = asyncHandler(async (req, res) => {
    const { key, value, category, description } = req.body;
    if (!key || value === undefined) {
        return errorResponse(res, 400, "Key and value are required");
    }

    const setting = await SiteSetting.findOneAndUpdate(
        { key },
        { value, category: category || "general", description: description || "" },
        { upsert: true, new: true }
    );

    return successResponse(res, 200, "Setting saved", { setting });
});

export const deleteSetting = asyncHandler(async (req, res) => {
    const setting = await SiteSetting.findByIdAndDelete(req.params.id);
    if (!setting) return errorResponse(res, 404, "Setting not found");
    return successResponse(res, 200, "Setting deleted");
});

//  CATEGORIES 

export const getAllCategories = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const categories = await Category.find(query).sort("-priority name");
    return successResponse(res, 200, "Categories fetched", { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await Category.create({ ...req.body, slug });
    return successResponse(res, 201, "Category created", { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
    if (req.body.name) {
        req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category updated", { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category deleted");
});