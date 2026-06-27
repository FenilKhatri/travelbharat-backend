import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Food from "./food.model.js";

// PUBLIC
export const getFoods = asyncHandler(async (req, res) => {
    const { stateId, cityId, type, search, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    
    const query = { isActive: true };
    if (stateId) query.stateIds = stateId;
    if (cityId) query.cityIds = cityId;
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: "i" };

    const total = await Food.countDocuments(query);
    const foods = await Food.find(query)
        .populate("stateIds", "name slug")
        .populate("cityIds", "name slug")
        .sort("-priority -createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Foods fetched", {
        foods,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

export const getFoodBySlug = asyncHandler(async (req, res) => {
    const food = await Food.findOne({ slug: req.params.slug, isActive: true })
        .populate("stateIds", "name slug")
        .populate("cityIds", "name slug");

    if (!food) return errorResponse(res, 404, "Food not found");
    return successResponse(res, 200, "Food fetched", { food });
});

// ADMIN
export const createFood = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Food, req.body.name);
    const food = await Food.create({ ...req.body, slug });
    return successResponse(res, 201, "Food created", { food });
});

export const updateFood = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Food, req.body.name, id);
    }
    const food = await Food.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!food) return errorResponse(res, 404, "Food not found");
    return successResponse(res, 200, "Food updated", { food });
});

export const deleteFood = asyncHandler(async (req, res) => {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return errorResponse(res, 404, "Food not found");
    return successResponse(res, 200, "Food deleted");
});
