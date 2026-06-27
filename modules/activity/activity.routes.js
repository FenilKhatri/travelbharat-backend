import express from "express";
import { getActivities, getActivityBySlug, createActivity, updateActivity, deleteActivity } from "./activity.controller.js";
import { protect, restrictTo } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getActivities);
router.get("/:slug", getActivityBySlug);

// Admin
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

export default router;
