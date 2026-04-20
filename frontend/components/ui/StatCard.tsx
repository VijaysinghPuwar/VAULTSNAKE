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
      <p className="break-words text-xs uppercase leading-relaxed tracking-wider text-cyber-muted">{label}</p>
      <p className={`break-words text-xl font-bold sm:text-2xl ${ACCENT_CLASS[accent]}`}>{value}</p>
      {sub && <p className="break-words text-xs text-cyber-muted">{sub}</p>}
    </div>
  );
}
