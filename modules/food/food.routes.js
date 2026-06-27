import express from "express";
import { getFoods, getFoodBySlug, createFood, updateFood, deleteFood } from "./food.controller.js";
import { protect, restrictTo } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getFoods);
router.get("/:slug", getFoodBySlug);

// Admin
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createFood);
router.put("/:id", updateFood);
router.delete("/:id", deleteFood);

export default router;
