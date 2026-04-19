import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default function TopBar({ handle }: { handle: string | null }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="logo" href="/">
          <span className="hook">&gt;</span><span>HOOKED</span>
          <span className="dot">.</span><span>ON</span>
          <span className="dot">.</span><span>PHOTONICS</span>
        </Link>
        <span className="tagline">
          industry gossip since <span style={{ color: "var(--magenta)" }}>2026</span>
        </span>
        <nav>
          <Link href="/">Feed</Link>
          <Link href="/channels">Channels</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/about">About</Link>
          {handle ? (
            <>
              <Link href="/submit" className="btn-login">+ Post</Link>
              <span style={{ color: "#ffd84a", fontSize: 12, marginLeft: 6 }}>
                anon: <b>{handle}</b>
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/signin" className="btn-login">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
