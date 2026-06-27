import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
            index: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Denormalized for fast rendering, but should be updated if user updates profile
        author: {
            name: String,
            profilePic: String,
        },
        content: {
            type: String,
            required: [true, "Comment content cannot be empty"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null, // If null, it's a top-level comment. If set, it's a reply.
            index: true,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        isApproved: {
            type: Boolean,
            default: true, // Assuming auto-approval, can be set to false for manual moderation
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true, // Soft delete
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for fetching top-level comments and their replies efficiently
commentSchema.index({ blogId: 1, parentId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
