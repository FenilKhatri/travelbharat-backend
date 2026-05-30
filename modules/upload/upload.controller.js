import fs from "fs";
import path from "path";
import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// Ensure local uploads directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const saveLocal = (file, req) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    
    // Construct full URL so the frontend can display it correctly
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return `${baseUrl}/uploads/${filename}`;
};

// Upload single image
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return errorResponse(res, 400, "No image file provided");
    }

    let imageUrl;

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Fallback to local storage if Cloudinary is not configured
        imageUrl = saveLocal(req.file, req);
    } else {
        // Upload to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const folder = req.body.folder || "travelbharat/general";
        const result = await uploadToCloudinary(dataURI, folder);
        imageUrl = result.url;
    }

    return successResponse(res, 200, "Image uploaded", { image: { url: imageUrl } });
});

// Upload multiple images
export const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return errorResponse(res, 400, "No image files provided");
    }

    let images = [];

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Fallback to local storage
        images = req.files.map(file => ({ url: saveLocal(file, req) }));
    } else {
        // Upload to Cloudinary
        const folder = req.body.folder || "travelbharat/general";
        const uploadPromises = req.files.map(async (file) => {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            return uploadToCloudinary(dataURI, folder);
        });
        images = await Promise.all(uploadPromises);
    }

    return successResponse(res, 200, "Images uploaded", { images });
});
