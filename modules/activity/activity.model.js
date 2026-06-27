import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const activitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Activity name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["adventure", "spiritual", "cultural", "nature", "water-sports", "wildlife", "shopping", "other"],
            index: true,
        },
        difficultyLevel: {
            type: String,
            enum: ["easy", "moderate", "challenging", "extreme"],
        },
        duration: {
            type: String, // e.g. "2-4 hours", "Half Day"
        },
        bestSeason: {
            type: String, // e.g. "October to March"
        },
        priceRange: {
            min: Number,
            max: Number,
            currency: { type: String, default: "INR" }
        },
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        requirements: [
            { type: String } // e.g. "Minimum age 12", "Swimming required"
        ],
        safetyTips: [
            { type: String }
        ],
        placeIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TouristPlace",
                index: true,
            }
        ],
        stateIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "State",
                index: true, // For fast state-level aggregation ("Adventure sports in Uttarakhand")
            }
        ],
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
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

// Pre-validate hook for slug generation
activitySchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
