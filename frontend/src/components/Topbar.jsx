import { BellRing, Cpu, LogOut, MapPinned, Radio } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { connected, alerts, hardwareStatus, hardwareDevices } = useDashboard();
  const { user, signOut } = useAuth();
  const locatedHardware = hardwareDevices.filter(
    (device) => device.latitude != null && device.longitude != null
  ).length;
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <header className="flex flex-col gap-5 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(36,18,24,0.96),rgba(66,28,23,0.88))] px-6 py-6 shadow-glow backdrop-blur xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-orange-300/80">Command Center</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-white">
          Smart Accident Detection System
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Live accident telemetry, GPS tracking, GSM alert escalation, and control-room response in one view.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[auto_1fr] xl:items-end">
        <div className="hidden rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200 ring-1 ring-white/10 md:block">
          {user?.email}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-white/6 px-4 py-4 ring-1 ring-white/10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Radio size={14} className={connected ? "text-emerald-400" : "text-rose-400"} />
              Socket
            </div>
            <p className="mt-2 text-sm font-semibold text-white">
              {connected ? "Live telemetry online" : "Socket disconnected"}
            </p>
          </div>
          <div className="rounded-[22px] bg-white/6 px-4 py-4 ring-1 ring-white/10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Cpu size={14} className={hardwareStatus.dot} />
              Hardware
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{hardwareStatus.label}</p>
          </div>
          <div className="rounded-[22px] bg-white/6 px-4 py-4 ring-1 ring-white/10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <MapPinned size={14} className="text-orange-300" />
              GPS Markers
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{locatedHardware} live hardware location(s)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:col-span-2 xl:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-2 text-sm text-rose-200 ring-1 ring-rose-500/20">
            <BellRing size={16} />
            {activeAlerts} active severe alerts
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
