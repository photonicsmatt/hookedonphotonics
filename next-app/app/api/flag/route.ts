import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export const FLAG_REASONS = [
  "names_individual",
  "defamatory",
  "spam",
  "off_topic",
  "nsfw",
  "insider_trading",
  "other",
] as const;

const schema = z
  .object({
    threadId: z.string().optional(),
    commentId: z.string().optional(),
    reason: z.enum(FLAG_REASONS),
    note: z.string().trim().max(500).optional(),
  })
  .refine((v) => !!v.threadId !== !!v.commentId, {
    message: "flag exactly one of threadId or commentId",
  });

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Bad payload" }, { status: 400 });
  }
  const { threadId, commentId, reason, note } = parsed.data;

  // 5 flags / 60s per user; 1 open flag per target per user.
  const recent = await prisma.flag.count({
    where: { reporterId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent >= 5) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  const dup = await prisma.flag.findFirst({
    where: {
      reporterId: user.id,
      threadId: threadId ?? null,
      commentId: commentId ?? null,
      resolvedAt: null,
    },
  });
  if (dup) return NextResponse.json({ ok: true, deduped: true });

  if (threadId) {
    const t = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (commentId) {
    const c = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.flag.create({
      data: { reporterId: user.id, threadId, commentId, reason, note },
    });
    if (threadId) {
      await tx.thread.update({ where: { id: threadId }, data: { flaggedAt: new Date() } });
    } else if (commentId) {
      await tx.comment.update({ where: { id: commentId }, data: { flaggedAt: new Date() } });
    }
  });

  return NextResponse.json({ ok: true });
}
