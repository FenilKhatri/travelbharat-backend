import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            enum: ["state", "city", "place", "festival", "blog", "comment", "food", "hotel", "restaurant", "activity"],
            required: true,
            index: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        entityModel: {
            type: String,
            required: true,
            enum: ["State", "City", "TouristPlace", "Festival", "Blog", "Comment", "Food", "Hotel", "Restaurant", "Activity"],
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

// Compound Unique Index: A user can only like a specific entity once
likeSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

// Index for "recently liked" queries
likeSchema.index({ userId: 1, createdAt: -1 });

// Index for "who liked this recently" queries
likeSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const UniversalLike = mongoose.model("UniversalLike", likeSchema);
export default UniversalLike;
