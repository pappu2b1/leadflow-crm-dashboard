import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import Lead from "../models/Lead.js";
import { sampleLeads } from "./sampleLeads.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Promise.all([Admin.deleteMany({}), Lead.deleteMany({})]);

  const admin = await Admin.create({
    name: "LeadFlow Admin",
    email: process.env.DEMO_ADMIN_EMAIL || "admin@leadflowcrm.com",
    password: process.env.DEMO_ADMIN_PASSWORD || "Admin@12345",
    role: "admin",
    companyName: "LeadFlow CRM Demo",
    defaultAssignee: "Sales Team"
  });

  const leads = sampleLeads.map((lead, index) => ({
    ...lead,
    notes: (lead.notes || []).map((note) => ({ ...note, createdBy: admin._id })),
    createdAt: new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
  }));

  await Lead.insertMany(leads);
  console.log("Seed complete: demo admin and sample leads created.");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
