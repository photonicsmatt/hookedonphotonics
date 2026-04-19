"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Target = { threadId: string } | { commentId: string };

const REASONS: { value: string; label: string }[] = [
  { value: "names_individual",  label: "names an individual" },
  { value: "defamatory",         label: "defamatory / false" },
  { value: "spam",               label: "spam / recruiting" },
  { value: "off_topic",          label: "off topic" },
  { value: "nsfw",               label: "NSFW" },
  { value: "insider_trading",    label: "insider trading risk" },
  { value: "other",              label: "other" },
];

export default function FlagButton(props: Target & { signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!props.signedIn) { router.push("/signin"); return; }
    setBusy(true);
    const body: Record<string, unknown> = { reason, note };
    if ("threadId" in props) body.threadId = props.threadId;
    else body.commentId = props.commentId;
    const res = await fetch("/api/flag", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setDone(true); setTimeout(() => setOpen(false), 900); }
  }

  return (
    <>
      <button
        type="button"
        className="chip"
        onClick={() => setOpen((v) => !v)}
      >⚑ flag</button>

      {open && (
        <div className="flag-pop">
          {done ? (
            <span className="small">thanks — a mod will review.</span>
          ) : (
            <>
              <div className="small" style={{ marginBottom: 6, color: "var(--ink-soft)" }}>
                why are you flagging this?
              </div>
              <select
                className="field"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <textarea
                className="field"
                placeholder="optional context (500 chars)"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ marginTop: 8, minHeight: 60 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                <button className="chip" type="button" onClick={() => setOpen(false)}>cancel</button>
                <button className="chip primary" type="button" disabled={busy} onClick={submit}>
                  {busy ? "sending…" : "send flag"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
