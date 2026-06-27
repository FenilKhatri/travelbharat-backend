import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        phone: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["feedback", "complaint", "suggestion", "partnership", "support", "other"],
            default: "support",
            index: true,
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "archived", "spam"],
            default: "new",
            index: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Admin user handling this inquiry
            index: true,
        },
        adminNotes: {
            type: String, // Internal notes for admins
        },
        repliedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

contactSchema.index({ createdAt: -1 });

const ContactInquiry = mongoose.model("ContactInquiry", contactSchema);
export default ContactInquiry;
