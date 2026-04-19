"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.refresh();
  }
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); signOut(); }} className="btn-login" style={{ marginLeft: 6 }}>
      Sign out
    </a>
  );
}
