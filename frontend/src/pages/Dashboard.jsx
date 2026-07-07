import { CalendarDays, CheckCircle2, CircleDollarSign, Clock3, PhoneCall, TrendingUp, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatCard } from "../components/StatCard";
import api from "../services/api";
import { formatDate } from "../utils/format";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/stats/dashboard")
      .then(({ data }) => setData(data))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (error) return <EmptyState title="Dashboard unavailable" description={error} />;

  const stats = data.stats;
  const cards = [
    { label: "Total Leads", value: stats.totalLeads, note: "All captured opportunities", icon: Users, tone: "bg-navy-50 text-navy-700" },
    { label: "New Leads", value: stats.newLeads, note: "Ready for first outreach", icon: UserPlus, tone: "bg-sky-50 text-sky-700" },
    { label: "Contacted", value: stats.contactedLeads, note: "Conversation started", icon: PhoneCall, tone: "bg-blue-50 text-blue-700" },
    { label: "Qualified", value: stats.qualifiedLeads, note: "Strong sales fit", icon: TrendingUp, tone: "bg-violet-50 text-violet-700" },
    { label: "Converted", value: stats.convertedLeads, note: "Won business", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Lost", value: stats.lostLeads, note: "Closed without sale", icon: CircleDollarSign, tone: "bg-rose-50 text-rose-700" },
    { label: "Today's Leads", value: stats.todaysLeads, note: "Created today", icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "This Month", value: stats.thisMonthsLeads, note: "Current month volume", icon: CalendarDays, tone: "bg-cyan-50 text-cyan-700" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-bold text-slate-950">Dashboard Overview</h2><p className="text-sm text-slate-500">A clear view of lead health, follow-ups, and pipeline movement.</p></div>
        <Link to="/leads/new" className="btn-primary">Add New Lead</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <StatCard key={card.label} {...card} />)}</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">Upcoming Follow-ups</h3>
          <div className="mt-4 space-y-3">
            {data.upcomingFollowUps.length ? data.upcomingFollowUps.map((lead) => (
              <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-navy-200 hover:bg-navy-50">
                <div><p className="font-semibold text-slate-900">{lead.fullName}</p><p className="text-sm text-slate-500">{lead.serviceInterested}</p></div>
                <div className="text-right"><Badge type="priority">{lead.priority}</Badge><p className="mt-1 text-xs text-slate-500">{formatDate(lead.followUpDate)}</p></div>
              </Link>
            )) : <EmptyState title="No upcoming follow-ups" description="New follow-ups will appear here after leads are scheduled." />}
          </div>
        </section>
        <section className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">Overdue Follow-ups</h3>
          <div className="mt-4 space-y-3">
            {data.overdueFollowUps.length ? data.overdueFollowUps.map((lead) => (
              <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-rose-200 hover:bg-rose-50">
                <div><p className="font-semibold text-slate-900">{lead.fullName}</p><p className="text-sm text-slate-500">{lead.phone}</p></div>
                <div className="text-right"><Badge type="status">{lead.status}</Badge><p className="mt-1 text-xs text-rose-600">{formatDate(lead.followUpDate)}</p></div>
              </Link>
            )) : <EmptyState title="No overdue follow-ups" description="Your follow-up queue is clean." />}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
