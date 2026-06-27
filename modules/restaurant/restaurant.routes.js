import express from "express";
import { getRestaurants, getRestaurantBySlug, createRestaurant, updateRestaurant, deleteRestaurant } from "./restaurant.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";

const router = express.Router();

// Public
router.get("/", getRestaurants);
router.get("/:slug", getRestaurantBySlug);

// Admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;
