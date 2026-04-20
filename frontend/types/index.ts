export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface VaultItem {
  id: string;
  title: string;
  item_type: "note" | "credential" | "api_key" | "other";
  created_at: string;
  updated_at: string;
}

export interface VaultItemDetail extends VaultItem {
  content: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  event_type: string;
  description: string;
  ip_address: string | null;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  alert_type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  user_email?: string;
}

export interface AuditSummary {
  total_events: number;
  logins: number;
  vault_operations: number;
  warnings: number;
  critical_events: number;
  last_activity: string | null;
}

export interface RiskScore {
  score: number;
  label: "Low" | "Medium" | "High" | "Critical";
}

export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_vault_items: number;
  total_audit_events: number;
  open_alerts: number;
  critical_alerts: number;
}
