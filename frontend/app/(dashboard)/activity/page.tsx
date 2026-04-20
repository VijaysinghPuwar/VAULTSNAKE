"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { api } from "@/lib/api";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { AuditLog } from "@/types";

const EVENT_LABEL: Record<string, string> = {
  login:                 "Login",
  logout:                "Logout",
  vault_create:          "Vault Create",
  vault_read:            "Vault Read",
  vault_update:          "Vault Update",
  vault_delete:          "Vault Delete",
  admin_access:          "Admin Access",
  unauthorized_access:   "Unauthorized Access",
  role_change:           "Role Change",
  suspicious_activity:   "Suspicious Activity",
};

export default function ActivityPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";

  const { data: logs, isLoading } = useSWR<AuditLog[]>(
    token ? "audit-logs" : null,
    () => api.getAuditLogs(token, 100)
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-cyber-text">Activity Log</h1>
        <p className="text-xs text-cyber-muted mt-1">All security-relevant events for your account</p>
      </div>

      <div className="card">
        {isLoading && <p className="text-xs text-cyber-muted p-4">Loading…</p>}
        {!isLoading && (!logs || logs.length === 0) && (
          <p className="text-xs text-cyber-muted p-4">No activity recorded yet.</p>
        )}
        {logs && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-cyber">
              <thead>
                <tr>
                  <th>Time</th>
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
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {EVENT_LABEL[log.event_type] ?? log.event_type}
                      </span>
                    </td>
                    <td className="text-cyber-text max-w-xs truncate text-xs">{log.description}</td>
                    <td className="text-cyber-muted text-xs">{log.ip_address ?? "—"}</td>
                    <td>
                      <SeverityBadge severity={log.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
