import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const stats = await api.adminGetStats(session.backendToken).catch(() => null);

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-cyber-text">Admin Overview</h1>
        <p className="text-xs text-cyber-muted mt-1">Platform-wide security telemetry</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Users" value={stats.total_users} />
          <StatCard label="Active Users" value={stats.active_users} accent="green" />
          <StatCard label="Vault Items" value={stats.total_vault_items} accent="purple" />
          <StatCard label="Audit Events" value={stats.total_audit_events} />
          <StatCard label="Open Alerts" value={stats.open_alerts} accent={stats.open_alerts > 0 ? "red" : "green"} />
          <StatCard
            label="Critical Alerts"
            value={stats.critical_alerts}
            accent={stats.critical_alerts > 0 ? "red" : "green"}
          />
        </div>
      )}
    </div>
  );
}
