"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Channel = { slug: string; name: string };

export default function NewThreadForm({ channels }: { channels: Channel[] }) {
  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [slug, setSlug]     = useState(channels[0]?.slug ?? "rumors");
  const [tagsStr, setTags]  = useState("");
  const [err, setErr]       = useState<string | null>(null);
  const [busy, setBusy]     = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const tags = tagsStr.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5);
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, body, channelSlug: slug, tags }),
    });
    setBusy(false);
    if (res.status === 401) { router.push("/signin"); return; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "Couldn't post"); return; }
    router.push(`/thread/${data.id}`);
  }

  return (
    <form className="reply-form" onSubmit={submit}>
      <h3 style={{ marginTop: 0, fontFamily: "'VT323',monospace", color: "var(--magenta)", fontSize: 24 }}>
        &gt; start a thread
      </h3>
      <input
        placeholder="headline — be specific"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 10, font: "inherit", border: "1px solid var(--line)", marginBottom: 8 }}
      />
      <textarea
        placeholder="the story. no named individuals."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ padding: 8, font: "inherit", border: "1px solid var(--line)" }}
        >
          {channels.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <input
          placeholder="tags (comma separated)"
          value={tagsStr}
          onChange={(e) => setTags(e.target.value)}
          style={{ flex: 1, padding: 8, font: "inherit", border: "1px solid var(--line)" }}
        />
      </div>
      <div className="row">
        <span>{err ? <span style={{ color: "var(--magenta)" }}>{err}</span> : "posting anonymously"}</span>
        <button className="chip primary" disabled={busy} type="submit">
          {busy ? "posting…" : "post thread"}
        </button>
      </div>
    </form>
  );
}
