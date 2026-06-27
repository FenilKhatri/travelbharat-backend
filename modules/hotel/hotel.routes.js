import express from "express";
import { getHotels, getHotelBySlug, createHotel, updateHotel, deleteHotel } from "./hotel.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";

const router = express.Router();

// Public
router.get("/", getHotels);
router.get("/:slug", getHotelBySlug);

// Admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/", createHotel);
router.put("/:id", updateHotel);
router.delete("/:id", deleteHotel);

export default router;
