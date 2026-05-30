import express from "express";
import { getAdminNotifications, markAsRead, markAllAsRead, deleteNotification } from "./notification.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));

router.get("/admin", getAdminNotifications);
router.put("/admin/read-all", markAllAsRead);
router.put("/admin/:id/read", markAsRead);
router.delete("/admin/:id", deleteNotification);

export default router;
