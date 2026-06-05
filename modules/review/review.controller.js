import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import Review from "./review.model.js";
import TouristPlace from "../place/place.model.js";
import Notification from "../notification/notification.model.js";

// ============ PUBLIC ============

// Get reviews for a place
export const getPlaceReviews = asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const sort = req.query.sort || "-createdAt";

    const query = { placeId, isActive: true };
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate("userId", "name profileImage city")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Get rating distribution
    const ratingDist = await Review.aggregate([
        { $match: { placeId: (await import("mongoose")).default.Types.ObjectId.createFromHexString(placeId), isActive: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
    ]);

    return successResponse(res, 200, "Reviews fetched", {
        reviews,
        ratingDistribution: ratingDist,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// ============ USER ============

// Create review (authenticated user)
export const createReview = asyncHandler(async (req, res) => {
    const { placeId, rating, title, comment, images, visitDate, tripType } = req.body;

    if (!placeId || !rating || !comment) {
        return errorResponse(res, 400, "Place ID, rating, and comment are required");
    }

    // Check if place exists
    const place = await TouristPlace.findById(placeId);
    if (!place) return errorResponse(res, 404, "Place not found");

    // Check for duplicate
    const existing = await Review.findOne({ userId: req.user.id, placeId });
    if (existing) return errorResponse(res, 400, "You have already reviewed this place");

    const review = await Review.create({
        userId: req.user.id,
        placeId,
        rating,
        title,
        comment,
        images: images || [],
        visitDate,
        tripType,
    });

    await Notification.create({
        title: "New Review Submitted",
        message: `A new review has been submitted for ${place.name} and is awaiting approval.`,
        type: "system",
        link: "/admin/reviews"
    });

    return successResponse(res, 201, "Review submitted! Awaiting admin approval.", { review });
});

// Update own review
export const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) return errorResponse(res, 404, "Review not found");

    const { rating, title, comment, images, visitDate, tripType } = req.body;
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    if (visitDate) review.visitDate = visitDate;
    if (tripType) review.tripType = tripType;
    review.isApproved = false; // Re-submit for approval

    await review.save();
    return successResponse(res, 200, "Review updated! Re-submitted for approval.", { review });
});

// Delete own review
export const deleteOwnReview = asyncHandler(async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!review) return errorResponse(res, 404, "Review not found");

    // Update place rating
    await updatePlaceRating(review.placeId);

    return successResponse(res, 200, "Review deleted");
});

// Get user's reviews
export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ userId: req.user.id, isActive: true })
        .populate("placeId", "name slug images.thumbnail")
        .sort("-createdAt");

    return successResponse(res, 200, "Your reviews fetched", { reviews });
});

// ============ ADMIN ============

export const adminGetAllReviews = asyncHandler(async (req, res) => {
    const { status, placeId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === "pending") query.isApproved = false;
    if (status === "approved") query.isApproved = true;
    if (placeId) query.placeId = placeId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate("userId", "name email profileImage")
        .populate("placeId", "name slug")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Reviews fetched", {
        reviews,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

export const approveReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
    );
    if (!review) return errorResponse(res, 404, "Review not found");

    // Update place rating
    await updatePlaceRating(review.placeId);

    return successResponse(res, 200, "Review approved", { review });
});

export const rejectReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: false, isActive: false },
        { new: true }
    );
    if (!review) return errorResponse(res, 404, "Review not found");
    return successResponse(res, 200, "Review rejected", { review });
});

export const adminRespondToReview = asyncHandler(async (req, res) => {
    const { adminResponse } = req.body;
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { adminResponse },
        { new: true }
    );
    if (!review) return errorResponse(res, 404, "Review not found");
    return successResponse(res, 200, "Response added", { review });
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return errorResponse(res, 404, "Review not found");
    await updatePlaceRating(review.placeId);
    return successResponse(res, 200, "Review deleted");
});

// ============ HELPER ============

async function updatePlaceRating(placeId) {
    const stats = await Review.aggregate([
        { $match: { placeId, isActive: true } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await TouristPlace.findByIdAndUpdate(placeId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    } else {
        await TouristPlace.findByIdAndUpdate(placeId, { rating: 0, reviewCount: 0 });
    }
}
