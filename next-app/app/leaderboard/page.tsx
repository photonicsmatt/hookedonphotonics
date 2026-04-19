import { topLeaders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaders = await topLeaders(30);
  return (
    <main className="wrap narrow">
      <div className="hero">
        <div className="crumb">// karma.sys</div>
        <h1>the <span className="accent">leaderboard</span>.</h1>
        <p>Karma earned from upvoted rumors, comp posts, and verified-flair contributions.</p>
      </div>

      <table className="leader-table">
        <thead>
          <tr>
            <th>#</th>
            <th>handle</th>
            <th>flair</th>
            <th>karma</th>
            <th>joined</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((l, i) => {
            const cls = /anon/i.test(l.flair) ? "flair anon" : "flair";
            return (
              <tr key={l.handle}>
                <td className={`rank ${i < 3 ? "top" : ""}`}>{i + 1}</td>
                <td><b>{l.handle}</b></td>
                <td><span className={cls}>{l.flair}</span></td>
                <td>{l.karma.toLocaleString()}</td>
                <td>{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
