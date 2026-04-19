import HitCounter from "./HitCounter";

const TRENDING_TAGS = [
  "#1.6T", "#CPO", "#layoffs", "#Allentown", "#SiPh",
  "#comp2026", "#tunable-laser", "#IPO", "#quantum-runway", "#DSP-leadtime",
];

export default function Sidebar({ online }: { online: string[] }) {
  return (
    <aside className="side">
      <div className="box">
        <h3>&gt; new thread</h3>
        <p className="small">Text, link, or image. Post anonymously.</p>
        <a className="chip primary" href="/submit">+ start a thread</a>
      </div>

      <div className="box">
        <h3>&gt; trending tags</h3>
        <div className="tags-cloud">
          {TRENDING_TAGS.map((t) => (
            <a key={t} href={`/?tag=${encodeURIComponent(t.slice(1))}`}>{t}</a>
          ))}
        </div>
      </div>

      <div className="box">
        <h3>&gt; online now</h3>
        <ul className="online-list">
          {online.map((h) => (
            <li key={h}><span className="led" /><b>{h}</b></li>
          ))}
        </ul>
      </div>

      <div className="box center">
        <h3 style={{ textAlign: "left" }}>&gt; visitors</h3>
        <HitCounter />
        <div className="small" style={{ marginTop: 8 }}>
          since <span style={{ color: "var(--magenta)" }}>03/2026</span>
        </div>
      </div>
    </aside>
  );
}
