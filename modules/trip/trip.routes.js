import express from "express";
import {
    getMyTrips, getTrip, createTrip, updateTrip, deleteTrip,
    addPlaceToTrip, removePlaceFromTrip, getPublicTrips,
    adminGetAllTrips, adminGetTrip, adminDeleteTrip,
    addExpense, deleteExpense,
    addItineraryDay, deleteItineraryDay,
    uploadGallery, deleteGalleryItem, generateTripItinerary,
    duplicateTrip
} from "./trip.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { uploadGallery as uploadGalleryMiddleware } from "../../common/middlewares/upload.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.get("/public", getPublicTrips);
router.post("/generate", generateTripItinerary);

// Protected
router.use(protect);
router.get("/", getMyTrips);

// Admin routes
router.get("/admin/all", authorizeRoles(ROLES.ADMIN), adminGetAllTrips);
router.get("/admin/:id", authorizeRoles(ROLES.ADMIN), adminGetTrip);
router.delete("/admin/:id", authorizeRoles(ROLES.ADMIN), adminDeleteTrip);

router.get("/:id", getTrip);
router.post("/", createTrip);
router.post("/:id/duplicate", duplicateTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/add-place", addPlaceToTrip);
router.post("/:id/remove-place", removePlaceFromTrip);

// Expenses
router.post("/:id/expenses", addExpense);
router.delete("/:id/expenses/:expenseId", deleteExpense);

// Itinerary
router.post("/:id/itinerary", addItineraryDay);
router.delete("/:id/itinerary/:dayId", deleteItineraryDay);

// Gallery
router.post("/:id/gallery", uploadGalleryMiddleware, uploadGallery);
router.delete("/:id/gallery/:imageId", deleteGalleryItem);

export default router;
