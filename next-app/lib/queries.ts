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

export async function getThread(id: string) {
  return prisma.thread.findFirst({
    where: { id, removedAt: null },
    include: {
      author: { select: { handle: true, flair: true } },
      channel: { select: { slug: true, name: true } },
      comments: {
        where: { removedAt: null },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { handle: true, flair: true } } },
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
