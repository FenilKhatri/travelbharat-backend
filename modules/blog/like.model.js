import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        referenceType: {
            type: String,
            enum: ["blog", "comment"],
            required: true,
        },

        author: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: String,
            profilePic: String,
        },

        likeTime: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Like", likeSchema);
