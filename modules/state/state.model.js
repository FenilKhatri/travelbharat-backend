import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "State name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        stateCode: {
            type: String,
            trim: true,
            uppercase: true,
        },
        isUnionTerritory: {
            type: Boolean,
            default: false,
        },
        region: {
            type: String,
            enum: ["north", "south", "east", "west", "central", "northeast"],
            required: true,
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
        capital: {
            type: String,
            required: true,
        },
        area: {
            type: Number, // in sq km
        },
        population: {
            type: Number,
        },
        languages: [
            {
                type: String,
                trim: true,
            },
        ],
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        stateBranding: {
            leftBackground: { url: String, publicId: String },
            rightBackground: { url: String, publicId: String },
            patternImage: { url: String, publicId: String },
            overlayImage: { url: String, publicId: String },
            primaryColor: String,
        },
        highlights: [
            {
                title: String,
                description: String,
                icon: String,
            },
        ],
        history: {
            type: String,
        },
        culture: {
            type: String,
        },
        weather: {
            summer: String,
            winter: String,
            monsoon: String,
            bestSeason: String,
        },
        transport: {
            byAir: String,
            byTrain: String,
            byRoad: String,
            local: String,
        },
        travelTips: [
            {
                type: String,
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
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
        },
        totalCities: {
            type: Number,
            default: 0,
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
stateSchema.index({ priority: -1 });
stateSchema.index({ featured: -1 });
stateSchema.index({ region: 1 });
stateSchema.index({ "mapCoordinates": "2dsphere" });

// Virtuals
stateSchema.virtual("cities", {
    ref: "City",
    localField: "_id",
    foreignField: "stateId",
});
stateSchema.virtual("festivals", {
    ref: "Festival",
    localField: "_id",
    foreignField: "stateIds",
});
stateSchema.virtual("foods", {
    ref: "Food",
    localField: "_id",
    foreignField: "stateIds",
});

// Pre-validate hook for slug generation
stateSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const State = mongoose.model("State", stateSchema);
export default State;
