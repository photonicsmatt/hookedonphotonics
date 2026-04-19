import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const schema = z.object({ body: z.string().trim().min(1).max(5000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Empty reply" }, { status: 400 });

  const thread = await prisma.thread.findUnique({ where: { id: params.id } });
  if (!thread || thread.removedAt) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const recent = await prisma.comment.count({
    where: { authorId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent >= 5) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  const comment = await prisma.comment.create({
    data: {
      threadId: params.id,
      authorId: user.id,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ ok: true, id: comment.id });
}
