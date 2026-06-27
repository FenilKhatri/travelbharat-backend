import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["place", "blog", "activity"],
            required: true,
            index: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String, // String icon name (e.g., FontAwesome, Lucide)
        },
        image: {
            url: { type: String },
            publicId: { type: String },
            altText: { type: String },
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
    }
);

// Compound Index: Enforce unique category names per type
categorySchema.index({ name: 1, type: 1 }, { unique: true });

// Pre-validate hook for slug generation
categorySchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        // Include type in slug to ensure uniqueness across types
        this.slug = generateSlug(`${this.type}-${this.name}`);
    }
    next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
