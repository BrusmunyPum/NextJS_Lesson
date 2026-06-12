import { NextResponse } from "next/server";
import { findUserByEmail } from "@/features/auth/mock-users";
import { createToken } from "@/features/auth/token";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 1. Find user by email
  const user = findUserByEmail(email);

  // 2. Check credentials — always return the same error for both cases
  //    (don't reveal whether the email exists)
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // 3. Create token
  const token = createToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // 4. Set HTTP-only cookie and return user info
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,        // JS cannot read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",       // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });

  return response;
}
