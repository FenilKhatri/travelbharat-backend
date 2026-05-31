import express from "express";
import {
    getAllCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    adminGetAllCategories,
} from "./category.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Admin routes
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllCategories);
router.post("/admin/create", createCategory);
router.put("/admin/:id", updateCategory);
router.delete("/admin/:id", deleteCategory);

export default router;
