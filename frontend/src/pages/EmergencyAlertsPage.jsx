import AlertList from "../components/AlertList";

const EmergencyAlertsPage = () => (
  <div className="space-y-6">
    <div className="rounded-[28px] border border-white/10 bg-panel/80 p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Emergency Alerts</p>
      <h2 className="mt-2 font-display text-3xl text-white">Critical incident command queue</h2>
      <p className="mt-3 text-slate-300">
        Severe events automatically trigger SMS workflows and a 108 ambulance simulation.
      </p>
    </div>
    <AlertList />
  </div>
);

export default EmergencyAlertsPage;
