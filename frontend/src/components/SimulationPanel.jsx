import { useDashboard } from "../context/DashboardContext";

const buttonStyles = {
  minor: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
  medium: "bg-amber-300 text-slate-950 hover:bg-amber-200",
  severe: "bg-rose-400 text-white hover:bg-rose-300"
};

const SimulationPanel = () => {
  const { runSimulation } = useDashboard();

  return (
    <div className="rounded-[28px] border border-white/10 bg-panel/80 p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Demo Mode</p>
      <h3 className="mt-2 font-display text-2xl text-white">Accident simulator</h3>
      <p className="mt-3 text-sm text-slate-300">
        Generate realistic fake sensor events to test alerts, charts, and the 3D impact viewer.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => runSimulation("minor")}
          className={`rounded-2xl px-4 py-3 font-semibold transition ${buttonStyles.minor}`}
        >
          Simulate Minor Accident
        </button>
        <button
          type="button"
          onClick={() => runSimulation("medium")}
          className={`rounded-2xl px-4 py-3 font-semibold transition ${buttonStyles.medium}`}
        >
          Simulate Medium Accident
        </button>
        <button
          type="button"
          onClick={() => runSimulation("severe")}
          className={`rounded-2xl px-4 py-3 font-semibold transition ${buttonStyles.severe}`}
        >
          Simulate Severe Accident
        </button>
      </div>
    </div>
  );
};

export default SimulationPanel;
