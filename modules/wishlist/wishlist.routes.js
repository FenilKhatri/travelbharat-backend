import express from "express";
import { getWishlist, togglePlace, toggleBlog, checkWishlist } from "./wishlist.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getWishlist);
router.get("/check", checkWishlist);
router.post("/place", togglePlace);
router.post("/blog", toggleBlog);

export default router;
