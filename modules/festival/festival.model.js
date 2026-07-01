import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const festivalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Festival name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        // Replaced single stateId with Many-to-Many support
        stateIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "State",
                index: true,
            },
        ],
        cityIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "City",
                index: true,
            },
        ],
        relatedPlaces: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TouristPlace", // e.g., Varanasi Ghats for Dev Deepawali
            },
        ],
        scope: {
            type: String,
            enum: ["national", "regional", "state", "city"],
            default: "state",
        },
        category: {
            type: String,
            enum: [
                "religious",
                "cultural",
                "harvest",
                "arts-and-crafts",
                "music-and-dance",
                "film",
                "food",
                "other",
            ],
            required: true,
        },
        // General traditional month
        month: {
            type: String,
            enum: [
                "january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december",
            ],
            required: true,
            index: true,
        },
        // Specific dates (since lunar calendar dates change yearly)
        dates: [
            {
                year: { type: Number, required: true },
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
            }
        ],
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        significance: {
            type: String,
        },
        rituals: {
            type: String,
        },
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        // Removed bestPlacesToCelebrate embedded array in favor of cityIds and relatedPlaces references
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
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
        likeCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        badges: [
            {
                type: String,
            }
        ],
        primaryBadge: {
            type: String,
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
festivalSchema.index({ "dates.startDate": 1, "dates.endDate": 1 });

// Pre-validate hook for slug generation
festivalSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Festival = mongoose.model("Festival", festivalSchema);
export default Festival;
