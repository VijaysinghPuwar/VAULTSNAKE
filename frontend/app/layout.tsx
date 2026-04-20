import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "VAULTSNAKE — Secure Vault & Access Monitoring",
  description:
    "A cybersecurity platform for secure vault storage, access control, audit logging, and threat monitoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cyber-bg text-cyber-text antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
