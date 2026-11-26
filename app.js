/* Sanatan Scroll, Vercel preview.
   Plain JavaScript, no framework, no server. The verse text is real and
   bundled in data/corpus.json. Saves, likes, streak and Pro are kept
   in this browser only, in localStorage. Nothing is sent to any server.
   Audio: only Gita Chapter 1 and Gita 2.47 are bundled in this preview,
   because the full Gita audio is 154 MB and does not fit a free Vercel
   deploy. See README.md for the full audio plan.
   No em dashes are used anywhere in this file, by Ankit's rule. */

var STORE_KEY = "sanatan-preview-v1";
var AUDIO_LANGS = ["sanskrit", "hindi", "english"];
var AUDIO_SET = {};
(function () {
  var v, l;
  for (v = 1; v <= 47; v++) {
    for (l = 0; l < AUDIO_LANGS.length; l++) {
      AUDIO_SET["gita-1-" + v + "-" + AUDIO_LANGS[l]] = true;
    }
  }
  AUDIO_SET["gita-2-47-sanskrit"] = true;
  AUDIO_SET["gita-2-47-hindi"] = true;
  AUDIO_SET["gita-2-47-english"] = true;
})();

var PRICES = {
  daily: { INR: 29, USD: 2, label: "1 day" },
  monthly: { INR: 99, USD: 9, label: "1 month" },
  yearly: { INR: 599, USD: 59, label: "1 year" }
};

var TEXTS = [
  { id: "gita", name: "Gita", hi: "गीता" },
  { id: "ramayana", name: "Ramayana", hi: "रामायण" },
  { id: "mahabharata", name: "Mahabharata", hi: "महाभारत" },
  { id: "chalisa", name: "Hanuman Chalisa", hi: "हनुमान चालीसा" }
];

var UI = {
  en: { scroll: "Scroll", discover: "Discover", plans: "Plans", saved: "Saved", profile: "Profile" },
  hi: { scroll: "पढ़ें", discover: "खोजें", plans: "योजनाएँ", saved: "सहेजा हुआ", profile: "प्रोफ़ाइल" }
};

var state = loadState();
var corpus = null;
var currentText = "gita";
var currentView = "feed";
var currency = detectCurrency();
var selectedPlan = "yearly";
var player = { verse: null, mode: "sanskrit", queue: [], qi: 0, playingAll: false };

function loadState() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* private mode, fall through to defaults */ }
  return {
    lang: "en", pro: null, trialUsed: false, likes: [], saves: [],
    readLog: {}, planDone: {}, fontScale: 1
  };
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
function detectCurrency() {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
  } catch (e) { /* default below */ }
  return "USD";
}
function istToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function money(amount) {
  return currency === "INR" ? "Rs " + amount : "$" + amount;
}
function isPro() {
  if (!state.pro) return false;
  if (state.pro.expires && Date.now() > state.pro.expires) { state.pro = null; saveState(); return false; }
  return true;
}
function el(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function verseList(textId) {
  if (textId === "gita") return corpus.gita.verses;
  if (textId === "ramayana") return corpus.ramayana.verses;
  if (textId === "mahabharata") return corpus.mahabharata.verses;
  return corpus.chalisa.verses;
}
function refLabel(v) {
  if (currentText === "gita") return "Gita " + v.c + "." + v.v;
  if (currentText === "ramayana") return "Ramayana, " + v.sectionName + " " + v.sarga + "." + v.n;
  if (currentText === "mahabharata") return "Mahabharata " + v.book + "." + v.chap + "." + v.n;
  return "Hanuman Chalisa " + v.num;
}
function audioFile(v, lang) {
  if (currentText !== "gita") return null;
  var name = "gita-" + v.c + "-" + v.v + "-" + lang;
  if (!AUDIO_SET[name]) return null;
  return "audio/gita/" + name + ".mp3";
}

function recordRead(key) {
  var day = istToday();
  state.readLog[day] = (state.readLog[day] || 0) + 1;
  saveState();
  renderProgress();
}
function streakDays() {
  var count = 0;
  var d = new Date();
  for (;;) {
    var day = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    if (state.readLog[day]) { count++; d.setDate(d.getDate() - 1); }
    else if (count === 0) { d.setDate(d.getDate() - 1); count = 0; break; }
    else break;
    if (count > 365) break;
  }
  return count;
}
function versesReadTotal() {
  var total = 0, k;
  for (k in state.readLog) total += state.readLog[k];
  return total;
}

function renderTextBar() {
  var bar = el("textBar");
  bar.innerHTML = TEXTS.map(function (t) {
    var label = state.lang === "hi" ? t.hi : t.name;
    return '<button type="button" class="textchip' + (t.id === currentText ? " active" : "") +
      '" data-text="' + t.id + '">' + esc(label) + "</button>";
  }).join("");
  bar.querySelectorAll("[data-text]").forEach(function (b) {
    b.addEventListener("click", function () {
      currentText = b.getAttribute("data-text");
      closePlayer();
      renderTextBar();
      renderFeed();
      renderRail();
      showView("feed");
    });
  });
}

function verseCard(v, index) {
  var liked = state.likes.indexOf(v.key) !== -1;
  var saved = state.saves.indexOf(v.key) !== -1;
  var hi = v.hi ? '<p class="hi">' + esc(v.hi) + "</p>" : "";
  var en = v.en ? '<p class="en">' + esc(v.en) + "</p>" : "";
  var missing = "";
  if (!v.hi && currentText !== "mahabharata") {
    missing = '<p class="missing">Hindi meaning is not bundled for this text yet.</p>';
  }
  if (!v.en && currentText === "mahabharata") {
    missing = '<p class="missing">No English meaning is bundled for this verse. The live app generates the meaning in the study sheet.</p>';
  }
  var words = "";
  if (v.words && v.words.length) {
    words = '<p class="words">' + v.words.slice(0, 8).map(function (w) {
      return "<b>" + esc(w.w) + "</b> " + esc(w.m);
    }).join(" , ") + "</p>";
  }
  var first = hi + en;
  return '<article class="verse" data-key="' + esc(v.key) + '" data-index="' + index + '">' +
    '<div class="ref">' + esc(refLabel(v)) + "</div>" +
    '<p class="sa">' + esc(v.sa) + "</p>" +
    first + missing + words +
    '<div class="actions">' +
      '<button type="button" data-act="like" class="' + (liked ? "on" : "") + '">' + (liked ? "Liked" : "Like") + "</button>" +
      '<button type="button" data-act="save" class="' + (saved ? "on" : "") + '">' + (saved ? "Saved" : "Save") + "</button>" +
      '<button type="button" data-act="share">Share</button>' +
      '<button type="button" data-act="study">Study</button>' +
      '<button type="button" data-act="listen" class="listen">Listen</button>' +
    "</div></article>";
}

function renderFeed() {
  var list = verseList(currentText);
  var feed = el("feed");
  feed.innerHTML = list.map(function (v, i) { return verseCard(v, i); }).join("");
  feed.querySelectorAll(".verse").forEach(function (card) {
    card.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(card.getAttribute("data-index"));
        var verse = verseList(currentText)[idx];
        var act = btn.getAttribute("data-act");
        if (act === "like") {
          toggleInList("likes", verse.key);
          var on = state.likes.indexOf(verse.key) !== -1;
          btn.classList.toggle("on", on);
          btn.textContent = on ? "Liked" : "Like";
        }
        if (act === "save") {
          toggleInList("saves", verse.key);
          var savedOn = state.saves.indexOf(verse.key) !== -1;
          btn.classList.toggle("on", savedOn);
          btn.textContent = savedOn ? "Saved" : "Save";
        }
        if (act === "share") shareVerse(verse);
        if (act === "study") openStudy(verse);
        if (act === "listen") openPlayer(verse);
      });
    });
  });
  var seen = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var key = entry.target.getAttribute("data-key");
      if (seen[key]) return;
      seen[key] = true;
      recordRead(key);
    });
  }, { root: feed, threshold: 0.6 });
  feed.querySelectorAll(".verse").forEach(function (card) { observer.observe(card); });
  renderProgress();
}
function renderProgress() {
  el("progressLine").textContent =
    versesReadTotal() + " verses read, " + streakDays() + " day streak";
}
function toggleInList(field, key) {
  var list = state[field];
  var i = list.indexOf(key);
  if (i === -1) list.push(key); else list.splice(i, 1);
  saveState();
}
function shareVerse(v) {
  var text = v.sa + "\n" + (v.en || "") + "\nSanatan Scroll";
  if (navigator.share) {
    navigator.share({ title: "Sanatan Scroll", text: text }).catch(function () { /* dismissed */ });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      alert("Verse copied. Paste it anywhere to share.");
    });
  }
}

function renderRail() {
  var rail = el("rail");
  var html = "<h3>Chapters and sections</h3>";
  if (currentText === "gita") {
    html += corpus.gita.chapters.map(function (c) {
      return '<button type="button" data-jump="gita-' + c.n + '">Chapter ' + c.n + ", " + esc(c.meaningEn) + " (" + c.count + ")</button>";
    }).join("");
  } else if (currentText === "ramayana") {
    html += corpus.ramayana.sections.map(function (s) {
      return '<button type="button" data-jump="ramayana-' + s.id + '">' + esc(s.name) + " (" + s.count + ")</button>";
    }).join("");
  } else if (currentText === "mahabharata") {
    html += '<button type="button" data-jump="mahabharata-adi">Opening, Book 1 (24)</button>' +
      '<button type="button" data-jump="mahabharata-yaksha">Yaksha Prashna (131)</button>';
  } else {
    html += "<p class=\"small\">Hanuman Chalisa, complete, 43 verses.</p>";
  }
  html += '<h3>About this preview</h3><p class="small">Gita, 701 verses, complete. ' +
    "Ramayana, 332 verses, curated openings from all 7 Kandas. Mahabharata, 155 verses, " +
    "curated selections. Hanuman Chalisa, 43 verses, complete. The full epics are much " +
    "larger, about 24,000 verses for Ramayana and about 100,000 for Mahabharata.</p>";
  rail.innerHTML = html;
  rail.querySelectorAll("[data-jump]").forEach(function (b) {
    b.addEventListener("click", function () { jumpTo(b.getAttribute("data-jump")); });
  });
}
function jumpTo(target) {
  var list = verseList(currentText);
  var idx = 0, i;
  if (target.indexOf("gita-") === 0) {
    var ch = Number(target.split("-")[1]);
    for (i = 0; i < list.length; i++) { if (list[i].c === ch) { idx = i; break; } }
  } else if (target.indexOf("ramayana-") === 0) {
    var sec = target.replace("ramayana-", "");
    for (i = 0; i < list.length; i++) { if (list[i].section === sec) { idx = i; break; } }
  } else if (target.indexOf("mahabharata-") === 0) {
    var want = target.indexOf("yaksha") !== -1 ? "yaksha" : "adi-opening";
    for (i = 0; i < list.length; i++) { if (list[i].section === want) { idx = i; break; } }
  }
  showView("feed");
  var card = el("feed").querySelector('[data-index="' + idx + '"]');
  if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- audio player ---------- */
function openPlayer(verse) {
  player.verse = verse;
  player.mode = "sanskrit";
  player.queue = [];
  player.playingAll = false;
  renderPlayer();
}
function closePlayer() {
  player.verse = null;
  el("playerSlot").classList.add("hidden");
  el("playerSlot").innerHTML = "";
}
function renderPlayer() {
  var slot = el("playerSlot");
  var v = player.verse;
  if (!v) { slot.classList.add("hidden"); return; }
  slot.classList.remove("hidden");
  var hasAudio = !!audioFile(v, "sanskrit");
  var modeBtns = [
    ["sanskrit", "Chant, Sanskrit", false],
    ["hindi", "Hindi narration", true],
    ["english", "English narration", true],
    ["chant-hindi", "Chant + Hindi", true],
    ["chant-english", "Chant + English", true]
  ].map(function (m) {
    var locked = m[2] && !isPro();
    return '<button type="button" data-mode="' + m[0] + '" class="' +
      (player.mode === m[0] ? "active" : "") + '">' + m[1] + (locked ? " (Pro)" : "") + "</button>";
  }).join("");
  slot.innerHTML = '<div class="playerbox">' +
    '<div><b>Listen, ' + esc(refLabel(v)) + '</b>' +
    ' <button type="button" id="closePlayer" style="float:right;background:none;border:none;color:#fdf8ef;font-size:18px;">x</button></div>' +
    '<div class="small" style="color:#d8c9a8;margin-top:4px;">Server voices, Sanskrit Chirp 3 HD Charon, Hindi Neural2-B, English Neural2-D. Sanskrit chant is free, narration and Play All are Pro.</div>' +
    (hasAudio
      ? '<div class="modes">' + modeBtns + '</div>' +
        '<audio id="audioEl" controls preload="none"></audio>' +
        '<div class="prow"><label>Speed <select id="speedSel">' +
        '<option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option>' +
        '</select></label>' +
        '<button type="button" id="prevBtn" class="pillbtn">Previous</button>' +
        '<button type="button" id="nextBtn" class="pillbtn">Next</button>' +
        '<button type="button" id="playAllBtn" class="pillbtn">Play All, Chapter ' + v.c + '</button></div>'
      : '<div class="note" style="background:#3d2f20;border-color:#6b5a44;color:#fdf8ef;">Audio for this verse is not in this preview yet. Chapter 1 and Gita 2.47 are included, so you can hear all three voices. The full Gita audio is 154 MB, too large for a free Vercel deploy, so it is hosted separately in the full version. See the README for the plan.</div>') +
    "</div>";
  el("closePlayer").addEventListener("click", closePlayer);
  if (!hasAudio) return;
  slot.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-mode");
      var needsPro = mode !== "sanskrit";
      if (needsPro && !isPro()) { openPaywall(); return; }
      player.mode = mode;
      renderPlayer();
      playCurrent();
    });
  });
  el("speedSel").addEventListener("change", function (e) {
    el("audioEl").playbackRate = Number(e.target.value);
  });
  el("prevBtn").addEventListener("click", function () { stepVerse(-1); });
  el("nextBtn").addEventListener("click", function () { stepVerse(1); });
  el("playAllBtn").addEventListener("click", function () {
    if (!isPro()) { openPaywall(); return; }
    startPlayAll();
  });
  el("audioEl").addEventListener("ended", function () {
    if (player.playingAll) playNextInQueue();
    else if (player.mode === "chant-hindi" || player.mode === "chant-english") playMeaningAfterChant();
  });
  playCurrent();
}
function playCurrent() {
  var v = player.verse;
  if (!v) return;
  var audio = el("audioEl");
  if (!audio) return;
  var lang = player.mode === "english" || player.mode === "chant-english" ? "english"
    : player.mode === "hindi" || player.mode === "chant-hindi" ? "hindi" : "sanskrit";
  if (player.mode.indexOf("chant-") === 0) lang = "sanskrit";
  var file = audioFile(v, lang);
  if (!file) {
    if (lang !== "sanskrit") {
      audio.src = audioFile(v, "sanskrit");
      audio.play().catch(function () { /* autoplay blocked until tap */ });
    }
    return;
  }
  audio.src = file;
  audio.play().catch(function () { /* autoplay blocked until tap */ });
}
function playMeaningAfterChant() {
  var v = player.verse;
  var lang = player.mode === "chant-hindi" ? "hindi" : "english";
  var audio = el("audioEl");
  var file = audioFile(v, lang);
  if (file) { audio.src = file; audio.play().catch(function () {}); }
}
function stepVerse(dir) {
  var list = verseList(currentText);
  var idx = list.indexOf(player.verse);
  var next = list[idx + dir];
  if (!next) return;
  player.verse = next;
  player.playingAll = false;
  renderPlayer();
  var card = el("feed").querySelector('[data-key="' + next.key + '"]');
  if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
}
function startPlayAll() {
  var list = verseList(currentText).filter(function (v) { return v.c === player.verse.c; });
  player.queue = list.filter(function (v) { return !!audioFile(v, "sanskrit"); });
  player.qi = 0;
  player.playingAll = true;
  if (!player.queue.length) { alert("No audio is bundled for this chapter in the preview."); return; }
  player.verse = player.queue[0];
  renderPlayer();
}
function playNextInQueue() {
  player.qi++;
  if (player.qi >= player.queue.length) { player.playingAll = false; return; }
  player.verse = player.queue[player.qi];
  renderPlayer();
}

/* ---------- paywall ---------- */
function openPaywall() {
  var slot = el("modalSlot");
  var cards = Object.keys(PRICES).map(function (id) {
    var p = PRICES[id];
    return '<div class="pricecard' + (selectedPlan === id ? " sel" : "") + '" data-plan="' + id + '">' +
      '<div class="pname">' + p.label + '</div>' +
      '<div class="pprice">' + money(p[currency]) + '</div>' +
      '<div class="psub">' + (id === "yearly" ? "7 day free trial" : id === "daily" ? "24 hours" : "30 days") + '</div></div>';
  }).join("");
  slot.innerHTML = '<div class="modalback"><div class="modal">' +
    '<button type="button" class="closebtn" id="closeModal">x</button>' +
    "<h2>Sanatan Pro</h2>" +
    "<p>Deep Study and Related Verses, Hindi and English narration, and Play All for a whole chapter. Sanskrit chant stays free.</p>" +
    '<div class="chiprow"><button type="button" class="chip' + (currency === "INR" ? " active" : "") + '" data-cur="INR">India, INR</button>' +
    '<button type="button" class="chip' + (currency === "USD" ? " active" : "") + '" data-cur="USD">Outside India, USD</button></div>' +
    '<div class="pricegrid">' + cards + "</div>" +
    '<button type="button" class="bigbtn" id="buyBtn">' +
    (selectedPlan === "yearly" ? "Start 7 day free trial" : "Buy " + PRICES[selectedPlan].label + ", " + money(PRICES[selectedPlan][currency])) +
    "</button>" +
    '<p class="small">Preview only. No payment is taken, no card is needed, nothing is charged. In the live version this opens Razorpay in India and the store checkout outside India. Pro is tied to your account, so sign in is needed before a real purchase.</p>' +
    "</div></div>";
  el("closeModal").addEventListener("click", closeModal);
  slot.querySelectorAll("[data-plan]").forEach(function (c) {
    c.addEventListener("click", function () { selectedPlan = c.getAttribute("data-plan"); openPaywall(); });
  });
  slot.querySelectorAll("[data-cur]").forEach(function (c) {
    c.addEventListener("click", function () { currency = c.getAttribute("data-cur"); openPaywall(); });
  });
  el("buyBtn").addEventListener("click", function () {
    var days = selectedPlan === "daily" ? 1 : selectedPlan === "monthly" ? 30 : 365;
    state.pro = { plan: selectedPlan, currency: currency, expires: Date.now() + days * 86400000 };
    if (selectedPlan === "yearly") state.trialUsed = true;
    saveState();
    closeModal();
    updateProBtn();
    alert("Pro is on in this preview for " + PRICES[selectedPlan].label + ". No payment was taken.");
    renderPlayer();
  });
}
function closeModal() { el("modalSlot").innerHTML = ""; }
function updateProBtn() {
  var btn = el("proBtn");
  btn.textContent = isPro() ? "Pro, on" : "Go Pro";
  btn.classList.toggle("ispro", isPro());
}

/* ---------- study ---------- */
function openStudy(v) {
  var slot = el("modalSlot");
  var words = (v.words || []).map(function (w) {
    return "<b>" + esc(w.w) + "</b>, " + esc(w.m);
  }).join("<br>");
  slot.innerHTML = '<div class="modalback"><div class="modal">' +
    '<button type="button" class="closebtn" id="closeModal">x</button>' +
    "<h2>" + esc(refLabel(v)) + "</h2>" +
    "<p><b>Easy explanation, free.</b></p>" +
    (v.hi ? "<p>" + esc(v.hi) + "</p>" : "") +
    (v.en ? "<p>" + esc(v.en) + "</p>" : "<p>Read the Sanskrit slowly, one line at a time, and sit with what it points to. The meaning for this verse is generated in the live app.</p>") +
    (words ? "<p><b>Word by word</b><br>" + words + "</p>" : "") +
    '<div class="note"><b>Deep Study and Related Verses are Pro.</b> ' +
    (isPro()
      ? "Pro is on in this preview. In the live app, Deep Study is generated per verse on the server. In this preview the word by word meanings above are the study material."
      : "Unlock them with Pro. Tap Go Pro above to see the plans.") +
    "</div>" +
    '<p class="small">English: Shri Purohit Swami, 1935, public domain. Hindi is a plain rendering made from the English for this app, not a published translation. Read it with the Sanskrit alongside.</p>' +
    "</div></div>";
  el("closeModal").addEventListener("click", closeModal);
}

/* ---------- views ---------- */
function showView(view) {
  currentView = view;
  document.querySelectorAll("#bottomNav button").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === view);
    var label = UI[state.lang][b.getAttribute("data-view")] || b.getAttribute("data-view");
    b.textContent = label;
  });
  el("feedView").classList.toggle("hidden", view !== "feed");
  var panel = el("panelView");
  if (view === "feed") { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  if (view === "discover") renderDiscover(panel);
  if (view === "plans") renderPlans(panel);
  if (view === "saved") renderSaved(panel);
  if (view === "profile") renderProfile(panel);
}
function verseOfDay() {
  var list = verseList("gita");
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var day = Math.floor((now - start) / 86400000);
  return list[day % list.length];
}
function renderDiscover(panel) {
  var v = verseOfDay();
  panel.innerHTML = "<h2>Discover</h2>" +
    '<div class="daycard"><div class="small">VERSE OF THE DAY</div>' +
    '<p class="sa" style="text-align:center;">' + esc(v.sa) + "</p>" +
    "<p>" + esc(v.en) + "</p>" +
    '<button type="button" class="ghostbtn" id="vodBtn">Read Gita ' + v.c + "." + v.v + "</button></div>" +
    "<h2>Search the texts</h2>" +
    '<input class="searchbox" id="searchBox" type="search" placeholder="Search a word or verse">' +
    '<div id="searchResults"></div>' +
    '<div class="note">Search looks through Sanskrit, Hindi and English across all four texts. ' +
    "Ramayana and Mahabharata are curated selections, not the full epics.</div>";
  el("vodBtn").addEventListener("click", function () {
    currentText = "gita"; renderTextBar(); renderFeed(); renderRail(); showView("feed");
    var card = el("feed").querySelector('[data-key="' + v.key + '"]');
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  el("searchBox").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    var box = el("searchResults");
    if (q.length < 2) { box.innerHTML = ""; return; }
    var hits = [];
    ["gita", "ramayana", "mahabharata", "chalisa"].forEach(function (tid) {
      var savedText = currentText;
      currentText = tid;
      verseList(tid).forEach(function (verse) {
        var hay = ((verse.sa || "") + " " + (verse.hi || "") + " " + (verse.en || "") + " " + (verse.tr || "")).toLowerCase();
        if (hay.indexOf(q) !== -1 && hits.length < 20) hits.push({ tid: tid, verse: verse });
      });
      currentText = savedText;
    });
    box.innerHTML = hits.length ? hits.map(function (h) {
      return '<div class="result" data-tid="' + h.tid + '" data-key="' + esc(h.verse.key) + '">' +
        '<div class="rref">' + esc(h.tid) + "</div>" + esc((h.verse.en || h.verse.sa).slice(0, 140)) + "</div>";
    }).join("") : "<p>No verses found for that search.</p>";
    box.querySelectorAll(".result").forEach(function (r) {
      r.addEventListener("click", function () {
        currentText = r.getAttribute("data-tid");
        renderTextBar(); renderFeed(); renderRail(); showView("feed");
        var card = el("feed").querySelector('[data-key="' + r.getAttribute("data-key") + '"]');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
}
function planDays() {
  var days = [], per = Math.ceil(701 / 21), i;
  for (i = 0; i < 21; i++) {
    var from = i * per + 1, to = Math.min(701, (i + 1) * per);
    days.push({ day: i + 1, from: from, to: to });
  }
  return days;
}
function renderPlans(panel) {
  var html = "<h2>Plans</h2><p>21 day Gita plan, free. Read a little every day, mark the day complete.</p>";
  html += planDays().map(function (d) {
    var done = !!state.planDone[d.day];
    return '<div class="planrow"><span>Day ' + d.day + ", Gita verses " + d.from + " to " + d.to +
      '</span><button type="button" data-day="' + d.day + '" class="' + (done ? "done" : "") + '">' +
      (done ? "Completed" : "Mark day complete") + "</button></div>";
  }).join("");
  panel.innerHTML = html;
  panel.querySelectorAll("[data-day]").forEach(function (b) {
    b.addEventListener("click", function () {
      var day = Number(b.getAttribute("data-day"));
      state.planDone[day] = !state.planDone[day];
      saveState();
      renderPlans(panel);
    });
  });
}
function findVerse(key) {
  var all = corpus.gita.verses.concat(corpus.ramayana.verses, corpus.mahabharata.verses, corpus.chalisa.verses);
  for (var i = 0; i < all.length; i++) if (all[i].key === key) return all[i];
  return null;
}
function renderSaved(panel) {
  var html = "<h2>Saved</h2>";
  if (!state.saves.length) {
    html += "<p>Nothing saved yet. Tap Save on any verse and it will wait for you here.</p>";
  } else {
    html += state.saves.map(function (key) {
      var v = findVerse(key);
      if (!v) return "";
      return '<div class="result" data-key="' + esc(key) + '">' +
        '<div class="rref">' + esc(key) + "</div>" + esc((v.en || v.sa).slice(0, 140)) + "</div>";
    }).join("");
  }
  panel.innerHTML = html;
  panel.querySelectorAll(".result").forEach(function (r) {
    r.addEventListener("click", function () {
      var key = r.getAttribute("data-key");
      var tid = key.split(":")[0];
      currentText = tid === "chalisa" ? "chalisa" : tid;
      renderTextBar(); renderFeed(); renderRail(); showView("feed");
      var card = el("feed").querySelector('[data-key="' + key + '"]');
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
function renderProfile(panel) {
  panel.innerHTML = "<h2>Profile</h2>" +
    '<div class="statgrid">' +
    '<div class="stat"><div class="n">' + streakDays() + '</div><div class="l">day streak</div></div>' +
    '<div class="stat"><div class="n">' + versesReadTotal() + '</div><div class="l">verses read</div></div>' +
    '<div class="stat"><div class="n">' + state.saves.length + '</div><div class="l">saved</div></div></div>' +
    '<div class="note"><b>Preview account.</b> You are browsing as a preview reader, nothing is signed in here. ' +
    "In the Muse app you are signed in with your Muse account, and your Pro, streak and saves are tied to it. " +
    "On Vercel, sign in is not connected yet. For launch it will be Google or email sign in, and your Pro, streak " +
    "and saves will follow your account. There is no fake Sign in button here, and nothing to sign out of in this preview.</div>" +
    '<p><b>Pro:</b> ' + (isPro() ? "On in this preview, plan " + state.pro.plan + ", " + state.pro.currency + "." : "Not on.") + "</p>" +
    '<p><b>Language:</b> ' + (state.lang === "hi" ? "Hindi" : "English") + '</p>' +
    '<p><b>Text size:</b></p><div class="chiprow">' +
    [0.9, 1, 1.15, 1.3].map(function (s) {
      return '<button type="button" class="chip' + (state.fontScale === s ? " active" : "") + '" data-font="' + s + '">' + Math.round(s * 100) + "%</button>";
    }).join("") + "</div>" +
    '<button type="button" class="ghostbtn" id="resetBtn">Clear preview data on this device</button>' +
    '<p class="small">Clearing removes your likes, saves, streak and preview Pro on this browser only. The live app keeps these on your account.</p>';
  panel.querySelectorAll("[data-font]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.fontScale = Number(b.getAttribute("data-font"));
      document.documentElement.style.setProperty("--verse-size", state.fontScale);
      document.querySelectorAll(".verse .sa").forEach(function (n) {
        n.style.fontSize = Math.round(22 * state.fontScale) + "px";
      });
      saveState();
      renderProfile(panel);
    });
  });
  el("resetBtn").addEventListener("click", function () {
    if (!confirm("Clear all preview data on this device?")) return;
    localStorage.removeItem(STORE_KEY);
    location.reload();
  });
}

/* ---------- init ---------- */
function init() {
  fetch("data/corpus.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      corpus = data;
      renderTextBar();
      renderFeed();
      renderRail();
      updateProBtn();
      showView("feed");
    })
    .catch(function () {
      el("feed").innerHTML = "<p>Could not load the verse text. Please reload the page.</p>";
    });
  el("langBtn").addEventListener("click", function () {
    state.lang = state.lang === "en" ? "hi" : "en";
    saveState();
    renderTextBar();
    renderFeed();
    showView(currentView);
  });
  el("proBtn").addEventListener("click", function () {
    if (isPro()) { alert("Pro is on in this preview."); return; }
    openPaywall();
  });
  document.querySelectorAll("#bottomNav button").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
  });
}
init();
