import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Polymorphic reference
        entityType: {
            type: String,
            enum: ["place", "hotel", "restaurant", "activity", "city"],
            required: true,
            index: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
        },
        // Optional sub-ratings for detailed feedback
        subRatings: {
            cleanliness: { type: Number, min: 1, max: 5 },
            service: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 },
            location: { type: Number, min: 1, max: 5 },
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        review: {
            type: String,
            required: [true, "Review text is required"],
            trim: true,
            maxlength: [1000, "Review cannot exceed 1000 characters"],
        },
        images: [
            {
                url: String,
                publicId: String,
                altText: String,
            },
        ],
        tripType: {
            type: String,
            enum: ["family", "couple", "solo", "friends", "business", ""],
            default: "",
        },
        visitDate: {
            type: Date,
        },
        verifiedVisit: {
            type: Boolean,
            default: false,
        },
        helpfulVotes: {
            type: Number,
            default: 0,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        adminResponse: {
            text: String,
            respondedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            respondedAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound Indexes
// Ensure a user can only review an entity once
reviewSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });
// Fast lookup for reviews of a specific entity
reviewSchema.index({ entityType: 1, entityId: 1, isActive: 1, isApproved: 1, createdAt: -1 });
// Sort by most helpful
reviewSchema.index({ entityType: 1, entityId: 1, helpfulVotes: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
