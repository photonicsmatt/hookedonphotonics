"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ threadId, handle }: { threadId: string; handle: string | null }) {
  const [body, setBody] = useState("");
  const [err, setErr]   = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle) { router.push("/signin"); return; }
    setBusy(true); setErr(null);
    const res = await fetch(`/api/threads/${threadId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setBusy(false);
    if (res.status === 401) { router.push("/signin"); return; }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Couldn't post");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form className="reply-form" onSubmit={submit}>
      <h3 style={{ marginTop: 0, fontFamily: "'VT323',monospace", color: "var(--magenta)", fontSize: 24 }}>
        &gt; reply {handle ? "anonymously" : "(sign in first)"}
      </h3>
      <textarea
        placeholder="Keep it specific. Keep it anonymous. Don't name names."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="row">
        <span>
          {err
            ? <span style={{ color: "var(--magenta)" }}>{err}</span>
            : handle
              ? <>posting as <b style={{ color: "var(--indigo)" }}>{handle}</b></>
              : "sign in with your work email to reply"}
        </span>
        <button className="chip primary" disabled={busy} type="submit">
          {busy ? "posting…" : "post reply"}
        </button>
      </div>
    </form>
  );
}
