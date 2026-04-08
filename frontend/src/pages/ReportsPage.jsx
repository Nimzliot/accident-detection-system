import ChartsPanel from "../components/ChartsPanel";
import { useDashboard } from "../context/DashboardContext";

const ReportsPage = () => {
  const { summary, accidents } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(29,18,20,0.95),rgba(50,26,19,0.88))] p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Reports</p>
        <h2 className="mt-2 font-display text-3xl text-white">Severity analytics and trend review</h2>
        <p className="mt-3 text-slate-300">
          Useful for final-year demos, operator audits, and showcasing predictive triage logic.
        </p>
      </div>
      <ChartsPanel accidents={accidents} summary={summary} />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Minor Share</p>
          <h3 className="mt-3 font-display text-4xl text-emerald-300">{summary.minor}</h3>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Medium Share</p>
          <h3 className="mt-3 font-display text-4xl text-amber-300">{summary.medium}</h3>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Severe Share</p>
          <h3 className="mt-3 font-display text-4xl text-rose-300">{summary.severe}</h3>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
