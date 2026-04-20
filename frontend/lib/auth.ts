import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const isProduction = process.env.NODE_ENV === "production";
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (!isProduction ? "vaultsnake-local-development-secret" : undefined);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "google") return false;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            google_sub: account.providerAccountId,
            email: user.email,
            name: user.name,
            picture: user.image,
          }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        // Attach backend token and role to the account object for jwt callback
        (account as Record<string, unknown>).backendToken = data.access_token;
        (account as Record<string, unknown>).role = data.user.role;
        (account as Record<string, unknown>).userId = data.user.id;
      } catch {
        return false;
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.backendToken = (account as Record<string, unknown>).backendToken as string;
        token.role = (account as Record<string, unknown>).role as string;
        token.userId = (account as Record<string, unknown>).userId as string;
      }
      return token;
    },

    async session({ session, token }) {
      session.backendToken = token.backendToken as string;
      session.user.role = token.role as "user" | "admin";
      session.user.id = token.userId as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
});

declare module "next-auth" {
  interface Session {
    backendToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "user" | "admin";
    };
  }
}
