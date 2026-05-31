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
        totalPerson: {
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
        status: {
            type: String,
            enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
            default: "upcoming",
        },
        completedAt: {
            type: Date,
        },
        autoCompleted: {
            type: Boolean,
            default: false,
        },
        gallery: [
            {
                url: String,
                publicId: String,
                resourceType: { type: String, default: "image" },
                uploadedAt: { type: Date, default: Date.now },
            }
        ],
        expenses: [
            {
                title: String,
                amount: Number,
                category: { type: String, enum: ["food", "transport", "accommodation", "shopping", "activities", "other"], default: "other" },
                date: { type: Date, default: Date.now },
            }
        ],
        itinerary: [
            {
                dayNumber: Number,
                title: String,
                date: Date,
                activities: [
                    {
                        time: String,
                        description: String,
                        activityType: { type: String, enum: ["place", "food", "travel", "other"], default: "other" },
                    }
                ]
            }
        ]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("SavedTrip", savedTripSchema);
