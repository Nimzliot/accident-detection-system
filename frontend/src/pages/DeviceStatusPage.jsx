import DevicePresenceSummary from "../components/DevicePresenceSummary";
import DevicePanel from "../components/DevicePanel";
import { useDashboard } from "../context/DashboardContext";

const DeviceStatusPage = () => {
  const { devices, connected, hardwareStatus, hardwareDevices } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(29,18,20,0.95),rgba(50,26,19,0.88))] p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Device Status</p>
        <h2 className="mt-2 font-display text-3xl text-white">Fleet connectivity</h2>
        <p className="mt-3 text-slate-300">
          Backend websocket status: {connected ? "connected and streaming telemetry" : "offline"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${hardwareStatus.tone}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${hardwareStatus.dot}`} />
            {hardwareStatus.label}
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10">
            {hardwareDevices.length} real hardware device(s) registered
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-400">{hardwareStatus.helper}</p>
      </div>
      <DevicePresenceSummary devices={devices} />
      <DevicePanel devices={devices} />
    </div>
  );
};

export default DeviceStatusPage;
