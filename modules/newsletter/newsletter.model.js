import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
        unsubscribedAt: {
            type: Date,
        },
        source: {
            type: String,
            enum: ["homepage", "footer", "blog", "popup", "other"],
            default: "homepage",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("NewsletterSubscriber", newsletterSchema);
