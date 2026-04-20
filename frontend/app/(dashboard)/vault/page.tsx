"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { VaultItem, VaultItemDetail } from "@/types";
import clsx from "clsx";

const TYPE_LABELS: Record<string, string> = {
  note: "Note",
  credential: "Credential",
  api_key: "API Key",
  other: "Other",
};

const TYPE_BADGE: Record<string, string> = {
  note: "badge-cyan",
  credential: "badge-amber",
  api_key: "badge-purple",
  other: "badge-gray",
};

export default function VaultPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";

  const { data: items, mutate, isLoading } = useSWR(
    token ? "vault" : null,
    () => api.listVault(token)
  );

  const [selected, setSelected] = useState<VaultItemDetail | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", item_type: "note" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openItem(item: VaultItem) {
    try {
      const detail = await api.getVaultItem(item.id, token);
      setSelected(detail);
    } catch {
      setError("Failed to decrypt vault item");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createVaultItem(formData, token);
      setFormData({ title: "", content: "", item_type: "note" });
      setShowCreate(false);
      mutate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this vault item?")) return;
    try {
      await api.deleteVaultItem(id, token);
      if (selected?.id === id) setSelected(null);
      mutate();
    } catch {
      setError("Failed to delete item");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Secure Vault</h1>
          <p className="page-subtitle">All content is Fernet-encrypted at rest</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary w-full sm:w-auto">
          + New Item
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-cyber-red bg-red-900/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="split-grid">
        <div className="card">
          <h2 className="card-title">
            Vault Items ({items?.length ?? 0})
          </h2>
          {isLoading && <p className="text-xs text-cyber-muted">Loading…</p>}
          {!isLoading && items?.length === 0 && (
            <p className="text-xs text-cyber-muted">No items yet. Create your first vault entry.</p>
          )}
          <div className="space-y-2">
            {items?.map((item) => (
              <div
                key={item.id}
                onClick={() => openItem(item)}
                className={clsx(
                  "flex min-w-0 cursor-pointer items-start justify-between gap-3 rounded border p-3 transition-colors sm:items-center",
                  selected?.id === item.id
                    ? "border-cyber-cyan bg-cyan-900/10"
                    : "border-cyber-border hover:border-cyber-cyan/50"
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <span className={clsx("badge", TYPE_BADGE[item.item_type])}>
                    {TYPE_LABELS[item.item_type]}
                  </span>
                  <span className="text-sm text-cyber-text truncate">{item.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="text-cyber-muted hover:text-cyber-red text-xs transition-colors ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {showCreate ? (
            <>
              <div className="mobile-stack mb-4">
                <h2 className="card-title mb-0">New Vault Item</h2>
                <button onClick={() => setShowCreate(false)} className="text-cyber-muted hover:text-cyber-text text-xs">
                  ✕ Close
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">Title</label>
                  <input
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. AWS Root Key"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">Type</label>
                  <select
                    className="input"
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                  >
                    <option value="note">Note</option>
                    <option value="credential">Credential</option>
                    <option value="api_key">API Key</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">Content (will be encrypted)</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter sensitive content…"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? "Encrypting…" : "Save to Vault"}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost sm:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : selected ? (
            <>
              <div className="flex min-w-0 items-start justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-cyber-text break-words">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-cyber-muted hover:text-cyber-text text-xs shrink-0">
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={clsx("badge", TYPE_BADGE[selected.item_type])}>
                    {TYPE_LABELS[selected.item_type]}
                  </span>
                  <span className="text-xs text-emerald-400">✓ Decrypted</span>
                </div>
                <div className="bg-cyber-bg rounded p-3 border border-cyber-border">
                  <p className="text-xs text-cyber-text font-mono whitespace-pre-wrap break-all">
                    {selected.content}
                  </p>
                </div>
                <p className="text-xs text-cyber-muted">
                  Created {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <p className="text-cyber-muted text-xs">Select a vault item to view its decrypted content,</p>
              <p className="text-cyber-muted text-xs">or create a new entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
