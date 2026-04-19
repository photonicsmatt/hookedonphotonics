"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

type Kind = "TEXT" | "LINK" | "IMAGE";
type Channel = { slug: string; name: string };

const MAX_IMG_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function SubmitForm({
  channels,
  defaultChannel,
  defaultKind,
}: {
  channels: Channel[];
  defaultChannel: string;
  defaultKind: Kind;
}) {
  const router = useRouter();

  const [kind, setKind] = useState<Kind>(defaultKind);
  const [channelSlug, setChannel] = useState(defaultChannel);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const titleCount = title.length;
  const titleOk = titleCount >= 6 && titleCount <= 200;
  const canSubmit = useMemo(() => {
    if (!titleOk || !channelSlug || busy || uploading) return false;
    if (kind === "LINK") return !!linkUrl;
    if (kind === "IMAGE") return !!imageUrl;
    return true;
  }, [titleOk, channelSlug, busy, uploading, kind, linkUrl, imageUrl]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) {
      setErr("Only JPG, PNG, WEBP, or GIF."); return;
    }
    if (file.size > MAX_IMG_BYTES) {
      setErr("Max 8 MB."); return;
    }
    setErr(null); setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setImageUrl(blob.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setErr(`${msg}  — or paste a direct image URL below.`);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const tags = tagsStr.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5);
    const payload: Record<string, unknown> = {
      kind, title, channelSlug, tags, body,
    };
    if (kind === "LINK") payload.linkUrl = linkUrl;
    if (kind === "IMAGE") { payload.imageUrl = imageUrl; payload.imageAlt = imageAlt; }

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.status === 401) { router.push("/signin?next=/submit"); return; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "Couldn't post"); return; }
    router.push(`/thread/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="submit-form">
      <div className="submit-tabs">
        <button
          type="button"
          className={`submit-tab ${kind === "TEXT" ? "active" : ""}`}
          onClick={() => setKind("TEXT")}
        >▤ Text</button>
        <button
          type="button"
          className={`submit-tab ${kind === "LINK" ? "active" : ""}`}
          onClick={() => setKind("LINK")}
        >◎ Link</button>
        <button
          type="button"
          className={`submit-tab ${kind === "IMAGE" ? "active" : ""}`}
          onClick={() => setKind("IMAGE")}
        >▦ Image</button>
      </div>

      <div className="submit-box">
        <label className="field-label">channel</label>
        <select
          value={channelSlug}
          onChange={(e) => setChannel(e.target.value)}
          className="field"
        >
          {channels.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <label className="field-label" style={{ marginTop: 12 }}>
          headline
          <span className={`char-count ${titleOk ? "" : "bad"}`}>{titleCount}/200</span>
        </label>
        <input
          className="field"
          placeholder="be specific. vague gets downvoted."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={220}
        />

        {kind === "TEXT" && (
          <>
            <label className="field-label" style={{ marginTop: 12 }}>body (optional)</label>
            <textarea
              className="field"
              placeholder="the story. markdown-ish. no named individuals."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 160, resize: "vertical" }}
            />
          </>
        )}

        {kind === "LINK" && (
          <>
            <label className="field-label" style={{ marginTop: 12 }}>url</label>
            <input
              className="field"
              type="url"
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            {linkUrl && (
              <div className="link-preview">
                <span className="link-favicon" aria-hidden>🔗</span>
                <div>
                  <div className="link-domain">{safeDomain(linkUrl)}</div>
                  <div className="link-url small">{linkUrl}</div>
                </div>
              </div>
            )}
            <label className="field-label" style={{ marginTop: 12 }}>commentary (optional)</label>
            <textarea
              className="field"
              placeholder="why should anyone click? 2 sentences."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 80, resize: "vertical" }}
            />
          </>
        )}

        {kind === "IMAGE" && (
          <>
            <label className="field-label" style={{ marginTop: 12 }}>image</label>
            <div className="img-drop">
              <input
                ref={fileRef}
                type="file"
                accept={OK_TYPES.join(",")}
                onChange={onPickFile}
                style={{ display: "none" }}
              />
              {imageUrl ? (
                <div className="img-preview-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={imageAlt || "preview"} className="img-preview" />
                  <button
                    type="button"
                    className="chip"
                    onClick={() => { setImageUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ marginTop: 10 }}
                  >remove</button>
                </div>
              ) : (
                <button
                  type="button"
                  className="chip primary"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "uploading…" : "📎 choose file (JPG / PNG / WEBP / GIF, ≤8MB)"}
                </button>
              )}
            </div>
            <label className="field-label" style={{ marginTop: 12 }}>
              …or paste a direct image URL
            </label>
            <input
              className="field"
              type="url"
              placeholder="https://…/thing.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <label className="field-label" style={{ marginTop: 12 }}>alt text (accessibility)</label>
            <input
              className="field"
              placeholder="what's in the image, for screen readers"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              maxLength={200}
            />
            <label className="field-label" style={{ marginTop: 12 }}>caption (optional)</label>
            <textarea
              className="field"
              placeholder="what are we looking at?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 80, resize: "vertical" }}
            />
          </>
        )}

        <label className="field-label" style={{ marginTop: 12 }}>tags (comma-separated, up to 5)</label>
        <input
          className="field"
          placeholder="e.g. 1.6T, ramp, hyperscaler"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
        />

        {err && <p style={{ color: "var(--magenta)", marginTop: 12, fontSize: 13 }}>{err}</p>}

        <div className="submit-actions">
          <button type="button" className="chip" onClick={() => router.back()}>cancel</button>
          <button type="submit" className="chip primary" disabled={!canSubmit}>
            {busy ? "posting…" : "post"}
          </button>
        </div>
      </div>
    </form>
  );
}

function safeDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return "invalid url"; }
}
