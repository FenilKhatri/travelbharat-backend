import express from "express";
import { getTags, getTagBySlug, createTag, updateTag, deleteTag } from "./tag.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";

const router = express.Router();

// Public
router.get("/", getTags);
router.get("/:slug", getTagBySlug);

// Admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

export default router;
