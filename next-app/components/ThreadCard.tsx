import Link from "next/link";
import VoteButtons from "./VoteButtons";

type Props = {
  id: string;
  title: string;
  body: string;
  authorHandle: string;
  authorFlair: string;
  channelName: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  tags: string[];
  commentCount: number;
};

function timeAgo(d: Date) {
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function ThreadCard(t: Props) {
  const snippet = t.body.split("\n")[0].slice(0, 220);
  const flairClass = /anon/i.test(t.authorFlair) ? "flair anon" : "flair";
  return (
    <article className="thread">
      <VoteButtons threadId={t.id} initialScore={t.upvotes - t.downvotes} />
      <div className="thread-body">
        <div className="thread-meta">
          <span className="channel">{t.channelName}</span>
          &nbsp;· <span>anon:{t.authorHandle}</span>
          <span className={flairClass}>{t.authorFlair}</span>
          &nbsp;· <span>{timeAgo(t.createdAt)}</span>
        </div>
        <Link className="thread-title" href={`/thread/${t.id}`}>{t.title}</Link>
        <p className="thread-snippet">{snippet}</p>
        <div className="thread-footer">
          {t.tags.slice(0, 3).map((x) => (
            <span className="tag" key={x}>#{x}</span>
          ))}
          <span className="dot-sep">·</span>
          <span>{t.commentCount} replies</span>
          <span className="dot-sep">·</span>
          <span>{t.upvotes} upvotes</span>
        </div>
      </div>
    </article>
  );
}
