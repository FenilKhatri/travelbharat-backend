import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import TouristPlace from "./place.model.js";
import City from "../city/city.model.js";
import State from "../state/state.model.js";
import Notification from "../notification/notification.model.js";

//  PUBLIC 

export const getAllPlaces = asyncHandler(async (req, res) => {
    const {
        search, stateId, cityId, category, budget, tripType,
        featured, trending, page = 1, limit = ITEMS_PER_PAGE
    } = req.query;
    const sort = req.query.sort || "-priority";

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateId = stateId;
    if (cityId) query.cityId = cityId;
    if (category) query.category = category;
    if (budget) query.budget = budget;
    if (tripType) query.tripType = tripType;
    if (featured === "true") query.featured = true;
    if (trending === "true") query.trending = true;

    const total = await TouristPlace.countDocuments(query);
    const places = await TouristPlace.find(query)
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-__v");

    return successResponse(res, 200, "Places fetched", {
        places,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) },
    });
});

export const getFeaturedPlaces = asyncHandler(async (req, res) => {
    const places = await TouristPlace.find({ isActive: true, featured: true })
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .sort("-priority")
        .limit(8)
        .select("name slug images.thumbnail category rating reviewCount stateId cityId budget");

    return successResponse(res, 200, "Featured places fetched", { places });
});

export const getTrendingPlaces = asyncHandler(async (req, res) => {
    const places = await TouristPlace.find({ isActive: true, trending: true })
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .sort("-priority -rating")
        .limit(8)
        .select("name slug images.thumbnail category rating reviewCount stateId cityId");

    return successResponse(res, 200, "Trending places fetched", { places });
});

export const getPlaceBySlug = asyncHandler(async (req, res) => {
    const place = await TouristPlace.findOne({ slug: req.params.slug, isActive: true })
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .populate("categoryId", "name slug");

    if (!place) return errorResponse(res, 404, "Place not found");
    return successResponse(res, 200, "Place fetched", { place });
});

export const getPlacesByCity = asyncHandler(async (req, res) => {
    const city = await City.findOne({ slug: req.params.citySlug });
    if (!city) return errorResponse(res, 404, "City not found");

    const { page = 1, limit = ITEMS_PER_PAGE, category } = req.query;
    const query = { cityId: city._id, isActive: true };
    if (category) query.category = category;

    const total = await TouristPlace.countDocuments(query);
    const places = await TouristPlace.find(query)
        .populate("stateId", "name slug")
        .sort("-priority -rating")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("name slug images.thumbnail category rating reviewCount description entryFee timings duration");

    return successResponse(res, 200, "Places fetched", {
        places, city: { name: city.name, slug: city.slug },
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const getPlacesByState = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.stateSlug });
    if (!state) return errorResponse(res, 404, "State not found");

    const { page = 1, limit = ITEMS_PER_PAGE, category } = req.query;
    const query = { stateId: state._id, isActive: true };
    if (category) query.category = category;

    const total = await TouristPlace.countDocuments(query);
    const places = await TouristPlace.find(query)
        .populate("cityId", "name slug")
        .sort("-priority -rating")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("name slug images.thumbnail category rating reviewCount cityId");

    return successResponse(res, 200, "Places fetched", {
        places, state: { name: state.name, slug: state.slug },
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// Get place categories with count
export const getPlaceCategories = asyncHandler(async (req, res) => {
    const categories = await TouristPlace.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    return successResponse(res, 200, "Categories fetched", { categories });
});

//  ADMIN 

export const createPlace = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(TouristPlace, req.body.name);
    const place = await TouristPlace.create({ ...req.body, slug });

    // Update counts
    await City.findByIdAndUpdate(req.body.cityId, { $inc: { totalPlaces: 1 } });
    await State.findByIdAndUpdate(req.body.stateId, { $inc: { totalPlaces: 1 } });

    await Notification.create({
        title: "New Destination Added",
        message: `A new destination "${place.name}" has been added.`,
        type: "system"
    });

    return successResponse(res, 201, "Place created", { place });
});

export const updatePlace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.name) {
        req.body.slug = await generateUniqueSlug(TouristPlace, req.body.name, id);
    }
    const place = await TouristPlace.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!place) return errorResponse(res, 404, "Place not found");
    return successResponse(res, 200, "Place updated", { place });
});

export const deletePlace = asyncHandler(async (req, res) => {
    const place = await TouristPlace.findByIdAndDelete(req.params.id);
    if (!place) return errorResponse(res, 404, "Place not found");
    await City.findByIdAndUpdate(place.cityId, { $inc: { totalPlaces: -1 } });
    await State.findByIdAndUpdate(place.stateId, { $inc: { totalPlaces: -1 } });
    return successResponse(res, 200, "Place deleted");
});

export const adminGetAllPlaces = asyncHandler(async (req, res) => {
    const { search, stateId, cityId, category, budget, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (stateId) query.stateId = stateId;
    if (cityId) query.cityId = cityId;
    if (category) query.category = category;
    if (budget) query.budget = budget;

    const total = await TouristPlace.countDocuments(query);
    const places = await TouristPlace.find(query)
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .sort("-priority -createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Places fetched", {
        places,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const adminGetPlace = asyncHandler(async (req, res) => {
    const place = await TouristPlace.findById(req.params.id)
        .populate("stateId", "name slug")
        .populate("cityId", "name slug");
    if (!place) return errorResponse(res, 404, "Place not found");

    // Backfill createdAt for legacy documents
    if (!place.createdAt && place.updatedAt) {
        place.createdAt = place.updatedAt;
        await place.save({ validateBeforeSave: false });
    }

    return successResponse(res, 200, "Place fetched", { place });
});
