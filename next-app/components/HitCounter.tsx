"use client";

import { useEffect, useState } from "react";

export default function HitCounter() {
  const [n, setN] = useState(8421);
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + Math.floor(Math.random() * 3)), 4200);
    return () => clearInterval(id);
  }, []);
  return <div className="hit-counter">{String(n).padStart(7, "0")}</div>;
}
