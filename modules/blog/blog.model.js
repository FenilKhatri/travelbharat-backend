import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
            index: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
        },

        author: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: String,
            profilePic: String,
        },

        likes: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const likeSchema = new mongoose.Schema(
    {
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        referenceType: {
            type: String,
            enum: ["blog", "comment"],
            required: true,
        },

        author: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: String,
            profilePic: String,
        },

        likeTime: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

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
            alias: "body",
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
            index: true,
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        images: {
            hero: {
                type: String,
                default: "",
            },

            thumbnail: {
                type: String,
                default: "",
            },

            gallery: [
                {
                    type: String,
                },
            ],
        },

        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
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
                ref: "Destination",
            },
        ],

        travelTips: [
            {
                type: String,
            },
        ],

        faqs: [
            {
                question: String,
                answer: String,
            },
        ],

        readTime: {
            type: Number,
            default: 5,
        },

        views: {
            type: Number,
            default: 0,
            alias: "viewCount",
        },

        likes: {
            type: Number,
            default: 0,
            alias: "likeCount",
        },

        commentCount: {
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
            metaTitle: {
                type: String,
                default: "",
            },

            metaDescription: {
                type: String,
                default: "",
            },

            keywords: [
                {
                    type: String,
                },
            ],
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

    if (this.isModified("content") && this.content) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    next();
});

// BLOGS LISTING
blogSchema.index({
    isPublished: 1,
    publishedAt: -1,
});

// BLOG BY SLUG
blogSchema.index({
    slug: 1,
});

// FILTER BY TAG
blogSchema.index({
    tags: 1,
});

// FILTER BY CATEGORY
blogSchema.index({
    category: 1,
    publishedAt: -1,
});

// POPULAR BLOGS
blogSchema.index({
    views: -1,
    likes: -1,
});

export const Blog = mongoose.model("Blog", blogSchema);
export const Comment = mongoose.model("Comment", commentSchema);
export const Like = mongoose.model("Like", likeSchema);