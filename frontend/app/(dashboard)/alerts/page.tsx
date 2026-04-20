"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { api } from "@/lib/api";
import SeverityBadge from "@/components/ui/SeverityBadge";
import StatCard from "@/components/ui/StatCard";
import type { Alert, RiskScore } from "@/types";

const ALERT_LABELS: Record<string, string> = {
  repeated_unauthorized_access: "Repeated Unauthorized Access",
  rapid_vault_operations:        "Rapid Vault Operations",
  suspicious_login_pattern:      "Suspicious Login Pattern",
  bulk_data_access:              "Bulk Data Access",
  admin_escalation_attempt:      "Admin Escalation Attempt",
};

export default function AlertsPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";

  const { data: alerts, mutate, isLoading } = useSWR<Alert[]>(
    token ? "alerts" : null,
    () => api.getAlerts(token)
  );

  const { data: risk } = useSWR<RiskScore>(
    token ? "risk-score" : null,
    () => api.getRiskScore(token)
  );

  const open = alerts?.filter((a) => !a.is_resolved) ?? [];
  const resolved = alerts?.filter((a) => a.is_resolved) ?? [];

  async function resolve(id: string) {
    await api.resolveAlert(id, token);
    mutate();
  }

  const riskAccent = { Low: "green", Medium: "amber", High: "red", Critical: "red" }[risk?.label ?? "Low"] as "green" | "amber" | "red";

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Security Alerts</h1>
          <p className="page-subtitle">Automated alerts from threat detection analysis</p>
        </div>
      </div>

      <div className="stats-grid mb-6 sm:mb-8">
        <StatCard label="Risk Score" value={risk?.score ?? 0} sub={risk?.label ?? "Low"} accent={riskAccent} />
        <StatCard label="Open Alerts" value={open.length} accent={open.length > 0 ? "red" : "green"} />
        <StatCard label="Resolved" value={resolved.length} accent="green" />
        <StatCard label="Total" value={alerts?.length ?? 0} />
      </div>

      <div className="card mb-6">
        <h2 className="card-title flex flex-wrap items-center gap-2">
          Open Alerts {open.length > 0 && <span className="badge badge-red ml-2">{open.length}</span>}
        </h2>

        {isLoading && <p className="text-xs text-cyber-muted">Loading…</p>}
        {!isLoading && open.length === 0 && (
          <div className="flex items-start gap-2 py-2 text-xs leading-relaxed text-emerald-400 sm:items-center">
            <span>✓</span>
            <span>No active security alerts - your account is clean.</span>
          </div>
        )}
        <div className="space-y-3">
          {open.map((alert) => (
            <div key={alert.id} className="border border-cyber-border rounded p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-sm font-medium text-cyber-text">
                      {ALERT_LABELS[alert.alert_type] ?? alert.alert_type}
                    </span>
                  </div>
                  <p className="mb-1 text-xs leading-relaxed text-cyber-muted">{alert.description}</p>
                  <p className="text-xs text-cyber-muted">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => resolve(alert.id)}
                  className="btn-ghost w-full shrink-0 text-xs sm:w-auto"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resolved.length > 0 && (
        <div className="card">
          <h2 className="card-title">Resolved Alerts</h2>
          <div className="space-y-2">
            {resolved.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-2 border-b border-cyber-border/30 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-3">
                <span className="badge badge-green">resolved</span>
                <span className="min-w-0 flex-1 text-xs text-cyber-muted sm:truncate">
                  {ALERT_LABELS[alert.alert_type] ?? alert.alert_type}
                </span>
                <span className="text-xs text-cyber-muted">
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
