import express from "express";
import { subscribe, unsubscribe, getAllSubscribers, deleteSubscriber, getSubscriberStats, broadcastNewsletter } from "./newsletter.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", getAllSubscribers);
router.get("/admin/stats", getSubscriberStats);
router.post("/admin/broadcast", broadcastNewsletter);
router.delete("/admin/:id", deleteSubscriber);

export default router;
