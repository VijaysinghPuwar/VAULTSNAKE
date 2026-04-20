"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
import VaultSnakeLogo from "./VaultSnakeLogo";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",    icon: "dashboard" },
  { href: "/vault",      label: "Vault",         icon: "vault" },
  { href: "/activity",   label: "Activity Log",  icon: "activity" },
  { href: "/alerts",     label: "Alerts",        icon: "alerts" },
];

const ADMIN_ITEMS = [
  { href: "/admin",       label: "Admin Overview", icon: "admin" },
  { href: "/admin/users", label: "Users",           icon: "users" },
  { href: "/admin/logs",  label: "Audit Logs",      icon: "logs" },
];

function NavIcon({ name }: { name: string }) {
  const common = "h-4 w-4";

  if (name === "vault") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 10h12v9H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "activity") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12a8 8 0 1 0 2.4-5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 5v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "alerts") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 16h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "admin") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 19 6v5c0 4.3-2.7 7.8-7 10-4.3-2.2-7-5.7-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 12.2 11.2 14l3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 20a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 11a3 3 0 0 0 0-5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17.5 18.5a5 5 0 0 0-2.2-3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "logs") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6h12M6 12h12M6 18h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  const renderItems = (items: typeof NAV_ITEMS, activeClass: string) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={clsx(
          "flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
          pathname === item.href
            ? activeClass
            : "text-cyber-muted hover:bg-white/5 hover:text-cyber-text"
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyber-border bg-cyber-bg/60">
          <NavIcon name={item.icon} />
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    ));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cyber-border bg-cyber-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <VaultSnakeLogo size="nav" showWordmark priority wordmarkClassName="text-[11px]" />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-cyber-border text-cyber-muted transition-colors hover:border-cyber-cyan hover:text-cyber-cyan"
          aria-label="Open navigation"
          aria-expanded={isOpen}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-cyber-border bg-cyber-surface transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-cyber-border px-4 py-4">
          <VaultSnakeLogo size="sidebar" showWordmark priority />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyber-border text-cyber-muted transition-colors hover:border-cyber-cyan hover:text-cyber-cyan lg:hidden"
            aria-label="Close navigation"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <p className="mb-1 px-2 py-1 text-xs uppercase tracking-wider text-cyber-muted">Platform</p>
          {renderItems(NAV_ITEMS, "border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan")}

          {isAdmin && (
            <>
              <p className="mb-1 mt-5 px-2 py-1 text-xs uppercase tracking-wider text-cyber-muted">Admin</p>
              {renderItems(ADMIN_ITEMS, "border border-purple-500/40 bg-cyber-purple/10 text-purple-300")}
            </>
          )}
        </nav>

        <div className="border-t border-cyber-border px-4 py-4">
          {session?.user && (
            <div className="mb-3 min-w-0">
              <p className="truncate text-xs text-cyber-text">{session.user.name}</p>
              <p className="truncate text-xs text-cyber-muted">{session.user.email}</p>
              <span className={clsx("badge mt-2", isAdmin ? "badge-purple" : "badge-cyan")}>
                {isAdmin ? "admin" : "user"}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex min-h-9 w-full items-center rounded-md px-1 text-left text-xs text-cyber-muted transition-colors hover:text-cyber-red"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
