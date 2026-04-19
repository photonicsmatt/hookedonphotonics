import { prisma } from "./db";

export type ThreadCard = Awaited<ReturnType<typeof listThreads>>[number];

export async function listThreads(opts: { channelSlug?: string; limit?: number } = {}) {
  return prisma.thread.findMany({
    where: {
      removedAt: null,
      channelSlug: opts.channelSlug,
    },
    orderBy: [{ createdAt: "desc" }],
    take: opts.limit ?? 30,
    include: {
      author: { select: { handle: true, flair: true } },
      channel: { select: { slug: true, name: true } },
      _count: { select: { comments: true } },
    },
  });
}

export async function getThread(id: string, opts: { includeRemoved?: boolean } = {}) {
  return prisma.thread.findFirst({
    where: opts.includeRemoved ? { id } : { id, removedAt: null },
    include: {
      author: { select: { id: true, handle: true, flair: true, bannedAt: true } },
      channel: { select: { slug: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, handle: true, flair: true, bannedAt: true } } },
      },
    },
  });
}

export async function listChannels() {
  return prisma.channel.findMany({
    orderBy: { slug: "asc" },
    include: { _count: { select: { threads: true } } },
  });
}

export async function topLeaders(limit = 20) {
  return prisma.user.findMany({
    orderBy: { karma: "desc" },
    take: limit,
    select: { handle: true, flair: true, karma: true, createdAt: true },
  });
}

export async function openFlags() {
  return prisma.flag.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, handle: true } },
      thread: {
        include: {
          author: { select: { id: true, handle: true, flair: true, bannedAt: true } },
          channel: { select: { slug: true, name: true } },
        },
      },
      comment: {
        include: {
          author: { select: { id: true, handle: true, flair: true, bannedAt: true } },
          thread: { select: { id: true, title: true, channelSlug: true } },
        },
      },
    },
  });
}

export async function recentModActions(limit = 50) {
  return prisma.modAction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { handle: true } } },
  });
}

export async function modCounts() {
  const [openFlagCount, removedThreads, removedComments] = await Promise.all([
    prisma.flag.count({ where: { resolvedAt: null } }),
    prisma.thread.count({ where: { removedAt: { not: null } } }),
    prisma.comment.count({ where: { removedAt: { not: null } } }),
  ]);
  return { openFlagCount, removedThreads, removedComments };
}
