import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, normalizeHandle, verifyPassword } from "@/lib/auth";

const schema = z.object({
  handle: z.string().min(1).max(48),
  password: z.string().min(1).max(500),
});

// Generic "bad credentials" message for either unknown handle or wrong password,
// so attackers can't enumerate valid usernames.
const BAD = "invalid handle or password";

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: BAD }, { status: 400 });

  const handle = normalizeHandle(parsed.data.handle);
  const user = await prisma.user.findUnique({ where: { handle } });
  if (!user) {
    // Still run a hash to equalize timing with a valid-user path.
    await verifyPassword(parsed.data.password, "$2a$12$abcdefghijklmnopqrstuu");
    return NextResponse.json({ error: BAD }, { status: 400 });
  }
  if (user.bannedAt) {
    return NextResponse.json({ error: "account suspended" }, { status: 403 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: BAD }, { status: 400 });

  const session = await getSession();
  session.userId = user.id;
  session.handle = user.handle;
  session.flair = user.flair;
  await session.save();

  return NextResponse.json({ ok: true, handle: user.handle });
}
