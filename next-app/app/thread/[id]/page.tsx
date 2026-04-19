import { notFound } from "next/navigation";
import ReplyForm from "@/components/ReplyForm";
import VoteButtons from "@/components/VoteButtons";
import { currentUser } from "@/lib/auth";
import { getThread } from "@/lib/queries";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString();
}

function domainOf(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, ""); }
  catch { return "link"; }
}

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const [thread, user] = await Promise.all([getThread(params.id), currentUser()]);
  if (!thread) notFound();

  const flairClass = /anon/i.test(thread.author.flair) ? "flair anon" : "flair";

  return (
    <main className="wrap narrow">
      <div style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
        <p className="small"><a href="/">← back to feed</a></p>

        <article className="post" style={{ display: "grid", gridTemplateColumns: "64px 1fr", padding: 0 }}>
          <VoteButtons threadId={thread.id} initialScore={thread.upvotes - thread.downvotes} />
          <div style={{ padding: "18px 22px" }}>
            <div className="post-meta">
              <span style={{ color: "var(--magenta)", fontWeight: 700 }}>{thread.channel.name}</span>
              {" "}· anon:{thread.author.handle} <span className={flairClass}>{thread.author.flair}</span>
              {" "}· {timeAgo(thread.createdAt)}
              {" "}· <span className={`kind-badge ${thread.kind.toLowerCase()}`}>
                {thread.kind === "LINK" ? "◎ link" : thread.kind === "IMAGE" ? "▦ image" : "▤ text"}
              </span>
            </div>
            <h2>{thread.title}</h2>

            {thread.kind === "LINK" && thread.linkUrl ? (
              <a
                className="link-card"
                href={thread.linkUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <span className="link-favicon" aria-hidden>🔗</span>
                <div>
                  <div className="link-domain">{domainOf(thread.linkUrl)} ↗</div>
                  <div className="link-url small">{thread.linkUrl}</div>
                </div>
              </a>
            ) : null}

            {thread.kind === "IMAGE" && thread.imageUrl ? (
              <a href={thread.imageUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thread.imageUrl}
                  alt={thread.imageAlt ?? thread.title}
                  className="img-full"
                />
              </a>
            ) : null}

            {thread.body && <div className="body" style={{ marginTop: 12 }}>{thread.body}</div>}

            {thread.tags.length > 0 && (
              <div className="thread-footer" style={{ marginTop: 10 }}>
                {thread.tags.map((t) => <span className="tag" key={t}>#{t}</span>)}
              </div>
            )}
          </div>
        </article>

        <section className="comments">
          <h3>&gt; {thread.comments.length} replies</h3>
          {thread.comments.length === 0 ? (
            <div className="box small">no replies yet. the silence is loud.</div>
          ) : (
            thread.comments.map((c) => {
              const cf = /anon/i.test(c.author.flair) ? "flair anon" : "flair";
              return (
                <div className="comment" key={c.id}>
                  <div className="cmeta">
                    <span className="handle">{c.author.handle}</span>{" "}
                    <span className={cf}>{c.author.flair}</span>
                    {" "}· {timeAgo(c.createdAt)}
                    {" "}· <span style={{ color: "var(--magenta)" }}>+{c.upvotes}</span>
                  </div>
                  <div className="cbody">{c.body}</div>
                </div>
              );
            })
          )}
        </section>

        <ReplyForm threadId={thread.id} handle={user?.handle ?? null} />
      </div>
    </main>
  );
}
