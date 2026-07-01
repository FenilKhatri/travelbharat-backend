import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "City name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: [true, "State reference is required"],
            index: true,
        },
        district: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["city", "town", "village", "cantonment", "hill-station"],
            default: "city",
        },
        tagline: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        overview: {
            type: String,
        },
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        transport: {
            local: String,
            fromAirport: String,
            fromStation: String,
            busStation: String,
        },
        emergencyInfo: {
            police: String,
            ambulance: String,
            hospital: String,
            fireBrigade: String,
            touristHelpline: String,
        },
        nearbyPlaces: [
            {
                placeId: { type: mongoose.Schema.Types.ObjectId, ref: "TouristPlace" },
                distance: String,
            },
        ],
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
        population: {
            type: Number,
        },
        pincode: {
            type: String,
        },
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
        },
        totalPlaces: {
            type: Number,
            default: 0,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        priority: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        badges: [
            {
                type: String,
            }
        ],
        primaryBadge: {
            type: String,
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
citySchema.index({ slug: 1, stateId: 1 }, { unique: true }); // A state cannot have two cities with the same slug
citySchema.index({ priority: -1 });
citySchema.index({ "mapCoordinates": "2dsphere" });

// Virtuals
citySchema.virtual("destinations", {
    ref: "TouristPlace",
    localField: "_id",
    foreignField: "cityId",
});

citySchema.virtual("hotels", {
    ref: "Hotel",
    localField: "_id",
    foreignField: "cityId",
});

citySchema.virtual("restaurants", {
    ref: "Restaurant",
    localField: "_id",
    foreignField: "cityId",
});

// Pre-validate hook for slug generation
citySchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const City = mongoose.model("City", citySchema);
export default City;
