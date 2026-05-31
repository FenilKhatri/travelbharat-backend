import express from "express";
import { toggleSaveItem, getSavedItems, checkSavedStatus } from "./savedItem.controller.js";
import { protect } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.post("/toggle", toggleSaveItem);
router.get("/", getSavedItems);
router.get("/check/:itemType/:itemId", checkSavedStatus);

export default router;
