import {
  Activity,
  Bell,
  ClipboardList,
  LayoutDashboard,
  RadioTower,
  Shield
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
              ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20"
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
    <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 px-4 py-5 backdrop-blur lg:hidden">
      <div className="mb-4 flex items-center gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Smart Accident</h1>
          <p className="text-sm text-slate-400">Realtime response dashboard</p>
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
                  ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20"
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

    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-slate-950/80 px-6 py-8 lg:block">
      <div className="mb-10">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Shield size={24} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-white">Smart Accident</h1>
        <p className="mt-2 text-sm text-slate-400">
          IoT incident command dashboard for realtime response teams.
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
