// Hooked on Photonics — client interactions

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const s = Math.max(1, Math.floor((now - then) / 1000));
  if (s < 60)       return s + "s ago";
  if (s < 3600)     return Math.floor(s / 60) + "m ago";
  if (s < 86400)    return Math.floor(s / 3600) + "h ago";
  if (s < 86400*7)  return Math.floor(s / 86400) + "d ago";
  return new Date(iso).toLocaleDateString();
}

function flairEl(flair) {
  const cls = /anon/i.test(flair) ? "flair anon" : "flair";
  return `<span class="${cls}">${esc(flair)}</span>`;
}

function threadCard(t) {
  const channel = CHANNELS.find(c => c.slug === t.channel);
  const snippet = t.body.split("\n")[0].slice(0, 220);
  const tags = (t.tags || []).slice(0, 3).map(x => `<span class="tag">#${esc(x)}</span>`).join(" ");
  const score = t.upvotes - t.downvotes;
  return `
    <article class="thread">
      <div class="votes">
        <button class="vote-up" title="upvote" onclick="bumpVote(this, 1)">▲</button>
        <div class="score">${score}</div>
        <button class="vote-down" title="downvote" onclick="bumpVote(this, -1)">▼</button>
      </div>
      <div class="thread-body">
        <div class="thread-meta">
          <span class="channel">${channel ? esc(channel.name) : "#" + esc(t.channel)}</span>
          · <span>anon:${esc(t.author)}</span>
          ${flairEl(t.flair)}
          · <span>${timeAgo(t.created)}</span>
        </div>
        <a class="thread-title" href="thread.html?id=${encodeURIComponent(t.id)}">${esc(t.title)}</a>
        <p class="thread-snippet">${esc(snippet)}</p>
        <div class="thread-footer">
          ${tags}
          <span class="dot-sep">·</span>
          <span>${t.comments.length} replies</span>
          <span class="dot-sep">·</span>
          <span>${t.upvotes} upvotes</span>
        </div>
      </div>
    </article>
  `;
}

function bumpVote(btn, dir) {
  const card = btn.closest(".thread, .post");
  const scoreEl = card.querySelector(".score, .post-score");
  if (!scoreEl) return;
  const current = parseInt(scoreEl.textContent, 10) || 0;
  scoreEl.textContent = current + dir;
  btn.style.color = dir > 0 ? "var(--magenta)" : "var(--cyan)";
}

// ---------- Home ----------
function renderHome() {
  const tabs = document.getElementById("channelTabs");
  const list = document.getElementById("threadList");
  const tagCloud = document.getElementById("tagCloud");
  const onlineList = document.getElementById("onlineList");

  if (tabs) {
    CHANNELS.forEach(c => {
      const a = document.createElement("a");
      a.className = "tab";
      a.href = "#";
      a.dataset.channel = c.slug;
      a.textContent = c.name;
      a.addEventListener("click", ev => {
        ev.preventDefault();
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        a.classList.add("active");
        drawList(c.slug);
      });
      tabs.appendChild(a);
    });
    tabs.querySelector('[data-channel="all"]').addEventListener("click", ev => {
      ev.preventDefault();
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      ev.target.classList.add("active");
      drawList("all");
    });
  }

  function drawList(slug) {
    const items = slug === "all"
      ? THREADS.slice().sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      : THREADS.filter(t => t.channel === slug);
    list.innerHTML = items.map(threadCard).join("") ||
      `<div class="box small center">nothing posted here yet. be the first anon.</div>`;
  }
  if (list) drawList("all");

  if (tagCloud) {
    tagCloud.innerHTML = TRENDING_TAGS.map(t => `<a href="#">${esc(t)}</a>`).join("");
  }

  if (onlineList) {
    const handles = LEADERS.slice(0, 6);
    onlineList.innerHTML = handles.map(h =>
      `<li><span class="led"></span><b>${esc(h.handle)}</b></li>`
    ).join("");
  }

  // Ticking hit counter for atmosphere
  const hit = document.getElementById("hitCounter");
  if (hit) {
    let n = parseInt(hit.textContent.replace(/\D/g, ""), 10) || 8421;
    setInterval(() => {
      n += Math.floor(Math.random() * 3);
      hit.textContent = String(n).padStart(7, "0");
    }, 4200);
  }

  const login = document.getElementById("loginBtn");
  if (login) login.addEventListener("click", ev => {
    ev.preventDefault();
    alert("Sign-in is mocked in this demo. In prod, you'd get a one-time code to a work email — hashed, never stored.");
  });
}

// ---------- Thread detail ----------
function renderThread() {
  const id = new URL(location.href).searchParams.get("id") || "t-001";
  const t = THREADS.find(x => x.id === id) || THREADS[0];
  const channel = CHANNELS.find(c => c.slug === t.channel);

  const post = document.getElementById("thread");
  post.className = "post";
  post.innerHTML = `
    <div class="post-meta">
      <span style="color:var(--magenta);font-weight:700">${channel ? esc(channel.name) : "#" + esc(t.channel)}</span>
      · anon:${esc(t.author)} ${flairEl(t.flair)}
      · ${timeAgo(t.created)}
    </div>
    <h2>${esc(t.title)}</h2>
    <div class="body">${esc(t.body)}</div>
    <div class="post-actions">
      <button class="chip" onclick="bumpVote(this,1)">▲ upvote <span class="post-score" style="margin-left:6px;font-weight:700">${t.upvotes - t.downvotes}</span></button>
      <button class="chip" onclick="bumpVote(this,-1)">▼ downvote</button>
      <button class="chip" onclick="navigator.clipboard && navigator.clipboard.writeText(location.href); this.textContent='copied ✓';">🔗 share</button>
      <button class="chip" onclick="alert('Thanks. A mod will review within 24h.')">⚑ flag</button>
      <span class="small" style="margin-left:auto">${t.comments.length} replies · ${t.upvotes} upvotes</span>
    </div>
  `;

  const wrap = document.getElementById("comments");
  wrap.innerHTML = `<h3>&gt; ${t.comments.length} replies</h3>` +
    (t.comments.length === 0
      ? `<div class="box small">no replies yet. the silence is loud.</div>`
      : t.comments.map(c => `
        <div class="comment">
          <div class="cmeta">
            <span class="handle">${esc(c.author)}</span> ${flairEl(c.flair)}
            · ${timeAgo(c.created)}
            · <span style="color:var(--magenta)">+${c.upvotes}</span>
          </div>
          <div class="cbody">${esc(c.body)}</div>
        </div>
      `).join(""));

  const anonTag = document.getElementById("anonTag");
  if (anonTag) anonTag.textContent = Math.random().toString(36).slice(2, 6);
}

// ---------- Channels ----------
function renderChannels() {
  const grid = document.getElementById("channelsGrid");
  grid.innerHTML = CHANNELS.map(c => {
    const count = THREADS.filter(t => t.channel === c.slug).length;
    return `
      <a class="channel-card" href="index.html#${c.slug}">
        <span class="cname">${esc(c.name)}</span>
        <div class="cblurb">${esc(c.blurb)}</div>
        <div class="small" style="margin-top:10px;color:var(--indigo)">${count} active thread${count === 1 ? "" : "s"}</div>
      </a>
    `;
  }).join("");
}

// ---------- Leaderboard ----------
function renderLeaderboard() {
  const body = document.getElementById("leaderBody");
  body.innerHTML = LEADERS.map((l, i) => `
    <tr>
      <td class="rank ${i < 3 ? "top" : ""}">${i + 1}</td>
      <td><b>${esc(l.handle)}</b></td>
      <td>${flairEl(l.flair)}</td>
      <td>${l.karma.toLocaleString()}</td>
      <td>${l.streak}d 🔥</td>
    </tr>
  `).join("");
}
