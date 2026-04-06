const PresenceCard = ({ label, value, accent, helper }) => (
  <div className="rounded-[24px] border border-white/10 bg-panel/80 p-5 shadow-glow">
    <div className={`mb-4 h-2 w-14 rounded-full ${accent}`} />
    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <div className="mt-3 flex items-end justify-between gap-4">
      <h3 className="font-display text-4xl font-semibold text-white">{value}</h3>
      <p className="max-w-[10rem] text-right text-xs text-slate-400">{helper}</p>
    </div>
  </div>
);

const DevicePresenceSummary = ({ devices }) => {
  const online = devices.filter((device) => device.presence.key === "online").length;
  const stale = devices.filter((device) => device.presence.key === "stale").length;
  const offline = devices.filter((device) => device.presence.key === "offline").length;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <PresenceCard
        label="Online Devices"
        value={online}
        accent="bg-emerald-400"
        helper="Healthy heartbeat received in the last 20 seconds."
      />
      <PresenceCard
        label="Stale Devices"
        value={stale}
        accent="bg-amber-300"
        helper="Telemetry delay detected. Device should be checked."
      />
      <PresenceCard
        label="Offline Devices"
        value={offline}
        accent="bg-slate-400"
        helper="No heartbeat received for more than one minute."
      />
    </div>
  );
};

export default DevicePresenceSummary;
