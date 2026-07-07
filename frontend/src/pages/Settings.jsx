import { Save, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { admin } = useAuth();
  const [form, setForm] = useState({ adminName: "", email: "", companyName: "", defaultAssignee: "" });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("leadflow_settings") || "null");
    setForm(saved || { adminName: admin?.name || "LeadFlow Admin", email: admin?.email || "admin@leadflowcrm.com", companyName: admin?.companyName || "LeadFlow CRM Demo", defaultAssignee: admin?.defaultAssignee || "Sales Team" });
  }, [admin]);

  const save = (event) => {
    event.preventDefault();
    localStorage.setItem("leadflow_settings", JSON.stringify(form));
    toast.success("Profile settings saved");
  };

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-950">Settings</h2><p className="text-sm text-slate-500">Maintain the demo admin profile and default assignment details.</p></div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-6"><div className="flex items-center gap-4"><div className="rounded-lg bg-navy-50 p-3 text-navy-700"><UserCircle size={36} /></div><div><h3 className="text-lg font-semibold text-slate-950">{form.adminName}</h3><p className="text-sm text-slate-500">{form.email}</p></div></div><div className="mt-6 space-y-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600"><p><strong>Company:</strong> {form.companyName}</p><p><strong>Default assignee:</strong> {form.defaultAssignee}</p><p><strong>Role:</strong> Admin</p></div></section>
        <form onSubmit={save} className="card p-6"><div className="grid gap-5 sm:grid-cols-2"><div><label className="label">Admin name</label><input className="input" name="adminName" value={form.adminName} onChange={update} /></div><div><label className="label">Email</label><input className="input" name="email" type="email" value={form.email} onChange={update} /></div><div><label className="label">Company name</label><input className="input" name="companyName" value={form.companyName} onChange={update} /></div><div><label className="label">Default lead assignment name</label><input className="input" name="defaultAssignee" value={form.defaultAssignee} onChange={update} /></div></div><div className="mt-6 flex justify-end"><button className="btn-primary"><Save size={17} /> Save Settings</button></div></form>
      </div>
    </div>
  );
};

export default Settings;
