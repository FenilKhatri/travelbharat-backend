import express from "express";
import {
    getAllStates, getFeaturedStates, getStateBySlug,
    createState, updateState, deleteState,
    adminGetAllStates, adminGetState, getAvailableFilters,
    getSimilarStates
} from "./state.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public routes
router.get("/filters", getAvailableFilters);
router.get("/", getAllStates);
router.get("/featured", getFeaturedStates);
router.get("/:slug", getStateBySlug);
router.get("/:slug/similar", getSimilarStates);

// Admin routes
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllStates);
router.get("/admin/:id", adminGetState);
router.post("/admin/create", createState);
router.put("/admin/:id", updateState);
router.delete("/admin/:id", deleteState);

export default router;
