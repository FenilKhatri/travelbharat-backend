import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
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
            required: true,
        },
        overview: {
            type: String,
            default: "",
        },
        tagline: {
            type: String,
            default: "",
        },
        images: {
            hero: { type: String, default: "" },
            thumbnail: { type: String, default: "" },
            gallery: [{ type: String }],
        },
        attractions: [
            {
                name: { type: String },
                description: { type: String },
                image: { type: String, default: "" },
                entryFee: { type: String, default: "Free" },
                timings: { type: String, default: "" },
            },
        ],
        hotels: [
            {
                name: { type: String },
                description: { type: String },
                rating: { type: Number, default: 0 },
                priceRange: { type: String, default: "" },
                image: { type: String, default: "" },
                address: { type: String, default: "" },
            },
        ],
        restaurants: [
            {
                name: { type: String },
                cuisine: { type: String, default: "" },
                description: { type: String },
                priceRange: { type: String, default: "" },
                image: { type: String, default: "" },
                rating: { type: Number, default: 0 },
            },
        ],
        shopping: [
            {
                name: { type: String },
                description: { type: String },
                image: { type: String, default: "" },
                speciality: { type: String, default: "" },
            },
        ],
        transport: {
            local: { type: String, default: "" },
            fromAirport: { type: String, default: "" },
            fromStation: { type: String, default: "" },
            busStation: { type: String, default: "" },
        },
        emergencyInfo: {
            police: { type: String, default: "100" },
            ambulance: { type: String, default: "108" },
            hospital: { type: String, default: "" },
            fireBrigade: { type: String, default: "101" },
            touristHelpline: { type: String, default: "1363" },
        },
        nearbyPlaces: [
            {
                name: { type: String },
                distance: { type: String },
                image: { type: String, default: "" },
            },
        ],
        mapCoordinates: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
        },
        bestTimeToVisit: {
            type: String,
            default: "",
        },
        population: {
            type: String,
            default: "",
        },
        pincode: {
            type: String,
            default: "",
        },
        priority: {
            type: Number,
            default: 0,
            index: true,
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        totalPlaces: {
            type: Number,
            default: 0,
        },
        likeCount: {
            type: Number,
            default: 0,
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

// Compound unique index: slug must be unique within a state
citySchema.index({ slug: 1, stateId: 1 }, { unique: true });

// Virtual for destinations
citySchema.virtual("destinations", {
    ref: "TouristPlace",
    localField: "_id",
    foreignField: "cityId",
});

citySchema.set("toObject", { virtuals: true });
citySchema.set("toJSON", { virtuals: true });

citySchema.pre("validate", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

export default mongoose.model("City", citySchema);
