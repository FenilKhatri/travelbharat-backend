import express from "express";
import {
    getAllPlaces, getFeaturedPlaces, getTrendingPlaces, getPlaceBySlug,
    getPlacesByCity, getPlacesByState, getPlaceCategories,
    createPlace, updatePlace, deletePlace, adminGetAllPlaces, adminGetPlace
} from "./place.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllPlaces);
router.get("/featured", getFeaturedPlaces);
router.get("/trending", getTrendingPlaces);
router.get("/categories", getPlaceCategories);
router.get("/city/:citySlug", getPlacesByCity);
router.get("/state/:stateSlug", getPlacesByState);
router.get("/:slug", getPlaceBySlug);

// Admin routes
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllPlaces);
router.get("/admin/:id", adminGetPlace);
router.post("/admin/create", createPlace);
router.put("/admin/:id", updatePlace);
router.delete("/admin/:id", deletePlace);

export default router;
