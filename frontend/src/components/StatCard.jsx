export const StatCard = ({ icon: Icon, label, value, note, tone = "bg-navy-50 text-navy-700" }) => (
  <div className="card group p-5 transition duration-200 hover:-translate-y-1 hover:border-navy-200">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <div className={`rounded-lg p-3 transition group-hover:scale-105 ${tone}`}><Icon size={22} /></div>
    </div>
    <p className="mt-4 text-xs font-medium text-slate-500">{note}</p>
  </div>
);
