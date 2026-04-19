import ChannelTabs from "@/components/ChannelTabs";
import NewThreadForm from "@/components/NewThreadForm";
import Sidebar from "@/components/Sidebar";
import ThreadCard from "@/components/ThreadCard";
import { currentUser } from "@/lib/auth";
import { listChannels, listThreads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { channel?: string; compose?: string };
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

        <ChannelTabs
          channels={channels.map((c) => ({ slug: c.slug, name: c.name }))}
          active={channel ?? "all"}
        />

        {searchParams.compose === "1" && user ? (
          <div style={{ marginBottom: 18 }}>
            <NewThreadForm channels={channels.map((c) => ({ slug: c.slug, name: c.name }))} />
          </div>
        ) : null}

        <div className="thread-list">
          {threads.length === 0 ? (
            <div className="box small center">nothing posted here yet. be the first anon.</div>
          ) : (
            threads.map((t) => (
              <ThreadCard
                key={t.id}
                id={t.id}
                title={t.title}
                body={t.body}
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
