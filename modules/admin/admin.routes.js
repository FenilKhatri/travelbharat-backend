import express from "express";
import {
    getDashboardStats, getAllUsers, getUserById, updateUser, deleteUser,
    getHeroBanners, getActiveHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner,
    getSettings, getPublicSettings, upsertSetting, deleteSetting,
    getAllCategories, createCategory, updateCategory, deleteCategory,
} from "./admin.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public routes (needed by frontend)
router.get("/banners/active", getActiveHeroBanners);
router.get("/settings/public", getPublicSettings);
router.get("/categories", getAllCategories);

// Admin routes
router.use(protect, authorizeRoles(ROLES.ADMIN));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Hero Banners
router.get("/banners", getHeroBanners);
router.post("/banners", createHeroBanner);
router.put("/banners/:id", updateHeroBanner);
router.delete("/banners/:id", deleteHeroBanner);

// Settings
router.get("/settings", getSettings);
router.post("/settings", upsertSetting);
router.delete("/settings/:id", deleteSetting);

// Categories
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;