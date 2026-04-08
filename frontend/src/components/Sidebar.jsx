import {
  Activity,
  Bell,
  ClipboardList,
  Flame,
  LayoutDashboard,
  RadioTower,
  TriangleAlert
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/monitoring", label: "Monitoring", icon: Activity },
  { to: "/app/devices", label: "Device Status", icon: RadioTower },
  { to: "/app/reports", label: "Reports", icon: ClipboardList },
  { to: "/app/alerts", label: "Emergency Alerts", icon: Bell }
];

const NavItems = () => (
  <>
    {links.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/app"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
              ? "bg-orange-400/10 text-orange-100 ring-1 ring-orange-300/20"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        <Icon size={18} />
        {label}
      </NavLink>
    ))}
  </>
);

const Sidebar = () => {
  const { hardwareStatus } = useDashboard();

  return (
  <>
    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#120c0d]/90 px-4 py-5 backdrop-blur lg:hidden">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.24),rgba(239,68,68,0.18))] text-orange-200 ring-1 ring-orange-300/20">
          <Flame size={20} />
          <TriangleAlert size={12} className="absolute bottom-2 right-2 text-white/90" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Crash Command</h1>
          <p className="text-sm text-slate-400">Emergency response dashboard</p>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app"}
            className={({ isActive }) =>
              `inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-orange-400/10 text-orange-100 ring-1 ring-orange-300/20"
                  : "bg-white/5 text-slate-300"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${hardwareStatus.tone}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${hardwareStatus.dot}`} />
        {hardwareStatus.label}
      </div>
    </div>

    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,rgba(18,12,13,0.98),rgba(16,11,18,0.92))] px-6 py-8 lg:block">
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,rgba(249,115,22,0.24),rgba(239,68,68,0.18))] text-orange-200 ring-1 ring-orange-300/20 shadow-glow">
            <Flame size={24} />
            <TriangleAlert size={14} className="absolute bottom-2 right-2 text-white/90" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300/80">Rapid Response</p>
            <h1 className="font-display text-2xl font-semibold text-white">Crash Command</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Emergency-grade command dashboard for live crash telemetry, GPS, and GSM escalation.
        </p>
        <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${hardwareStatus.tone}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${hardwareStatus.dot}`} />
          {hardwareStatus.label}
        </div>
        <p className="mt-2 text-xs text-slate-500">{hardwareStatus.helper}</p>
      </div>

      <nav className="space-y-2">
        <NavItems />
      </nav>
    </aside>
  </>
  );
};

export default Sidebar;
