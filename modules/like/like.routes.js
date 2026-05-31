import express from "express";
import { toggleLike, getLikedItems } from "./like.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.post("/toggle", toggleLike);
router.get("/", getLikedItems);

export default router;
