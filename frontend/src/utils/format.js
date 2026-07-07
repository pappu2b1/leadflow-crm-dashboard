export const formatDate = (value) => {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
};

export const statusColor = {
  New: "bg-sky-50 text-sky-700 ring-sky-200",
  Contacted: "bg-blue-50 text-blue-700 ring-blue-200",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-200",
  "Proposal Sent": "bg-amber-50 text-amber-700 ring-amber-200",
  Converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-rose-50 text-rose-700 ring-rose-200"
};

export const priorityColor = {
  Low: "bg-slate-50 text-slate-700 ring-slate-200",
  Medium: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  High: "bg-orange-50 text-orange-700 ring-orange-200",
  Urgent: "bg-red-50 text-red-700 ring-red-200"
};

export const followUpLabel = (date) => {
  if (!date) return { label: "No date", className: "bg-slate-50 text-slate-600 ring-slate-200" };
  const target = new Date(date);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = Math.round((startTarget - startToday) / 86400000);
  if (diff < 0) return { label: "Overdue", className: "bg-rose-50 text-rose-700 ring-rose-200" };
  if (diff === 0) return { label: "Today", className: "bg-amber-50 text-amber-700 ring-amber-200" };
  return { label: "Upcoming", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
};
