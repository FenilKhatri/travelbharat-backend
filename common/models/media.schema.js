import mongoose from "mongoose";

export const mediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        folder: {
            type: String,
        },
        resourceType: {
            type: String,
        },
        format: {
            type: String,
        },
        bytes: {
            type: Number,
        },
        width: {
            type: Number,
        },
        height: {
            type: Number,
        },
        altText: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);
