"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import VaultSnakeLogo from "@/components/layout/VaultSnakeLogo";

const FEATURES = [
  {
    icon: "vault",
    title: "Encrypted Vault",
    desc: "Store credentials, API keys, and secrets in a private encrypted vault. Accessed only by you.",
  },
  {
    icon: "audit",
    title: "Access Monitoring",
    desc: "Every action is logged with timestamps and context. Always know who accessed what.",
  },
  {
    icon: "alert",
    title: "Smart Alerts",
    desc: "Automated detection of unusual activity patterns with real-time notifications.",
  },
];

function FeatureIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "vault") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 10h12v9H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "audit") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4h10v16H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 9h4M10 13h4M10 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Header — brand only, no clutter */}
      <header className="relative z-10 flex items-center border-b border-cyber-border/40 px-6 py-4 sm:px-10">
        <VaultSnakeLogo size="nav" showWordmark priority />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-28 lg:py-32">
        {/* Glow orb */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-cyan opacity-[0.03] blur-3xl" />

        {/* Status pill */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-cyber-border/70 px-3.5 py-1.5 text-xs text-cyber-muted">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
          <span>Platform Online</span>
        </div>

        {/* Logo mark */}
        <div className="mb-7">
          <VaultSnakeLogo size="hero" priority />
        </div>

        {/* Brand name */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-cyber-text sm:text-6xl lg:text-7xl">
          VAULT<span className="text-cyber-cyan">SNAKE</span>
        </h1>

        {/* Value proposition — clean and minimal */}
        <p className="mb-10 max-w-sm text-sm leading-relaxed text-cyber-muted sm:max-w-md sm:text-base">
          Your secrets, secured and monitored.<br className="hidden sm:block" />
          Enterprise-grade protection, built for simplicity.
        </p>

        {/* Sign-in CTA */}
        <button
          onClick={() => signIn("google")}
          className="group mb-4 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl border border-cyber-border bg-cyber-surface px-7 py-3.5 text-sm font-medium transition-all duration-200 hover:border-cyber-cyan/50 hover:bg-cyber-surface/80 hover:shadow-[0_0_20px_rgba(0,212,255,0.08)] sm:px-8"
        >
          <svg className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-cyber-text transition-colors group-hover:text-cyber-cyan">
            Sign in with Google
          </span>
        </button>
        <p className="text-xs text-cyber-muted/60">Secured with Google OAuth</p>
      </main>

      {/* Feature highlights — simplified, user-friendly */}
      <section className="relative z-10 border-t border-cyber-border/40 px-6 py-14 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-10 text-center text-xs uppercase tracking-[0.18em] text-cyber-muted/70">
            What&rsquo;s inside
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card flex flex-col gap-3 hover:border-cyber-cyan/30 transition-colors duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyber-cyan/20 bg-cyber-bg text-cyber-cyan">
                  <FeatureIcon name={f.icon} />
                </div>
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold text-cyber-text">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-cyber-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — clean and minimal */}
      <footer className="relative z-10 flex items-center justify-between border-t border-cyber-border/40 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2.5 text-xs text-cyber-muted/60">
          <VaultSnakeLogo size="tiny" />
          <span>VAULTSNAKE</span>
        </div>
        <span className="text-xs text-cyber-muted/40">Secure Vault &amp; Access Monitoring</span>
      </footer>
    </div>
  );
}
