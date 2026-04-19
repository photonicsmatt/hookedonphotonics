import { redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import { currentUser } from "@/lib/auth";
import { listChannels } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: { channel?: string; kind?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/signin?next=/submit");

  const channels = await listChannels();
  const defaultChannel =
    (searchParams.channel && channels.find((c) => c.slug === searchParams.channel)?.slug) ??
    channels[0]?.slug ??
    "rumors";

  const defaultKind =
    searchParams.kind === "link" ? "LINK" :
    searchParams.kind === "image" ? "IMAGE" : "TEXT";

  return (
    <main className="wrap narrow">
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
        <div className="hero">
          <div className="crumb">// compose.exe</div>
          <h1>new <span className="accent">post</span>.</h1>
          <p>
            Posting as <b style={{ color: "var(--indigo)" }}>{user.handle}</b>. No named individuals.
            Specifics &gt; vibes.
          </p>
        </div>

        <SubmitForm
          channels={channels.map((c) => ({ slug: c.slug, name: c.name }))}
          defaultChannel={defaultChannel}
          defaultKind={defaultKind as "TEXT" | "LINK" | "IMAGE"}
        />
      </div>
    </main>
  );
}
