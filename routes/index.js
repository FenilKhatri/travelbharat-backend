import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import stateRoutes from "../modules/state/state.routes.js";
import cityRoutes from "../modules/city/city.routes.js";
import { getCityByStateAndSlug } from "../modules/city/city.controller.js";
import placeRoutes from "../modules/place/place.routes.js";
import blogRoutes from "../modules/blog/blog.routes.js";
import festivalRoutes from "../modules/festival/festival.routes.js";
import reviewRoutes from "../modules/review/review.routes.js";
import tripRoutes from "../modules/trip/trip.routes.js";
import likeRoutes from "../modules/like/like.routes.js";
import newsletterRoutes from "../modules/newsletter/newsletter.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";
import searchRoutes from "../modules/search/search.routes.js";
import uploadRoutes from "../modules/upload/upload.routes.js";
import notificationRoutes from "../modules/notification/notification.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import statsRoutes from "../modules/stats/stats.routes.js";
import savedItemRoutes from "../modules/user/savedItem.routes.js";
import historyRoutes from "../modules/history/history.routes.js";

import foodRoutes from "../modules/food/food.routes.js";
import hotelRoutes from "../modules/hotel/hotel.routes.js";
import restaurantRoutes from "../modules/restaurant/restaurant.routes.js";
import activityRoutes from "../modules/activity/activity.routes.js";
import tagRoutes from "../modules/tag/tag.routes.js";

const router = express.Router();

// Authentication
router.use("/auth", authRoutes);

// Public Content
router.use("/states", stateRoutes);
router.get("/states/:stateSlug/cities/:citySlug", getCityByStateAndSlug);
router.use("/cities", cityRoutes);
router.use("/places", placeRoutes);
router.use("/blogs", blogRoutes);
router.use("/festivals", festivalRoutes);
router.use("/reviews", reviewRoutes);
router.use("/categories", categoryRoutes);
router.use("/stats", statsRoutes);

router.use("/foods", foodRoutes);
router.use("/hotels", hotelRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/activities", activityRoutes);
router.use("/tags", tagRoutes);

// User Features
router.use("/trips", tripRoutes);
router.use("/likes", likeRoutes);
router.use("/saved-items", savedItemRoutes);
router.use("/history", historyRoutes);

// Public Forms
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);

// Search
router.use("/search", searchRoutes);

// Admin
router.use("/admin", adminRoutes);

// Uploads
router.use("/upload", uploadRoutes);

// Notifications
router.use("/notifications", notificationRoutes);

export default router;