import SeverityBadge from "./SeverityBadge";

const AccidentTable = ({ accidents }) => (
  <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-5 shadow-glow">
    <div className="mb-4">
      <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Accident History</p>
      <h3 className="mt-2 font-display text-2xl text-white">Latest incident log</h3>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="text-slate-400">
          <tr>
            <th className="pb-3">Device</th>
            <th className="pb-3">Acceleration</th>
            <th className="pb-3">Tilt</th>
            <th className="pb-3">Speed</th>
            <th className="pb-3">Severity</th>
            <th className="pb-3">Location</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Time</th>
          </tr>
        </thead>
        <tbody>
          {accidents.map((accident) => (
            <tr key={accident.id} className="border-t border-white/5">
              <td className="py-4 pr-4 font-medium text-white">{accident.device_id}</td>
              <td className="py-4 pr-4">{accident.acceleration} m/s^2</td>
              <td className="py-4 pr-4">{Number(accident.tilt_angle ?? 0).toFixed(1)} deg</td>
              <td className="py-4 pr-4">{Number(accident.speed ?? 0).toFixed(1)} km/h</td>
              <td className="py-4 pr-4">
                <SeverityBadge label={accident.severity_label} />
              </td>
              <td className="py-4 pr-4">
                {accident.latitude?.toFixed?.(4)}, {accident.longitude?.toFixed?.(4)}
              </td>
              <td className="py-4 pr-4 capitalize">{accident.status}</td>
              <td className="py-4">{new Date(accident.timestamp ?? accident.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AccidentTable;
