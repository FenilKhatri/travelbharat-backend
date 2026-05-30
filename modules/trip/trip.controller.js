import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import SavedTrip from "./trip.model.js";

// Get user's trips
export const getMyTrips = asyncHandler(async (req, res) => {
    const trips = await SavedTrip.find({ userId: req.user.id })
        .populate("places.placeId", "name slug images.thumbnail category")
        .sort("-updatedAt");

    return successResponse(res, 200, "Trips fetched", { trips });
});

// Get single trip
export const getTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id })
        .populate("places.placeId", "name slug images.thumbnail category rating stateId cityId entryFee timings");

    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip fetched", { trip });
});

// Create trip
export const createTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.create({ ...req.body, userId: req.user.id });
    return successResponse(res, 201, "Trip created", { trip });
});

// Update trip
export const updateTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip updated", { trip });
});

// Delete trip
export const deleteTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip deleted");
});

// Add place to trip
export const addPlaceToTrip = asyncHandler(async (req, res) => {
    const { placeId, day, notes } = req.body;
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    // Check if place already exists
    const exists = trip.places.some((p) => p.placeId?.toString() === placeId);
    if (exists) return errorResponse(res, 400, "Place already in trip");

    trip.places.push({
        placeId,
        day: day || 1,
        notes: notes || "",
        order: trip.places.length,
    });

    await trip.save();
    return successResponse(res, 200, "Place added to trip", { trip });
});

// Remove place from trip
export const removePlaceFromTrip = asyncHandler(async (req, res) => {
    const { placeId } = req.body;
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.places = trip.places.filter((p) => p.placeId?.toString() !== placeId);
    await trip.save();
    return successResponse(res, 200, "Place removed from trip", { trip });
});

// Get public trips (for inspiration)
export const getPublicTrips = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const total = await SavedTrip.countDocuments({ isPublic: true });
    const trips = await SavedTrip.find({ isPublic: true })
        .populate("userId", "name profileImage")
        .populate("places.placeId", "name slug images.thumbnail")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("name description totalDays budget tripType coverImage places userId");

    return successResponse(res, 200, "Public trips fetched", {
        trips,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// Admin: Get all trips
export const adminGetAllTrips = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, tripType } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }
    if (tripType) {
        query.tripType = tripType;
    }

    const total = await SavedTrip.countDocuments(query);
    const trips = await SavedTrip.find(query)
        .populate("userId", "name email profileImage")
        .populate("places.placeId", "name slug images.thumbnail")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "All trips fetched for admin", {
        trips,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
});

// Admin: Delete any trip
export const adminDeleteTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findByIdAndDelete(req.params.id);
    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip deleted by admin");
});
