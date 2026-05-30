import express from "express";
import { submitContact, getAllInquiries, getInquiry, updateInquiryStatus, deleteInquiry, getInquiryStats } from "./contact.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

// Public
router.post("/", submitContact);

// Admin
router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/admin/all", getAllInquiries);
router.get("/admin/stats", getInquiryStats);
router.get("/admin/:id", getInquiry);
router.put("/admin/:id", updateInquiryStatus);
router.delete("/admin/:id", deleteInquiry);

export default router;
