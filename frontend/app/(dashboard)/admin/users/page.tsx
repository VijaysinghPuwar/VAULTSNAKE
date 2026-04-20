"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";
import clsx from "clsx";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const token = session?.backendToken ?? "";
  const { data: users, mutate, isLoading } = useSWR<User[]>(
    token ? "admin-users" : null,
    () => api.adminGetUsers(token)
  );

  const [updating, setUpdating] = useState<string | null>(null);

  async function toggleRole(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!confirm(`Change ${user.email} role to "${newRole}"?`)) return;
    setUpdating(user.id);
    try {
      await api.adminUpdateRole(user.id, newRole, token);
      mutate();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage roles and view user accounts</p>
        </div>
      </div>

      <div className="card">
        {isLoading && <p className="text-xs text-cyber-muted p-4">Loading…</p>}
        {users && (
          <div className="table-wrap">
            <table className="table-cyber">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex min-w-0 flex-col">
                        <span className="max-w-[220px] truncate text-xs text-cyber-text">{user.name}</span>
                        <span className="max-w-[220px] truncate text-xs text-cyber-muted">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={clsx("badge", user.role === "admin" ? "badge-purple" : "badge-cyan")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-cyber-muted text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-cyber-muted text-xs">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <span className={clsx("badge", user.is_active ? "badge-green" : "badge-red")}>
                        {user.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td>
                      {user.id !== session?.user?.id ? (
                        <button
                          disabled={updating === user.id}
                          onClick={() => toggleRole(user)}
                          className="btn-ghost min-h-8 py-1 text-xs"
                        >
                          {updating === user.id ? "…" : user.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      ) : (
                        <span className="text-xs text-cyber-muted">(you)</span>
                      )}
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
