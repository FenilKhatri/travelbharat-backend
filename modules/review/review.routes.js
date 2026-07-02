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
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";

const router = express.Router();

// User (Requires Authentication)
router.get("/user/me", protect, getMyReviews);
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteOwnReview);

// Admin (Requires Admin Role)
const adminAuth = [protect, authorizeRoles("admin")];
router.get("/admin/all", adminAuth, adminGetAllReviews);
router.get("/admin/:id", adminAuth, adminGetReview);
router.patch("/admin/:id/approve", adminAuth, approveReview);
router.patch("/admin/:id/reject", adminAuth, rejectReview);
router.patch("/admin/:id/respond", adminAuth, adminRespondToReview);
router.delete("/admin/:id", adminAuth, adminDeleteReview);

// Public (Must be last to avoid catching /admin/all or /user/me)
router.get("/:entityType/:entityId", getEntityReviews);

export default router;
