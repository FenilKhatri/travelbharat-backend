import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";

// Memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif|svg/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError("Only image files are allowed (jpeg, jpg, png, gif, webp, avif, svg)", 400), false);
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

// Gallery upload (max 20)
export const uploadGallery = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).array("gallery", 20);

export default multer({ storage, fileFilter });
