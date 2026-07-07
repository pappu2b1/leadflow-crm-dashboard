import { CalendarClock, Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import api from "../services/api";
import { followUpLabel, formatDate } from "../utils/format";

const FollowUps = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leads", { params: { limit: 100, sort: "newest" } })
      .then(({ data }) => setLeads(data.leads.filter((lead) => lead.followUpDate)))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => leads.filter((lead) => {
    const label = followUpLabel(lead.followUpDate).label.toLowerCase();
    const matchesFilter = filter === "all" || label === filter;
    const q = search.toLowerCase();
    const matchesSearch = [lead.fullName, lead.phone, lead.serviceInterested, lead.status, lead.priority].some((item) => String(item || "").toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate)), [leads, filter, search]);

  if (loading) return <LoadingState label="Loading follow-ups" />;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-950">Follow-ups</h2><p className="text-sm text-slate-500">Prioritize today, overdue, and upcoming conversations.</p></div>
      <section className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search follow-up queue" /></div>
          <div className="grid grid-cols-2 gap-2 sm:flex">{["all", "today", "upcoming", "overdue"].map((item) => <button key={item} className={filter === item ? "btn-primary" : "btn-secondary"} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        </div>
      </section>
      {visible.length ? <section className="card overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Lead Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Follow-up Date</th><th className="px-4 py-3">Label</th><th className="px-4 py-3 text-right">Quick View</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{visible.map((lead) => { const label = followUpLabel(lead.followUpDate); return <tr key={lead._id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-slate-900">{lead.fullName}</td><td className="px-4 py-4 text-slate-600">{lead.phone}</td><td className="px-4 py-4 text-slate-700">{lead.serviceInterested}</td><td className="px-4 py-4"><Badge type="status">{lead.status}</Badge></td><td className="px-4 py-4"><Badge type="priority">{lead.priority}</Badge></td><td className="px-4 py-4 text-slate-600">{formatDate(lead.followUpDate)}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${label.className}`}><CalendarClock size={13} />{label.label}</span></td><td className="px-4 py-4 text-right"><Link className="icon-btn" to={`/leads/${lead._id}`}><Eye size={17} /></Link></td></tr>; })}</tbody></table></div></section> : <EmptyState title="No follow-ups found" description="Try another label or schedule a follow-up date on a lead." />}
    </div>
  );
};

export default FollowUps;
