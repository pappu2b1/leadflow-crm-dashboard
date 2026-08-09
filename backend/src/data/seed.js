import dotenv from "dotenv";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import Lead from "../models/Lead.js";
import { sampleLeads } from "./sampleLeads.js";
import { validateStrongPassword } from "../utils/passwordPolicy.js";

dotenv.config();

export const seedDemoData = async () => {
  const email = (process.env.DEMO_ADMIN_EMAIL || "admin@leadflowcrm.com").toLowerCase().trim();
  const password = process.env.DEMO_ADMIN_PASSWORD;
  validateStrongPassword(password, "DEMO_ADMIN_PASSWORD");

  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = await Admin.create({
      name: "LeadFlow Admin",
      email,
      password,
      role: "admin",
      companyName: "LeadFlow CRM Demo",
      defaultAssignee: "Sales Team"
    });
  }

  const now = Date.now();
  const operations = sampleLeads.map((lead, index) => ({
    updateOne: {
      filter: { email: lead.email.toLowerCase() },
      update: {
        $setOnInsert: {
          ...lead,
          notes: (lead.notes || []).map((note) => ({ ...note, createdBy: admin._id })),
          createdAt: new Date(now - index * 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now - index * 24 * 60 * 60 * 1000)
        }
      },
      upsert: true,
      timestamps: false
    }
  }));
  await Lead.bulkWrite(operations);
  return { adminEmail: email, demoLeadCount: sampleLeads.length };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  connectDB()
    .then(seedDemoData)
    .then(async ({ adminEmail, demoLeadCount }) => {
      console.log(`Seed complete: demo admin ${adminEmail} and ${demoLeadCount} synthetic leads ensured.`);
      await mongoose.disconnect();
    })
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exit(1);
    });
}
