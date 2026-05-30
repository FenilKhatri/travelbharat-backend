import mongoose from "mongoose";

const festivalSchema = new mongoose.Schema(
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
        month: {
            type: String,
            enum: [
                "january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december",
            ],
        },
        duration: {
            type: String,
            default: "",
        },
        highlights: [{ type: String }],
        significance: {
            type: String,
            default: "",
        },
        celebrations: {
            type: String,
            default: "",
        },
        bestPlacesToCelebrate: [
            {
                name: { type: String },
                description: { type: String },
            },
        ],
        travelTips: [{ type: String }],
        category: {
            type: String,
            enum: ["religious", "cultural", "harvest", "national", "seasonal", "other"],
            default: "cultural",
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

festivalSchema.pre("validate", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

export default mongoose.model("Festival", festivalSchema);
