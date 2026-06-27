import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, "Setting key is required"],
            unique: true,
            trim: true,
            index: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Setting value is required"],
        },
        category: {
            type: String,
            enum: ["general", "seo", "social", "contact", "theme", "payment", "other"],
            default: "general",
            index: true,
        },
        isPublic: {
            type: Boolean,
            default: false, // If true, returned in frontend config payload
            index: true,
        },
        description: {
            type: String,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true, // we mostly care about updatedAt here
    }
);

const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
export default SiteSetting;
