"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import VaultSnakeLogo from "@/components/layout/VaultSnakeLogo";

const FEATURES = [
  {
    icon: "vault",
    title: "Encrypted Vault",
    desc: "Store credentials, API keys, and secrets with Fernet AES-128 encryption. Content is never saved in plaintext.",
  },
  {
    icon: "audit",
    title: "Audit Logging",
    desc: "Every security-relevant action is logged with event type, severity level, timestamp, and source IP.",
  },
  {
    icon: "alert",
    title: "Threat Detection",
    desc: "Automated alerts for suspicious patterns including rapid vault operations and unauthorized access attempts.",
  },
  {
    icon: "access",
    title: "Role-Based Access",
    desc: "User and admin roles enforced server-side on every API endpoint, not just hidden in the UI.",
  },
  {
    icon: "risk",
    title: "Risk Scoring",
    desc: "Dynamic risk score calculated from 24-hour event severity history. Always know your current threat level.",
  },
  {
    icon: "shield",
    title: "Secure by Design",
    desc: "No hardcoded secrets. CORS allowlisting, JWT validation, Pydantic input validation on all endpoints.",
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
  if (name === "alert") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "access") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 11v8M13 15h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "risk") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 19V9M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.3-2.7 7.8-7 10-4.3-2.2-7-5.7-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 12.2 11.2 14l3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-8 border-b border-cyber-border/60 px-5 py-3 sm:px-8">
        <VaultSnakeLogo size="nav" showWordmark priority wordmarkClassName="hidden sm:block" />
        <span className="ml-auto hidden max-w-xs text-right text-xs leading-relaxed text-cyber-muted lg:block">
          Secure Vault &amp; Monitoring Platform
        </span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:px-8 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-cyan opacity-[0.035] blur-3xl sm:h-[520px] sm:w-[520px]" />

        <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-cyber-border/80 px-3 py-1 text-xs text-cyber-muted">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">SYSTEM ONLINE - ACCESS CONTROL ACTIVE</span>
        </div>

        <div className="mb-6">
          <VaultSnakeLogo size="hero" priority />
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-cyber-text sm:text-5xl lg:text-6xl">
          VAULT<span className="text-cyber-cyan">SNAKE</span>
        </h1>
        <p className="mb-3 text-base text-cyber-muted sm:text-lg">
          Secure Vault &amp; Access Monitoring Platform
        </p>
        <p className="mb-9 max-w-xl px-2 text-sm leading-relaxed text-cyber-muted sm:mb-10">
          A full-stack cybersecurity platform demonstrating encrypted secret storage,
          role-based access control, real-time audit logging, and automated threat detection.
        </p>

        <button
          onClick={() => signIn("google")}
          className="group mb-3 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-cyber-border bg-cyber-surface px-5 py-3 transition-all duration-200 hover:border-cyber-cyan/60 sm:px-6"
        >
          <svg className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-cyber-text text-sm font-medium group-hover:text-cyber-cyan transition-colors">
            Sign in with Google
          </span>
        </button>
        <p className="text-center text-xs text-cyber-muted/70">
          Secured by Google OAuth 2.0 &amp; JWT
        </p>
      </main>

      <section className="relative z-10 border-t border-cyber-border/60 px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="mb-8 text-center text-xs uppercase tracking-[0.15em] text-cyber-muted">
            Security Capabilities
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card hover:border-cyber-cyan/40 transition-colors duration-200"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-cyber-cyan/20 bg-cyber-bg text-cyber-cyan">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-sm font-semibold text-cyber-text mb-1">{f.title}</h3>
                <p className="text-xs text-cyber-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col items-center justify-between gap-2 border-t border-cyber-border/60 px-5 py-4 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2 text-xs text-cyber-muted">
          <VaultSnakeLogo size="tiny" />
          <span>VAULTSNAKE v2.0</span>
        </div>
        <span className="text-xs text-cyber-muted text-center sm:text-right">
          FastAPI / Next.js / Google OAuth / Fernet Encryption
        </span>
      </footer>
    </div>
  );
}
