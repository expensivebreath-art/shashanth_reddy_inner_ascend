/* Ascend Insights — three features, one file.
   1. Concept of the day + spaced review   (Learn tab)
   2. Session proof cards                  (Practice tab, sheet after a focus block)
   3. Honest weekly summary                (Review tab)
   Data lives in data.insights and data.deepSessions[].proof, so it saves,
   syncs to Supabase and exports with everything else. */
(() => {
"use strict";
let api = null;
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, "0");
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

/* ---------- content: 24 foundation concepts (defensive basics) ---------- */
const C = (id, t, h, b, q, o, a) => ({ id, t, h, b, q, o, a });
const CONCEPTS = [
  C("l1", "LINUX", "Paths and moving around", "An absolute path starts at / (the root); a relative path starts from where you are. pwd shows your location, cd moves you, ls lists what is here.", "You are in /home/sam. What does cd documents do?", ["Moves to /home/sam/documents", "Moves to /documents", "Creates a folder called documents"], 0),
  C("n1", "NETWORK", "IP addresses", "An IP address identifies a device on a network. Private ranges (10.x, 172.16–31.x, 192.168.x) work inside your home or lab; the internet sees your router's public address.", "Which of these is a private IP address?", ["8.8.8.8", "192.168.1.20", "142.250.1.1"], 1),
  C("w1", "WEB", "Requests and responses", "A browser sends a request (method, URL, headers). The server answers with a response (status code, headers, body). Almost everything on the web is this loop.", "Who sends the status code?", ["The browser", "The server", "The DNS resolver"], 1),
  C("l2", "LINUX", "File permissions", "rwx means read, write, execute, shown for owner, group, then others. -rw-r--r-- lets the owner read and write, and everyone else read only.", "In -rw-r--r--, who can modify the file?", ["Everyone", "Only the owner", "Owner and group"], 1),
  C("n2", "NETWORK", "Ports", "A port chooses which service on a device receives traffic. Common ones: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS.", "Which port is HTTPS by default?", ["80", "22", "443"], 2),
  C("w2", "WEB", "Status codes", "2xx means success, 3xx redirect, 4xx a client-side problem (404 not found, 403 forbidden), 5xx a server-side problem.", "What does a 403 mean?", ["The server crashed", "The page moved", "You are not allowed"], 2),
  C("l3", "LINUX", "Root and sudo", "Root is the all-powerful account. sudo runs a single command with root rights, so you can work as a normal user day to day. This is least privilege.", "Why avoid working as root all day?", ["It is slower", "One mistake or bad command has full power", "Root cannot use the network"], 1),
  C("n3", "NETWORK", "DNS", "DNS turns names like example.com into IP addresses, like the internet's phone book. Many attacks and many fixes start here.", "What does DNS do?", ["Encrypts traffic", "Turns names into IP addresses", "Assigns private IPs"], 1),
  C("w3", "WEB", "Cookies", "A cookie is a small piece of data a site stores in your browser. Your browser sends it back to that site on later requests, often to remember who you are.", "Cookies are sent back to…", ["Any site you visit", "The site that set them", "Only your ISP"], 1),
  C("l4", "LINUX", "Pipes and redirects", "| sends one command's output into another: ls | wc -l counts items. > writes output into a file instead of the screen.", "What does ls | wc -l do?", ["Counts the items listed", "Deletes the listed items", "Sorts them alphabetically"], 0),
  C("n4", "NETWORK", "TCP vs UDP", "TCP checks that data arrives complete and in order (web, SSH). UDP skips the checks to be faster (video calls, many DNS lookups).", "Which suits a live video call better?", ["TCP, for guaranteed order", "UDP, for speed", "FTP"], 1),
  C("w4", "WEB", "Sessions", "After you log in, the server creates a session and gives your browser an ID, usually in a cookie. Anyone holding that ID can act as you, so it must stay secret.", "Why must a session ID stay secret?", ["Anyone holding it can act as you", "It stores your password", "It is hard to type"], 0),
  C("l5", "LINUX", "Searching with grep", "grep finds lines that match text: grep 'error' app.log. Add -i to ignore case and -r to search folders.", "Which finds 'fail' in auth.log, ignoring case?", ["find fail auth.log", "cat -i fail auth.log", "grep -i fail auth.log"], 2),
  C("n5", "NETWORK", "NAT and your router", "NAT lets many private devices share one public IP. As a side effect, unsolicited inbound traffic has nowhere to go unless you forward a port.", "What does NAT let a router do?", ["Share one public IP among many devices", "Block all websites", "Speed up Wi-Fi"], 0),
  C("w5", "WEB", "Authentication vs authorization", "Authentication asks who you are. Authorization asks what you are allowed to do. Logging in proves identity; permissions limit actions.", "Checking that a user may delete a post is…", ["Authentication", "Authorization", "Encryption"], 1),
  C("l6", "LINUX", "Processes", "A process is a running program. ps lists them, top shows live usage, and kill ends one using its PID (process ID).", "What identifies a process for kill?", ["Its filename", "Its owner's password", "Its PID"], 2),
  C("n6", "NETWORK", "localhost", "127.0.0.1 (localhost) means this very machine. Traffic sent there never leaves your device, which makes it ideal for safe local testing.", "Traffic to 127.0.0.1 goes to…", ["Your router", "The same device", "Your ISP"], 1),
  C("w6", "WEB", "Cookie flags", "HttpOnly hides a cookie from page scripts, Secure sends it only over HTTPS, and SameSite limits sending it from other sites.", "Which flag stops JavaScript reading a cookie?", ["Secure", "HttpOnly", "SameSite"], 1),
  C("l7", "LINUX", "Logs", "Linux records events in /var/log, including login attempts and system errors. Defenders look at logs first when something seems wrong.", "Where do system logs usually live?", ["/bin", "/home", "/var/log"], 2),
  C("n7", "NETWORK", "DHCP", "DHCP gives a device an IP address automatically when it joins a network, so nobody sets addresses by hand.", "Who usually runs DHCP at home?", ["Your browser", "Your router", "The website"], 1),
  C("w7", "WEB", "Same-origin policy", "Browsers stop a page from reading data from a different origin (scheme + host + port) unless that other site allows it.", "Which is a different origin from https://a.com?", ["https://a.com/about", "https://a.com/page", "http://a.com"], 2),
  C("l8", "LINUX", "Keeping software updated", "apt installs and updates software from trusted repositories. Updates patch known vulnerabilities, so staying current is basic defence.", "Why keep packages updated?", ["Patches fix known vulnerabilities", "It brightens the screen", "It only frees memory"], 0),
  C("n8", "NETWORK", "HTTPS and TLS", "HTTPS is HTTP wrapped in TLS: traffic is encrypted and the server proves its identity with a certificate.", "What does HTTPS add to HTTP?", ["Faster downloads", "Encryption and server identity", "Bigger pages"], 1),
  C("w8", "WEB", "Never trust input", "Validate everything users send, and use parameterised queries so input is treated as data and never as commands. This is the core defence against SQL injection.", "What best defends against SQL injection?", ["Hiding the login page", "Longer passwords", "Parameterised queries"], 2)
];
const INTERVALS = [1, 3, 7, 14, 30];

/* ---------- storage ---------- */
function store() {
  const d = api.data();
  d.insights = d.insights || {};
  const i = d.insights;
  i.concepts = i.concepts || {};
  i.log = i.log || [];
  return i;
}
function streakOf(i) {
  const days = new Set(i.log.map(x => x.d));
  let t = api.today(), n = 0;
  if (!days.has(t)) t = addDays(t, -1);
  while (days.has(t)) { n++; t = addDays(t, -1); }
  return n;
}

/* ---------- 1. Concept of the day ---------- */
let cur = { id: null, pick: null }, extra = false;
function pickNext(i, t) {
  const due = CONCEPTS.filter(c => i.concepts[c.id] && i.concepts[c.id].next <= t)
    .sort((a, b) => i.concepts[a.id].next.localeCompare(i.concepts[b.id].next));
  if (due.length) return { c: due[0], mode: "review", due: due.length };
  const fresh = CONCEPTS.find(c => !i.concepts[c.id]);
  return fresh ? { c: fresh, mode: "new", due: 0 } : { c: null, mode: "done", due: 0 };
}
function renderConcept() {
  const host = $("#conceptCard"); if (!host || !api) return;
  const i = store(), t = api.today(), p = pickNext(i, t), e = api.esc;
  const learned = Object.keys(i.concepts).length, streak = streakOf(i);
  const newToday = i.log.some(x => x.d === t && x.mode === "new");
  const stats = `<div class="ins-stats"><span><b>${streak}</b> day streak</span><span><b>${learned}</b>/${CONCEPTS.length} learned</span><span><b>${p.due}</b> due</span></div>`;
  const head = tag => `<div class="ins-head"><div><div class="eyebrow">CONCEPT OF THE DAY${tag ? " · " + tag : ""}</div></div></div>`;

  if (!p.c || (p.mode === "new" && newToday && !extra)) {
    host.innerHTML = head("") + `<h3>${p.c ? "Today's concept is done." : "You have covered everything."}</h3>
      <p class="ins-sub">${p.c ? "Come back tomorrow, or keep going if you have energy." : "Reviews will return here as they come due."}</p>${stats}
      ${p.c ? `<button class="secondary-button" data-extra="1">One more</button>` : ""}`;
    return;
  }
  const c = p.c;
  if (cur.id !== c.id) cur = { id: c.id, pick: null };
  const answered = cur.pick !== null, isReview = p.mode === "review";
  const showBody = !isReview || answered;
  const opts = c.o.map((o, n) => {
    const cls = !answered ? "" : n === c.a ? " ok" : n === cur.pick ? " bad" : "";
    return `<button class="ins-opt${cls}" data-opt="${n}" ${answered ? "disabled" : ""}><span>${"ABC"[n]}</span>${e(o)}</button>`;
  }).join("");
  const right = answered && cur.pick === c.a;
  host.innerHTML = head(isReview ? "REVIEW" : c.t) + `
    <h3>${e(c.h)}</h3>
    ${showBody ? `<p class="ins-body">${e(c.b)}</p>` : `<p class="ins-sub">Recall first, then check. This is how it sticks.</p>`}
    <div class="ins-q"><small>QUICK CHECK</small><strong>${e(c.q)}</strong></div>
    <div class="ins-opts">${opts}</div>
    ${answered ? `<p class="ins-feedback ${right ? "ok" : "bad"}">${right ? "Correct." : "Not quite. The answer is highlighted."} How does it feel?</p>
      <div class="ins-rate"><button class="${right ? "primary-button" : "secondary-button"}" data-rate="got">Got it</button><button class="${right ? "secondary-button" : "primary-button"}" data-rate="shaky">Still shaky</button></div>` : ""}
    ${stats}`;
}
function rate(kind) {
  const i = store(), t = api.today(), p = pickNext(i, t);
  if (!p.c || p.c.id !== cur.id) return;
  const s = i.concepts[p.c.id] || { box: 0 };
  const ok = kind === "got";
  s.box = ok ? Math.min(s.box + 1, 5) : 0;
  s.next = addDays(t, INTERVALS[Math.min(s.box, 4)]);
  s.last = t;
  i.concepts[p.c.id] = s;
  i.log.push({ d: t, id: p.c.id, ok: ok && cur.pick === p.c.a, mode: p.mode });
  if (i.log.length > 400) i.log = i.log.slice(-400);
  cur = { id: null, pick: null }; extra = false;
  api.save(); renderConcept(); renderWeekly();
  api.toast(ok ? `Nice. Back in ${plural(INTERVALS[Math.min(s.box, 4)], "day")}.` : "Marked shaky. It returns tomorrow.");
}

/* ---------- 2. Session proof cards ---------- */
const KINDS = ["Ran a command", "Explained a concept", "Built something", "Read & noted"];
function closeProof() { document.querySelector(".proof-backdrop")?.remove(); document.body.classList.remove("modal-open"); }
function openProof(id) {
  const s = api.data().deepSessions.find(x => x.id === id); if (!s) return;
  closeProof();
  const e = api.esc, el = document.createElement("div");
  el.className = "proof-backdrop";
  el.innerHTML = `<div class="proof-sheet" role="dialog" aria-modal="true" aria-labelledby="proofTitle">
    <span class="proof-grab"></span>
    <div class="eyebrow">${s.completed ? "SESSION COMPLETE" : "SESSION"} · ${+s.minutes || 0} MIN</div>
    <h2 id="proofTitle">What did you actually do?</h2>
    <p class="ins-sub">${e(s.topic || "Focus session")}</p>
    <div class="proof-kinds">${KINDS.map((k, n) => `<button type="button" class="filter-chip${n === 0 ? " active" : ""}" data-kind="${e(k)}">${e(k)}</button>`).join("")}</div>
    <input id="proofLine" maxlength="140" autocomplete="off" placeholder="e.g. Ran nmap on my own lab VM and read the open ports">
    <div class="proof-actions"><button type="button" class="secondary-button" data-act="skip">Skip</button><button type="button" class="primary-button" data-act="save">Save proof</button></div></div>`;
  el.dataset.sid = id;
  document.body.appendChild(el);
  document.body.classList.add("modal-open");
  setTimeout(() => $("#proofLine")?.focus(), 380);
}
function saveProof() {
  const el = document.querySelector(".proof-backdrop"); if (!el) return;
  const line = $("#proofLine").value.trim();
  if (!line) { api.toast("Add one line, or tap Skip."); return; }
  const s = api.data().deepSessions.find(x => x.id === el.dataset.sid); if (!s) return closeProof();
  s.proof = { line, kind: el.querySelector(".filter-chip.active")?.dataset.kind || KINDS[0], at: new Date().toISOString() };
  api.save(); closeProof(); renderProof(); renderWeekly(); api.toast("Proof saved to your timeline.");
}
function renderProof() {
  const host = $("#proofTimeline"); if (!host || !api) return;
  const e = api.esc, all = api.data().deepSessions || [];
  const withProof = all.filter(s => s.proof), mins = withProof.reduce((n, s) => n + (+s.minutes || 0), 0);
  const missing = all.filter(s => !s.proof).slice(0, 3);
  let lastDay = "";
  const cards = withProof.slice(0, 20).map(s => {
    const dt = new Date(s.date), day = dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const sep = day !== lastDay ? `<div class="proof-day">${e(day)}</div>` : ""; lastDay = day;
    return `${sep}<article class="proof-card"><div class="proof-min">${+s.minutes || 0}<small>MIN</small></div><div class="proof-main"><span class="proof-kind">${e(s.proof.kind)}</span><strong>${e(s.proof.line)}</strong><small>${e(s.topic || "Focus session")}</small></div></article>`;
  }).join("");
  host.innerHTML = `<div class="ins-head"><div><div class="eyebrow">WHAT YOU CAN SHOW</div><h3>Proof timeline</h3></div><span class="ins-chip">${plural(withProof.length, "card")} · ${mins} min</span></div>
    ${cards || `<p class="ins-sub">Finish a focus session and add one line about what you did. Over time this becomes your evidence.</p>`}
    ${missing.length ? `<div class="proof-missing"><small>NO PROOF YET</small>${missing.map(s => `<button class="proof-add" data-proof-add="${s.id}"><span>${e(s.topic || "Focus session")}</span><b>Add ＋</b></button>`).join("")}</div>` : ""}`;
}
function onFocusComplete() {
  setTimeout(() => {
    const s = api.data().deepSessions[0];
    if (s && !s.proof && Date.now() - new Date(s.date) < 90000) openProof(s.id);
  }, 900);
}

/* ---------- 3. Honest weekly summary ---------- */
function weekly() {
  const d = api.data(), t = api.today(), local = iso => fmt(new Date(iso));
  const days = [...Array(7)].map((_, n) => addDays(t, n - 6)), prev = [...Array(7)].map((_, n) => addDays(t, n - 13));
  const sess = d.deepSessions || [];
  const minsOn = k => sess.filter(s => local(s.date) === k).reduce((n, s) => n + (+s.minutes || 0), 0);
  const perDay = days.map(minsOn), total = perDay.reduce((a, b) => a + b, 0), prevTotal = prev.map(minsOn).reduce((a, b) => a + b, 0);
  const wk = sess.filter(s => days.includes(local(s.date)));
  const parts = {};
  wk.forEach(s => { const h = new Date(s.date).getHours(), p = h >= 5 && h < 12 ? "morning" : h < 17 ? "afternoon" : h < 22 ? "evening" : "night"; parts[p] = (parts[p] || 0) + (+s.minutes || 0); });
  const bestPart = Object.entries(parts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bi = perDay.indexOf(Math.max(...perDay));
  const items = [...(d.tasks || []), ...(d.priorities || [])].filter(x => x.date && days.includes(x.date));
  const doneItems = items.filter(x => x.done).length;
  const habits = d.habits || [], hist = d.history || {};
  const activeDays = days.filter(k => (hist[k] || []).length).length;
  const hc = habits.map(h => ({ name: h.name, n: days.filter(k => (hist[k] || []).includes(h.id)).length })).sort((a, b) => b.n - a.n);
  const log = (d.insights?.log || []).filter(x => days.includes(x.d)), solid = log.filter(x => x.ok).length;
  const proofs = wk.filter(s => s.proof).length;
  const lines = [];
  if (total || wk.length) lines.push(["FOCUS", `${total} minutes across ${plural(wk.length, "session")}${prevTotal ? total > prevTotal ? `, ${total - prevTotal} more than last week.` : total < prevTotal ? `, ${prevTotal - total} fewer than last week.` : ", the same as last week." : "."}`]);
  if (total && bi >= 0) lines.push(["RHYTHM", `Your biggest day was ${parse(days[bi]).toLocaleDateString(undefined, { weekday: "long" })}${bestPart ? `, and most focus landed in the ${bestPart}.` : "."}`]);
  if (items.length) lines.push(["TASKS", `You finished ${doneItems} of ${items.length} tasks and priorities set this week.`]);
  if (habits.length && activeDays) lines.push(["HABITS", `Checked in on ${activeDays} of 7 days. Most consistent: ${hc[0].name} (${hc[0].n}/7).`]);
  if (log.length) lines.push(["LEARNING", `${plural(log.length, "concept check")} done, ${solid} answered correctly.`]);
  if (proofs) lines.push(["PROOF", `${plural(proofs, "proof card")} added to your timeline.`]);
  const dropped = activeDays ? hc.filter(h => h.n === 0).slice(0, 2).map(h => h.name) : [];
  const any = lines.length > 0;
  const head = !any ? "Nothing logged yet." : !prevTotal && total ? "A solid start." : total > prevTotal ? "A stronger week than the last." : total < prevTotal ? "A lighter week than the last." : "A steady week.";
  return { head, lines, dropped, perDay, days, any };
}
function renderWeekly() {
  const host = $("#weeklyHonest"); if (!host || !api) return;
  const w = weekly(), e = api.esc, max = Math.max(...w.perDay, 1);
  host.innerHTML = `<div class="ins-head"><div><div class="eyebrow">THE HONEST VERSION · LAST 7 DAYS</div><h3>${e(w.head)}</h3></div></div>
    ${w.any ? `<div class="wk-bars" aria-hidden="true">${w.perDay.map((m, n) => `<div class="${n === 6 ? "today" : ""}"><i style="height:${Math.max(m / max * 100, m ? 8 : 3)}%"></i><span>${parse(w.days[n]).toLocaleDateString(undefined, { weekday: "narrow" })}</span></div>`).join("")}</div>
    <ul class="wk-lines">${w.lines.map(([k, v]) => `<li><small>${k}</small><span>${e(v)}</span></li>`).join("")}</ul>
    ${w.dropped.length ? `<p class="wk-drop"><small>WHAT I'D DROP</small>${e(w.dropped.join(" and "))} ${w.dropped.length > 1 ? "weren't" : "wasn't"} checked once this week. Keep it, shrink it, or drop it?</p>` : ""}`
      : `<p class="ins-sub">Log a focus session or check off a habit and this fills in with plain sentences, not charts.</p>`}`;
}

/* ---------- wiring ---------- */
function mount() {
  const add = (sel, pos, id) => { const t = $(sel); if (t && !$("#" + id)) t.insertAdjacentHTML(pos, `<section class="panel insight-card" id="${id}"></section>`); };
  add("#view-learn .page-intro", "afterend", "conceptCard");
  add("#view-practice .note-panel", "beforebegin", "proofTimeline");
  add("#view-analytics .analytics-stats", "afterend", "weeklyHonest");
}
function bind() {
  document.addEventListener("click", ev => {
    const t = ev.target;
    const opt = t.closest("[data-opt]"); if (opt) { cur.pick = +opt.dataset.opt; renderConcept(); return; }
    const r = t.closest("[data-rate]"); if (r) { rate(r.dataset.rate); return; }
    if (t.closest("[data-extra]")) { extra = true; renderConcept(); return; }
    const add = t.closest("[data-proof-add]"); if (add) { openProof(add.dataset.proofAdd); return; }
    if (t.classList.contains("proof-backdrop")) { closeProof(); return; }
    const k = t.closest(".proof-kinds .filter-chip"); if (k) { k.parentElement.querySelectorAll(".filter-chip").forEach(x => x.classList.toggle("active", x === k)); return; }
    const a = t.closest("[data-act]"); if (a) { a.dataset.act === "save" ? saveProof() : closeProof(); }
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") closeProof();
    if (ev.key === "Enter" && ev.target.id === "proofLine") { ev.preventDefault(); saveProof(); }
  });
}
function renderAll() { renderConcept(); renderProof(); renderWeekly(); }
window.AscendInsights = {
  init(a) { api = a; mount(); bind(); renderAll(); },
  onView(name) { if (!api) return; if (name === "learn") renderConcept(); else if (name === "practice") renderProof(); else if (name === "analytics") renderWeekly(); },
  onFocusComplete,
  refresh() { if (api) renderAll(); },
  _concepts: CONCEPTS
};
})();
