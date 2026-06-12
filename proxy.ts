import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/features/auth/token";

// Routes that require a logged-in user
const PROTECTED_PREFIXES = ["/dashboard"];

// Routes only for logged-out users (redirect to dashboard if already logged in)
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth-token")?.value;

  // Verify the token — returns the user or null if missing/invalid/expired
  const user = token ? verifyToken(token) : null;
  const isAuthenticated = user !== null;

  // Protected route + not logged in → go to login
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname); // remember where they were going
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth route + already logged in → go to dashboard
  if (AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
