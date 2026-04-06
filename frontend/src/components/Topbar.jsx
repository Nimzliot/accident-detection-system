import { BellRing, LogOut, Radio } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { connected, alerts, hardwareStatus } = useDashboard();
  const { user, signOut } = useAuth();

  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 shadow-glow backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">Command Center</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-white">
          Smart Accident Detection System
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10 md:block">
          {user?.email}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10">
          <Radio size={16} className={connected ? "text-emerald-400" : "text-rose-400"} />
          {connected ? "Live telemetry online" : "Socket disconnected"}
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${hardwareStatus.tone}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${hardwareStatus.dot}`} />
          {hardwareStatus.label}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-2 text-sm text-rose-200 ring-1 ring-rose-500/20">
          <BellRing size={16} />
          {alerts.length} active severe alerts
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
