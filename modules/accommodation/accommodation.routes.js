import express from "express";
import { getAccommodationsByDestination, createAccommodation } from "./accommodation.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

router.get("/destination/:destinationId", getAccommodationsByDestination);

// Admin
router.post("/admin/create", protect, authorizeRoles(ROLES.ADMIN), createAccommodation);

export default router;
