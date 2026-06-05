import express from "express";
import { toggleLike, getLikedItems, checkLikeStatus } from "./like.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.post("/toggle", toggleLike);
router.get("/", getLikedItems);
router.get("/check/:entityType/:entityId", checkLikeStatus);

export default router;
