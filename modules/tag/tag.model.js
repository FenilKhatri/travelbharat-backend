import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
        },
        usageCount: {
            type: Number,
            default: 0,
            index: true, // Useful for "Popular Tags"
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
    },
    {
        timestamps: true,
    }
);

// Pre-validate hook for slug generation
tagSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
