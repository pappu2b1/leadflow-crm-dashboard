import express from "express";
import { getMe, loginAdmin, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();
router.post("/login", loginAdmin);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
export default router;
