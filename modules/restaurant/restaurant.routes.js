import express from "express";
import { getRestaurants, getRestaurantBySlug, createRestaurant, updateRestaurant, deleteRestaurant } from "./restaurant.controller.js";
import { protect, restrictTo } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getRestaurants);
router.get("/:slug", getRestaurantBySlug);

// Admin
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;
