// Simple base64 token for learning purposes.
// In production: use a proper JWT library (jose, jsonwebtoken).

import type { User } from "@/features/auth/types";

const TOKEN_SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-in-production";

// Encode user data into a token string
export function createToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in 7 days
  });
  // Base64 encode + simple signature (not cryptographically secure — learning only)
  const encoded = Buffer.from(payload).toString("base64");
  const signature = Buffer.from(`${encoded}.${TOKEN_SECRET}`).toString("base64").slice(0, 16);
  return `${encoded}.${signature}`;
}

// Decode and verify a token string — returns the user or null if invalid/expired
export function verifyToken(token: string): User | null {
  try {
    const [encoded, signature] = token.split(".");
    const expectedSig = Buffer.from(`${encoded}.${TOKEN_SECRET}`).toString("base64").slice(0, 16);
    if (signature !== expectedSig) return null; // tampered

    const payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
    if (payload.exp < Date.now()) return null; // expired

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
