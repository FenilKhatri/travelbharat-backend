import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: [true, "Blog content is required"],
        },
        excerpt: {
            type: String,
            maxlength: [300, "Excerpt cannot exceed 300 characters"],
        },
        readTime: {
            type: Number, // in minutes
            default: 3,
        },
        wordCount: {
            type: Number,
            default: 0,
        },
        language: {
            type: String,
            default: "en", // For future i18n
        },
        coverImage: {
            url: { type: String },
            publicId: { type: String },
            altText: { type: String },
        },
        status: {
            type: String,
            enum: ["draft", "pending", "published", "rejected"],
            default: "draft",
            index: true,
        },
        rejectionReason: {
            type: String,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            index: true,
        },
        relatedCities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "City",
            },
        ],
        relatedDestinations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TouristPlace",
            },
        ],
        tags: [
            {
                type: String,
                trim: true,
                index: true,
            },
        ],
        faqs: [
            {
                question: String,
                answer: String,
            },
        ],
        editRequest: {
            isRequested: { type: Boolean, default: false },
            reason: String,
            requestedAt: Date,
            status: { type: String, enum: ["pending", "approved", "rejected"] },
        },
        deleteRequest: {
            isRequested: { type: Boolean, default: false },
            reason: String,
            requestedAt: Date,
            status: { type: String, enum: ["pending", "approved", "rejected"] },
        },
        publishedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        approvedAt: {
            type: Date,
        },
        viewCount: {
            type: Number,
            default: 0,
            index: true,
        },
        likeCount: {
            type: Number,
            default: 0,
            index: true,
        },
        commentCount: {
            type: Number,
            default: 0,
        },
        reportCount: {
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
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });

// Pre-validate hook for slug generation
blogSchema.pre("validate", function (next) {
    if (this.title && !this.slug) {
        this.slug = generateSlug(this.title);
    }
    
    // Auto-calculate word count and read time
    if (this.isModified('content') && this.content) {
        const words = this.content.split(/\s+/).length;
        this.wordCount = words;
        this.readTime = Math.ceil(words / 200); // Assuming 200 words per minute reading speed
    }
    
    next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;