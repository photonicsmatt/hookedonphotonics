"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  kind: "thread" | "comment";
  id: string;
  isRemoved: boolean;
  authorId: string;
  authorBanned: boolean;
  canBan?: boolean;
  compact?: boolean;
};

export default function ModActionBar(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function action(kind: string, extras: Record<string, unknown> = {}) {
    const note = extras.note === undefined && (kind === "REMOVE_THREAD" || kind === "REMOVE_COMMENT" || kind === "BAN_USER")
      ? prompt("reason (shown in audit log, private to mods):") ?? undefined
      : (extras.note as string | undefined);
    if (note === "") return; // user cancelled
    setBusy(true);
    const body: Record<string, unknown> = { kind, note };
    if (props.kind === "thread") body.threadId = props.id; else body.commentId = props.id;
    if (kind.endsWith("_USER")) { body.userId = props.authorId; delete body.threadId; delete body.commentId; }
    const res = await fetch("/api/mod/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  const removeKind  = props.kind === "thread" ? "REMOVE_THREAD"  : "REMOVE_COMMENT";
  const restoreKind = props.kind === "thread" ? "RESTORE_THREAD" : "RESTORE_COMMENT";

  return (
    <div className={`mod-bar ${props.compact ? "compact" : ""}`}>
      <span className="mod-tag">MOD</span>
      {props.isRemoved ? (
        <button className="chip" disabled={busy} onClick={() => action(restoreKind, { note: "" })}>
          ↺ restore
        </button>
      ) : (
        <button className="chip" disabled={busy} onClick={() => action(removeKind)}>
          ✂ remove
        </button>
      )}
      <button className="chip" disabled={busy} onClick={() => action("DISMISS_FLAG", { note: "" })}>
        ✓ dismiss flags
      </button>
      {props.canBan !== false && (
        props.authorBanned ? (
          <button className="chip" disabled={busy} onClick={() => action("UNBAN_USER", { note: "" })}>
            🔓 unban author
          </button>
        ) : (
          <button className="chip" disabled={busy} onClick={() => action("BAN_USER")}>
            🚫 ban author
          </button>
        )
      )}
    </div>
  );
}
