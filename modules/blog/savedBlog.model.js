import mongoose from "mongoose";

const savedBlogSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

savedBlogSchema.index({ blogId: 1, userId: 1 }, { unique: true });

const SavedBlog = mongoose.model("SavedBlog", savedBlogSchema);
export default SavedBlog;
