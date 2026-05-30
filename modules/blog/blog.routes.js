import express from "express";
import {
    getAllBlogs, getFeaturedBlogs, getPopularBlogs, getBlogBySlug, getRelatedBlogs, getBlogsByCategory, getBlogsByTag, getBlogCategories, getBlogTags,
    createBlog, updateBlog, deleteBlog, adminGetAllBlogs, adminGetBlog,
    addComment, getComments, deleteComment, toggleLike, toggleSaveBlog, getSavedBlogs, incrementBlogViews
} from "./blog.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/popular", getPopularBlogs);
router.get("/categories", getBlogCategories);
router.get("/tags", getBlogTags);
router.get("/category/:category", getBlogsByCategory);
router.get("/tag/:tag", getBlogsByTag);
router.get("/related/:slug", getRelatedBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/:slug/view", incrementBlogViews);

// Public Interactions
router.get("/:blogId/comments", getComments);

// Protected Interactions
router.post("/:blogId/comments", protect, addComment);
router.delete("/comments/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleLike);
router.post("/:blogId/save", protect, toggleSaveBlog);
router.get("/user/saved", protect, getSavedBlogs);
router.post("/create", protect, createBlog); // Allow authenticated users to create blogs

// Admin
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllBlogs);
router.get("/admin/:id", adminGetBlog);
router.post("/admin/create", createBlog);
router.put("/admin/:id", updateBlog);
router.delete("/admin/:id", deleteBlog);

export default router;
