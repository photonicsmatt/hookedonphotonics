export default function AboutPage() {
  return (
    <main className="wrap narrow">
      <div className="hero">
        <div className="crumb">// readme.txt</div>
        <h1>what is <span className="accent">this</span>?</h1>
        <p>An anonymous discussion board for people who actually work in photonics. Think Wall Street Oasis for the lightpath set, or Blind without the blue checkmarks.</p>
      </div>

      <div className="post">
        <h2>the rules</h2>
        <div className="body">{`1. No real names. Talk about companies, not individuals.
2. No PR, no recruiters, no "we're hiring" posts outside #careers.
3. Pick a handle that doesn't identify you. Don't use your work name, your real name, or a username you've used elsewhere.
4. Tip mods if something crosses into defamation or insider-trading territory.
5. Mods have final say. If a post disappears, don't take it personally.`}</div>
      </div>

      <div className="post">
        <h2>the faq</h2>
        <div className="body">{`How is this anonymous?
All we store is a handle and a bcrypt hash of your password. No email, no phone, no real name. Pick a handle that isn't traceable back to you and you're as anonymous as you choose to be.

I forgot my password. Can you reset it?
No. We have no way to reach you. Write your password down somewhere safe, or use a password manager. A lost password means a new account.

Can my employer see I posted?
Not from our side. We don't log IPs beyond 72 hours and we don't sell data. Don't post uniquely identifying stories, though — common sense applies.

Who runs this?
A small crew of former module, foundry, and IDM folks.

Why the 90s look?
Photonics is old and weird and beautiful. So are the early internet fonts. And it loads fast.`}</div>
      </div>
    </main>
  );
}
