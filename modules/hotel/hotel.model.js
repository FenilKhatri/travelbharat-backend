import mongoose from "mongoose";
import { generateSlug } from "../../common/utils/slug.utils.js";

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Hotel name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true,
            index: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
            index: true, // Denormalized for faster "hotels in Rajasthan" queries
        },
        type: {
            type: String,
            enum: ["hotel", "resort", "homestay", "hostel", "guest-house", "camp"],
            default: "hotel",
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        mapCoordinates: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
        },
        contact: {
            phone: String,
            email: String,
            website: String,
        },
        pricePerNight: {
            min: Number,
            max: Number,
            currency: { type: String, default: "INR" }
        },
        amenities: [
            { type: String } // e.g. "WiFi", "Pool", "Spa", "Parking"
        ],
        checkInTime: { type: String, default: "14:00" },
        checkOutTime: { type: String, default: "11:00" },
        policies: [
            { type: String }
        ],
        images: {
            hero: { url: String, publicId: String, altText: String },
            thumbnail: { url: String, publicId: String, altText: String },
            gallery: [
                { url: String, publicId: String, altText: String }
            ],
        },
        starRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        userRating: {
            type: Number,
            default: 0,
            index: true,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        bookingUrl: {
            type: String,
        },
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            keywords: [{ type: String, trim: true }],
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
hotelSchema.index({ "mapCoordinates": "2dsphere" });
hotelSchema.index({ cityId: 1, "pricePerNight.min": 1 });
hotelSchema.index({ cityId: 1, userRating: -1 });

// Pre-validate hook for slug generation
hotelSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
