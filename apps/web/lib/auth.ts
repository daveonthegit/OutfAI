import { createHmac } from "crypto";

export const SESSION_COOKIE = "outfai-session";

const SECRET = process.env.NEXTAUTH_SECRET ?? "outfai-dev-secret";

interface SessionData {
  userId: string;
  name: string;
  exp: number;
}

export function createSessionToken(userId: string, name: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, name, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const lastDot = token.lastIndexOf(".");
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expected = createHmac("sha256", SECRET)
      .update(payload)
      .digest("base64url");
    if (sig !== expected) return null;
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SessionData;
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

const USERS = [
  { id: "1", username: "test", password: "test", name: "Test User" },
];

export function validateCredentials(username: string, password: string) {
  return (
    USERS.find((u) => u.username === username && u.password === password) ??
    null
  );
}
