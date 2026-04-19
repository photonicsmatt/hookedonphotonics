import Link from "next/link";

type Channel = { slug: string; name: string };

export default function ChannelTabs({
  channels,
  active,
}: {
  channels: Channel[];
  active: string;
}) {
  return (
    <div className="tabs">
      <Link className={`tab ${active === "all" ? "active" : ""}`} href="/">all</Link>
      {channels.map((c) => (
        <Link
          key={c.slug}
          className={`tab ${active === c.slug ? "active" : ""}`}
          href={`/?channel=${c.slug}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
