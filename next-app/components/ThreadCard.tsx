import Link from "next/link";
import VoteButtons from "./VoteButtons";

type Props = {
  id: string;
  kind: "TEXT" | "LINK" | "IMAGE";
  title: string;
  body: string;
  linkUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
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

function domainOf(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, ""); }
  catch { return "link"; }
}

function kindBadge(k: Props["kind"]) {
  if (k === "LINK")  return <span className="kind-badge link">◎ link</span>;
  if (k === "IMAGE") return <span className="kind-badge image">▦ image</span>;
  return <span className="kind-badge text">▤ text</span>;
}

export default function ThreadCard(t: Props) {
  const flairClass = /anon/i.test(t.authorFlair) ? "flair anon" : "flair";
  const snippet =
    t.kind === "TEXT" && t.body
      ? t.body.split("\n")[0].slice(0, 220)
      : t.kind === "LINK" && t.body
        ? t.body.split("\n")[0].slice(0, 180)
        : "";

  return (
    <article className="thread">
      <VoteButtons threadId={t.id} initialScore={t.upvotes - t.downvotes} />

      {t.kind === "IMAGE" && t.imageUrl ? (
        <Link href={`/thread/${t.id}`} className="thumb-link" aria-label={t.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="img-thumb" src={t.imageUrl} alt={t.imageAlt ?? ""} loading="lazy" />
        </Link>
      ) : null}

      <div className="thread-body">
        <div className="thread-meta">
          <span className="channel">{t.channelName}</span>
          {" "}· <span>anon:{t.authorHandle}</span>
          <span className={flairClass}>{t.authorFlair}</span>
          {" "}· <span>{timeAgo(t.createdAt)}</span>
          {" "}· {kindBadge(t.kind)}
        </div>

        <Link className="thread-title" href={`/thread/${t.id}`}>{t.title}</Link>

        {t.kind === "LINK" && t.linkUrl ? (
          <a
            className="link-inline"
            href={t.linkUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {domainOf(t.linkUrl)} ↗
          </a>
        ) : null}

        {snippet && <p className="thread-snippet">{snippet}</p>}

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
