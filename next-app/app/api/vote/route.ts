import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const schema = z.object({
  threadId: z.string().min(1),
  dir: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  const { threadId, dir } = parsed.data;

  const existing = await prisma.vote.findUnique({
    where: { userId_threadId: { userId: user.id, threadId } },
  });

  const delta = { up: 0, down: 0 };
  const applyCounts = (d: number, sign: 1 | -1) => {
    if (d === 1)  delta.up  += sign;
    if (d === -1) delta.down += sign;
  };

  await prisma.$transaction(async (tx) => {
    if (existing) applyCounts(existing.dir, -1);
    if (dir === 0) {
      if (existing) {
        await tx.vote.delete({ where: { userId_threadId: { userId: user.id, threadId } } });
      }
    } else {
      applyCounts(dir, 1);
      await tx.vote.upsert({
        where: { userId_threadId: { userId: user.id, threadId } },
        update: { dir },
        create: { userId: user.id, threadId, dir },
      });
    }
    await tx.thread.update({
      where: { id: threadId },
      data: {
        upvotes:   { increment: delta.up },
        downvotes: { increment: delta.down },
      },
    });
  });

  const updated = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { upvotes: true, downvotes: true },
  });
  return NextResponse.json({ ok: true, score: (updated?.upvotes ?? 0) - (updated?.downvotes ?? 0) });
}
