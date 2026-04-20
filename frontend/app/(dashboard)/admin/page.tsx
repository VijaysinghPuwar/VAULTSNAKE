import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const stats = await api.adminGetStats(session.backendToken).catch(() => null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Platform-wide security telemetry</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid-3">
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
