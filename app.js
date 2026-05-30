import express from "express";
import dns from "dns";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";

import routes from "./routes/index.js";
import { apiLimiter } from "./common/middlewares/limiter.js";

const app = express();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Security
app.use(helmet());
app.use(mongoSanitize());

// Serve static files for local uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Disable caching in development
if (process.env.NODE_ENV !== "production") {
    app.set("etag", false);
    app.use((req, res, next) => {
        res.set("Cache-Control", "no-store");
        next();
    });
}

// Rate limiting
app.use(apiLimiter);

// API Routes
app.use("/api", routes);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "TravelBharat API is running!",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("ERROR:", err);

    const statusCode = err.statusCode || 500;

    if (err.isOperational) {
        return res.status(statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(", "),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for ${field}. Please use a different value.`,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again.",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired. Please login again.",
        });
    }

    // Multer file upload errors
    if (err.name === "MulterError") {
        const multerMessages = {
            LIMIT_FILE_SIZE: "File is too large. Maximum allowed size is 2 MB.",
            LIMIT_FILE_COUNT: "Too many files uploaded at once.",
            LIMIT_UNEXPECTED_FILE: "Unexpected file field. Please check the upload form.",
            LIMIT_PART_COUNT: "Too many parts in the upload.",
            LIMIT_FIELD_KEY: "Field name is too long.",
            LIMIT_FIELD_VALUE: "Field value is too long.",
            LIMIT_FIELD_COUNT: "Too many fields in the upload.",
        };
        return res.status(400).json({
            success: false,
            message: multerMessages[err.code] || "File upload error. Please try again.",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
});

export default app;