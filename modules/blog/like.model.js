import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            alias: "ReferenceId"
            // Can refer to Blog or Comment
        },
        onModel: {
            type: String,
            required: true,
            enum: ['Blog', 'Comment']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            alias: "Author"
        },
    },
    { timestamps: true }
);

// Ensure a user can only like a specific reference once
likeSchema.index({ referenceId: 1, author: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
