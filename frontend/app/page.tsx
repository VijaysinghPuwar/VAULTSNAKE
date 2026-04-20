"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: "🔐",
    title: "Encrypted Vault",
    desc: "Store sensitive notes, credentials, and API keys with Fernet symmetric encryption.",
  },
  {
    icon: "📋",
    title: "Audit Logging",
    desc: "Every security-relevant action is logged with timestamp, event type, and severity.",
  },
  {
    icon: "🚨",
    title: "Threat Detection",
    desc: "Automated alerts for suspicious patterns: rapid operations, unauthorized access attempts.",
  },
  {
    icon: "👥",
    title: "Role-Based Access",
    desc: "Separate user and admin roles with server-enforced authorization on every endpoint.",
  },
  {
    icon: "📊",
    title: "Risk Scoring",
    desc: "Dynamic risk scores based on recent event severity — always know your threat level.",
  },
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "No hardcoded secrets, CORS allowlisting, JWT auth, input validation on all endpoints.",
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-cyber-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyber-cyan flex items-center justify-center">
            <span className="text-cyber-bg font-bold text-sm">VS</span>
          </div>
          <span className="font-bold text-cyber-cyan tracking-widest text-sm uppercase">
            VAULTSNAKE
          </span>
        </div>
        <span className="text-xs text-cyber-muted">Secure Vault &amp; Monitoring Platform</span>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyber-cyan opacity-5 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-border text-xs text-cyber-muted mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse-slow" />
          SYSTEM ONLINE — ACCESS CONTROL ACTIVE
        </div>

        <h1 className="text-5xl font-bold text-cyber-text mb-4 tracking-tight">
          VAULT<span className="text-cyber-cyan">SNAKE</span>
        </h1>
        <p className="text-lg text-cyber-muted max-w-xl mb-2">
          Secure Vault &amp; Access Monitoring Platform
        </p>
        <p className="text-sm text-cyber-muted max-w-lg mb-10 leading-relaxed">
          A full-stack cybersecurity platform demonstrating encrypted secret storage,
          role-based access control, real-time audit logging, and automated threat detection.
        </p>

        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 bg-cyber-surface border border-cyber-border hover:border-cyber-cyan px-6 py-3 rounded-lg transition-all duration-200 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-cyber-text text-sm font-medium group-hover:text-cyber-cyan transition-colors">
            Sign in with Google
          </span>
        </button>

        <p className="mt-4 text-xs text-cyber-muted">
          Authentication secured by Google OAuth 2.0 &amp; JWT
        </p>
      </main>

      {/* Features */}
      <section className="relative z-10 border-t border-cyber-border px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xs uppercase tracking-widest text-cyber-muted mb-10">
            Security Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card hover:border-cyber-cyan hover:border-opacity-50 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-cyber-text mb-1">{f.title}</h3>
                <p className="text-xs text-cyber-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyber-border px-6 py-4 flex items-center justify-between">
        <span className="text-xs text-cyber-muted">VAULTSNAKE v2.0 — Cybersecurity Final Project</span>
        <span className="text-xs text-cyber-muted">FastAPI · Next.js · Google OAuth · Fernet Encryption</span>
      </footer>
    </div>
  );
}
