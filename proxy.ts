import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO Phase 7: replace this with real JWT/session auth check
// For now, proxy is disabled so we can test the dashboard freely
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
