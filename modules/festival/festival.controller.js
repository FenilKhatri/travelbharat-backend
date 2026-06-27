import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import Festival from "./festival.model.js";
import State from "../state/state.model.js";

//  PUBLIC 

export const getAllFestivals = asyncHandler(async (req, res) => {
    const { search, stateId, month, category, featured, page = 1, limit = ITEMS_PER_PAGE } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateIds = stateId;
    if (month) query.month = month.toLowerCase();
    if (category) query.category = category;
    if (featured === "true") query.featured = true;

    const total = await Festival.countDocuments(query);
    const festivals = await Festival.find(query)
        .populate("stateIds", "name slug")
        .populate("cityIds", "name slug")
        .populate("relatedPlaces", "name slug")
        .sort("-priority -createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-__v");

    return successResponse(res, 200, "Festivals fetched", {
        festivals,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const getFeaturedFestivals = asyncHandler(async (req, res) => {
    const festivals = await Festival.find({ isActive: true, featured: true })
        .populate("stateIds", "name slug")
        .sort("-priority")
        .limit(8)
        .select("name slug description images.thumbnail month duration stateIds category");

    return successResponse(res, 200, "Featured festivals fetched", { festivals });
});

export const getFestivalBySlug = asyncHandler(async (req, res) => {
    const festival = await Festival.findOne({ slug: req.params.slug, isActive: true })
        .populate("stateIds", "name slug")
        .populate("cityIds", "name slug")
        .populate("relatedPlaces", "name slug images.thumbnail");

    if (!festival) return errorResponse(res, 404, "Festival not found");
    return successResponse(res, 200, "Festival fetched", { festival });
});

export const getFestivalsByState = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.stateSlug });
    if (!state) return errorResponse(res, 404, "State not found");

    const festivals = await Festival.find({ stateIds: state._id, isActive: true })
        .sort("-priority")
        .select("name slug description images.thumbnail month duration category");

    return successResponse(res, 200, "Festivals fetched", {
        festivals,
        state: { name: state.name, slug: state.slug },
    });
});

//  ADMIN 

export const createFestival = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Festival, req.body.name);
    const festival = await Festival.create({ ...req.body, slug });
    return successResponse(res, 201, "Festival created", { festival });
});

export const updateFestival = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(Festival, req.body.name, id);
    }
    const festival = await Festival.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!festival) return errorResponse(res, 404, "Festival not found");
    return successResponse(res, 200, "Festival updated", { festival });
});

export const deleteFestival = asyncHandler(async (req, res) => {
    const festival = await Festival.findByIdAndDelete(req.params.id);
    if (!festival) return errorResponse(res, 404, "Festival not found");
    return successResponse(res, 200, "Festival deleted");
});

export const adminGetAllFestivals = asyncHandler(async (req, res) => {
    const { search, stateId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateIds = stateId;

    const total = await Festival.countDocuments(query);
    const festivals = await Festival.find(query)
        .populate("stateIds", "name slug")
        .sort("-priority -createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Festivals fetched", {
        festivals,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const adminGetFestival = asyncHandler(async (req, res) => {
    const festival = await Festival.findById(req.params.id)
        .populate("stateIds", "name slug")
        .populate("cityIds", "name slug")
        .populate("relatedPlaces", "name slug");
    if (!festival) return errorResponse(res, 404, "Festival not found");
    return successResponse(res, 200, "Festival fetched", { festival });
});
