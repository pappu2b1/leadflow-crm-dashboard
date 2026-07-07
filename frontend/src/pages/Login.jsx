import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@leadflowcrm.com", password: "Admin@12345" });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100 ring-1 ring-white/15">
              <ShieldCheck size={16} /> Premium lead operations dashboard
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-normal sm:text-5xl">LeadFlow CRM</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100">Track sales inquiries, assign follow-ups, monitor conversion, and keep every lead moving from first contact to closed business.</p>
            <div className="mt-8 grid gap-3 text-sm text-blue-100 sm:grid-cols-3">
              {['JWT protected', 'Live reports', 'Responsive admin'].map((item) => <div key={item} className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">{item}</div>)}
            </div>
          </section>
          <section className="rounded-lg bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-bold">Admin Login</h2>
            <p className="mt-1 text-sm text-slate-500">Use the demo credentials to enter the dashboard.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={18} /><input id="email" type="email" className="input pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} /><input id="password" type="password" className="input pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              </div>
              <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Open Dashboard"}<ArrowRight size={18} /></button>
            </form>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p><strong>Email:</strong> admin@leadflowcrm.com</p>
              <p><strong>Password:</strong> Admin@12345</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
