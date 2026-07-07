import { BarChart3, LayoutDashboard, LogOut, Menu, PlusCircle, Settings, Users, X, CalendarClock } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/leads/new", label: "Add Lead", icon: PlusCircle },
  { to: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen lg:flex">
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-900 px-4 py-5 text-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold tracking-normal">LeadFlow CRM</p>
            <p className="text-xs text-blue-100">Admin lead command center</p>
          </div>
          <button className="rounded-lg p-2 text-blue-100 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar"><X size={20} /></button>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-white text-navy-900" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={doLogout} className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button className="icon-btn lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar"><Menu size={20} /></button>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-500">Welcome back</p>
              <h1 className="text-lg font-semibold text-slate-950">{admin?.name || "Admin"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{admin?.name || "Admin"}</p>
                <p className="text-xs text-slate-500">{admin?.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700 text-sm font-bold text-white">{(admin?.name || "A").slice(0, 1)}</div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
      </div>
    </div>
  );
};
