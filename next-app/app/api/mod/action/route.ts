import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMod } from "@/lib/auth";

const ACTIONS = [
  "REMOVE_THREAD",
  "RESTORE_THREAD",
  "REMOVE_COMMENT",
  "RESTORE_COMMENT",
  "DISMISS_FLAG",
  "BAN_USER",
  "UNBAN_USER",
  "PROMOTE_USER",
  "DEMOTE_USER",
] as const;

const schema = z.object({
  kind: z.enum(ACTIONS),
  threadId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const mod = await requireMod();
  if (!mod.ok) return NextResponse.json({ error: "Forbidden" }, { status: mod.status });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  const { kind, threadId, commentId, userId, note } = parsed.data;

  await prisma.$transaction(async (tx) => {
    switch (kind) {
      case "REMOVE_THREAD": {
        if (!threadId) throw new Error("threadId required");
        await tx.thread.update({
          where: { id: threadId },
          data: { removedAt: new Date(), removalReason: note ?? null },
        });
        await tx.flag.updateMany({
          where: { threadId, resolvedAt: null },
          data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "removed" },
        });
        break;
      }
      case "RESTORE_THREAD": {
        if (!threadId) throw new Error("threadId required");
        await tx.thread.update({
          where: { id: threadId },
          data: { removedAt: null, removalReason: null },
        });
        await tx.flag.updateMany({
          where: { threadId, resolvedAt: null },
          data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "restored" },
        });
        break;
      }
      case "REMOVE_COMMENT": {
        if (!commentId) throw new Error("commentId required");
        await tx.comment.update({
          where: { id: commentId },
          data: { removedAt: new Date(), removalReason: note ?? null },
        });
        await tx.flag.updateMany({
          where: { commentId, resolvedAt: null },
          data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "removed" },
        });
        break;
      }
      case "RESTORE_COMMENT": {
        if (!commentId) throw new Error("commentId required");
        await tx.comment.update({
          where: { id: commentId },
          data: { removedAt: null, removalReason: null },
        });
        await tx.flag.updateMany({
          where: { commentId, resolvedAt: null },
          data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "restored" },
        });
        break;
      }
      case "DISMISS_FLAG": {
        if (threadId) {
          await tx.flag.updateMany({
            where: { threadId, resolvedAt: null },
            data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "dismissed" },
          });
          await tx.thread.update({ where: { id: threadId }, data: { flaggedAt: null } });
        } else if (commentId) {
          await tx.flag.updateMany({
            where: { commentId, resolvedAt: null },
            data: { resolvedAt: new Date(), resolvedById: mod.user!.id, resolution: "dismissed" },
          });
          await tx.comment.update({ where: { id: commentId }, data: { flaggedAt: null } });
        } else {
          throw new Error("threadId or commentId required");
        }
        break;
      }
      case "BAN_USER": {
        if (!userId) throw new Error("userId required");
        await tx.user.update({
          where: { id: userId },
          data: { bannedAt: new Date(), banReason: note ?? null },
        });
        break;
      }
      case "UNBAN_USER": {
        if (!userId) throw new Error("userId required");
        await tx.user.update({
          where: { id: userId },
          data: { bannedAt: null, banReason: null },
        });
        break;
      }
      case "PROMOTE_USER": {
        if (!userId) throw new Error("userId required");
        if (mod.user!.role !== "ADMIN") throw new Error("only admins can promote");
        await tx.user.update({ where: { id: userId }, data: { role: "MOD" } });
        break;
      }
      case "DEMOTE_USER": {
        if (!userId) throw new Error("userId required");
        if (mod.user!.role !== "ADMIN") throw new Error("only admins can demote");
        await tx.user.update({ where: { id: userId }, data: { role: "USER" } });
        break;
      }
    }

    await tx.modAction.create({
      data: {
        actorId: mod.user!.id,
        kind,
        threadId,
        commentId,
        userId,
        note,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
