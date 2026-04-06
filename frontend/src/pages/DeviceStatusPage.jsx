import DevicePresenceSummary from "../components/DevicePresenceSummary";
import DevicePanel from "../components/DevicePanel";
import { useDashboard } from "../context/DashboardContext";

const DeviceStatusPage = () => {
  const { devices, connected } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-panel/80 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Device Status</p>
        <h2 className="mt-2 font-display text-3xl text-white">Fleet connectivity</h2>
        <p className="mt-3 text-slate-300">
          Backend websocket status: {connected ? "connected and streaming telemetry" : "offline"}
        </p>
      </div>
      <DevicePresenceSummary devices={devices} />
      <DevicePanel devices={devices} />
    </div>
  );
};

export default DeviceStatusPage;
