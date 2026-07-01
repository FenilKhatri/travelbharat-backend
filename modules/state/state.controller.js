import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";
import State from "./state.model.js";
import Notification from "../notification/notification.model.js";

//  PUBLIC 

// Get all states (public)
export const getAllStates = asyncHandler(async (req, res) => {
    const { search, region, badge, featured, page = 1, limit = ITEMS_PER_PAGE } = req.query;
    const sort = req.query.sort || "-priority";

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (region) query.region = region.toLowerCase();
    if (badge) query.badges = badge;
    if (featured === "true") query.featured = true;

    const paginatedResult = await getPaginatedData(State, query, {
        page,
        limit,
        sort,
        select: "-__v"
    });

    return successResponse(res, 200, "States fetched", paginatedResult);
});

// Get featured states (public)
export const getFeaturedStates = asyncHandler(async (req, res) => {
    const states = await State.find({ isActive: true, featured: true })
        .sort("-priority")
        .limit(8)
        .select("name slug tagline heroDescription quickFacts images.thumbnail images.hero totalCities totalPlaces");

    return successResponse(res, 200, "Featured states fetched", { states });
});

// Get state by slug (public)
export const getStateBySlug = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.slug, isActive: true })
        .populate("featuredAttractions.place", "name slug images.thumbnail category rating reviewCount")
        .populate("featuredFestivals.festival", "name slug images.thumbnail month category")
        .populate("featuredCuisine.food", "name slug image cuisine isVeg")
        .populate("nearbyStates", "name slug images.thumbnail tagline region");

    if (!state) {
        return errorResponse(res, 404, "State not found");
    }

    return successResponse(res, 200, "State fetched", { state });
});

// Get available filters for states
export const getAvailableFilters = asyncHandler(async (req, res) => {
    // Get unique regions
    const regions = await State.distinct("region", { isActive: true });
    
    return successResponse(res, 200, "State filters fetched", {
        regions: regions.filter(Boolean)
    });
});

// Get similar states based on shared badges
export const getSimilarStates = asyncHandler(async (req, res) => {
    const currentState = await State.findOne({ slug: req.params.slug, isActive: true });
    
    if (!currentState) {
        return errorResponse(res, 404, "State not found");
    }

    if (!currentState.badges || currentState.badges.length === 0) {
        return successResponse(res, 200, "Similar states fetched", { states: [] });
    }

    const similarStates = await State.find({
        _id: { $ne: currentState._id },
        isActive: true,
        badges: { $in: currentState.badges }
    })
    .sort("-priority")
    .limit(4)
    .select("name slug tagline images.thumbnail images.hero primaryBadge badges totalCities totalPlaces");

    return successResponse(res, 200, "Similar states fetched", { states: similarStates });
});

//  ADMIN 

// Create state (admin)
export const createState = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(State, req.body.name);
    const state = await State.create({ ...req.body, slug });
    await Notification.create({
        title: "New State Added",
        message: `A new state "${state.name}" has been added.`,
        type: "system"
    });
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
    const { search, region, featured, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (region) query.region = region;
    if (featured === "true") query.featured = true;
    else if (featured === "false") query.featured = false;

    const paginatedResult = await getPaginatedData(State, query, {
        page,
        limit,
        sort: "-priority"
    });

    return successResponse(res, 200, "States fetched", paginatedResult);
});

// Get single state by ID (admin)
export const adminGetState = asyncHandler(async (req, res) => {
    const state = await State.findById(req.params.id);
    if (!state) return errorResponse(res, 404, "State not found");
    return successResponse(res, 200, "State fetched", { state });
});
