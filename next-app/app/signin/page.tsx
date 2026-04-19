"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "signup";

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/";

  const [mode, setMode]       = useState<Mode>("login");
  const [handle, setHandle]   = useState("");
  const [password, setPw]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr]         = useState<string | null>(null);
  const [busy, setBusy]       = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (mode === "signup" && password !== confirm) {
      setErr("passwords don't match"); return;
    }

    setBusy(true);
    const res = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle, password }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "something went wrong"); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="wrap narrow">
      <div style={{ maxWidth: 460, margin: "0 auto", width: "100%" }}>
        <div className="hero">
          <div className="crumb">// auth.sh</div>
          <h1>{mode === "signup" ? "new account." : "sign in."}</h1>
          <p>
            {mode === "signup"
              ? "Pick a handle. Don't use your real name. Don't use your work name."
              : "Welcome back, anon."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`submit-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setErr(null); }}
          >sign in</button>
          <button
            type="button"
            className={`submit-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setErr(null); }}
          >create account</button>
        </div>

        <div className="submit-box">
          <form onSubmit={submit}>
            <label className="field-label">handle</label>
            <input
              className="field"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="3–24 chars, a–z 0–9 _"
              maxLength={24}
            />

            <label className="field-label" style={{ marginTop: 12 }}>password</label>
            <input
              className="field"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPw(e.target.value)}
              placeholder={mode === "signup" ? "at least 8 characters" : ""}
              minLength={mode === "signup" ? 8 : 1}
            />

            {mode === "signup" && (
              <>
                <label className="field-label" style={{ marginTop: 12 }}>confirm password</label>
                <input
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <p className="small" style={{ marginTop: 10, color: "var(--ink-soft)" }}>
                  no email, no password recovery. write your password down somewhere safe.
                </p>
              </>
            )}

            {err && <p style={{ color: "var(--magenta)", marginTop: 12, fontSize: 13 }}>{err}</p>}

            <div className="submit-actions">
              <button className="chip primary" type="submit" disabled={busy}>
                {busy
                  ? (mode === "signup" ? "creating…" : "signing in…")
                  : (mode === "signup" ? "create account" : "sign in")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
