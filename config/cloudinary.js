import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = "travelbharat", publicId = undefined) => {
    try {
        const options = {
            folder,
            resource_type: "auto",
            quality: "auto:good",
            fetch_format: "auto",
        };
        if (publicId) {
            options.public_id = publicId;
        }
        const result = await cloudinary.uploader.upload(filePath, options);
        return {
            url: result.secure_url,
            publicId: result.public_id,
            folder: result.folder,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};

export default cloudinary;
