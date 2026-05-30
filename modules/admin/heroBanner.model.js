import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            default: "",
        },
        buttonText: {
            type: String,
            default: "Explore Now",
        },
        buttonLink: {
            type: String,
            default: "/states",
        },
        page: {
            type: String,
            enum: ["home", "states", "blogs", "festivals", "about"],
            default: "home",
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("HeroBanner", heroBannerSchema);
