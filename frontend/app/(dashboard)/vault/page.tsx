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
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-cyber-text">Secure Vault</h1>
          <p className="text-xs text-cyber-muted mt-1">All content is Fernet-encrypted at rest</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          + New Item
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded border border-cyber-red bg-red-900 bg-opacity-10 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item list */}
        <div className="card">
          <h2 className="text-sm font-semibold text-cyber-text mb-4">
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
                  "flex items-center justify-between p-3 rounded cursor-pointer border transition-colors",
                  selected?.id === item.id
                    ? "border-cyber-cyan bg-cyan-900 bg-opacity-10"
                    : "border-cyber-border hover:border-cyber-cyan hover:border-opacity-50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
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

        {/* Item detail / Create form */}
        <div className="card">
          {showCreate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-cyber-text">New Vault Item</h2>
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
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? "Encrypting…" : "Save to Vault"}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-cyber-text truncate">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-cyber-muted hover:text-cyber-text text-xs shrink-0">
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
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
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-cyber-muted text-xs">Select a vault item to view its decrypted content,</p>
              <p className="text-cyber-muted text-xs">or create a new entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
