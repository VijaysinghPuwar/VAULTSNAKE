const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  syncGoogle: (payload: { google_sub: string; email: string; name: string; picture?: string }, token?: string) =>
    fetch(`${BASE_URL}/api/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  getMe: (token: string) => apiFetch("/api/auth/me", token),

  // Vault
  listVault: (token: string) => apiFetch<import("@/types").VaultItem[]>("/api/vault/", token),
  getVaultItem: (id: string, token: string) => apiFetch<import("@/types").VaultItemDetail>(`/api/vault/${id}`, token),
  createVaultItem: (payload: { title: string; content: string; item_type: string }, token: string) =>
    apiFetch<import("@/types").VaultItem>("/api/vault/", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateVaultItem: (id: string, payload: Partial<{ title: string; content: string; item_type: string }>, token: string) =>
    apiFetch<import("@/types").VaultItem>(`/api/vault/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteVaultItem: (id: string, token: string) =>
    apiFetch<void>(`/api/vault/${id}`, token, { method: "DELETE" }),

  // Audit
  getAuditLogs: (token: string, limit = 50, offset = 0) =>
    apiFetch<import("@/types").AuditLog[]>(`/api/audit/?limit=${limit}&offset=${offset}`, token),
  getAuditSummary: (token: string) =>
    apiFetch<import("@/types").AuditSummary>("/api/audit/summary", token),

  // Alerts
  getAlerts: (token: string) => apiFetch<import("@/types").Alert[]>("/api/alerts/", token),
  getRiskScore: (token: string) => apiFetch<import("@/types").RiskScore>("/api/alerts/risk-score", token),
  resolveAlert: (id: string, token: string) =>
    apiFetch<import("@/types").Alert>(`/api/alerts/${id}/resolve`, token, { method: "PUT" }),

  // Admin
  adminGetUsers: (token: string) => apiFetch<import("@/types").User[]>("/api/admin/users", token),
  adminUpdateRole: (userId: string, role: string, token: string) =>
    apiFetch<import("@/types").User>(`/api/admin/users/${userId}/role`, token, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  adminGetAuditLogs: (token: string, limit = 100) =>
    apiFetch<import("@/types").AuditLog[]>(`/api/admin/audit?limit=${limit}`, token),
  adminGetAlerts: (token: string, unresolvedOnly = false) =>
    apiFetch<import("@/types").Alert[]>(`/api/admin/alerts?unresolved_only=${unresolvedOnly}`, token),
  adminGetStats: (token: string) =>
    apiFetch<import("@/types").PlatformStats>("/api/admin/stats", token),
};
