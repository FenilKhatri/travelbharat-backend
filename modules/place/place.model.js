import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
            index: true,
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true,
            index: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        overview: {
            type: String,
            default: "",
        },
        images: {
            hero: { type: String, default: "" },
            thumbnail: { type: String, default: "" },
            gallery: [{ type: String }],
        },
        location: {
            address: { type: String, default: "" },
            coordinates: {
                lat: { type: Number, default: 0 },
                lng: { type: Number, default: 0 },
            },
        },
        entryFee: {
            indian: { type: String, default: "Free" },
            foreigner: { type: String, default: "Free" },
            camera: { type: String, default: "Free" },
        },
        timings: {
            type: String,
            default: "Open 24 hours",
        },
        closedOn: {
            type: String,
            default: "Open all days",
        },
        bestTimeToVisit: {
            type: String,
            default: "",
        },
        duration: {
            type: String,
            default: "2-3 hours",
        },
        tips: [{ type: String }],
        highlights: [{ type: String }],
        activities: [
            {
                name: { type: String },
                description: { type: String },
                image: { type: String, default: "" },
            },
        ],
        history: {
            type: String,
            default: "",
        },
        howToReach: {
            type: String,
            default: "",
        },
        nearbyAttractions: [
            {
                name: { type: String },
                distance: { type: String },
                image: { type: String, default: "" },
            },
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            enum: [
                "heritage",
                "nature",
                "temple",
                "beach",
                "hill-station",
                "wildlife",
                "adventure",
                "museum",
                "fort",
                "palace",
                "garden",
                "lake",
                "waterfall",
                "market",
                "religious",
                "modern",
                "other",
            ],
            default: "other",
        },
        tripType: [
            {
                type: String,
                enum: ["family", "couple", "solo", "friends", "pilgrim"],
            },
        ],
        budget: {
            type: String,
            enum: ["budget", "moderate", "luxury"],
            default: "moderate",
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        trending: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
            index: true,
        },
        seo: {
            metaTitle: { type: String, default: "" },
            metaDescription: { type: String, default: "" },
            keywords: [{ type: String }],
        },
    },
    {
        timestamps: true,
    }
);

placeSchema.pre("validate", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

export default mongoose.model("TouristPlace", placeSchema);
