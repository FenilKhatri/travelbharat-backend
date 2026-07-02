import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { generateUniqueSlug } from "../../common/utils/slug.utils.js";
import { ITEMS_PER_PAGE } from "../../common/utils/constants.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";
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
    if (category) query.categoryId = category; // assuming category query param is an ObjectId, or needs to be resolved
    if (budget) query.budget = budget;
    if (tripType) query.tripType = tripType;
    if (featured === "true") query.featured = true;
    if (trending === "true") query.trending = true;

    const paginatedResult = await getPaginatedData(TouristPlace, query, {
        page,
        limit,
        sort,
        populate: [
            { path: "stateId", select: "name slug" },
            { path: "cityId", select: "name slug" },
            { path: "categoryId", select: "name slug" }
        ],
        select: "-__v"
    });

    return successResponse(res, 200, "Places fetched", paginatedResult);
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
        .populate("categoryId", "name slug")
        .sort("-priority -rating")
        .limit(8)
        .select("name slug images.thumbnail categoryId rating reviewCount stateId cityId");

    return successResponse(res, 200, "Trending places fetched", { places });
});

export const getPlaceBySlug = asyncHandler(async (req, res) => {
    const place = await TouristPlace.findOne({ slug: req.params.slug, isActive: true })
        .populate("stateId", "name slug")
        .populate("cityId", "name slug")
        .populate("categoryId", "name slug")
        .populate("tags", "name slug")
        .populate("foodSpecialities", "name slug images.thumbnail")
        .populate("activities", "name slug description images.thumbnail")
        .populate("nearbyAttractions.placeId", "name slug images.thumbnail rating");

    if (!place) return errorResponse(res, 404, "Place not found");
    return successResponse(res, 200, "Place fetched", { place });
});

export const getPlacesByCity = asyncHandler(async (req, res) => {
    const city = await City.findOne({ slug: req.params.citySlug });
    if (!city) return errorResponse(res, 404, "City not found");

    const { page = 1, limit = ITEMS_PER_PAGE, category } = req.query;
    const query = { cityId: city._id, isActive: true };
    if (category) query.category = category;

    const paginatedResult = await getPaginatedData(TouristPlace, query, {
        page,
        limit,
        sort: "-priority -rating",
        populate: [
            { path: "stateId", select: "name slug" },
            { path: "cityId", select: "name slug" }
        ],
        select: "name slug images.thumbnail categoryId rating reviewCount description entryFee timings duration primaryBadge badges"
    });

    return successResponse(res, 200, "Places fetched", {
        ...paginatedResult,
        city: { name: city.name, slug: city.slug }
    });
});

export const getPlacesByState = asyncHandler(async (req, res) => {
    const state = await State.findOne({ slug: req.params.stateSlug });
    if (!state) return errorResponse(res, 404, "State not found");

    const { page = 1, limit = ITEMS_PER_PAGE, category } = req.query;
    const query = { stateId: state._id, isActive: true };
    if (category) query.category = category;

    const paginatedResult = await getPaginatedData(TouristPlace, query, {
        page,
        limit,
        sort: "-priority -rating",
        populate: [
            { path: "categoryId", select: "name slug" },
            { path: "stateId", select: "name slug" },
            { path: "cityId", select: "name slug" }
        ],
        select: "name slug images.thumbnail categoryId rating reviewCount cityId primaryBadge badges"
    });

    return successResponse(res, 200, "Places fetched", {
        ...paginatedResult,
        state: { name: state.name, slug: state.slug }
    });
});

// Get place categories with count
export const getPlaceCategories = asyncHandler(async (req, res) => {
    const categories = await TouristPlace.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: "$categoryDetails" },
        {
            $project: {
                _id: 1,
                count: 1,
                name: "$categoryDetails.name",
                slug: "$categoryDetails.slug"
            }
        },
        { $sort: { count: -1 } },
    ]);

    return successResponse(res, 200, "Categories fetched", { categories });
});

//  ADMIN 

export const createPlace = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(TouristPlace, req.body.name);
    const place = await TouristPlace.create({ ...req.body, slug });

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

    const paginatedResult = await getPaginatedData(TouristPlace, query, {
        page,
        limit,
        sort: "-priority -createdAt",
        populate: [
            { path: "stateId", select: "name slug" },
            { path: "cityId", select: "name slug" },
            { path: "categoryId", select: "name slug" }
        ]
    });

    return successResponse(res, 200, "Places fetched", paginatedResult);
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
