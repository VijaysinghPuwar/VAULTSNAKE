import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  applicationName: "VAULTSNAKE",
  title: "VAULTSNAKE - Secure Vault & Access Monitoring",
  description:
    "A cybersecurity platform for encrypted vault storage, role-based access control, real-time audit logging, and automated threat detection.",
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    shortcut: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1e",
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
