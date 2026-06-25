import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.email) {
        token.email = String(profile.email).toLowerCase();
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = String(token.email).toLowerCase();
      }
      return session;
    },
  },
});
