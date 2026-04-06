import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { session, signIn } = useAuth();
  const [form, setForm] = useState({
    email: "admin@rescue.local",
    password: "password123"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signIn(form);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_25%),linear-gradient(160deg,_#08111f,_#030712)] px-6 font-body">
      <div className="grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-cyan-300/80">
            Emergency Operations Dashboard
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-white">
            Smart Accident Detection System
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Supabase-authenticated, realtime accident monitoring for ESP32 + MPU6050 vehicle
            telemetry, control room workflows, and emergency response escalation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-glow backdrop-blur"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Secure Login</p>
          <h2 className="mt-3 font-display text-3xl text-white">Control room access</h2>
          <div className="mt-8 space-y-4">
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              placeholder="admin@rescue.local"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              placeholder="Enter secure password"
            />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Enter Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
