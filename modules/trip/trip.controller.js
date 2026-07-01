import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import SavedTrip from "./trip.model.js";
import TouristPlace from "../place/place.model.js";
import Notification from "../notification/notification.model.js";
import { getPaginatedData } from "../../common/utils/pagination.utils.js";

// Get user's trips
export const getMyTrips = asyncHandler(async (req, res) => {
    let trips = await SavedTrip.find({ userId: req.user.id })
        .populate("destinationId", "name slug images categoryId stateId cityId")
        .populate("places.placeId", "name slug heroImage images categoryId stateId cityId")
        .sort("-updatedAt");

    const now = new Date();

    // Dynamically update status based on dates
    trips = await Promise.all(trips.map(async (trip) => {
        if (trip.status === "cancelled" || trip.status === "draft") return trip;

        let newStatus = trip.status;
        if (trip.startDate && trip.endDate) {
            if (now < trip.startDate) newStatus = "upcoming";
            else if (now >= trip.startDate && now <= trip.endDate) newStatus = "ongoing";
            else newStatus = "completed";
        }

        if (newStatus !== trip.status) {
            trip.status = newStatus;
            await trip.save({ validateBeforeSave: false });
        }
        return trip;
    }));

    return successResponse(res, 200, "Trips fetched", { trips });
});

// Get single trip
export const getTrip = asyncHandler(async (req, res) => {
    let trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id })
        .populate("destinationId", "name slug images categoryId stateId cityId overview timings location bestTimeToVisit highlights travelTips")
        .populate({
            path: "places.placeId",
            populate: [
                { path: "stateId", select: "name heroImage images" },
                { path: "cityId", select: "name images" }
            ]
        });

    if (!trip) return errorResponse(res, 404, "Trip not found");

    const now = new Date();
    if (trip.status !== "cancelled" && trip.status !== "draft" && trip.startDate && trip.endDate) {
        let newStatus = trip.status;
        if (now < trip.startDate) newStatus = "upcoming";
        else if (now >= trip.startDate && now <= trip.endDate) newStatus = "ongoing";
        else newStatus = "completed";

        if (newStatus !== trip.status) {
            trip.status = newStatus;
            await trip.save({ validateBeforeSave: false });
        }
    }

    return successResponse(res, 200, "Trip fetched", { trip });
});

// Create trip
export const createTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.create({
        ...req.body,
        userId: req.user.id
    });

    await Notification.create({
        title: "Trip Created",
        message: `Your trip "${trip.name}" has been successfully planned.`,
        type: "success",
        user: req.user.id,
        link: `/user/trips/${trip._id}`
    });

    await Notification.create({
        title: "New Trip Planned",
        message: `A user planned a new trip: "${trip.name}".`,
        type: "system",
        link: `/admin/trips`
    });

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

// Duplicate trip
export const duplicateTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    const tripData = trip.toObject();
    delete tripData._id;
    delete tripData.createdAt;
    delete tripData.updatedAt;
    delete tripData.__v;
    
    // Strip _ids from nested arrays
    if (tripData.places) tripData.places.forEach(p => delete p._id);
    if (tripData.itinerary) tripData.itinerary.forEach(i => delete i._id);
    if (tripData.expenses) tripData.expenses.forEach(e => delete e._id);
    if (tripData.gallery) tripData.gallery.forEach(g => delete g._id);

    tripData.name = `${tripData.name} (Copy)`;
    tripData.status = "draft"; // Reset status for the copy

    const duplicatedTrip = await SavedTrip.create(tripData);

    return successResponse(res, 201, "Trip duplicated", { trip: duplicatedTrip });
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

    const paginatedResult = await getPaginatedData(SavedTrip, { isPublic: true }, {
        page,
        limit,
        sort: "-createdAt",
        select: "name description totalDays budget tripType coverImage places userId",
        populate: [
            { path: "userId", select: "name profileImage" },
            { path: "places.placeId", select: "name slug images.thumbnail" }
        ]
    });

    return successResponse(res, 200, "Public trips fetched", {
        trips: paginatedResult.items,
        pagination: { 
            total: paginatedResult.totalItems, 
            page: paginatedResult.currentPage, 
            pages: paginatedResult.totalPages 
        },
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

    const paginatedResult = await getPaginatedData(SavedTrip, query, {
        page,
        limit,
        sort: "-createdAt",
        populate: [
            { path: "userId", select: "name email profileImage" },
            { path: "places.placeId", select: "name slug images.thumbnail" }
        ]
    });

    return successResponse(res, 200, "All trips fetched for admin", {
        trips: paginatedResult.items,
        pagination: { 
            total: paginatedResult.totalItems, 
            page: paginatedResult.currentPage, 
            pages: paginatedResult.totalPages 
        }
    });
});

// Admin: Get single trip (any user's trip)
export const adminGetTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findById(req.params.id)
        .populate("userId", "name email profileImage")
        .populate({
            path: "places.placeId",
            populate: [
                { path: "stateId", select: "name images" },
                { path: "cityId", select: "name images" }
            ]
        });

    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip fetched", { trip });
});

// Admin: Delete any trip
export const adminDeleteTrip = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findByIdAndDelete(req.params.id);
    if (!trip) return errorResponse(res, 404, "Trip not found");
    return successResponse(res, 200, "Trip deleted by admin");
});

// =
// EXPENSES
// =
export const addExpense = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.expenses.push(req.body);
    await trip.save();
    return successResponse(res, 200, "Expense added", { trip });
});

export const deleteExpense = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.expenses = trip.expenses.filter(e => e._id.toString() !== req.params.expenseId);
    await trip.save();
    return successResponse(res, 200, "Expense deleted", { trip });
});

// =
// ITINERARY
// =
export const addItineraryDay = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.itinerary.push(req.body);
    // Sort by day number
    trip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
    await trip.save();
    return successResponse(res, 200, "Itinerary day added", { trip });
});

export const deleteItineraryDay = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.itinerary = trip.itinerary.filter(i => i._id.toString() !== req.params.dayId);
    await trip.save();
    return successResponse(res, 200, "Itinerary day deleted", { trip });
});

// =
// GALLERY
// =
import { uploadToCloudinary } from "../../config/cloudinary.js";

export const uploadGallery = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    if (!req.files || req.files.length === 0) {
        return errorResponse(res, 400, "No files provided");
    }

    if (trip.gallery.length + req.files.length > 10) {
        return errorResponse(res, 400, "Maximum 10 files allowed in gallery");
    }

    const userName = req.user.name ? req.user.name.replace(/[^a-zA-Z0-9]/g, '_') : 'user';
    const tripName = trip.name ? trip.name.replace(/[^a-zA-Z0-9]/g, '_') : 'trip';
    const folder = `travelbharat/${userName}/${tripName}`;

    const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await uploadToCloudinary(dataURI, folder);
        return {
            url: result.url,
            publicId: result.publicId,
            resourceType: file.mimetype.startsWith("video") ? "video" : "image"
        };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    trip.gallery.push(...uploadedFiles);
    await trip.save();

    return successResponse(res, 200, "Gallery updated", { trip });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
    const trip = await SavedTrip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return errorResponse(res, 404, "Trip not found");

    trip.gallery = trip.gallery.filter(g => g._id.toString() !== req.params.imageId);
    await trip.save();
    return successResponse(res, 200, "Gallery item deleted", { trip });
});

// Mocked AI Generator
export const generateTripItinerary = asyncHandler(async (req, res) => {
    const { destinationId, duration, budget, travelStyle, interests, travelers } = req.body;

    if (!destinationId || !duration) {
        return errorResponse(res, 400, "Destination and duration are required.");
    }

    const place = await TouristPlace.findById(destinationId).populate("cityId stateId");
    if (!place) {
        return errorResponse(res, 404, "Destination not found.");
    }

    const nearbyAttractions = await TouristPlace.find({
        cityId: place.cityId._id,
        _id: { $ne: place._id },
        isActive: true
    }).limit(5).select("name images categoryId").populate("categoryId", "name slug");

    // Generate Mocked Response
    const dayWiseItinerary = [];
    for (let i = 1; i <= duration; i++) {
        dayWiseItinerary.push({
            day: i,
            title: `Day ${i}: Exploring ${place.cityId.name}`,
            morning: {
                time: "09:00 AM",
                activity: i === 1 ? `Visit ${place.name}` : `Discover ${nearbyAttractions[(i-2) % nearbyAttractions.length]?.name || 'Local Markets'}`,
                description: "Start your day with a guided tour and photography."
            },
            afternoon: {
                time: "01:00 PM",
                activity: "Local Cuisine & Relaxation",
                description: "Enjoy traditional food at a popular local restaurant."
            },
            evening: {
                time: "05:00 PM",
                activity: "Sunset Views & Leisure",
                description: "Take a stroll, shop for souvenirs, and watch the sunset."
            }
        });
    }

    const recommendedHotels = [
        { name: `Luxury Stay ${place.cityId.name}`, price: "₹8,000/night", rating: 4.8 },
        { name: `Comfort Inn ${place.cityId.name}`, price: "₹3,500/night", rating: 4.2 },
        { name: `Budget Hostel ${place.cityId.name}`, price: "₹1,200/night", rating: 4.0 },
    ];

    const costBreakdown = {
        transportation: budget * 0.3,
        accommodation: budget * 0.4,
        food: budget * 0.2,
        activities: budget * 0.1,
        totalEstimated: budget
    };

    const weather = {
        condition: "Sunny with pleasant breeze",
        temperature: "24°C - 30°C",
        clothing: "Light cotton clothes, comfortable walking shoes, and sunglasses."
    };

    const travelEssentials = {
        packing: ["Sunscreen", "Power Bank", "Water Bottle", "Camera"],
        safety: "Generally safe. Beware of pickpockets in crowded tourist areas.",
        customs: "Dress modestly when visiting religious sites."
    };

    const generatedTrip = {
        destination: {
            id: place._id,
            name: place.name,
            city: place.cityId.name,
            state: place.stateId.name,
            heroImage: place.images?.hero || place.images?.thumbnail || "",
            overview: place.overview || `A wonderful trip to ${place.name}, ${place.cityId.name}.`,
            categoryId: place.categoryId,
            bestTime: place.bestTimeToVisit
        },
        itinerary: dayWiseItinerary,
        nearbyAttractions: nearbyAttractions,
        recommendedHotels,
        costBreakdown,
        weather,
        travelEssentials
    };

    return successResponse(res, 200, "Trip itinerary generated successfully", generatedTrip);
});
