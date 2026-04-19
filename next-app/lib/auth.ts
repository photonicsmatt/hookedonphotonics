import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { prisma } from "./db";

export type Session = {
  userId?: string;
  handle?: string;
  flair?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-please-set-SESSION_SECRET-in-env-32-bytes",
  cookieName: "hop_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession(): Promise<IronSession<Session>> {
  return getIronSession<Session>(cookies(), sessionOptions);
}

export async function currentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  if (user.bannedAt) {
    session.destroy();
    return null;
  }
  return user;
}

export async function requireMod() {
  const user = await currentUser();
  if (!user) return { user: null as const, ok: false as const, status: 401 as const };
  if (user.role !== "MOD" && user.role !== "ADMIN") {
    return { user, ok: false as const, status: 403 as const };
  }
  return { user, ok: true as const, status: 200 as const };
}

export function isMod(user: { role: string } | null | undefined): boolean {
  return !!user && (user.role === "MOD" || user.role === "ADMIN");
}

// ---- handle + password helpers ----

const HANDLE_RE = /^[a-z0-9_]{3,24}$/;
const RESERVED = new Set([
  "admin", "administrator", "mod", "mods", "moderator",
  "system", "anon", "anonymous", "deleted", "removed",
  "root", "api", "support", "help", "hop",
  "hookedonphotonics", "official",
]);

export function normalizeHandle(input: string): string {
  return input.trim().toLowerCase();
}

export function handleOk(handle: string): { ok: boolean; reason?: string } {
  if (!HANDLE_RE.test(handle)) {
    return { ok: false, reason: "handles are 3–24 chars: a–z, 0–9, underscore" };
  }
  if (RESERVED.has(handle)) return { ok: false, reason: "that handle is reserved" };
  return { ok: true };
}

export function passwordOk(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: "password must be at least 8 characters" };
  if (password.length > 200) return { ok: false, reason: "password too long" };
  return { ok: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try { return await bcrypt.compare(password, hash); }
  catch { return false; }
}
