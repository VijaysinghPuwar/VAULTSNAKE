"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { AuditLog, Alert } from "@/types";
import clsx from "clsx";

type Tab = "logs" | "alerts";

export default function AdminLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("logs");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const token = session?.backendToken ?? "";

  const { data: logs, isLoading: logsLoading } = useSWR<AuditLog[]>(
    token ? "admin-audit" : null,
    () => api.adminGetAuditLogs(token, 200)
  );

  const { data: alerts, mutate: mutateAlerts, isLoading: alertsLoading } = useSWR<Alert[]>(
    token ? "admin-alerts" : null,
    () => api.adminGetAlerts(token)
  );

  const openAlerts = alerts?.filter((a) => !a.is_resolved) ?? [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Audit Logs & Alerts</h1>
          <p className="page-subtitle">Platform-wide security event history</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        {(["logs", "alerts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "rounded px-4 py-2 text-sm capitalize transition-colors",
              tab === t ? "bg-cyber-cyan bg-opacity-10 text-cyber-cyan border border-cyber-cyan" : "btn-ghost"
            )}
          >
            {t === "alerts" ? `Alerts (${openAlerts.length} open)` : "Audit Logs"}
          </button>
        ))}
      </div>

      {tab === "logs" && (
        <div className="card">
          {logsLoading && <p className="text-xs text-cyber-muted p-4">Loading…</p>}
          {logs && (
            <div className="table-wrap">
              <table className="table-cyber">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Event</th>
                    <th>Description</th>
                    <th>IP</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-cyber-muted whitespace-nowrap text-xs">
                        {new Date(log.created_at).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="max-w-[220px] truncate text-xs text-cyber-muted">{log.user_email}</td>
                      <td><span className="badge badge-gray text-xs">{log.event_type}</span></td>
                      <td className="text-cyber-text max-w-xs truncate text-xs">{log.description}</td>
                      <td className="text-cyber-muted text-xs">{log.ip_address ?? "—"}</td>
                      <td><SeverityBadge severity={log.severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "alerts" && (
        <div className="card">
          {alertsLoading && <p className="text-xs text-cyber-muted p-4">Loading…</p>}
          {alerts && (
            <div className="table-wrap">
              <table className="table-cyber">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="text-cyber-muted whitespace-nowrap text-xs">
                        {new Date(alert.created_at).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="max-w-[220px] truncate text-xs text-cyber-muted">{(alert as import("@/types").Alert & { user_email?: string }).user_email ?? "—"}</td>
                      <td className="max-w-[220px] truncate text-xs text-cyber-text">{alert.alert_type.replace(/_/g, " ")}</td>
                      <td className="max-w-xs truncate text-xs text-cyber-text">{alert.description}</td>
                      <td><SeverityBadge severity={alert.severity} /></td>
                      <td>
                        <span className={clsx("badge", alert.is_resolved ? "badge-green" : "badge-red")}>
                          {alert.is_resolved ? "resolved" : "open"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
