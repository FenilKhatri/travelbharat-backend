import { errorResponse } from "../utils/responseHandler.utils.js";

// Remove caregiver references, simplified for TravelBharat
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role?.toLowerCase();
        const allowed = roles.map((r) => r.toLowerCase());

        if (!allowed.includes(userRole)) {
            return errorResponse(res, 403, "Access denied! Insufficient permissions.");
        }

        next();
    };
};