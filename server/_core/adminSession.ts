/**
 * Server-side admin login for the certification admin area.
 *
 * Replaces the old browser-only check (password hard-coded in AdminLogin.tsx,
 * "session" kept in localStorage). The password now lives only in Railway:
 *
 *   ADMIN_PASSWORD        – the admin password (required)
 *   ADMIN_SESSION_SECRET  – random string, at least 32 characters (required)
 *   ADMIN_USERNAME        – optional, defaults to "admin"
 *
 * On success the server sets a signed, HttpOnly cookie that expires after
 * 8 hours. Admin-only tRPC procedures check that cookie (see adminSessionProcedure).
 * If either required variable is missing, admin login is disabled rather than
 * falling back to a default password.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "mt_admin";
const SESSION_HOURS = 8;
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

type AdminConfig = { username: string; password: string; secret: Uint8Array };

function getAdminConfig(): AdminConfig | null {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!password || secret.length < 32) return null;
  return {
    username: (process.env.ADMIN_USERNAME || "admin").trim(),
    password,
    secret: new TextEncoder().encode(secret),
  };
}

/** Constant-time string comparison (hash first so lengths always match). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// --- simple in-memory brute-force guard (per IP) ---
const attempts = new Map<string, { count: number; first: number }>();

function clientKey(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(key: string, now = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || now - entry.first > ATTEMPT_WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string, now = Date.now()): void {
  const entry = attempts.get(key);
  if (!entry || now - entry.first > ATTEMPT_WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else entry.count += 1;
}

export function resetLoginAttempts(): void {
  attempts.clear();
}

// --- session token ---
async function createSessionToken(username: string, secret: Uint8Array): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret);
}

/** Returns the admin username if the request carries a valid admin cookie, otherwise null. */
export async function readAdminSession(req: Pick<Request, "headers">): Promise<string | null> {
  const config = getAdminConfig();
  if (!config) return null;
  const raw = req.headers.cookie;
  if (!raw) return null;
  const token = readCookie(raw, ADMIN_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, config.secret, { algorithms: ["HS256"] });
    return payload.role === "admin" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Returns one cookie's value from a Cookie header, or undefined. */
export function readCookie(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function cookieHeader(value: string, maxAgeSeconds: number): string {
  const parts = [
    `${ADMIN_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Strict",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

// --- Express handlers ---
export async function adminLoginHandler(req: Request, res: Response): Promise<void> {
  const config = getAdminConfig();
  if (!config) {
    console.error("[Admin] Login disabled: ADMIN_PASSWORD and/or ADMIN_SESSION_SECRET (32+ chars) not set");
    res.status(503).json({ success: false, message: "Admin login is not configured." });
    return;
  }

  const key = clientKey(req);
  if (isRateLimited(key)) {
    res.status(429).json({ success: false, message: "Too many attempts. Try again in 15 minutes." });
    return;
  }

  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const ok = safeEqual(username, config.username) && safeEqual(password, config.password);

  if (!ok) {
    recordFailure(key);
    res.status(401).json({ success: false, message: "Invalid admin credentials" });
    return;
  }

  try {
    const token = await createSessionToken(config.username, config.secret);
    res.setHeader("Set-Cookie", cookieHeader(token, SESSION_HOURS * 3600));
    res.json({ success: true });
  } catch (error) {
    console.error("[Admin] Could not create session:", error);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
}

export function adminLogoutHandler(_req: Request, res: Response): void {
  res.setHeader("Set-Cookie", cookieHeader("", 0));
  res.json({ success: true });
}

export async function adminSessionHandler(req: Request, res: Response): Promise<void> {
  const username = await readAdminSession(req);
  res.set("Cache-Control", "no-store");
  if (!username) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username });
}
