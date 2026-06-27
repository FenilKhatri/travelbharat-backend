import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Restaurant name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true,
            index: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
            index: true,
        },
        description: {
            type: String,
        },
        address: {
            type: String,
            required: true,
        },
        mapCoordinates: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
        },
        contact: {
            phone: String,
            email: String,
            website: String,
        },
        cuisines: [
            { type: String, index: true } // e.g. "North Indian", "Italian", "Cafe"
        ],
        dietaryOptions: [
            { type: String } // e.g. "Veg Only", "Vegan Options", "Halal"
        ],
        priceRange: {
            type: String,
            enum: ["cheap", "moderate", "expensive", "luxury"],
        },
        averageCostForTwo: {
            type: Number,
        },
        timings: {
            type: String, // e.g. "11:00 AM - 11:00 PM"
        },
        features: [
            { type: String } // e.g. "Outdoor Seating", "Live Music", "Bar"
        ],
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        userRating: {
            type: Number,
            default: 0,
            index: true,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
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

// Indexes
restaurantSchema.index({ "mapCoordinates": "2dsphere" });
restaurantSchema.index({ cityId: 1, userRating: -1 });

// Pre-validate hook for slug generation
restaurantSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
