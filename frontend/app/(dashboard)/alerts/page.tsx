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
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-cyber-text">Security Alerts</h1>
        <p className="text-xs text-cyber-muted mt-1">Automated alerts from threat detection analysis</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Risk Score" value={risk?.score ?? 0} sub={risk?.label ?? "Low"} accent={riskAccent} />
        <StatCard label="Open Alerts" value={open.length} accent={open.length > 0 ? "red" : "green"} />
        <StatCard label="Resolved" value={resolved.length} accent="green" />
        <StatCard label="Total" value={alerts?.length ?? 0} />
      </div>

      {/* Open alerts */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-cyber-text mb-4">
          Open Alerts {open.length > 0 && <span className="badge badge-red ml-2">{open.length}</span>}
        </h2>

        {isLoading && <p className="text-xs text-cyber-muted">Loading…</p>}
        {!isLoading && open.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
            <span>✓</span>
            <span>No active security alerts — your account is clean.</span>
          </div>
        )}
        <div className="space-y-3">
          {open.map((alert) => (
            <div key={alert.id} className="border border-cyber-border rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-sm text-cyber-text font-medium">
                      {ALERT_LABELS[alert.alert_type] ?? alert.alert_type}
                    </span>
                  </div>
                  <p className="text-xs text-cyber-muted mb-1">{alert.description}</p>
                  <p className="text-xs text-cyber-muted">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => resolve(alert.id)}
                  className="btn-ghost shrink-0 text-xs"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-cyber-text mb-4">Resolved Alerts</h2>
          <div className="space-y-2">
            {resolved.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 py-2 border-b border-cyber-border border-opacity-30 last:border-0">
                <span className="badge badge-green">resolved</span>
                <span className="text-xs text-cyber-muted flex-1 truncate">
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
