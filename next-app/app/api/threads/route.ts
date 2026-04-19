import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const baseSchema = z.object({
  kind: z.enum(["TEXT", "LINK", "IMAGE"]),
  title: z.string().trim().min(6).max(200),
  channelSlug: z.string().min(1),
  tags: z.array(z.string().trim().min(1).max(24)).max(5).optional(),
  body: z.string().trim().max(10_000).optional().default(""),
  linkUrl: z.string().url().max(2000).optional(),
  imageUrl: z.string().url().max(2000).optional(),
  imageAlt: z.string().trim().max(200).optional(),
});

const schema = baseSchema.superRefine((v, ctx) => {
  if (v.kind === "LINK" && !v.linkUrl) {
    ctx.addIssue({ code: "custom", path: ["linkUrl"], message: "Link URL is required" });
  }
  if (v.kind === "IMAGE" && !v.imageUrl) {
    ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Image URL is required" });
  }
  if (v.linkUrl) {
    try {
      const u = new URL(v.linkUrl);
      if (!["http:", "https:"].includes(u.protocol)) {
        ctx.addIssue({ code: "custom", path: ["linkUrl"], message: "http(s) only" });
      }
    } catch {
      ctx.addIssue({ code: "custom", path: ["linkUrl"], message: "Invalid URL" });
    }
  }
  if (v.imageUrl) {
    try {
      const u = new URL(v.imageUrl);
      if (!["http:", "https:"].includes(u.protocol)) {
        ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "http(s) only" });
      }
    } catch {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Invalid URL" });
    }
  }
});

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Bad payload", field: first?.path?.join(".") },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const channel = await prisma.channel.findUnique({ where: { slug: data.channelSlug } });
  if (!channel) return NextResponse.json({ error: "Unknown channel" }, { status: 400 });

  const recent = await prisma.thread.count({
    where: { authorId: user.id, createdAt: { gt: new Date(Date.now() - 10 * 60_000) } },
  });
  if (recent >= 3) return NextResponse.json({ error: "Easy, typewriter." }, { status: 429 });

  const thread = await prisma.thread.create({
    data: {
      kind: data.kind,
      title: data.title,
      body: data.body ?? "",
      linkUrl: data.kind === "LINK" ? data.linkUrl : null,
      imageUrl: data.kind === "IMAGE" ? data.imageUrl : null,
      imageAlt: data.kind === "IMAGE" ? data.imageAlt ?? null : null,
      authorId: user.id,
      channelSlug: data.channelSlug,
      tags: data.tags ?? [],
    },
  });

  return NextResponse.json({ ok: true, id: thread.id });
}
