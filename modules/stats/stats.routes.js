import express from "express";
import { getPublicStats, getStatesDestinationCounts, getUserDashboardStats } from "./stats.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/public", getPublicStats);
router.get("/states-destination-counts", getStatesDestinationCounts);
router.get("/user-dashboard", protect, getUserDashboardStats);

export default router;
