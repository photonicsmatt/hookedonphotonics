import { listChannels } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const channels = await listChannels();
  return (
    <main className="wrap narrow">
      <div className="hero">
        <div className="crumb">// directory</div>
        <h1>channels.</h1>
        <p>Pick your flavor of industry drama. Each channel has its own rules and mods.</p>
      </div>

      <div className="channels-grid">
        {channels.map((c) => (
          <a key={c.slug} className="channel-card" href={`/?channel=${c.slug}`}>
            <span className="cname">{c.name}</span>
            <div className="cblurb">{c.blurb}</div>
            <div className="small" style={{ marginTop: 10, color: "var(--indigo)" }}>
              {c._count.threads} thread{c._count.threads === 1 ? "" : "s"}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
