import type { NextAuthConfig } from "next-auth";

const PROTECTED_PATHS = ["/dashboard", "/manage", "/chat", "/subscription"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = PROTECTED_PATHS.some((prefix) =>
        nextUrl.pathname.startsWith(prefix),
      );
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", nextUrl)); // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
