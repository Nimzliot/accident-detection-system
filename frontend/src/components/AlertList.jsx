import { useDashboard } from "../context/DashboardContext";
import SeverityBadge from "./SeverityBadge";

const AlertList = () => {
  const { alerts, acknowledgeAlert } = useDashboard();

  return (
    <div className="rounded-[28px] border border-white/10 bg-panel/80 p-5 shadow-glow">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Emergency Queue</p>
        <h3 className="mt-2 font-display text-2xl text-white">Dispatch and acknowledgement</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-white">{alert.accident?.device_id ?? "Emergency Alert"}</p>
                  <SeverityBadge label={alert.accident?.severity_label ?? "Severe"} />
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {alert.message}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-rose-200/70">
                  Alert status: {alert.sent ? "sent" : "acknowledged"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => acknowledgeAlert(alert.accidentId ?? alert.accident_id)}
                disabled={!alert.sent}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
              >
                {alert.sent ? "Acknowledge" : "Acknowledged"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertList;
