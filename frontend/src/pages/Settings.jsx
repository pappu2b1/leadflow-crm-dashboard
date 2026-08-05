import { Save, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { admin, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", companyName: "", defaultAssignee: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm({ name: admin?.name || "", email: admin?.email || "", companyName: admin?.companyName || "", defaultAssignee: admin?.defaultAssignee || "" }), [admin]);
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try { await updateProfile(form); localStorage.removeItem("leadflow_settings"); toast.success("Profile settings saved"); }
    catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-950">Settings</h2><p className="text-sm text-slate-500">Maintain the authenticated admin profile and default assignment details.</p></div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-6"><div className="flex items-center gap-4"><div className="rounded-lg bg-navy-50 p-3 text-navy-700"><UserCircle size={36} /></div><div><h3 className="text-lg font-semibold text-slate-950">{form.name}</h3><p className="text-sm text-slate-500">{form.email}</p></div></div><div className="mt-6 space-y-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600"><p><strong>Company:</strong> {form.companyName}</p><p><strong>Default assignee:</strong> {form.defaultAssignee}</p><p><strong>Role:</strong> Admin</p></div></section>
        <form onSubmit={save} className="card p-6"><div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="name">Admin name</label><input id="name" required className="input" name="name" value={form.name} onChange={update} /></div><div><label className="label" htmlFor="settings-email">Email</label><input id="settings-email" required className="input" name="email" type="email" value={form.email} onChange={update} /></div><div><label className="label" htmlFor="companyName">Company name</label><input id="companyName" required className="input" name="companyName" value={form.companyName} onChange={update} /></div><div><label className="label" htmlFor="defaultAssignee">Default lead assignment name</label><input id="defaultAssignee" required className="input" name="defaultAssignee" value={form.defaultAssignee} onChange={update} /></div></div><div className="mt-6 flex justify-end"><button className="btn-primary" disabled={saving}><Save size={17} /> {saving ? "Saving..." : "Save Settings"}</button></div></form>
      </div>
    </div>
  );
};
export default Settings;
