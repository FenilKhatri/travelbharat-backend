import express from "express";
import {
    getAllFestivals, getFeaturedFestivals, getFestivalBySlug, getFestivalsByState,
    createFestival, updateFestival, deleteFestival, adminGetAllFestivals, adminGetFestival
} from "./festival.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

router.get("/", getAllFestivals);
router.get("/featured", getFeaturedFestivals);
router.get("/state/:stateSlug", getFestivalsByState);
router.get("/:slug", getFestivalBySlug);

router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", adminGetAllFestivals);
router.get("/admin/:id", adminGetFestival);
router.post("/admin/create", createFestival);
router.put("/admin/:id", updateFestival);
router.delete("/admin/:id", deleteFestival);

export default router;
