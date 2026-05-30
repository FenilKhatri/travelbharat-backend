import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
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
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            default: "",
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            enum: [
                "travel-guide",
                "destination",
                "food",
                "culture",
                "adventure",
                "heritage",
                "festivals",
                "tips",
                "budget-travel",
                "luxury-travel",
                "wildlife",
                "spiritual",
                "other",
            ],
            default: "travel-guide",
        },
        tags: [{ type: String }],
        images: {
            hero: { type: String, default: "" },
            thumbnail: { type: String, default: "" },
            gallery: [{ type: String }],
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
        },
        readTime: {
            type: Number,
            default: 5,
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
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

blogSchema.pre("validate", function (next) {
    if (this.isModified("title") && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    // Auto-calculate read time from content
    if (this.isModified("content") && this.content) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

export default mongoose.model("Blog", blogSchema);
