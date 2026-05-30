import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
            index: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
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

        likes: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Comment", commentSchema);
