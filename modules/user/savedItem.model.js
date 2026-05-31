import mongoose from "mongoose";

const savedItemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        itemType: {
            type: String,
            enum: ["place", "city", "state"], // blogs use SavedBlog currently, but we could add it
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate saves
savedItemSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

export default mongoose.model("SavedItem", savedItemSchema);
