import express from "express";
import { getDashboardStats, getReports } from "../controllers/statsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/reports", protect, getReports);

export default router;
