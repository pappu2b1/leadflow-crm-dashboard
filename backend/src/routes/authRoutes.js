import express from "express";
import { getMe, loginAdmin, loginDemo, updateProfile } from "../controllers/authController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
const router = express.Router();
router.post("/login", loginAdmin);
router.post("/demo", loginDemo);
router.get("/me", protect, getMe);
router.put("/profile", protect, requireAdmin, updateProfile);
export default router;
