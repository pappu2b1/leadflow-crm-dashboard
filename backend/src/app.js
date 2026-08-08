import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import packageJson from "../package.json" with { type: "json" };

export const createApp = () => {
  const app = express();
  const configuredClientUrl = process.env.CLIENT_URL?.trim();
  const corsOrigin = configuredClientUrl || (process.env.NODE_ENV === "production" ? false : ["http://localhost:5173", "http://127.0.0.1:5173"]);
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  if (process.env.NODE_ENV !== "test") app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 900000, max: process.env.NODE_ENV === "test" ? 10000 : 300, standardHeaders: true, legacyHeaders: false }));
  app.get("/api/health", (req, res) => res.json({ success: true, message: "LeadFlow CRM API is healthy" }));
  app.get("/api/version", (req, res) => res.json({ success: true, name: packageJson.name, version: packageJson.version }));
  app.get("/api/health/database", (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ success: connected, status: connected ? "connected" : "disconnected" });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/stats", statsRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
