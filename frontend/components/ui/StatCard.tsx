interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "cyan" | "green" | "amber" | "red" | "purple";
}

const ACCENT_CLASS: Record<string, string> = {
  cyan:   "text-cyber-cyan",
  green:  "text-emerald-400",
  amber:  "text-amber-400",
  red:    "text-red-400",
  purple: "text-purple-400",
};

export default function StatCard({ label, value, sub, accent = "cyan" }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="text-xs text-cyber-muted uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${ACCENT_CLASS[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-cyber-muted">{sub}</p>}
    </div>
  );
}
