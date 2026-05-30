import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { 
            type: String, 
            enum: ["info", "success", "warning", "error", "system", "user"],
            default: "info"
        },
        read: { type: Boolean, default: false },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        link: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
