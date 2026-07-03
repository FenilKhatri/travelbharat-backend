import express from "express";
import {
    getAllCities, getCitiesByState, getCityBySlug, getFeaturedCities,
    createCity, updateCity, deleteCity, adminGetAllCities, adminGetCity
} from "./city.controller.js";
import { validateCreateCity, validateUpdateCity } from "./city.validation.js";
import { protect, optionalAuth } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllCities);
router.get("/featured", getFeaturedCities);
router.get("/state/:stateSlug", getCitiesByState);
router.get("/:citySlug", optionalAuth, getCityBySlug);

// Admin routes
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllCities);
router.get("/admin/:id", adminGetCity);
router.post("/admin/create", validateCreateCity, createCity);
router.patch("/admin/:id", validateUpdateCity, updateCity);
router.delete("/admin/:id", deleteCity);

export default router;
