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
  const { summary, devices, accidents, latestAccident } = useDashboard();

  return (
    <div className="space-y-6">
      <AlertBanner />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Incidents"
          value={summary.total}
          accent="bg-cyan-300"
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

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Accident3DViewer accident={latestAccident} />
        <SimulationPanel />
      </div>

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
