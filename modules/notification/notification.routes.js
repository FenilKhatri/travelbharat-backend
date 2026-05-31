import express from "express";
import { getAdminNotifications, markAsRead, markAllAsRead, deleteNotification, getUserNotifications, userMarkAllAsRead, userMarkAsRead } from "./notification.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

router.use(protect);

// User routes
router.get("/user", getUserNotifications);
router.put("/user/read-all", userMarkAllAsRead);
router.put("/user/:id/read", userMarkAsRead);
router.delete("/user/:id", deleteNotification);

// Admin routes
router.get("/admin", authorizeRoles(ROLES.ADMIN), getAdminNotifications);
router.put("/admin/read-all", authorizeRoles(ROLES.ADMIN), markAllAsRead);
router.put("/admin/:id/read", authorizeRoles(ROLES.ADMIN), markAsRead);
router.delete("/admin/:id", authorizeRoles(ROLES.ADMIN), deleteNotification);

export default router;
