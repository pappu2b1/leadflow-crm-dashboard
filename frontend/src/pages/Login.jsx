import { ArrowRight, Eye, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginError = "Invalid email or password.";
const inputClass = "input h-12 pl-11 pr-4 leading-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
const inputIconClass = "pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400";

const Login = () => {
  const { login, openDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      await login(form.email, form.password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      setErrorMessage(loginError);
      toast.error(loginError);
    } finally {
      setLoading(false);
    }
  };

  const launchDemo = async () => {
    setDemoLoading(true);
    setErrorMessage("");
    try {
      await openDemo();
      toast.success("Read-only demo opened");
      navigate("/");
    } catch {
      const message = "Live demo temporarily unavailable.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-navy-900 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 opacity-80" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(47,118,210,0.35),transparent_30rem),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_26rem),linear-gradient(135deg,#07182f_0%,#0b2448_52%,#102f5c_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100 ring-1 ring-white/15">
              <ShieldCheck size={16} /> Secure admin access
            </div>
            <div className="mt-6">
              <p className="text-4xl font-bold tracking-normal sm:text-5xl">LeadFlow CRM</p>
              <p className="mt-3 text-base font-semibold text-blue-100 sm:text-lg">Lead Management Admin Dashboard</p>
            </div>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
              A professional CRM workspace for managing leads, follow-ups, and business reports from one clean admin panel.
            </p>
            <div className="mt-8 grid gap-3 text-sm font-medium text-blue-50 sm:grid-cols-3">
              {["Lead tracking", "Follow-up queue", "CRM reports"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 shadow-lg shadow-navy-900/20 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl shadow-navy-900/30 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 sm:mx-0">
                <Eye size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-950">Admin Login</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage leads, follow-ups, and CRM reports.</p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <span className={inputIconClass}>
                    <Mail size={18} strokeWidth={2} />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={loading || demoLoading}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <span className={inputIconClass}>
                    <LockKeyhole size={18} strokeWidth={2} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    disabled={loading || demoLoading}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium leading-5 text-rose-700" role="alert">
                  {errorMessage}
                </div>
              )}

              <button className="btn-primary w-full py-3" disabled={loading || demoLoading} type="submit">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <button className="btn-secondary w-full py-3" type="button" onClick={launchDemo} disabled={loading || demoLoading}>
                <Eye size={18} /> {demoLoading ? "Opening demo..." : "Open Live Demo"}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">Explore synthetic CRM data in a secure read-only workspace. No credentials required.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
