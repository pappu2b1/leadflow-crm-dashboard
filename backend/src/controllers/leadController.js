import Lead, { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDemoFollowUps, getDemoLead, getDemoLeads } from "../services/demoDataService.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLead = (payload) => {
  const errors = [];
  if (!payload.fullName?.trim()) errors.push("Full name is required");
  if (payload.email && !emailRegex.test(payload.email)) errors.push("Email format is invalid");
  if (!payload.phone?.trim()) errors.push("Phone is required");
  if (!payload.serviceInterested?.trim()) errors.push("Service interested in is required");
  if (!LEAD_STATUSES.includes(payload.status)) errors.push("Status is invalid");
  if (!LEAD_PRIORITIES.includes(payload.priority)) errors.push("Priority is invalid");
  if (payload.leadSource && !LEAD_SOURCES.includes(payload.leadSource)) errors.push("Lead source is invalid");
  return errors;
};

const buildFilters = (query) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.leadSource) filters.leadSource = query.leadSource;
  if (query.search) {
    const search = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filters.$or = [
      { fullName: search },
      { email: search },
      { phone: search },
      { companyName: search },
      { serviceInterested: search }
    ];
  }
  return filters;
};

export const getFollowUps = asyncHandler(async (req, res) => {
  if (req.user?.role === "demo") {
    const { items, pagination } = getDemoFollowUps(req.query);
    return res.json({ success: true, leads: items, pagination });
  }
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const filters = { followUpDate: { $exists: true, $ne: null }, status: { $nin: ["Converted", "Lost"] } };
  if (req.query.type === "overdue") filters.followUpDate = { $lt: today };
  if (req.query.type === "today") filters.followUpDate = { $gte: today, $lt: tomorrow };
  if (req.query.type === "upcoming") filters.followUpDate = { $gte: tomorrow };
  if (req.query.search) {
    const search = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filters.$or = [{ fullName: search }, { phone: search }, { serviceInterested: search }];
  }
  const [leads, total] = await Promise.all([
    Lead.find(filters).sort({ followUpDate: 1 }).skip((page - 1) * limit).limit(limit),
    Lead.countDocuments(filters)
  ]);
  res.json({ success: true, leads, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});
export const getLeads = asyncHandler(async (req, res) => {
  if (req.user?.role === "demo") {
    const { items, pagination } = getDemoLeads(req.query);
    return res.json({ success: true, leads: items, pagination });
  }
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
  const filters = buildFilters(req.query);

  const [leads, total] = await Promise.all([
    Lead.find(filters).sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filters)
  ]);

  res.json({
    success: true,
    leads,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = req.user?.role === "demo" ? getDemoLead(req.params.id) : await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  res.json({ success: true, lead });
});

export const createLead = asyncHandler(async (req, res) => {
  const errors = validateLead(req.body);
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const lead = await Lead.create({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    companyName: req.body.companyName,
    serviceInterested: req.body.serviceInterested,
    budget: Number(req.body.budget) || 0,
    leadSource: req.body.leadSource || "Website Form",
    status: req.body.status,
    priority: req.body.priority,
    assignedTo: req.body.assignedTo || req.admin.defaultAssignee || "Sales Team",
    followUpDate: req.body.followUpDate || undefined,
    notes: req.body.notes ? [{ message: req.body.notes, createdBy: req.admin._id }] : []
  });

  res.status(201).json({ success: true, message: "Lead created successfully", lead });
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const merged = { ...lead.toObject(), ...req.body };
  const errors = validateLead(merged);
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const fields = ["fullName", "email", "phone", "companyName", "serviceInterested", "leadSource", "status", "priority", "assignedTo", "followUpDate"];
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) lead[field] = req.body[field];
  });
  if (Object.prototype.hasOwnProperty.call(req.body, "budget")) lead.budget = Number(req.body.budget) || 0;
  if (req.body.notes?.trim()) {
    lead.notes.push({ message: req.body.notes.trim(), createdBy: req.admin._id });
  }

  const updatedLead = await lead.save();
  res.json({ success: true, message: "Lead updated successfully", lead: updatedLead });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  await lead.deleteOne();
  res.json({ success: true, message: "Lead deleted successfully" });
});

export const getLeadNotes = asyncHandler(async (req, res) => {
  const lead = req.user?.role === "demo" ? getDemoLead(req.params.id) : await Lead.findById(req.params.id).select("notes");
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  const notes = [...lead.notes].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, notes });
});

export const addLeadNote = asyncHandler(async (req, res) => {
  if (!req.body.message?.trim()) {
    res.status(400);
    throw new Error("Note message is required");
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  lead.notes.push({ message: req.body.message.trim(), createdBy: req.admin._id });
  await lead.save();
  const note = lead.notes[lead.notes.length - 1];
  res.status(201).json({ success: true, message: "Note added", note });
});
