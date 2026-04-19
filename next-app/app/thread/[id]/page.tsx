import { notFound } from "next/navigation";
import FlagButton from "@/components/FlagButton";
import ModActionBar from "@/components/ModActionBar";
import ReplyForm from "@/components/ReplyForm";
import VoteButtons from "@/components/VoteButtons";
import { currentUser, isMod } from "@/lib/auth";
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
  const [thread, user] = await Promise.all([getThread(params.id, { includeRemoved: true }), currentUser()]);
  if (!thread) notFound();
  const mod = isMod(user);
  // Non-mods don't see content of removed items.
  const hideContent = !!thread.removedAt && !mod;

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
              {thread.removedAt && <span className="removed-tag">REMOVED</span>}
            </div>
            <h2>{thread.title}</h2>

            {hideContent ? (
              <p className="removed-placeholder">
                [removed by mods{thread.removalReason ? ` — ${thread.removalReason}` : ""}]
              </p>
            ) : (
              <>
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
              </>
            )}

            <div className="post-actions">
              <FlagButton threadId={thread.id} signedIn={!!user} />
              <span className="small" style={{ marginLeft: "auto" }}>
                {thread.comments.length} replies · {thread.upvotes} upvotes
              </span>
            </div>

            {mod && (
              <ModActionBar
                kind="thread"
                id={thread.id}
                isRemoved={!!thread.removedAt}
                authorId={thread.author.id}
                authorBanned={!!thread.author.bannedAt}
              />
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
              const hideComment = !!c.removedAt && !mod;
              return (
                <div className="comment" key={c.id}>
                  <div className="cmeta">
                    <span className="handle">{c.author.handle}</span>{" "}
                    <span className={cf}>{c.author.flair}</span>
                    {" "}· {timeAgo(c.createdAt)}
                    {" "}· <span style={{ color: "var(--magenta)" }}>+{c.upvotes}</span>
                    {c.removedAt && <span className="removed-tag">REMOVED</span>}
                  </div>
                  {hideComment ? (
                    <p className="removed-placeholder">
                      [removed by mods{c.removalReason ? ` — ${c.removalReason}` : ""}]
                    </p>
                  ) : (
                    <div className="cbody">{c.body}</div>
                  )}
                  <div className="comment-actions">
                    <FlagButton commentId={c.id} signedIn={!!user} />
                    {mod && (
                      <ModActionBar
                        kind="comment"
                        id={c.id}
                        isRemoved={!!c.removedAt}
                        authorId={c.author.id}
                        authorBanned={!!c.author.bannedAt}
                        compact
                      />
                    )}
                  </div>
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
