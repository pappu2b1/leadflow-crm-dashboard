import { priorityColor, statusColor } from "../utils/format";

export const Badge = ({ children, type = "neutral", className = "" }) => {
  const colors = type === "status" ? statusColor : type === "priority" ? priorityColor : {};
  const tone = colors[children] || "bg-slate-50 text-slate-700 ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone} ${className}`}>{children}</span>;
};
