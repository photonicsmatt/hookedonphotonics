import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getSession,
  handleOk,
  hashPassword,
  normalizeHandle,
  passwordOk,
} from "@/lib/auth";

const schema = z.object({
  handle: z.string().min(1).max(48),
  password: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const handle = normalizeHandle(parsed.data.handle);
  const hCheck = handleOk(handle);
  if (!hCheck.ok) return NextResponse.json({ error: hCheck.reason }, { status: 400 });

  const pCheck = passwordOk(parsed.data.password);
  if (!pCheck.ok) return NextResponse.json({ error: pCheck.reason }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { handle } });
  if (existing) return NextResponse.json({ error: "that handle is taken" }, { status: 409 });

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: { handle, passwordHash, flair: "Anon" },
  });

  const session = await getSession();
  session.userId = user.id;
  session.handle = user.handle;
  session.flair = user.flair;
  await session.save();

  return NextResponse.json({ ok: true, handle: user.handle });
}
