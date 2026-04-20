"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",    icon: "◈" },
  { href: "/vault",      label: "Vault",         icon: "⬡" },
  { href: "/activity",   label: "Activity Log",  icon: "⟳" },
  { href: "/alerts",     label: "Alerts",        icon: "⚑" },
];

const ADMIN_ITEMS = [
  { href: "/admin",       label: "Admin Overview", icon: "◎" },
  { href: "/admin/users", label: "Users",           icon: "◷" },
  { href: "/admin/logs",  label: "Audit Logs",      icon: "≡" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-cyber-surface border-r border-cyber-border shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cyber-cyan flex items-center justify-center">
            <span className="text-cyber-bg font-bold text-xs">VS</span>
          </div>
          <span className="font-bold text-cyber-cyan tracking-widest text-xs uppercase">
            VAULTSNAKE
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="px-2 py-1 text-xs text-cyber-muted uppercase tracking-wider mb-1">Platform</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
              pathname === item.href
                ? "bg-cyber-cyan bg-opacity-10 text-cyber-cyan"
                : "text-cyber-muted hover:text-cyber-text hover:bg-white hover:bg-opacity-5"
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="px-2 py-1 text-xs text-cyber-muted uppercase tracking-wider mt-4 mb-1">Admin</p>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  pathname === item.href
                    ? "bg-cyber-purple bg-opacity-10 text-purple-400"
                    : "text-cyber-muted hover:text-cyber-text hover:bg-white hover:bg-opacity-5"
                )}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-cyber-border">
        {session?.user && (
          <div className="mb-3">
            <p className="text-xs text-cyber-text truncate">{session.user.name}</p>
            <p className="text-xs text-cyber-muted truncate">{session.user.email}</p>
            <span className={clsx("badge mt-1", isAdmin ? "badge-purple" : "badge-cyan")}>
              {isAdmin ? "admin" : "user"}
            </span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left text-xs text-cyber-muted hover:text-cyber-red transition-colors py-1"
        >
          ⎋ Sign out
        </button>
      </div>
    </aside>
  );
}
