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
            enum: ["state", "city", "destination", "blog", "festival"],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "entityModel",
        },
        entityModel: {
            type: String,
            required: true,
            enum: ["State", "City", "TouristPlace", "Blog", "Festival"],
        }
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate likes
likeSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

export default mongoose.model("UniversalLike", likeSchema);
