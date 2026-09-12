import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { callGas } from "@/lib/gas";
import type { UserRole } from "@/lib/types";
import { staffRoleFromMemberRole } from "@/lib/workflow";

const ROLE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, profile, trigger }) {
      if (profile?.email) {
        token.email = String(profile.email).toLowerCase();
      } else if (user?.email) {
        token.email = String(user.email).toLowerCase();
      }

      const now = Date.now();
      const roleExpiry =
        typeof token.roleFetchedAt === "number"
          ? token.roleFetchedAt + ROLE_CACHE_TTL_MS
          : 0;
      const shouldFetchRole =
        Boolean(token.email) &&
        (Boolean(user) ||
          token.role === undefined ||
          now > roleExpiry ||
          trigger === "update");

      if (shouldFetchRole && token.email) {
        try {
          const data = await callGas<{ role: UserRole | null }>(
            "getMemberRole",
            { email: token.email },
          );
          token.role = staffRoleFromMemberRole(data.role);
          token.roleFetchedAt = now;
        } catch (error) {
          console.error("Failed to fetch member role in JWT callback:", error);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = String(token.email).toLowerCase();
        session.user.role = (token.role as UserRole | null | undefined) ?? null;
      }
      return session;
    },
  },
});
