import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <section className="card max-w-lg p-8 text-center">
      <p className="text-sm font-semibold uppercase text-navy-700">404</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-950">Page not found</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">The page you are looking for does not exist in this dashboard.</p>
      <Link to="/" className="btn-primary mt-6"><Home size={17} /> Back to Dashboard</Link>
    </section>
  </div>
);

export default NotFound;
