import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Badge name is required"],
            trim: true,
            unique: true,
        },
        icon: {
            type: String,
            required: [true, "Badge icon is required"],
            trim: true,
        },
        color: {
            type: String,
            required: [true, "Badge color is required"],
            trim: true,
        },
        priority: {
            type: Number,
            default: 0,
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

// Index for sorting
badgeSchema.index({ priority: -1 });

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
