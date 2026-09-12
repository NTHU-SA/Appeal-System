import type { DefaultSession } from "@auth/core/types";
import type { UserRole } from "@/lib/types";

declare module "@auth/core/types" {
  interface User {
    role?: UserRole | null;
  }

  interface Session {
    user?: {
      role?: UserRole | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole | null;
    roleFetchedAt?: number;
  }
}

declare module "next-auth" {
  interface User {
    role?: UserRole | null;
  }

  interface Session {
    user?: {
      role?: UserRole | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | null;
    roleFetchedAt?: number;
  }
}
