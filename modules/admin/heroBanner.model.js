import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Banner title is required"],
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        image: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
            altText: { type: String },
        },
        page: {
            type: String,
            enum: ["home", "destinations", "festivals", "blogs", "about"],
            required: true,
            index: true,
        },
        ctaText: {
            type: String,
            trim: true,
        },
        ctaLink: {
            type: String,
            trim: true,
        },
        displayDuration: {
            type: Number, // In seconds, for auto-rotating carousels
            default: 5,
        },
        startDate: {
            type: Date, // For time-limited promotional banners
        },
        endDate: {
            type: Date, // For time-limited promotional banners
        },
        priority: {
            type: Number,
            default: 0, // Higher number = displays first in carousel
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Ensure active, high-priority banners load first for the specific page
heroBannerSchema.index({ page: 1, isActive: 1, priority: -1 });

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);
export default HeroBanner;
