import { Calendar, Save } from "lucide-react";

export const leadSources = ["Website Form", "WhatsApp", "Facebook Ads", "Google Ads", "Referral", "LinkedIn", "Direct Call", "Other"];
export const leadStatuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"];
export const leadPriorities = ["Low", "Medium", "High", "Urgent"];

const blankLead = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  serviceInterested: "",
  budget: "",
  leadSource: "Website Form",
  status: "New",
  priority: "Medium",
  assignedTo: "Sales Team",
  followUpDate: "",
  notes: ""
};

const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

export const makeInitialLead = (lead) => lead ? {
  fullName: lead.fullName || "",
  email: lead.email || "",
  phone: lead.phone || "",
  companyName: lead.companyName || "",
  serviceInterested: lead.serviceInterested || "",
  budget: lead.budget || "",
  leadSource: lead.leadSource || "Website Form",
  status: lead.status || "New",
  priority: lead.priority || "Medium",
  assignedTo: lead.assignedTo || "Sales Team",
  followUpDate: toInputDate(lead.followUpDate),
  notes: ""
} : blankLead;

export const validateLeadForm = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Name is required";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  if (!form.serviceInterested.trim()) errors.serviceInterested = "Service is required";
  if (!form.status) errors.status = "Status is required";
  if (!form.priority) errors.priority = "Priority is required";
  return errors;
};

export const LeadForm = ({ form, setForm, errors = {}, onSubmit, saving = false, mode = "add" }) => {
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const field = (name, label, type = "text", props = {}) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={update} className="input" {...props} />
      {errors[name] && <p className="mt-1 text-xs font-medium text-rose-600">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        {field("fullName", "Full Name")}
        {field("email", "Email", "email")}
        {field("phone", "Phone")}
        {field("companyName", "Company Name")}
        {field("serviceInterested", "Service Interested In")}
        {field("budget", "Budget", "number", { min: 0 })}
        <div>
          <label className="label" htmlFor="leadSource">Lead Source</label>
          <select id="leadSource" name="leadSource" value={form.leadSource} onChange={update} className="input">{leadSources.map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={update} className="input">{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select>
          {errors.status && <p className="mt-1 text-xs font-medium text-rose-600">{errors.status}</p>}
        </div>
        <div>
          <label className="label" htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={update} className="input">{leadPriorities.map((item) => <option key={item}>{item}</option>)}</select>
          {errors.priority && <p className="mt-1 text-xs font-medium text-rose-600">{errors.priority}</p>}
        </div>
        {field("assignedTo", "Assigned To")}
        <div>
          <label className="label" htmlFor="followUpDate">Follow-up Date</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
            <input id="followUpDate" name="followUpDate" type="date" value={form.followUpDate} onChange={update} className="input pl-10" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={update} rows={5} className="input resize-y" placeholder={mode === "edit" ? "Add new detail in the notes timeline from the lead profile." : "Add the first conversation note for this lead."} />
        </div>
      </div>
      <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
        <button type="submit" disabled={saving} className="btn-primary"><Save size={18} /> {saving ? "Saving..." : mode === "edit" ? "Update Lead" : "Create Lead"}</button>
      </div>
    </form>
  );
};
