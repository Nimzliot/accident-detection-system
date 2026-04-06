import { severityStyles } from "../utils/severity";

const SeverityBadge = ({ label }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[label]}`}
  >
    {label}
  </span>
);

export default SeverityBadge;
