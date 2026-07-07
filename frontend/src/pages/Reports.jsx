import { BarChart3, CircleDollarSign, LineChart as LineIcon, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatCard } from "../components/StatCard";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

const colors = ["#164f9c", "#2f76d2", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0f766e", "#64748b"];

const ChartBox = ({ title, children }) => <section className="card p-5"><h3 className="text-lg font-semibold text-slate-950">{title}</h3><div className="mt-4 h-72">{children}</div></section>;

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats/reports")
      .then(({ data }) => setReports(data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading reports" />;
  if (!reports) return <EmptyState title="Reports unavailable" description="Refresh after adding leads or checking the API." />;

  const { reportCards, charts } = reports;
  const cards = [
    { label: "Conversion Rate", value: `${reportCards.conversionRate}%`, note: "Converted leads against total volume", icon: Target, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Average Budget", value: formatCurrency(reportCards.averageLeadBudget), note: "Mean budget across tracked leads", icon: CircleDollarSign, tone: "bg-amber-50 text-amber-700" },
    { label: "Popular Service", value: reportCards.mostPopularService, note: "Most requested service category", icon: TrendingUp, tone: "bg-violet-50 text-violet-700" },
    { label: "Best Source", value: reportCards.bestLeadSource, note: "Highest lead volume channel", icon: BarChart3, tone: "bg-sky-50 text-sky-700" }
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-950">Analytics & Reports</h2><p className="text-sm text-slate-500">Business-focused reporting for lead quality, channel performance, and conversion movement.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.label} {...card} />)}</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartBox title="Leads by Status"><ResponsiveContainer><PieChart><Pie data={charts.leadsByStatus} dataKey="value" nameKey="name" outerRadius={95} label>{charts.leadsByStatus.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></ChartBox>
        <ChartBox title="Leads by Source"><ResponsiveContainer><BarChart data={charts.leadsBySource}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#164f9c" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartBox>
        <ChartBox title="Leads by Priority"><ResponsiveContainer><BarChart data={charts.leadsByPriority}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2f76d2" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartBox>
        <ChartBox title="Monthly Lead Growth"><ResponsiveContainer><LineChart data={charts.monthlyLeadGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="leads" stroke="#164f9c" strokeWidth={3} dot={{ r: 5 }} /></LineChart></ResponsiveContainer></ChartBox>
        <ChartBox title="Conversion Rate Summary"><ResponsiveContainer><PieChart><Pie data={charts.conversionSummary} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>{charts.conversionSummary.map((_, index) => <Cell key={index} fill={index === 0 ? "#16a34a" : "#94a3b8"} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></ChartBox>
        <section className="card flex min-h-72 flex-col justify-center p-6"><LineIcon className="text-navy-700" size={34} /><h3 className="mt-4 text-xl font-semibold text-slate-950">Pipeline insight</h3><p className="mt-2 text-sm leading-6 text-slate-500">Use status, source, and priority charts together to identify which services and campaigns deserve more sales attention.</p></section>
      </div>
    </div>
  );
};

export default Reports;
