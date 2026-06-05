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
        destinationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TouristPlace",
        },
        city: String,
        state: String,
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
        duration: {
            type: Number,
            default: 1,
        },
        travelers: {
            adults: { type: Number, default: 1 },
            children: { type: Number, default: 0 },
            seniors: { type: Number, default: 0 },
        },
        budget: {
            type: Number,
            default: 0,
        },
        tripType: {
            type: String,
            enum: ["family", "couple", "solo", "friends", "pilgrim", "group"],
            default: "family",
        },
        transportation: {
            type: String,
            default: "",
        },
        accommodations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Accommodation"
            }
        ],
        estimatedCost: {
            type: Number,
            default: 0,
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
