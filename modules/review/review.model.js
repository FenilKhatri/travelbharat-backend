import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        placeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TouristPlace",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            default: "",
            trim: true,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        images: [{ type: String }],
        visitDate: {
            type: Date,
        },
        tripType: {
            type: String,
            enum: ["family", "couple", "solo", "friends", "pilgrim", "business"],
        },
        isApproved: {
            type: Boolean,
            default: false,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        adminResponse: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews from same user for same place
reviewSchema.index({ userId: 1, placeId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
