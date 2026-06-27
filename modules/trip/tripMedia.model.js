import mongoose from "mongoose";

const tripMediaSchema = new mongoose.Schema(
    {
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SavedTrip",
            required: true,
            index: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        media: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
            resourceType: { type: String, enum: ["image", "video"], default: "image" },
        },
        caption: {
            type: String,
            trim: true,
            maxlength: [200, "Caption cannot exceed 200 characters"],
        },
        location: {
            name: { type: String },
            coordinates: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number] },
            },
            placeId: { type: mongoose.Schema.Types.ObjectId, ref: "TouristPlace" }, // Optional link to a specific place
        },
        isCoverImage: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: true,
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
tripMediaSchema.index({ tripId: 1, createdAt: -1 });
tripMediaSchema.index({ uploadedBy: 1, createdAt: -1 });
tripMediaSchema.index({ "location.coordinates": "2dsphere" });

const TripMedia = mongoose.model("TripMedia", tripMediaSchema);
export default TripMedia;
