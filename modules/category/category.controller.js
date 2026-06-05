import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import Category from "./category.model.js";
import TouristPlace from "../place/place.model.js";
import Notification from "../notification/notification.model.js";

//  PUBLIC 

// Get all categories with place count
export const getAllCategories = asyncHandler(async (req, res) => {
    const { type } = req.query;

    const query = { isActive: true };
    if (type) query.type = type;

    const categories = await Category.find(query)
        .sort("-priority name")
        .select("-__v");

    // Aggregate place counts per category
    const placeCounts = await TouristPlace.aggregate([
        { $match: { isActive: true, categoryId: { $exists: true, $ne: null } } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    placeCounts.forEach((p) => {
        countMap[p._id.toString()] = p.count;
    });

    const enriched = categories.map((cat) => ({
        ...cat.toObject(),
        placeCount: countMap[cat._id.toString()] || 0,
    }));

    return successResponse(res, 200, "Categories fetched", { categories: enriched });
});

// Get category by slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return errorResponse(res, 404, "Category not found");

    const placeCount = await TouristPlace.countDocuments({
        categoryId: category._id,
        isActive: true,
    });

    return successResponse(res, 200, "Category fetched", {
        category: { ...category.toObject(), placeCount },
    });
});

//  ADMIN 

// Create category
export const createCategory = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Category, req.body.name);
    const category = await Category.create({ ...req.body, slug });

    await Notification.create({
        title: "New Category Added",
        message: `A new category "${category.name}" has been added.`,
        type: "system",
    });

    return successResponse(res, 201, "Category created", { category });
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Category, req.body.name, id);
    }
    const category = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category updated", { category });
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category deleted");
});

// Admin get all categories (includes inactive)
export const adminGetAllCategories = asyncHandler(async (req, res) => {
    const { search, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (type) query.type = type;

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
        .sort("-priority name")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Categories fetched", {
        categories,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});
