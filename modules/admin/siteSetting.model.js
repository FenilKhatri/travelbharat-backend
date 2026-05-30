import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        category: {
            type: String,
            enum: ["general", "seo", "social", "contact", "maintenance", "email", "appearance"],
            default: "general",
        },
        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("SiteSetting", siteSettingSchema);
