import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(6).max(200),
  body: z.string().trim().min(1).max(10_000),
  channelSlug: z.string().min(1),
  tags: z.array(z.string().trim().min(1).max(24)).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  const { title, body, channelSlug, tags } = parsed.data;

  const channel = await prisma.channel.findUnique({ where: { slug: channelSlug } });
  if (!channel) return NextResponse.json({ error: "Unknown channel" }, { status: 400 });

  // Very basic spam rate limit: max 3 threads / 10 min per user.
  const recent = await prisma.thread.count({
    where: { authorId: user.id, createdAt: { gt: new Date(Date.now() - 10 * 60_000) } },
  });
  if (recent >= 3) return NextResponse.json({ error: "Easy, typewriter." }, { status: 429 });

  const thread = await prisma.thread.create({
    data: {
      title,
      body,
      authorId: user.id,
      channelSlug,
      tags: tags ?? [],
    },
  });

  return NextResponse.json({ ok: true, id: thread.id });
}
