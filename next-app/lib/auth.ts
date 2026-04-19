import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { prisma } from "./db";
import { domainOf, isBlockedDomain, isEduDomain, SEED_ALLOWED } from "./domains";

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
  return prisma.user.findUnique({ where: { id: session.userId } });
}

// ---- hashing helpers ----

export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const pepper = process.env.EMAIL_PEPPER || "dev-pepper-change-me";
  return crypto.createHmac("sha256", pepper).update(normalized).digest("hex");
}

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function generateCode(): string {
  // 6-digit, leading zeros preserved
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

// ---- domain validation ----

export async function isDomainAllowed(domain: string): Promise<boolean> {
  if (!domain) return false;
  if (isBlockedDomain(domain)) return false;
  if (SEED_ALLOWED.includes(domain)) return true;
  if (isEduDomain(domain)) return true;
  const row = await prisma.allowedDomain.findUnique({ where: { domain } });
  return !!row;
}

// ---- handle generation ----

const ADJ = [
  "shot", "tunable", "bandgap", "coherent", "stray", "dispersive",
  "nonlinear", "single-mode", "polarized", "monolithic", "evanescent", "cladded",
];
const NOUN = [
  "photon", "waveguide", "packet", "splitter", "fringe", "qubit",
  "modulator", "resonator", "dimer", "speckle", "cavity", "etalon",
];

export function randomHandle(): string {
  const a = ADJ[crypto.randomInt(0, ADJ.length)];
  const n = NOUN[crypto.randomInt(0, NOUN.length)];
  const tag = crypto.randomInt(100, 999);
  return `${a}_${n}_${tag}`;
}

export async function createUniqueHandle(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const h = randomHandle();
    const exists = await prisma.user.findUnique({ where: { handle: h } });
    if (!exists) return h;
  }
  return randomHandle() + "_" + crypto.randomInt(1000, 9999);
}

export function emailOk(email: string): { ok: boolean; reason?: string; domain: string } {
  const domain = domainOf(email);
  if (!domain) return { ok: false, reason: "Invalid email", domain: "" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, reason: "Invalid email", domain };
  if (isBlockedDomain(domain)) return { ok: false, reason: "Personal email providers aren't allowed. Use a work or .edu address.", domain };
  return { ok: true, domain };
}
