import express from "express";
import {
    getAllBlogs, getFeaturedBlogs, getPopularBlogs, getBlogBySlug, getRelatedBlogs, getBlogsByCategory, getBlogsByTag, getBlogCategories, getBlogTags,
    createBlog, updateBlog, deleteBlog, requestDeleteBlog, adminGetAllBlogs, adminGetBlog,
    adminGetModerationRequests, adminApproveBlog, adminRejectBlog, adminApproveEdit, adminRejectEdit, adminApproveDelete, adminRejectDelete, getUserBlogs,
    addComment, getComments, deleteComment, toggleLike, incrementBlogViews
} from "./blog.controller.js";
import { protect, optionalAuth } from "../../common/middlewares/auth.middleware.js";
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
router.get("/:slug", optionalAuth, getBlogBySlug);
router.post("/:slug/view", incrementBlogViews);

// Public Interactions
router.get("/:blogId/comments", getComments);

// Protected Interactions
router.post("/:blogId/comments", protect, addComment);
router.delete("/comments/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleLike);
router.get("/user/my-blogs", protect, getUserBlogs);
router.post("/create", protect, createBlog); // Allow authenticated users to create blogs
router.put("/:id", protect, updateBlog); // Allow users to update/edit
router.post("/:id/request-delete", protect, requestDeleteBlog); // Allow users to request deletion

// Admin
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/moderation/requests", adminGetModerationRequests);
router.put("/admin/moderation/:id/approve", adminApproveBlog);
router.put("/admin/moderation/:id/reject", adminRejectBlog);
router.put("/admin/moderation/:id/approve-edit", adminApproveEdit);
router.put("/admin/moderation/:id/reject-edit", adminRejectEdit);
router.put("/admin/moderation/:id/approve-delete", adminApproveDelete);
router.put("/admin/moderation/:id/reject-delete", adminRejectDelete);

router.get("/admin/all", adminGetAllBlogs);
router.get("/admin/:id", adminGetBlog);
router.post("/admin/create", createBlog);
router.put("/admin/:id", updateBlog);
router.delete("/admin/:id", deleteBlog);

export default router;
