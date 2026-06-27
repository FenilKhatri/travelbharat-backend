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
            enum: ["place", "city", "state", "festival", "blog", "food", "hotel", "restaurant", "activity", "tag"],
            required: true,
            index: true,
        },
        itemModel: {
            type: String,
            required: true,
            enum: ["TouristPlace", "City", "State", "Festival", "Blog", "Food", "Hotel", "Restaurant", "Activity", "Tag"],
        },
        notes: {
            type: String, // Optional user notes for why they saved it
            maxlength: [200, "Notes cannot exceed 200 characters"],
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

// Compound Unique Index: A user can only save a specific item once
savedItemSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

// Index for getting a user's recent saves of a specific type
savedItemSchema.index({ userId: 1, itemType: 1, createdAt: -1 });

const SavedItem = mongoose.model("SavedItem", savedItemSchema);
export default SavedItem;
