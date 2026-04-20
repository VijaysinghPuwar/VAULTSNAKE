import clsx from "clsx";

type Severity = "info" | "warning" | "critical" | "low" | "medium" | "high";

const MAP: Record<Severity, string> = {
  info:     "badge-cyan",
  low:      "badge-green",
  medium:   "badge-amber",
  warning:  "badge-amber",
  high:     "badge-red",
  critical: "badge-red",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={clsx("badge", MAP[severity] ?? "badge-gray")}>{severity}</span>;
}
