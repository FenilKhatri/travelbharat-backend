import express from "express";
import {
    getPlaceReviews, createReview, updateReview, deleteOwnReview, getMyReviews,
    adminGetAllReviews, approveReview, rejectReview, adminRespondToReview, adminDeleteReview
} from "./review.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.get("/place/:placeId", getPlaceReviews);

// User (authenticated)
router.use(protect);
router.post("/", authorizeRoles(ROLES.USER, ROLES.ADMIN), createReview);
router.get("/my", authorizeRoles(ROLES.USER, ROLES.ADMIN), getMyReviews);
router.put("/:id", authorizeRoles(ROLES.USER), updateReview);
router.delete("/:id", authorizeRoles(ROLES.USER), deleteOwnReview);

// Admin
router.get("/admin/all", authorizeRoles(ROLES.ADMIN), adminGetAllReviews);
router.put("/admin/approve/:id", authorizeRoles(ROLES.ADMIN), approveReview);
router.put("/admin/reject/:id", authorizeRoles(ROLES.ADMIN), rejectReview);
router.put("/admin/respond/:id", authorizeRoles(ROLES.ADMIN), adminRespondToReview);
router.delete("/admin/:id", authorizeRoles(ROLES.ADMIN), adminDeleteReview);

export default router;
