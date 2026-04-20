import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { AuditLog, Alert } from "@/types";

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const token = session!.backendToken;

  const [summary, recentLogs, alerts, riskScore] = await Promise.all([
    api.getAuditSummary(token).catch(() => null),
    api.getAuditLogs(token, 5).catch(() => [] as AuditLog[]),
    api.getAlerts(token).catch(() => [] as Alert[]),
    api.getRiskScore(token).catch(() => ({ score: 0, label: "Low" })),
  ]);

  const openAlerts = alerts.filter((a) => !a.is_resolved);
  const riskAccent = { Low: "green", Medium: "amber", High: "red", Critical: "red" }[riskScore.label] as "green" | "amber" | "red";

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Security Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <span className="text-cyber-cyan">{session!.user.name}</span>
          </p>
        </div>
      </div>

      <div className="stats-grid mb-6 sm:mb-8">
        <StatCard label="Risk Score" value={riskScore.score} sub={riskScore.label} accent={riskAccent} />
        <StatCard label="Open Alerts" value={openAlerts.length} accent={openAlerts.length > 0 ? "red" : "green"} />
        <StatCard label="Total Events" value={summary?.total_events ?? "—"} sub="All time" />
        <StatCard label="Vault Ops" value={summary?.vault_operations ?? "—"} sub="All time" accent="purple" />
      </div>

      <div className="split-grid">
        <div className="card">
          <h2 className="card-title">Recent Activity</h2>
          {recentLogs.length === 0 ? (
            <p className="text-xs text-cyber-muted">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex min-w-0 items-start gap-3">
                  <SeverityBadge severity={log.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-cyber-text sm:truncate">{log.description}</p>
                    <p className="text-xs text-cyber-muted">{formatTime(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Active Alerts</h2>
          {openAlerts.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span>✓</span>
              <span>No active security alerts</span>
            </div>
          ) : (
            <div className="space-y-3">
              {openAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex min-w-0 items-start gap-3">
                  <SeverityBadge severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cyber-text">
                      {alert.alert_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs leading-relaxed text-cyber-muted sm:truncate">{alert.description}</p>
                    <p className="text-xs text-cyber-muted">{formatTime(alert.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Summary */}
      {summary && (
        <div className="mt-6 card">
          <h2 className="text-sm font-semibold text-cyber-text mb-4">Event Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-cyber-muted">Logins</p>
              <p className="text-lg font-bold text-cyber-cyan">{summary.logins}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-muted">Vault Operations</p>
              <p className="text-lg font-bold text-purple-400">{summary.vault_operations}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-muted">Warnings</p>
              <p className="text-lg font-bold text-amber-400">{summary.warnings}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-muted">Critical Events</p>
              <p className="text-lg font-bold text-red-400">{summary.critical_events}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
