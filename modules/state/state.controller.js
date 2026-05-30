import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import State from "./state.model.js";

// ============ PUBLIC ============

// Get all states (public)
export const getAllStates = asyncHandler(async (req, res) => {
    const { search, region, featured, page = 1, limit = ITEMS_PER_PAGE, sort = "-priority" } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (region) query.region = region;
    if (featured === "true") query.featured = true;

    const total = await State.countDocuments(query);
    const states = await State.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-__v");

    return successResponse(res, 200, "States fetched", {
        states,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit),
        },
    });
});

// Get featured states (public)
export const getFeaturedStates = asyncHandler(async (req, res) => {
    const states = await State.find({ isActive: true, featured: true })
        .sort("-priority")
        .limit(8)
        .select("name slug tagline images.thumbnail images.hero totalCities totalPlaces");

    return successResponse(res, 200, "Featured states fetched", { states });
});

// Get state by slug (public)
export const getStateBySlug = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.slug, isActive: true });

    if (!state) {
        return errorResponse(res, 404, "State not found");
    }

    return successResponse(res, 200, "State fetched", { state });
});

// ============ ADMIN ============

// Create state (admin)
export const createState = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(State, req.body.name);
    const state = await State.create({ ...req.body, slug });
    return successResponse(res, 201, "State created", { state });
});

// Update state (admin)
export const updateState = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(State, req.body.name, id);
    }

    const state = await State.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!state) return errorResponse(res, 404, "State not found");
    return successResponse(res, 200, "State updated", { state });
});

// Delete state (admin)
export const deleteState = asyncHandler(async (req, res) => {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) return errorResponse(res, 404, "State not found");
    return successResponse(res, 200, "State deleted");
});

// Get all states for admin (includes inactive)
export const adminGetAllStates = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };

    const total = await State.countDocuments(query);
    const states = await State.find(query)
        .sort("-priority -createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "States fetched", {
        states,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        },
    });
});

// Get single state by ID (admin)
export const adminGetState = asyncHandler(async (req, res) => {
    const state = await State.findById(req.params.id);
    if (!state) return errorResponse(res, 404, "State not found");
    return successResponse(res, 200, "State fetched", { state });
});
