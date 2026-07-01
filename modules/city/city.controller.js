import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";
import City from "./city.model.js";
import State from "../state/state.model.js";
import Notification from "../notification/notification.model.js";

//  PUBLIC 

// Get all cities (with optional state filter)
export const getAllCities = asyncHandler(async (req, res) => {
    const { search, stateId, state: stateSlug, featured, page = 1, limit = ITEMS_PER_PAGE } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateId = stateId;
    if (featured === "true") query.featured = true;

    // If state slug is provided, find the state first
    if (stateSlug) {
        const stateDoc = await State.findOne({ slug: stateSlug });
        if (stateDoc) query.stateId = stateDoc._id;
    }

    const paginatedResult = await getPaginatedData(City, query, {
        page,
        limit,
        sort: "-priority -createdAt",
        populate: [
            { path: "stateId", select: "name slug" }
        ],
        select: "-__v"
    });

    return successResponse(res, 200, "Cities fetched", paginatedResult);
});

// Get cities by state slug
export const getCitiesByState = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.stateSlug });
    if (!state) return errorResponse(res, 404, "State not found");

    const cities = await City.find({ stateId: state._id, isActive: true })
        .sort("-priority")
        .select("name slug tagline description images.thumbnail totalPlaces bestTimeToVisit");

    return successResponse(res, 200, "Cities fetched", { cities, state: { name: state.name, slug: state.slug } });
});

// Get city by slug
export const getCityBySlug = asyncHandler(async (req, res) => {
    const city = await City.findOne({ slug: req.params.citySlug, isActive: true })
        .populate("stateId", "name slug languages travelTips")
        .populate("destinations", "name slug images.thumbnail category rating reviewCount description entryFee timings duration priority isActive");

    if (!city) return errorResponse(res, 404, "City not found");
    return successResponse(res, 200, "City fetched", { city });
});

// Get featured cities
export const getFeaturedCities = asyncHandler(async (req, res) => {
    const cities = await City.find({ isActive: true, featured: true })
        .populate("stateId", "name slug")
        .sort("-priority")
        .limit(8)
        .select("name slug tagline images.thumbnail stateId totalPlaces");

    return successResponse(res, 200, "Featured cities fetched", { cities });
});

//  ADMIN 

export const createCity = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(City, req.body.name);

    const city = await City.create({ ...req.body, slug });

    // Update state totalCities count
    await State.findByIdAndUpdate(req.body.stateId, { $inc: { totalCities: 1 } });

    await Notification.create({
        title: "New City Added",
        message: `A new city "${city.name}" has been added.`,
        type: "system"
    });

    return successResponse(res, 201, "City created", { city });
});

export const updateCity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(City, req.body.name, id);
    }
    const city = await City.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!city) return errorResponse(res, 404, "City not found");
    return successResponse(res, 200, "City updated", { city });
});

export const deleteCity = asyncHandler(async (req, res) => {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return errorResponse(res, 404, "City not found");
    await State.findByIdAndUpdate(city.stateId, { $inc: { totalCities: -1 } });
    return successResponse(res, 200, "City deleted");
});

export const adminGetAllCities = asyncHandler(async (req, res) => {
    const { search, stateId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateId = stateId;

    const paginatedResult = await getPaginatedData(City, query, {
        page,
        limit,
        sort: "-priority -createdAt",
        populate: [
            { path: "stateId", select: "name slug" }
        ]
    });

    return successResponse(res, 200, "Cities fetched", paginatedResult);
});

export const adminGetCity = asyncHandler(async (req, res) => {
    const city = await City.findById(req.params.id)
        .populate("stateId", "name slug")
        .populate("destinations", "name slug images.thumbnail isActive featured");
    if (!city) return errorResponse(res, 404, "City not found");
    return successResponse(res, 200, "City fetched", { city });
});
