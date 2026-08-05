import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const publicAdmin = (admin) => ({ id: admin._id, name: admin.name, email: admin.email, role: admin.role, companyName: admin.companyName, defaultAssignee: admin.defaultAssignee });

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error("Email and password are required"); }
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin || !(await admin.matchPassword(password))) { res.status(401); throw new Error("Invalid email or password"); }
  res.json({ success: true, token: generateToken(admin._id), admin: publicAdmin(admin) });
});

export const getMe = asyncHandler(async (req, res) => res.json({ success: true, admin: publicAdmin(req.admin) }));

export const updateProfile = asyncHandler(async (req, res) => {
  const fields = ["name", "email", "companyName", "defaultAssignee"];
  const updates = Object.fromEntries(fields.map((field) => [field, String(req.body[field] || "").trim()]));
  if (Object.values(updates).some((value) => !value)) { res.status(400); throw new Error("Name, email, company name, and default assignee are required"); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) { res.status(400); throw new Error("Email format is invalid"); }
  const duplicate = await Admin.findOne({ email: updates.email.toLowerCase(), _id: { $ne: req.admin._id } });
  if (duplicate) { res.status(409); throw new Error("Email is already in use"); }
  Object.assign(req.admin, updates);
  await req.admin.save();
  res.json({ success: true, message: "Profile updated successfully", admin: publicAdmin(req.admin) });
});
