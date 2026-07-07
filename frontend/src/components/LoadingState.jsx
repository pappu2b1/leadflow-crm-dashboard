export const LoadingState = ({ label = "Loading" }) => (
  <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70">
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-200 border-t-navy-700" />
      {label}
    </div>
  </div>
);
