import express from "express";
import { uploadImage, uploadImages } from "./upload.controller.js";
import { uploadSingle, uploadMultiple } from "../../common/middlewares/upload.middleware.js";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../common/middlewares/role.middleware.js";
import { ROLES } from "../../common/utils/constants.js";

const router = express.Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));
router.post("/single", uploadSingle, uploadImage);
router.post("/multiple", uploadMultiple, uploadImages);

export default router;
