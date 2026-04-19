"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoteButtons({
  threadId,
  initialScore,
}: {
  threadId: string;
  initialScore: number;
}) {
  const [score, setScore] = useState(initialScore);
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  const router = useRouter();

  async function vote(next: 1 | -1) {
    const nextDir = dir === next ? 0 : next;
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ threadId, dir: nextDir }),
    });
    if (res.status === 401) {
      router.push("/signin");
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { score: number };
    setScore(data.score);
    setDir(nextDir);
  }

  return (
    <div className="votes">
      <button
        className="vote-up"
        onClick={() => vote(1)}
        style={dir === 1 ? { color: "var(--magenta)" } : undefined}
        title="upvote"
      >▲</button>
      <div className="score">{score}</div>
      <button
        className="vote-down"
        onClick={() => vote(-1)}
        style={dir === -1 ? { color: "var(--cyan)" } : undefined}
        title="downvote"
      >▼</button>
    </div>
  );
}
