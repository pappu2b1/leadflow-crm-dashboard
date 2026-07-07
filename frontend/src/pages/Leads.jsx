import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { ConfirmModal } from "../components/ConfirmModal";
import { EmptyState } from "../components/EmptyState";
import { leadPriorities, leadSources, leadStatuses } from "../components/LeadForm";
import { LoadingState } from "../components/LoadingState";
import { useDebounce } from "../hooks/useDebounce";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";

const Leads = () => {
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", leadSource: "", sort: "newest" });
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ leads: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(filters.search);

  const query = useMemo(() => ({ ...filters, search: debouncedSearch, page, limit: 10 }), [filters, debouncedSearch, page]);

  const fetchLeads = () => {
    setLoading(true);
    api.get("/leads", { params: query })
      .then(({ data }) => setPayload(data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [query]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const deleteLead = async () => {
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      toast.success("Lead deleted");
      setDeleteTarget(null);
      fetchLeads();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-bold text-slate-950">Lead Management</h2><p className="text-sm text-slate-500">Search, filter, update, and follow every sales opportunity.</p></div>
        <Link to="/leads/new" className="btn-primary"><Plus size={18} /> Add Lead</Link>
      </div>
      <section className="card p-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Search name, email, phone, company, service" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} /></div>
          <select className="input" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}><option value="">All statuses</option>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="input" value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)}><option value="">All priorities</option>{leadPriorities.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="input" value={filters.leadSource} onChange={(e) => updateFilter("leadSource", e.target.value)}><option value="">All sources</option>{leadSources.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="input" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
        </div>
      </section>
      {loading ? <LoadingState label="Loading leads" /> : payload.leads.length ? (
        <section className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">Follow-up</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payload.leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4"><p className="font-semibold text-slate-900">{lead.fullName}</p><p className="text-xs text-slate-500">{lead.email || lead.phone}</p><p className="text-xs text-slate-400">{lead.companyName}</p></td>
                    <td className="px-4 py-4 text-slate-700">{lead.serviceInterested}</td>
                    <td className="px-4 py-4 text-slate-600">{lead.leadSource}</td>
                    <td className="px-4 py-4"><Badge type="status">{lead.status}</Badge></td>
                    <td className="px-4 py-4"><Badge type="priority">{lead.priority}</Badge></td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(lead.budget)}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(lead.followUpDate)}</td>
                    <td className="px-4 py-4"><div className="flex justify-end gap-2"><Link className="icon-btn" to={`/leads/${lead._id}`} title="View"><Eye size={17} /></Link><Link className="icon-btn" to={`/leads/${lead._id}/edit`} title="Edit"><Edit size={17} /></Link><button className="icon-btn hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => setDeleteTarget(lead)} title="Delete"><Trash2 size={17} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
            <p className="text-sm text-slate-500">Showing {payload.leads.length} of {payload.pagination.total} leads</p>
            <div className="flex gap-2"><button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">{page} / {payload.pagination.pages}</span><button className="btn-secondary" disabled={page >= payload.pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</button></div>
          </div>
        </section>
      ) : <EmptyState title="No leads found" description="No leads match the current search or filters." />}
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete lead?" description={`This will permanently delete ${deleteTarget?.fullName || "this lead"}.`} onCancel={() => setDeleteTarget(null)} onConfirm={deleteLead} confirmText="Delete Lead" />
    </div>
  );
};

export default Leads;
