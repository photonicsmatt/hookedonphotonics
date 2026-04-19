"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const [sent, setSent]   = useState(false);
  const [dev, setDev]     = useState(false);
  const [err, setErr]     = useState<string | null>(null);
  const [busy, setBusy]   = useState(false);
  const router = useRouter();

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "Couldn't send code"); return; }
    setSent(true); setDev(!!data.dev);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "Invalid code"); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="wrap narrow">
      <div style={{ maxWidth: 460, margin: "0 auto", width: "100%" }}>
        <div className="hero">
          <div className="crumb">// auth.sh</div>
          <h1>sign in.</h1>
          <p>Work or .edu email only. We hash it with a pepper — the raw address never touches the DB.</p>
        </div>

        <div className="post">
          {!sent ? (
            <form onSubmit={requestCode}>
              <label className="small" style={{ display: "block", marginBottom: 6 }}>work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                style={{ width: "100%", padding: 10, font: "inherit", border: "1px solid var(--line)" }}
              />
              {err && <p style={{ color: "var(--magenta)", marginTop: 10 }}>{err}</p>}
              <div className="post-actions" style={{ marginTop: 14 }}>
                <button className="chip primary" disabled={busy} type="submit">
                  {busy ? "sending…" : "send one-time code"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={verify}>
              <p className="small">
                sent a 6-digit code to <b>{email}</b>
                {dev && <span style={{ color: "var(--magenta)" }}> — check server console (dev mode)</span>}
              </p>
              <input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 22,
                  letterSpacing: 6,
                  textAlign: "center",
                  font: "inherit",
                  fontFamily: "'VT323',monospace",
                  border: "1px solid var(--line)",
                }}
              />
              {err && <p style={{ color: "var(--magenta)", marginTop: 10 }}>{err}</p>}
              <div className="post-actions" style={{ marginTop: 14 }}>
                <button className="chip primary" disabled={busy} type="submit">
                  {busy ? "verifying…" : "verify & sign in"}
                </button>
                <button className="chip" type="button" onClick={() => { setSent(false); setCode(""); }}>
                  use different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
