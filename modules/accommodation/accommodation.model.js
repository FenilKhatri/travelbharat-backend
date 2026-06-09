import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        destinationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TouristPlace",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["Hotel", "Resort", "Homestay", "Hostel", "Guest House"],
            default: "Hotel",
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        pricePerNight: {
            type: Number,
            required: true,
        },
        distanceFromCenter: {
            type: String, // e.g., "2 km", "500 m"
            default: "Unknown",
        },
        images: {
            hero: { type: String, default: "" },
            gallery: [{ type: String }],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Accommodation", accommodationSchema);
