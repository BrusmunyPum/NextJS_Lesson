import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/features/auth/token";

// GET /api/auth/me — return the currently logged-in user (or 401)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
