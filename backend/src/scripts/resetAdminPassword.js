import dotenv from "dotenv";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import { validateStrongPassword } from "../utils/passwordPolicy.js";

dotenv.config();

export const validateResetEnvironment = (env = process.env) => {
  if (!env.MONGO_URI?.trim()) throw new Error("MONGO_URI is required");
  if (!env.ADMIN_RESET_EMAIL?.trim()) throw new Error("ADMIN_RESET_EMAIL is required");
  validateStrongPassword(env.ADMIN_RESET_PASSWORD, "ADMIN_RESET_PASSWORD");
  return {
    email: env.ADMIN_RESET_EMAIL.toLowerCase().trim(),
    password: env.ADMIN_RESET_PASSWORD
  };
};

export const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  return local.slice(0, 1) + "***@" + domain;
};

export const resetAdminPassword = async ({ email, password }) => {
  validateStrongPassword(password, "ADMIN_RESET_PASSWORD");
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) throw new Error("Admin account not found");
  if (admin.role !== "admin") throw new Error("Account is not an admin");

  admin.password = password;
  await admin.save({ timestamps: false, validateModifiedOnly: true });
  return maskEmail(admin.email);
};

const run = async () => {
  try {
    const credentials = validateResetEnvironment();
    await connectDB({ logConnection: false });
    const maskedEmail = await resetAdminPassword(credentials);
    console.log("Admin password reset successfully for " + maskedEmail);
  } catch (error) {
    const safeMessages = new Set([
      "MONGO_URI is required",
      "ADMIN_RESET_EMAIL is required",
      "ADMIN_RESET_PASSWORD is required",
      "ADMIN_RESET_PASSWORD must be at least 12 characters",
      "Admin account not found",
      "Account is not an admin"
    ]);
    console.error(safeMessages.has(error.message) ? error.message : "Admin password reset failed");
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      if (!process.exitCode) console.error("Admin password reset failed");
      process.exitCode = 1;
    }
  }
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) await run();