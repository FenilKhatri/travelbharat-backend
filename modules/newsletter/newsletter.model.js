import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
            index: true,
        },
        source: {
            type: String,
            enum: ["homepage", "footer", "blog", "popup", "registration", "other"],
            default: "footer",
        },
        tags: [
            { type: String, index: true } // e.g. "budget-traveler", "luxury", "rajasthan"
        ],
        lastEmailSentAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        unsubscribedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;
