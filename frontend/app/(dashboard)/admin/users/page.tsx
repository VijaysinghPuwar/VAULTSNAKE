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
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-cyber-text">User Management</h1>
        <p className="text-xs text-cyber-muted mt-1">Manage roles and view user accounts</p>
      </div>

      <div className="card">
        {isLoading && <p className="text-xs text-cyber-muted p-4">Loading…</p>}
        {users && (
          <div className="overflow-x-auto">
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
                      <div className="flex flex-col">
                        <span className="text-cyber-text text-xs">{user.name}</span>
                        <span className="text-cyber-muted text-xs">{user.email}</span>
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
                          className="btn-ghost py-1 text-xs"
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
