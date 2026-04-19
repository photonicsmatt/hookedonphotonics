import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ModActionBar from "@/components/ModActionBar";
import { currentUser, isMod } from "@/lib/auth";
import { modCounts, openFlags, recentModActions } from "@/lib/queries";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString();
}

const REASON_LABELS: Record<string, string> = {
  names_individual: "names an individual",
  defamatory: "defamatory",
  spam: "spam",
  off_topic: "off topic",
  nsfw: "NSFW",
  insider_trading: "insider trading",
  other: "other",
};

export default async function ModQueuePage() {
  const user = await currentUser();
  if (!user) redirect("/signin?next=/mod");
  if (!isMod(user)) notFound();

  const [flags, counts, log] = await Promise.all([
    openFlags(),
    modCounts(),
    recentModActions(40),
  ]);

  // Group flags by target (thread or comment)
  type Group = { key: string; kind: "thread" | "comment"; flags: typeof flags; };
  const groups: Group[] = [];
  const index = new Map<string, Group>();
  for (const f of flags) {
    const key = f.threadId ? `t:${f.threadId}` : f.commentId ? `c:${f.commentId}` : `f:${f.id}`;
    let g = index.get(key);
    if (!g) {
      g = { key, kind: f.threadId ? "thread" : "comment", flags: [] as typeof flags };
      index.set(key, g);
      groups.push(g);
    }
    g.flags.push(f);
  }

  return (
    <main className="wrap narrow">
      <div className="hero">
        <div className="crumb">// mod.sys</div>
        <h1>mod <span className="accent">queue</span>.</h1>
        <p>
          You&apos;re signed in as <b style={{ color: "var(--indigo)" }}>{user.handle}</b>
          {" "}· role: <span className="mod-tag">{user.role}</span>
        </p>
      </div>

      <div className="mod-stats">
        <div><b>{counts.openFlagCount}</b><span>open flags</span></div>
        <div><b>{counts.removedThreads}</b><span>removed threads</span></div>
        <div><b>{counts.removedComments}</b><span>removed comments</span></div>
      </div>

      <h2 style={{ marginTop: 24 }}>unresolved</h2>
      {groups.length === 0 ? (
        <div className="box small">queue is empty. nice.</div>
      ) : (
        <div className="mod-list">
          {groups.map((g) => {
            const first = g.flags[0];
            if (g.kind === "thread" && first.thread) {
              const t = first.thread;
              return (
                <article className="mod-item" key={g.key}>
                  <div className="mod-item-head">
                    <span className="kind-badge text">thread</span>
                    <span className="small">in <b style={{ color: "var(--magenta)" }}>{t.channel.name}</b></span>
                    <span className="small">· by {t.author.handle}{t.author.bannedAt ? " (banned)" : ""}</span>
                    <span className="small">· {timeAgo(t.createdAt)}</span>
                    {t.removedAt && <span className="removed-tag">REMOVED</span>}
                  </div>
                  <Link className="thread-title" href={`/thread/${t.id}`} style={{ fontSize: 17 }}>
                    {t.title}
                  </Link>
                  {t.body && (
                    <p className="thread-snippet" style={{ marginTop: 6 }}>
                      {t.body.slice(0, 280)}
                    </p>
                  )}
                  <div className="flag-list">
                    {g.flags.map((f) => (
                      <div key={f.id} className="flag-item">
                        <b>{REASON_LABELS[f.reason] ?? f.reason}</b>
                        <span className="small"> · reporter {f.reporter.handle} · {timeAgo(f.createdAt)}</span>
                        {f.note && <div className="small" style={{ marginTop: 2 }}>&ldquo;{f.note}&rdquo;</div>}
                      </div>
                    ))}
                  </div>
                  <ModActionBar
                    kind="thread"
                    id={t.id}
                    isRemoved={!!t.removedAt}
                    authorId={t.author.id}
                    authorBanned={!!t.author.bannedAt}
                    canBan={user.role === "ADMIN" || user.role === "MOD"}
                  />
                </article>
              );
            }
            if (g.kind === "comment" && first.comment) {
              const c = first.comment;
              return (
                <article className="mod-item" key={g.key}>
                  <div className="mod-item-head">
                    <span className="kind-badge link">comment</span>
                    <span className="small">on <Link href={`/thread/${c.thread.id}`} style={{ color: "var(--indigo)" }}>{c.thread.title.slice(0, 60)}</Link></span>
                    <span className="small">· by {c.author.handle}{c.author.bannedAt ? " (banned)" : ""}</span>
                    <span className="small">· {timeAgo(c.createdAt)}</span>
                    {c.removedAt && <span className="removed-tag">REMOVED</span>}
                  </div>
                  <p className="cbody" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{c.body}</p>
                  <div className="flag-list">
                    {g.flags.map((f) => (
                      <div key={f.id} className="flag-item">
                        <b>{REASON_LABELS[f.reason] ?? f.reason}</b>
                        <span className="small"> · reporter {f.reporter.handle} · {timeAgo(f.createdAt)}</span>
                        {f.note && <div className="small" style={{ marginTop: 2 }}>&ldquo;{f.note}&rdquo;</div>}
                      </div>
                    ))}
                  </div>
                  <ModActionBar
                    kind="comment"
                    id={c.id}
                    isRemoved={!!c.removedAt}
                    authorId={c.author.id}
                    authorBanned={!!c.author.bannedAt}
                    canBan={user.role === "ADMIN" || user.role === "MOD"}
                  />
                </article>
              );
            }
            return null;
          })}
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>recent actions</h2>
      <table className="leader-table">
        <thead>
          <tr>
            <th>when</th>
            <th>actor</th>
            <th>action</th>
            <th>target</th>
            <th>note</th>
          </tr>
        </thead>
        <tbody>
          {log.length === 0 && (
            <tr><td colSpan={5} className="small" style={{ textAlign: "center", padding: 16 }}>no actions yet.</td></tr>
          )}
          {log.map((a) => (
            <tr key={a.id}>
              <td className="small">{timeAgo(a.createdAt)}</td>
              <td><b>{a.actor.handle}</b></td>
              <td><span className="kind-badge text">{a.kind}</span></td>
              <td className="small">
                {a.threadId && <Link href={`/thread/${a.threadId}`}>thread</Link>}
                {a.commentId && <span>comment</span>}
                {a.userId && <span>user:{a.userId.slice(0, 6)}…</span>}
              </td>
              <td className="small">{a.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
