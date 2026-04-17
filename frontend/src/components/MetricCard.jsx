const MetricCard = ({ label, value, accent, helper, glowClass = "" }) => (
  <div
    className={`animate-rise-in rounded-[28px] border border-white/10 bg-panel/85 p-5 shadow-glow ${glowClass}`.trim()}
  >
    <div className={`mb-4 h-2 w-16 rounded-full ${accent}`} />
    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <div className="mt-4 flex items-end justify-between gap-4">
      <h3 className="font-display text-4xl font-semibold text-white">{value}</h3>
      <p className="max-w-[10rem] text-right text-sm text-slate-400">{helper}</p>
    </div>
  </div>
);

export default MetricCard;
