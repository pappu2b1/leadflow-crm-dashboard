import { ArrowLeft, Edit, Mail, MessageCircle, Phone, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { ConfirmModal } from "../components/ConfirmModal";
import { LoadingState } from "../components/LoadingState";
import api from "../services/api";
import { followUpLabel, formatCurrency, formatDate, formatDateTime } from "../utils/format";

const DetailRow = ({ label, value }) => <div><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value || "Not provided"}</p></div>;

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const loadLead = () => {
    api.get(`/leads/${id}`)
      .then(({ data }) => setLead(data.lead))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLead(); }, [id]);

  const whatsappPhone = useMemo(() => (lead?.phone || "").replace(/\D/g, ""), [lead]);
  const follow = lead ? followUpLabel(lead.followUpDate) : null;

  const deleteLead = async () => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success("Lead deleted");
      navigate("/leads");
    } catch (error) { toast.error(error.message); }
  };

  const addNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return toast.error("Write a note first");
    setSavingNote(true);
    try {
      await api.post(`/leads/${id}/notes`, { message: note });
      setNote("");
      toast.success("Note added");
      loadLead();
    } catch (error) { toast.error(error.message); }
    finally { setSavingNote(false); }
  };

  if (loading) return <LoadingState label="Loading lead profile" />;
  if (!lead) return null;

  const sortedNotes = [...(lead.notes || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3"><Link className="icon-btn" to="/leads"><ArrowLeft size={18} /></Link><div><h2 className="text-2xl font-bold text-slate-950">{lead.fullName}</h2><p className="text-sm text-slate-500">{lead.companyName || "Individual lead"} - {lead.serviceInterested}</p></div></div>
        <div className="flex flex-wrap gap-2"><a className="btn-secondary" href={`tel:${lead.phone}`}><Phone size={17} /> Call</a><a className="btn-secondary" href={`mailto:${lead.email}`}><Mail size={17} /> Email</a><a className="btn-secondary" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsappPhone}`}><MessageCircle size={17} /> WhatsApp</a><Link className="btn-primary" to={`/leads/${id}/edit`}><Edit size={17} /> Edit</Link><button className="btn-danger" onClick={() => setDeleteOpen(true)}><Trash2 size={17} /> Delete</button></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-5">
          <div className="flex flex-wrap gap-2"><Badge type="status">{lead.status}</Badge><Badge type="priority">{lead.priority}</Badge><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${follow.className}`}>{follow.label}</span></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Email" value={lead.email} /><DetailRow label="Phone" value={lead.phone} /><DetailRow label="Company" value={lead.companyName} />
            <DetailRow label="Service" value={lead.serviceInterested} /><DetailRow label="Budget" value={formatCurrency(lead.budget)} /><DetailRow label="Source" value={lead.leadSource} />
            <DetailRow label="Assigned To" value={lead.assignedTo} /><DetailRow label="Follow-up" value={formatDate(lead.followUpDate)} /><DetailRow label="Created" value={formatDateTime(lead.createdAt)} />
            <DetailRow label="Updated" value={formatDateTime(lead.updatedAt)} />
          </div>
        </section>
        <section className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">Activity Timeline</h3>
          <form onSubmit={addNote} className="mt-4 space-y-3"><textarea className="input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a call note, proposal update, or follow-up outcome." /><button className="btn-primary" disabled={savingNote}><Plus size={17} /> {savingNote ? "Adding..." : "Add Note"}</button></form>
          <div className="mt-5 space-y-3">
            {sortedNotes.length ? sortedNotes.map((item) => <div key={item._id} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="text-sm text-slate-800">{item.message}</p><p className="mt-2 text-xs font-medium text-slate-400">{formatDateTime(item.createdAt)}</p></div>) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No notes yet.</p>}
          </div>
        </section>
      </div>
      <ConfirmModal open={deleteOpen} title="Delete lead?" description={`This will permanently delete ${lead.fullName}.`} onCancel={() => setDeleteOpen(false)} onConfirm={deleteLead} confirmText="Delete Lead" />
    </div>
  );
};

export default LeadDetails;
