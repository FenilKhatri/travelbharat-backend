import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Trip name is required"],
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        collaborators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        description: {
            type: String,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
            default: "draft",
            index: true,
        },
        tripType: {
            type: String,
            enum: ["family", "solo", "friends", "couple", "business"],
            default: "solo",
        },
        travelers: {
            adults: { type: Number, default: 1 },
            children: { type: Number, default: 0 },
            seniors: { type: Number, default: 0 },
        },
        // Consolidated Itinerary (replaces separate places[] and itinerary[])
        itinerary: [
            {
                dayNumber: { type: Number, required: true },
                title: { type: String },
                date: { type: Date },
                // Activities for the day (can be a place visit, travel, food, etc)
                activities: [
                    {
                        time: { type: String }, // e.g., "10:00 AM"
                        type: {
                            type: String,
                            enum: ["place", "food", "travel", "accommodation", "other"],
                            default: "place",
                        },
                        description: { type: String },
                        // Optional links to actual entities
                        placeId: { type: mongoose.Schema.Types.ObjectId, ref: "TouristPlace" },
                        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
                        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
                        activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
                        notes: { type: String },
                    },
                ],
            },
        ],
        // Budget & Expenses
        budget: {
            type: Number,
            default: 0,
        },
        totalExpense: {
            type: Number,
            default: 0,
        },
        // Expenses kept embedded unless it becomes a heavy feature
        expenses: [
            {
                category: {
                    type: String,
                    enum: ["food", "transport", "accommodation", "activities", "shopping", "other"],
                },
                amount: { type: Number, required: true },
                currency: { type: String, default: "INR" },
                date: { type: Date },
                description: { type: String },
                paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            },
        ],
        // Bookings/Accommodations references
        accommodations: [
            {
                hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
                checkIn: Date,
                checkOut: Date,
                bookingReference: String,
            },
        ],
        transportation: {
            type: String, // e.g. "Flight to Delhi, Cab to Agra"
        },
        isPublic: {
            type: Boolean,
            default: false,
            index: true,
        },
        autoCompleted: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ isPublic: 1, createdAt: -1 });

const SavedTrip = mongoose.model("SavedTrip", tripSchema);
export default SavedTrip;
