import Lead, { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const currencyAverage = (total, count) => (count ? Math.round(total / count) : 0);

const countByField = async (field, values) => {
  const groups = await Lead.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return values.map((value) => ({ name: value, value: groups.find((item) => item._id === value)?.count || 0 }));
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = endOfDay(now);
  const monthStart = startOfMonth(now);

  const [total, today, month, byStatus, upcomingFollowUps, overdueFollowUps] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
    Lead.countDocuments({ createdAt: { $gte: monthStart } }),
    countByField("status", LEAD_STATUSES),
    Lead.find({ followUpDate: { $gte: todayStart }, status: { $nin: ["Converted", "Lost"] } }).sort({ followUpDate: 1 }).limit(8),
    Lead.find({ followUpDate: { $lt: todayStart }, status: { $nin: ["Converted", "Lost"] } }).sort({ followUpDate: 1 }).limit(8)
  ]);

  const statusMap = Object.fromEntries(byStatus.map((item) => [item.name, item.value]));
  res.json({
    success: true,
    stats: {
      totalLeads: total,
      newLeads: statusMap.New || 0,
      contactedLeads: statusMap.Contacted || 0,
      qualifiedLeads: statusMap.Qualified || 0,
      convertedLeads: statusMap.Converted || 0,
      lostLeads: statusMap.Lost || 0,
      todaysLeads: today,
      thisMonthsLeads: month
    },
    upcomingFollowUps,
    overdueFollowUps
  });
});

export const getReports = asyncHandler(async (req, res) => {
  const [total, converted, byStatus, bySource, byPriority, budgetAgg, services, monthly] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: "Converted" }),
    countByField("status", LEAD_STATUSES),
    countByField("leadSource", LEAD_SOURCES),
    countByField("priority", LEAD_PRIORITIES),
    Lead.aggregate([{ $group: { _id: null, averageBudget: { $avg: "$budget" } } }]),
    Lead.aggregate([{ $group: { _id: "$serviceInterested", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
    Lead.aggregate([
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, leads: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);

  const bestSource = bySource.reduce((best, item) => (item.value > best.value ? item : best), { name: "N/A", value: 0 });
  const monthlyLeadGrowth = monthly.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    leads: item.leads
  }));

  res.json({
    success: true,
    reportCards: {
      conversionRate: total ? Math.round((converted / total) * 100) : 0,
      averageLeadBudget: currencyAverage(budgetAgg[0]?.averageBudget || 0, 1),
      mostPopularService: services[0]?._id || "N/A",
      bestLeadSource: bestSource.name
    },
    charts: {
      leadsByStatus: byStatus,
      leadsBySource: bySource,
      leadsByPriority: byPriority,
      monthlyLeadGrowth,
      conversionSummary: [
        { name: "Converted", value: converted },
        { name: "Open/Lost", value: Math.max(total - converted, 0) }
      ]
    }
  });
});
