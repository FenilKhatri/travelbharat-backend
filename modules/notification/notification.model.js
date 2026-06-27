import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true, // Only for user-specific notifications
        },
        isSystemWide: {
            type: Boolean,
            default: false, // If true, applicable to all users
            index: true,
        },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error", "system", "user"],
            default: "info",
        },
        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
        },
        link: {
            type: String, // Optional URL to redirect when clicked
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Primary query pattern for user's unread notifications
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// TTL Index: Auto-delete notifications older than 90 days to prevent bloat
// 90 days = 90 * 24 * 60 * 60 = 7776000 seconds
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
