import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        tagline: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            required: true,
        },
        overview: {
            type: String,
            default: "",
        },
        capital: {
            type: String,
            default: "",
        },
        languages: [{ type: String }],
        images: {
            hero: { type: String, default: "" },
            thumbnail: { type: String, default: "" },
            gallery: [{ type: String }],
        },
        highlights: [
            {
                title: { type: String },
                description: { type: String },
                icon: { type: String, default: "" },
            },
        ],
        food: [
            {
                name: { type: String },
                description: { type: String },
                image: { type: String, default: "" },
                isVeg: { type: Boolean, default: true },
            },
        ],
        history: {
            type: String,
            default: "",
        },
        culture: {
            type: String,
            default: "",
        },
        weather: {
            summer: { type: String, default: "" },
            winter: { type: String, default: "" },
            monsoon: { type: String, default: "" },
            bestSeason: { type: String, default: "" },
        },
        bestTimeToVisit: {
            type: String,
            default: "",
        },
        transport: {
            byAir: { type: String, default: "" },
            byTrain: { type: String, default: "" },
            byRoad: { type: String, default: "" },
            local: { type: String, default: "" },
        },
        travelTips: [{ type: String }],
        mapCoordinates: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
        },
        region: {
            type: String,
            enum: ["north", "south", "east", "west", "central", "northeast"],
            default: "west",
        },
        totalCities: {
            type: Number,
            default: 0,
        },
        totalPlaces: {
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
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
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

// Auto-generate slug from name
stateSchema.pre("validate", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

export default mongoose.model("State", stateSchema);
