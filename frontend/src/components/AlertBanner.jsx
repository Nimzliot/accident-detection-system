import { TriangleAlert } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

const AlertBanner = () => {
  const { latestAccident, alerts } = useDashboard();
  const latest = latestAccident;

  const latestAlert = alerts.find(
    (alert) =>
      (alert.accidentId === latest?.id || alert.accident_id === latest?.id) && alert.sent
  );

  if (!latest || latest.severity_level !== 3 || !latestAlert) {
    return null;
  }

  return (
    <div className="animate-pulse-alert rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-5 shadow-glow">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-1 text-rose-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-rose-200/80">
              Severe accident alert
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {latest.device_id} reported a critical impact at {new Date(
                latest.timestamp ?? latest.created_at
              ).toLocaleTimeString()}
            </h3>
          </div>
        </div>
        <p className="text-sm text-rose-100/80">
          Emergency contacts and ambulance response simulation are active until this alert is acknowledged.
        </p>
      </div>
    </div>
  );
};

export default AlertBanner;
