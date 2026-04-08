import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const ChartsPanel = ({ accidents, summary }) => {
  const timeline = accidents
    .slice(0, 7)
    .reverse()
    .map((accident, index) => ({
      name: `E${index + 1}`,
      severity: accident.severity_level,
      acceleration: accident.acceleration
    }));

  const distribution = [
    { label: "Minor", value: summary.minor, color: "#22c55e" },
    { label: "Medium", value: summary.medium, color: "#facc15" },
    { label: "Severe", value: summary.severe, color: "#ef4444" }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-5 shadow-glow">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Timeline</p>
        <h3 className="mt-2 font-display text-2xl text-white">Impact trend</h3>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                dataKey="acceleration"
                type="monotone"
                stroke="#fb923c"
                strokeWidth={3}
                dot={{ fill: "#fb923c", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,20,30,0.94),rgba(24,26,45,0.9))] p-5 shadow-glow">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Severity Mix</p>
        <h3 className="mt-2 font-display text-2xl text-white">Incident classification</h3>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={92}
                paddingAngle={4}
              >
                {distribution.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;
