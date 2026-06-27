import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import Review from "./review.model.js";
import mongoose from "mongoose";

// Helper to get the correct model for a given entity type
const getEntityModel = (entityType) => {
    switch (entityType) {
        case "place": return mongoose.model("TouristPlace");
        case "hotel": return mongoose.model("Hotel");
        case "restaurant": return mongoose.model("Restaurant");
        case "activity": return mongoose.model("Activity");
        case "city": return mongoose.model("City");
        default: return null;
    }
};

// PUBLIC

// Get reviews for an entity
export const getEntityReviews = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const sort = req.query.sort || "-createdAt";

    if (!getEntityModel(entityType)) {
        return errorResponse(res, 400, "Invalid entity type");
    }

    const query = { entityType, entityId, isActive: true, isApproved: true };
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate("userId", "name profileImage city")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Get rating distribution
    const ratingDist = await Review.aggregate([
        { $match: { entityType, entityId: mongoose.Types.ObjectId.createFromHexString(entityId), isActive: true, isApproved: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
    ]);

    return successResponse(res, 200, "Reviews fetched", {
        reviews,
        ratingDistribution: ratingDist,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// USER

// Create review (authenticated user)
export const createReview = asyncHandler(async (req, res) => {
    const { entityType, entityId, rating, subRatings, title, review: reviewText, images, visitDate, tripType } = req.body;

    if (!entityType || !entityId || !rating || !reviewText) {
        return errorResponse(res, 400, "Entity Type, ID, rating, and review text are required");
    }

    const Model = getEntityModel(entityType);
    if (!Model) return errorResponse(res, 400, "Invalid entity type");

    // Check if entity exists
    const entity = await Model.findById(entityId);
    if (!entity) return errorResponse(res, 404, "Entity not found");

    // Check for duplicate
    const existing = await Review.findOne({ userId: req.user.id, entityType, entityId });
    if (existing) return errorResponse(res, 400, "You have already reviewed this.");

    const review = await Review.create({
        userId: req.user.id,
        entityType,
        entityId,
        rating,
        subRatings,
        title,
        review: reviewText,
        images: images || [],
        visitDate,
        tripType,
        isApproved: true, // Assuming auto-approve for now, can be changed later
    });

    await updateEntityRating(entityType, entityId);

    return successResponse(res, 201, "Review submitted!", { review });
});

// Update own review
export const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) return errorResponse(res, 404, "Review not found");

    const { rating, subRatings, title, review: reviewText, images, visitDate, tripType } = req.body;
    if (rating) review.rating = rating;
    if (subRatings) review.subRatings = subRatings;
    if (title !== undefined) review.title = title;
    if (reviewText) review.review = reviewText;
    if (images) review.images = images;
    if (visitDate) review.visitDate = visitDate;
    if (tripType) review.tripType = tripType;

    await review.save();
    
    await updateEntityRating(review.entityType, review.entityId);

    return successResponse(res, 200, "Review updated!", { review });
});

// Delete own review
export const deleteOwnReview = asyncHandler(async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!review) return errorResponse(res, 404, "Review not found");

    // Update entity rating
    await updateEntityRating(review.entityType, review.entityId);

    return successResponse(res, 200, "Review deleted");
});

// Get user's reviews
export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ userId: req.user.id, isActive: true })
        .sort("-createdAt");

    return successResponse(res, 200, "Your reviews fetched", { reviews });
});

// ADMIN

export const adminGetReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
        .populate("userId", "name email profileImage");

    if (!review) return errorResponse(res, 404, "Review not found");
    return successResponse(res, 200, "Review fetched", { review });
});

export const adminGetAllReviews = asyncHandler(async (req, res) => {
    const { status, entityType, entityId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === "pending") query.isApproved = false;
    if (status === "approved") query.isApproved = true;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .populate("userId", "name email profileImage")
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

    await updateEntityRating(review.entityType, review.entityId);

    return successResponse(res, 200, "Review approved", { review });
});

export const rejectReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: false, isActive: false },
        { new: true }
    );
    if (!review) return errorResponse(res, 404, "Review not found");
    
    await updateEntityRating(review.entityType, review.entityId);
    
    return successResponse(res, 200, "Review rejected", { review });
});

export const adminRespondToReview = asyncHandler(async (req, res) => {
    const { adminResponse } = req.body;
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { adminResponse: { text: adminResponse, respondedAt: new Date() } },
        { new: true }
    );
    if (!review) return errorResponse(res, 404, "Review not found");
    return successResponse(res, 200, "Response added", { review });
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return errorResponse(res, 404, "Review not found");
    await updateEntityRating(review.entityType, review.entityId);
    return successResponse(res, 200, "Review deleted");
});

// HELPER

async function updateEntityRating(entityType, entityId) {
    const stats = await Review.aggregate([
        { $match: { entityType, entityId: mongoose.Types.ObjectId.createFromHexString(entityId.toString()), isActive: true, isApproved: true } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    const Model = getEntityModel(entityType);
    if (!Model) return;

    if (stats.length > 0) {
        await Model.findByIdAndUpdate(entityId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    } else {
        await Model.findByIdAndUpdate(entityId, { rating: 0, reviewCount: 0 });
    }
}
