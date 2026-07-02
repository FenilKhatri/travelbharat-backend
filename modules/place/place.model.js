import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Place name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: [true, "State reference is required"],
            index: true,
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: [true, "City reference is required"],
            index: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        overview: {
            type: String,
        },
        history: {
            type: String,
        },
        legends: {
            type: String,
        },
        whyVisit: {
            type: String,
        },
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        address: {
            type: String,
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
        timings: {
            type: String,
        },
        closedOn: {
            type: String,
        },
        duration: {
            type: String, // e.g., "2-3 hours"
        },
        bestTimeToVisit: {
            type: String,
        },
        seasonalAvailability: {
            type: String, // e.g., "Open May to November only"
        },
        accessibility: [
            { type: String } // e.g., "Wheelchair Accessible", "Elder Friendly"
        ],
        entryFee: {
            indian: { type: String, default: "Free" },
            foreigner: { type: String, default: "Free" },
            camera: { type: String, default: "Not Allowed" },
        },
        quickFacts: {
            distanceFromCity: String,
            famousFor: String,
            idealDuration: String,
            nearestAirport: String,
            nearestRailwayStation: String,
        },
        highlights: [
            { type: String }
        ],
        tips: [
            { type: String }
        ],
        foodSpecialities: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Food" }
        ],
        photographySpots: [
            {
                title: String,
                description: String,
            },
        ],
        nearbyAttractions: [
            {
                placeId: { type: mongoose.Schema.Types.ObjectId, ref: "TouristPlace" },
                distance: String,
            },
        ],
        howToReach: {
            byAir: String,
            byTrain: String,
            byRoad: String,
            localTransport: String,
        },
        budget: {
            type: String,
            enum: ["budget", "moderate", "luxury", "all"],
            default: "all",
        },
        suitableFor: [
            {
                type: String,
                enum: ["family", "couples", "solo", "friends", "kids", "seniors"],
            },
        ],
        tripType: [
            {
                type: String,
                enum: ["weekend", "long-weekend", "day-trip", "extended-trip"],
            },
        ],
        tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
        rating: {
            type: Number,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        commentCount: {
            type: Number,
            default: 0,
        },
        visitCount: {
            type: Number,
            default: 0,
        },
        priority: {
            type: Number,
            default: 0,
            index: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        trending: {
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
placeSchema.index({ categoryId: 1, rating: -1 });
placeSchema.index({ "mapCoordinates": "2dsphere" });
placeSchema.index({ stateId: 1, priority: -1 });
placeSchema.index({ cityId: 1, priority: -1 });

// Virtual for Activities
placeSchema.virtual("activities", {
    ref: "Activity",
    localField: "_id",
    foreignField: "placeIds",
});

// Pre-validate hook for slug generation
placeSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

// Middleware for Auto Counters
placeSchema.pre("save", function (next) {
    this.wasNew = this.isNew;
    next();
});

placeSchema.post("save", async function (doc, next) {
    // Only increment when a new place is created
    if (doc && this.wasNew) {
        try {
            if (doc.stateId) {
                await mongoose.model("State").findByIdAndUpdate(doc.stateId, { $inc: { totalPlaces: 1 } });
            }
            if (doc.cityId) {
                await mongoose.model("City").findByIdAndUpdate(doc.cityId, { $inc: { totalPlaces: 1 } });
            }
        } catch (error) {
            console.error("Error updating totalPlaces on save:", error);
        }
    }
    next();
});

placeSchema.post("findOneAndDelete", async function (doc, next) {
    if (doc) {
        try {
            if (doc.stateId) {
                await mongoose.model("State").findByIdAndUpdate(doc.stateId, { $inc: { totalPlaces: -1 } });
            }
            if (doc.cityId) {
                await mongoose.model("City").findByIdAndUpdate(doc.cityId, { $inc: { totalPlaces: -1 } });
            }
        } catch (error) {
            console.error("Error updating totalPlaces on delete:", error);
        }
    }
    next();
});

const TouristPlace = mongoose.model("TouristPlace", placeSchema);
export default TouristPlace;