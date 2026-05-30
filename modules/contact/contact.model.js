import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            default: "",
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "archived"],
            default: "new",
            index: true,
        },
        adminNotes: {
            type: String,
            default: "",
        },
        repliedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("ContactInquiry", contactSchema);
