import express from "express";
import { 
    getEntityReviews, 
    createReview, 
    updateReview, 
    deleteOwnReview, 
    getMyReviews, 
    adminGetAllReviews, 
    adminGetReview, 
    approveReview, 
    rejectReview, 
    adminRespondToReview, 
    adminDeleteReview 
} from "./review.controller.js";
import { protect, restrictTo } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/:entityType/:entityId", getEntityReviews);

// User
router.use(protect);
router.get("/user/me", getMyReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteOwnReview);

// Admin
router.use(restrictTo("admin"));
router.get("/admin/all", adminGetAllReviews);
router.get("/admin/:id", adminGetReview);
router.patch("/admin/:id/approve", approveReview);
router.patch("/admin/:id/reject", rejectReview);
router.patch("/admin/:id/respond", adminRespondToReview);
router.delete("/admin/:id", adminDeleteReview);

export default router;
