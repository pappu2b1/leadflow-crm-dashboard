import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "demo" && decoded.mode === "readonly") {
      req.user = { id: "demo", name: "Demo User", role: "demo", mode: "readonly" };
      req.admin = null;
      return next();
    }

    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      res.status(401);
      throw new Error("Not authorized, admin not found");
    }

    req.user = req.admin;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "demo" && req.admin) return next();
  return res.status(403).json({ success: false, message: "Demo mode is read-only." });
};

export const blockDemoMutations = (req, res, next) => {
  if (req.user?.role === "demo" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return res.status(403).json({ success: false, message: "Demo mode is read-only." });
  }
  return next();
};
