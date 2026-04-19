import Link from "next/link";
import ChannelTabs from "@/components/ChannelTabs";
import Sidebar from "@/components/Sidebar";
import ThreadCard from "@/components/ThreadCard";
import { currentUser } from "@/lib/auth";
import { listChannels, listThreads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { channel?: string };
}) {
  const channel = searchParams.channel;
  const user = await currentUser();
  const [threads, channels] = await Promise.all([
    listThreads({ channelSlug: channel }),
    listChannels(),
  ]);

  return (
    <main className="wrap">
      <section>
        <div className="hero">
          <div className="crumb">// welcome{user ? `, ${user.handle}` : " back, anon"}</div>
          <h1>the <span className="accent">unofficial</span> photonics watercooler.</h1>
          <p>Post rumors, compare offers, vent about tapeouts. No recruiters. No PR teams. No LinkedIn influencers.</p>
        </div>

        <div className="notice">
          <b>House rules:</b> keep it anonymous, keep it specific, keep it real. No named individuals. Mods don&apos;t play.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
          <ChannelTabs
            channels={channels.map((c) => ({ slug: c.slug, name: c.name }))}
            active={channel ?? "all"}
          />
          <Link className="chip primary" href={channel ? `/submit?channel=${channel}` : "/submit"}>
            + new post
          </Link>
        </div>

        <div className="thread-list">
          {threads.length === 0 ? (
            <div className="box small center">nothing posted here yet. be the first anon.</div>
          ) : (
            threads.map((t) => (
              <ThreadCard
                key={t.id}
                id={t.id}
                kind={t.kind}
                title={t.title}
                body={t.body}
                linkUrl={t.linkUrl}
                imageUrl={t.imageUrl}
                imageAlt={t.imageAlt}
                authorHandle={t.author.handle}
                authorFlair={t.author.flair}
                channelName={t.channel.name}
                createdAt={t.createdAt}
                upvotes={t.upvotes}
                downvotes={t.downvotes}
                tags={t.tags}
                commentCount={t._count.comments}
              />
            ))
          )}
        </div>
      </section>

      <Sidebar
        online={["fiber_mom", "pluggable_pete", "ghost_of_finisar", "bandgap_betty", "ex_bell_labs", "heatsink_hero"]}
      />
    </main>
  );
}
