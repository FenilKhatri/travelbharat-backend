import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";

// Memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif|svg|mp4|mov|avi|wmv/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    // Allow image and video mimetypes
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError("Only image and video files are allowed", 400), false);
    }
};

// Single image upload
export const uploadSingle = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

// Multiple images upload (max 10)
export const uploadMultiple = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).array("images", 10);

// Gallery upload (max 5 files, 5MB limit)
export const uploadGallery = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).array("gallery", 5);

export default multer({ storage, fileFilter });
