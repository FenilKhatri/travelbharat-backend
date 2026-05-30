import mongoose from "mongoose";

const savedTripSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        places: [
            {
                placeId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "TouristPlace",
                },
                day: { type: Number, default: 1 },
                notes: { type: String, default: "" },
                order: { type: Number, default: 0 },
            },
        ],
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        totalDays: {
            type: Number,
            default: 1,
        },
        budget: {
            type: String,
            enum: ["budget", "moderate", "luxury"],
            default: "moderate",
        },
        tripType: {
            type: String,
            enum: ["family", "couple", "solo", "friends", "pilgrim"],
            default: "family",
        },
        notes: {
            type: String,
            default: "",
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        coverImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("SavedTrip", savedTripSchema);
