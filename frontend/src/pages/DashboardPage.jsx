import AlertBanner from "../components/AlertBanner";
import Accident3DViewer from "../components/Accident3DViewer";
import ChartsPanel from "../components/ChartsPanel";
import DevicePanel from "../components/DevicePanel";
import MetricCard from "../components/MetricCard";
import AccidentMap from "../components/AccidentMap";
import AccidentTable from "../components/AccidentTable";
import SimulationPanel from "../components/SimulationPanel";
import { useDashboard } from "../context/DashboardContext";

const DashboardPage = () => {
  const { summary, devices, accidents, latestAccident, hardwareStatus } = useDashboard();

  return (
    <div className="space-y-6">
      <AlertBanner />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(29,18,20,0.95),rgba(50,26,19,0.88))] p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-300/80">Operations Overview</p>
          <h3 className="mt-3 font-display text-4xl text-white">Realtime fleet safety monitoring</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The dashboard merges live ESP32 telemetry, GPS tracking, GSM escalation, and control-room alert handling into a single response workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${hardwareStatus.tone}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${hardwareStatus.dot}`} />
              {hardwareStatus.label}
            </div>
            <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10">
              {summary.activeDevices} active device(s) in the last minute
            </div>
            <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10">
              {summary.openAlerts} open emergency alert(s)
            </div>
          </div>
        </div>
        <SimulationPanel />
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Incidents"
          value={summary.total}
          accent="bg-orange-300"
          helper="All logged accidents across the connected fleet."
        />
        <MetricCard
          label="Minor"
          value={summary.minor}
          accent="bg-emerald-400"
          helper="Low-priority impacts suitable for monitoring."
        />
        <MetricCard
          label="Medium"
          value={summary.medium}
          accent="bg-amber-300"
          helper="Moderate-risk events needing operator review."
        />
        <MetricCard
          label="Severe"
          value={summary.severe}
          accent="bg-rose-400"
          helper="Critical incidents escalated to emergency response."
        />
      </div>

      <Accident3DViewer accident={latestAccident} />

      <ChartsPanel accidents={accidents} summary={summary} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <AccidentMap accidents={accidents} devices={devices} />
        <DevicePanel devices={devices} />
      </div>

      <AccidentTable accidents={accidents.slice(0, 10)} />
    </div>
  );
};

export default DashboardPage;
