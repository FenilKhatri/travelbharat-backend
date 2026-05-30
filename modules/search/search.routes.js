import express from "express";
import { search, suggestions } from "./search.controller.js";

const router = express.Router();

router.get("/", search);
router.get("/suggestions", suggestions);

export default router;
