import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Ticker from "@/components/Ticker";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hooked on Photonics — industry gossip for the lightpath crowd",
  description: "Anonymous, verified-by-work-email discussion for people inside the photonics industry.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TopBar handle={user?.handle ?? null} />
        <Ticker />
        {children}
        <footer>
          <div>© 2026 Hooked on Photonics &nbsp;·&nbsp; <a href="/about">rules</a></div>
          <div className="glyphs">/\/\ ◇ &lt;&lt;&lt; ◇ /\/\</div>
          <div className="small" style={{ marginTop: 8, opacity: 0.6 }}>
            best viewed in any browser made after 1997
          </div>
        </footer>
      </body>
    </html>
  );
}
