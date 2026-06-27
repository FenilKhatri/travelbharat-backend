import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Food name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        image: {
            url: { type: String },
            publicId: { type: String },
            altText: { type: String },
        },
        cuisine: {
            type: String, // e.g., "Rajasthani", "Mughlai", "South Indian"
            index: true,
        },
        isVeg: {
            type: Boolean,
            required: true,
        },
        category: {
            type: String,
            enum: ["street-food", "dessert", "main-course", "snack", "beverage"],
        },
        ingredients: [{ type: String }],
        origin: {
            type: String, // Historical origin
        },
        stateIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "State",
                index: true,
            }
        ],
        cityIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "City",
            }
        ],
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

// Pre-validate hook for slug generation
foodSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Food = mongoose.model("Food", foodSchema);
export default Food;
