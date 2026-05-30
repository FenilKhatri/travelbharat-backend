import express from "express";
import {
    getAllBlogs, getFeaturedBlogs, getBlogBySlug, getBlogCategories, getBlogTags,
    createBlog, updateBlog, deleteBlog, adminGetAllBlogs, adminGetBlog
} from "./blog.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/categories", getBlogCategories);
router.get("/tags", getBlogTags);
router.get("/:slug", getBlogBySlug);

// Admin
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllBlogs);
router.get("/admin/:id", adminGetBlog);
router.post("/admin/create", createBlog);
router.put("/admin/:id", updateBlog);
router.delete("/admin/:id", deleteBlog);

export default router;
