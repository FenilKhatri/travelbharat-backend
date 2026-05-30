import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        places: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TouristPlace",
            },
        ],
        blogs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Wishlist", wishlistSchema);
