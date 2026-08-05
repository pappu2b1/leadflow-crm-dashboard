import mongoose from "mongoose";

export const LEAD_SOURCES = ["Website Form", "WhatsApp", "Facebook Ads", "Google Ads", "Referral", "LinkedIn", "Direct Call", "Other"];
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"];
export const LEAD_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const noteSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    serviceInterested: { type: String, required: true, trim: true },
    budget: { type: Number, min: 0, default: 0 },
    leadSource: { type: String, enum: LEAD_SOURCES, default: "Website Form" },
    status: { type: String, enum: LEAD_STATUSES, required: true, default: "New" },
    priority: { type: String, enum: LEAD_PRIORITIES, required: true, default: "Medium" },
    assignedTo: { type: String, trim: true, default: "Sales Team" },
    followUpDate: { type: Date },
    notes: [noteSchema]
  },
  { timestamps: true }
);

leadSchema.index({ fullName: "text", email: "text", phone: "text", companyName: "text", serviceInterested: "text" });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
