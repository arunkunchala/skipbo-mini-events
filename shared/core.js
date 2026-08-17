/* ============================================================
   Skip-Bo Mini-Events — shared core (wallet, fake IAP, FX)
   Global: window.SB
   ============================================================ */
(function () {
  "use strict";

  // ---------- safe storage (falls back to memory) ----------
  var mem = {};
  function sGet(k) {
    try { var v = localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : null) : v; }
    catch (e) { return k in mem ? mem[k] : null; }
  }
  function sSet(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, v); } catch (e) {}
  }
  function sDel(k) {
    delete mem[k];
    try { localStorage.removeItem(k); } catch (e) {}
  }

  // ---------- reward catalog ----------
  var ICONS = {
    coins: "🪙", energy: "⚡", wild: "🃏", undo: "↩️", draw: "🎴",
    reverse: "🔄", chest: "🎁", gem: "💎", token: "🎟️", star: "⭐", shovel: "⛏️",
    ball: "🔮", grab: "🕹️", tool: "🔧", key: "🗝️", trophy: "🏆", ticket: "🎫",
    plank: "🪵"
  };
  var LABELS = {
    coins: "Coins", energy: "Energy", wild: "Wild Card", undo: "Undo",
    draw: "Draw+", reverse: "Reverse", chest: "Chest", gem: "Gems",
    token: "Event Tokens", star: "Stars", shovel: "Shovels", ball: "Drop Balls",
    grab: "Grabs", tool: "Tools", key: "Keys", trophy: "Trophies", ticket: "Tickets",
    plank: "Planks"
  };

  // ---------- wallet ----------
  var WKEY = "sb_wallet_v1";
  function loadWallet() {
    var d = sGet(WKEY);
    if (d) { try { return JSON.parse(d); } catch (e) {} }
    return { coins: 2450, energy: 5, wild: 2, undo: 3, draw: 1, gem: 10 };
  }
  var wallet = loadWallet();
  function saveWallet() { sSet(WKEY, JSON.stringify(wallet)); renderWallet(); }

  function renderWallet() {
    var el = document.getElementById("sb-wallet-amt");
    if (el) el.textContent = fmt(wallet.coins);
  }
  // single source of truth for reward-label pluralisation (chips + toasts agree).
  // Irregulars are explicit: mass nouns never take an "s", -ies words need a real
  // singular, and symbol-suffixed labels must not be mangled.
  var IRREGULAR = {
    "Energy":    { one: "Energy",     many: "Energy" },      // mass noun
    "Trophies":  { one: "Trophy",     many: "Trophies" },
    "Draw+":     { one: "Draw+",      many: "Draw+" },       // symbol suffix
    "Undo":      { one: "Undo",       many: "Undos" },
    "Wild Card": { one: "Wild Card",  many: "Wild Cards" }
  };
  function plural(label, amount) {
    var irr = IRREGULAR[label];
    if (irr) return amount === 1 ? irr.one : irr.many;
    // Phrases ("Tickets per clear", "Digs remaining") must be left alone — inflecting
    // the trailing word produces nonsense. Plain noun phrases ("Dig Ticket") inflect
    // normally.
    if (/\s(per|remaining|left|to|in|of|for|from|and)\b|\b(remaining|left)$/i.test(label)) return label;
    if (amount === 1) return (/s$/.test(label) && !/ss$/.test(label)) ? label.replace(/s$/, "") : label;
    return /s$/.test(label) ? label : label + "s";
  }
  function fmt(n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  // ---------- top bar ----------
  function init(opts) {
    opts = opts || {};
    var app = document.querySelector(".sb-app");
    if (!app) { app = document.createElement("div"); app.className = "sb-app"; while (document.body.firstChild) app.appendChild(document.body.firstChild); document.body.appendChild(app); }
    var bar = document.createElement("div");
    bar.className = "sb-topbar";
    var isHub = !!opts.hub;
    bar.innerHTML =
      (isHub ? "" : '<button class="sb-back" id="sb-back" aria-label="Back">‹</button>') +
      '<div class="sb-title-wrap"><div class="sb-title">' + (opts.title || "Skip-Bo Event") + "</div>" +
      (opts.subtitle ? '<div class="sb-subtitle">' + opts.subtitle + "</div>" : "") +
      "</div>" +
      '<div class="sb-wallet"><span class="sb-coin-ico">🪙</span><span id="sb-wallet-amt">0</span></div>';
    app.insertBefore(bar, app.firstChild);
    if (!isHub) {
      bar.querySelector("#sb-back").addEventListener("click", function () {
        location.href = location.pathname.indexOf("/events/") !== -1 ? "../index.html" : "index.html";
      });
    }
    if (opts.resetKey) {
      var r = document.createElement("button");
      r.className = "sb-demo-reset";
      r.innerHTML = '⟲<span class="lbl">Reset demo</span>';
      r.setAttribute("aria-label", "Reset demo");
      r.addEventListener("click", function () {
        // first tap expands the label, second tap resets (avoids accidental wipes on touch)
        if (!r.classList.contains("open")) {
          r.classList.add("open");
          setTimeout(function () { r.classList.remove("open"); }, 2600);
          return;
        }
        sDel("sb_evt_" + opts.resetKey);
        sDel(WKEY);
        location.reload();
      });
      // Docked in the top bar, not floating over content: as a fixed FAB it sat on
      // top of event CTAs (claim columns, bottom action rows) in several events.
      bar.appendChild(r);
    }
    if (!document.querySelector('link[rel="icon"]')) {
      var fav = document.createElement("link");
      fav.rel = "icon";
      fav.href = "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="%231D4FA1"/><rect x="7" y="5" width="18" height="22" rx="3" fill="%23FDF6E3" stroke="%23FFC72C" stroke-width="2"/><text x="16" y="21" font-size="12" font-weight="bold" text-anchor="middle" fill="%23D7263D" font-family="Arial">SB</text></svg>'.replace(/%23/g, "#")
      );
      document.head.appendChild(fav);
    }
    ensureFxLayers();
    renderWallet();
    return bar;
  }

  // ---------- event-local persistent store ----------
  function store(key, defaults) {
    var K = "sb_evt_" + key;
    var cur = null;
    var raw = sGet(K);
    if (raw) { try { cur = JSON.parse(raw); } catch (e) {} }
    if (!cur) cur = JSON.parse(JSON.stringify(defaults || {}));
    return {
      data: cur,
      save: function () { sSet(K, JSON.stringify(cur)); },
      clear: function () { sDel(K); }
    };
  }

  // ---------- toast ----------
  // toast(msg, ms) or toast(msg, {ms, top:true}). Messages queue one-deep-plus so a
  // reward toast is never erased by an incidental one arriving on its heels.
  var toastEl, toastTimer, toastQ = [], toastBusy = false;
  function toast(msg, ms) {
    var top = false;
    if (ms && typeof ms === "object") { top = !!ms.top; ms = ms.ms; }
    toastQ.push({ msg: msg, ms: ms || 1800, top: top });
    if (!toastBusy) drainToast();
  }
  function drainToast() {
    if (!toastQ.length) { toastBusy = false; return; }
    toastBusy = true;
    var t = toastQ.shift();
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "sb-toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = t.msg;
    toastEl.classList.toggle("top", t.top);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(drainToast, toastQ.length ? 180 : 0);
    }, t.ms);
  }

  // ---------- haptic ----------
  var userInteracted = false;
  window.addEventListener("pointerdown", function () { userInteracted = true; }, { once: true, capture: true });
  function haptic(ms) { try { if (userInteracted && navigator.vibrate) navigator.vibrate(ms || 15); } catch (e) {} }

  // ---------- flying rewards + grant ----------
  function ensureFxLayers() {
    if (!document.getElementById("sb-confetti")) {
      var c = document.createElement("canvas");
      c.id = "sb-confetti";
      document.body.appendChild(c);
    }
  }

  function flyIcon(icon, fromX, fromY) {
    var target = document.getElementById("sb-wallet-amt");
    var tx = window.innerWidth - 50, ty = 30;
    if (target) { var r = target.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2; }
    var el = document.createElement("div");
    el.className = "sb-fly";
    el.textContent = icon;
    el.style.left = fromX + "px";
    el.style.top = fromY + "px";
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.left = tx + "px";
        el.style.top = ty + "px";
        el.style.transform = "scale(0.4)";
        el.style.opacity = "0.3";
      });
    });
    setTimeout(function () { el.remove(); }, 800);
  }

  // rewards: [{type:'coins', amount:500}, ...]  originEl optional
  // opts: {toast:false} to suppress, or {toastTop:true} to keep it clear of bottom CTAs
  function grantRewards(rewards, originEl, opts) {
    opts = opts || {};
    var ox = window.innerWidth / 2, oy = window.innerHeight / 2;
    if (originEl && originEl.getBoundingClientRect) {
      var r = originEl.getBoundingClientRect();
      ox = r.left + r.width / 2; oy = r.top + r.height / 2;
    }
    var names = [];
    (rewards || []).forEach(function (rw, i) {
      wallet[rw.type] = (wallet[rw.type] || 0) + rw.amount;
      names.push("+" + fmt(rw.amount) + " " + plural(rw.label || LABELS[rw.type] || rw.type, rw.amount));
      var n = Math.min(rw.type === "coins" ? 6 : 2, 6);
      for (var j = 0; j < n; j++) {
        (function (d) {
          setTimeout(function () { flyIcon(ICONS[rw.type] || "🎁", ox + (Math.random() * 60 - 30), oy + (Math.random() * 40 - 20)); }, d);
        })(i * 120 + j * 70);
      }
    });
    saveWallet();
    haptic(20);
    if (names.length && opts.toast !== false) toast(names.join("  ·  "), { top: !!opts.toastTop });
    var w = document.querySelector(".sb-wallet");
    // wallet is right-docked: use the gentler bounce so it can't overflow the viewport
    if (w) { w.classList.remove("sb-bounce-sm"); void w.offsetWidth; w.classList.add("sb-bounce-sm"); }
  }

  function spend(type, amount) {
    if ((wallet[type] || 0) < amount) return false;
    wallet[type] -= amount;
    saveWallet();
    return true;
  }
  function bal(type) { return wallet[type] || 0; }

  // ---------- reward chip HTML ----------
  // rw: {type, amount} or {icon, label, amount} for event-local currencies
  function rewardChip(rw) {
    var ic = rw.icon || ICONS[rw.type] || "🎁";
    // {exact:true} prints the full number so sheet chips match displayed arithmetic
    var amt = rw.exact ? Math.floor(rw.amount).toLocaleString("en-US") : fmt(rw.amount);
    return '<span class="sb-reward"><span class="ico">' + ic + "</span>" +
      amt + " " + plural(rw.label || LABELS[rw.type] || rw.type, rw.amount) + "</span>";
  }
  function icon(type) { return ICONS[type] || "🎁"; }

  // ---------- fake IAP bottom sheet ----------
  var sheetEl = null;
  function buyIAP(opts) {
    // opts: {label, price, sub, contents:[rewards], onSuccess, grant:true|false}
    // re-entrancy guard: a second open while a purchase is mid-flight is ignored
    if (sheetEl && sheetEl.__processing) return;
    closeSheet();
    var bd = document.createElement("div");
    bd.className = "sb-sheet-backdrop";
    var chips = (opts.contents || []).map(rewardChip).join("");
    bd.innerHTML =
      '<div class="sb-sheet">' +
      "<h3>" + (opts.label || "Special Offer") + "</h3>" +
      '<div class="sb-sheet-sub">' + (opts.sub || "One-time offer · Skip-Bo Mini Event") + "</div>" +
      (chips ? '<div class="sb-sheet-contents">' + chips + "</div>" : "") +
      '<button class="sb-btn sb-btn-green sb-btn-block" id="sb-sheet-buy"><span>Buy now</span><span class="sb-price-tag">' + opts.price + "</span></button>" +
      '<button class="sb-sheet-cancel" id="sb-sheet-cancel">No thanks</button>' +
      "</div>";
    document.body.appendChild(bd);
    sheetEl = bd;
    requestAnimationFrame(function () { requestAnimationFrame(function () { bd.classList.add("open"); }); });
    var processing = false;
    bd.addEventListener("click", function (e) { if (e.target === bd && !processing) dismiss(); });
    bd.querySelector("#sb-sheet-cancel").addEventListener("click", function () { if (!processing) dismiss(); });
    bd.querySelector("#sb-sheet-buy").addEventListener("click", function () {
      var btn = bd.querySelector("#sb-sheet-buy");
      if (processing) return;
      processing = true;
      bd.__processing = true;
      var cancelBtn = bd.querySelector("#sb-sheet-cancel");
      if (cancelBtn) cancelBtn.style.visibility = "hidden";
      btn.disabled = true;
      btn.innerHTML = "<span>Processing…</span>";
      haptic(10);
      setTimeout(function () {
        btn.innerHTML = "<span>✓ Purchased!</span>";
        haptic(35);
        setTimeout(function () {
          closeSheet();
          if (opts.grant !== false && opts.contents) grantRewards(opts.contents);
          confetti();
          if (opts.onSuccess) opts.onSuccess();
        }, 450);
      }, 700);
    });
    function dismiss() { closeSheet(); if (opts.onCancel) opts.onCancel(); }
  }
  function closeSheet() {
    if (sheetEl) {
      var s = sheetEl; sheetEl = null;
      s.classList.remove("open");
      setTimeout(function () { s.remove(); }, 300);
    }
  }

  // ---------- centered modal ----------
  function modal(html, onClose) {
    var bd = document.createElement("div");
    bd.className = "sb-modal-backdrop open";
    bd.innerHTML = '<div class="sb-modal">' + html + "</div>";
    document.body.appendChild(bd);
    var closed = false;
    function shut(silent) {
      if (closed) return;          // idempotent: onClose can never fire twice
      closed = true;
      bd.remove();
      if (!silent && onClose) onClose();
    }
    bd.addEventListener("click", function (e) { if (e.target === bd) shut(false); });
    return {
      el: bd,
      close: shut,
      get closed() { return closed; }
    };
  }

  // ---------- confetti ----------
  var confettiRunning = false;
  function confetti(x, y, count) {
    ensureFxLayers();
    var canvas = document.getElementById("sb-confetti");
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var cx = x == null ? canvas.width / 2 : x;
    var cy = y == null ? canvas.height / 3 : y;
    var colors = ["#FFC72C", "#D7263D", "#2E9E4F", "#3E8EDE", "#ffffff", "#FDF6E3"];
    var parts = [];
    var nParts = (count == null ? 80 : count);
    for (var i = 0; i < nParts; i++) {
      parts.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 3,
        s: Math.random() * 7 + 4,
        c: colors[(Math.random() * colors.length) | 0],
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 90 + Math.random() * 40
      });
    }
    if (confettiRunning) { confettiParts = confettiParts.concat(parts); return; }
    confettiParts = parts;
    confettiRunning = true;
    (function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      confettiParts.forEach(function (p) {
        if (p.life <= 0) return;
        alive = true;
        p.life--;
        p.vy += 0.35;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (alive) requestAnimationFrame(frame);
      else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    })();
  }
  var confettiParts = [];

  // ---------- countdown helper ----------
  // urgentMs defaults to 3 minutes: every event here runs a compressed demo clock,
  // so a 1-hour threshold would pulse the chip for the entire session.
  function countdown(el, endTs, onEnd, urgentMs) {
    var UR = urgentMs == null ? 180000 : urgentMs;
    function tick() {
      var left = Math.max(0, endTs - Date.now());
      var h = Math.floor(left / 3600000);
      var m = Math.floor((left % 3600000) / 60000);
      var s = Math.floor((left % 60000) / 1000);
      el.textContent = (h > 0 ? h + "h " : "") + String(m).padStart(2, "0") + "m " + String(s).padStart(2, "0") + "s";
      if (!el.isConnected) { clearInterval(iv); return; }   // self-clear if the element is detached
      if (el.parentElement) el.parentElement.classList.toggle("urgent", left < UR);
      if (left <= 0) { clearInterval(iv); if (onEnd) onEnd(); }
    }
    var iv = setInterval(tick, 1000);
    tick();
    return iv;
  }

  window.SB = {
    init: init, store: store, toast: toast, haptic: haptic,
    grantRewards: grantRewards, spend: spend, bal: bal, fmt: fmt,
    rewardChip: rewardChip, icon: icon, buyIAP: buyIAP, closeSheet: closeSheet, modal: modal,
    num: function (n) { return Math.floor(n).toLocaleString("en-US"); },
    confetti: confetti, countdown: countdown, wallet: wallet
  };
})();
