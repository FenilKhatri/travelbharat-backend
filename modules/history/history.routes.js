import express from "express";
import { protect } from "../../common/middlewares/auth.middleware.js";
import { addHistory, getMyHistory, clearHistory } from "./history.controller.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getMyHistory)
  .post(addHistory)
  .delete(clearHistory);

export default router;
