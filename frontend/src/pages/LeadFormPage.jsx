import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LeadForm, makeInitialLead, validateLeadForm } from "../components/LeadForm";
import { LoadingState } from "../components/LoadingState";
import api from "../services/api";

const LeadFormPage = ({ edit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(makeInitialLead());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!edit) return;
    api.get(`/leads/${id}`)
      .then(({ data }) => setForm(makeInitialLead(data.lead)))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [edit, id]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLeadForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const payload = { ...form, budget: Number(form.budget) || 0, followUpDate: form.followUpDate || undefined };
    try {
      if (edit) {
        await api.put(`/leads/${id}`, payload);
        toast.success("Lead updated successfully");
        navigate(`/leads/${id}`);
      } else {
        const { data } = await api.post("/leads", payload);
        toast.success("Lead created successfully");
        navigate(`/leads/${data.lead._id}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading lead form" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Link className="icon-btn" to={edit ? `/leads/${id}` : "/leads"}><ArrowLeft size={18} /></Link><div><h2 className="text-2xl font-bold text-slate-950">{edit ? "Edit Lead" : "Add New Lead"}</h2><p className="text-sm text-slate-500">{edit ? "Update lead details and pipeline status." : "Capture a new inquiry with clean sales context."}</p></div></div>
      <LeadForm form={form} setForm={setForm} errors={errors} onSubmit={submit} saving={saving} mode={edit ? "edit" : "add"} />
    </div>
  );
};

export default LeadFormPage;
