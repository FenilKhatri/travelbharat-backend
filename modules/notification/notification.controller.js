import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import Notification from "./notification.model.js";

// Admin: Get notifications
export const getAdminNotifications = asyncHandler(async (req, res) => {
    // Return all system notifications and notifications for this user
    const query = { $or: [{ user: req.user._id }, { type: "system" }] };
    const notifications = await Notification.find(query).sort("-createdAt").limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });

    return successResponse(res, 200, "Notifications fetched", { notifications, unreadCount });
});

// Admin: Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return errorResponse(res, 404, "Notification not found");
    return successResponse(res, 200, "Marked as read", { notification });
});

// Admin: Mark all as read
export const markAllAsRead = asyncHandler(async (req, res) => {
    const query = { $or: [{ user: req.user._id }, { type: "system" }], read: false };
    await Notification.updateMany(query, { read: true });
    return successResponse(res, 200, "All marked as read");
});

// Admin: Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
    await Notification.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, "Notification deleted");
});
