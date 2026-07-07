import { SearchX } from "lucide-react";

export const EmptyState = ({ title = "No results found", description = "Try changing filters or adding a new lead." }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
    <div className="mb-3 rounded-full bg-navy-50 p-3 text-navy-700"><SearchX size={24} /></div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
  </div>
);
