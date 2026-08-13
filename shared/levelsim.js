/* ============================================================
   Skip-Bo Mini-Events — shared level-play simulator
   Load AFTER core.js. Adds SB.playLevel(opts) -> Promise<result>
   result: { won:bool, firstTry:bool, hard:bool, cardsLeft:int }

   The engagement research rule: every event input is fueled by
   MAIN LEVEL COMPLETION. This simulator stands in for playing a
   real Skip-Bo adventure level: a quick animated card-shedding
   sequence with a win/near-miss outcome.

   opts:
     hard      : false  — hard level (bigger stockpile, lower win rate, events pay 2x)
     winRate   : 0.78 normal / 0.55 hard (override for demos)
     stock     : stockpile size override (10 normal / 14 hard)
     title     : header label ("Adventure Level 214")
     instant   : skip animation entirely (for retries)
   ============================================================ */
(function () {
  "use strict";
  if (!window.SB) { console.error("levelsim.js requires core.js"); return; }

  var css = [
    ".sb-lvl-backdrop{position:fixed;inset:0;z-index:240;background:rgba(10,20,40,0.78);display:flex;align-items:center;justify-content:center;padding:22px;opacity:0;transition:opacity .2s;}",
    ".sb-lvl-backdrop.on{opacity:1;}",
    ".sb-lvl{width:100%;max-width:340px;background:linear-gradient(180deg,#2a5cb0,#1D4FA1);border:2.5px solid rgba(255,199,44,.75);border-radius:20px;padding:16px 16px 18px;text-align:center;color:#fff;box-shadow:0 14px 44px rgba(0,0,0,.55);transform:scale(.85);transition:transform .22s cubic-bezier(.34,1.56,.64,1);}",
    ".sb-lvl-backdrop.on .sb-lvl{transform:scale(1);}",
    ".sb-lvl.hard{border-color:#ef5468;background:linear-gradient(180deg,#7a1b2c,#4a0f1b);}",
    ".sb-lvl-head{font-weight:900;font-size:15px;text-shadow:0 1px 0 rgba(0,0,0,.3);}",
    ".sb-lvl-tag{display:inline-block;margin-top:3px;font-size:10px;font-weight:900;letter-spacing:1px;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.16);}",
    ".sb-lvl.hard .sb-lvl-tag{background:#D7263D;}",
    ".sb-lvl-table{margin:14px auto 6px;padding:12px 10px 14px;border-radius:14px;background:radial-gradient(120% 120% at 50% 0%,#2E9E4F 0%,#1f7038 70%);box-shadow:inset 0 0 22px rgba(0,0,0,.35);}",
    ".sb-lvl-stockrow{display:flex;align-items:center;justify-content:center;gap:12px;}",
    ".sb-lvl-stack{position:relative;width:52px;height:70px;}",
    ".sb-lvl-stack .sb-card{position:absolute;left:0;top:0;width:46px;height:62px;font-size:22px;}",
    ".sb-lvl-count{font-size:26px;font-weight:900;color:var(--sb-yellow);text-shadow:0 2px 0 rgba(0,0,0,.35);min-width:56px;}",
    ".sb-lvl-count small{display:block;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.75);}",
    ".sb-lvl-build{display:flex;gap:6px;justify-content:center;margin-top:12px;min-height:40px;}",
    ".sb-lvl-build .sb-card{width:30px;height:40px;font-size:15px;}",
    "@keyframes sbLvlShed{0%{transform:translate(0,0) rotate(0);opacity:1;}100%{transform:translate(46px,58px) rotate(14deg) scale(.72);opacity:0;}}",
    ".sb-lvl-shed{animation:sbLvlShed .34s ease-in forwards;}",
    ".sb-lvl-result{margin-top:12px;font-weight:900;font-size:20px;min-height:26px;text-shadow:0 2px 0 rgba(0,0,0,.35);}",
    ".sb-lvl-result.win{color:var(--sb-yellow);animation:sbBounce .5s;}",
    ".sb-lvl-result.lose{color:#ffb3bd;}",
    ".sb-lvl-sub{font-size:12px;font-weight:700;color:rgba(255,255,255,.85);min-height:16px;margin-top:2px;}",
    ".sb-lvl-skip{margin-top:10px;background:none;border:none;color:rgba(255,255,255,.6);font-weight:700;font-size:12px;cursor:pointer;padding:8px;min-height:44px;}"
  ].join("\n");
  var tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);

  function playLevel(opts) {
    opts = opts || {};
    var hard = !!opts.hard;
    var winRate = opts.winRate != null ? opts.winRate : (hard ? 0.55 : 0.78);
    var stock = opts.stock || (hard ? 14 : 10);
    var won = Math.random() < winRate;
    // near-miss: losses stop with 1-3 cards left; wins shed all
    var stopAt = won ? 0 : (1 + Math.floor(Math.random() * 3));
    var result = { won: won, firstTry: won, hard: hard, cardsLeft: stopAt };

    if (opts.instant) return Promise.resolve(result);

    return new Promise(function (resolve) {
      var bd = document.createElement("div");
      bd.className = "sb-lvl-backdrop";
      var colors = ["red", "green", "blue"];
      bd.innerHTML =
        '<div class="sb-lvl' + (hard ? " hard" : "") + '">' +
        '<div class="sb-lvl-head">' + (opts.title || "Skip-Bo Adventure Level") + "</div>" +
        '<div class="sb-lvl-tag">' + (hard ? "🔥 HARD LEVEL · 2× EVENT REWARDS" : "CLASSIC LEVEL") + "</div>" +
        '<div class="sb-lvl-table">' +
        '<div class="sb-lvl-stockrow">' +
        '<div class="sb-lvl-stack" id="sb-lvl-stack"></div>' +
        '<div class="sb-lvl-count"><span id="sb-lvl-n">' + stock + '</span><small>STOCKPILE</small></div>' +
        "</div>" +
        '<div class="sb-lvl-build" id="sb-lvl-build"></div>' +
        "</div>" +
        '<div class="sb-lvl-result" id="sb-lvl-res"></div>' +
        '<div class="sb-lvl-sub" id="sb-lvl-sub"></div>' +
        '<button class="sb-lvl-skip" id="sb-lvl-skip">skip ›</button>' +
        "</div>";
      document.body.appendChild(bd);
      requestAnimationFrame(function () { requestAnimationFrame(function () { bd.classList.add("on"); }); });

      var stackEl = bd.querySelector("#sb-lvl-stack");
      var buildEl = bd.querySelector("#sb-lvl-build");
      var nEl = bd.querySelector("#sb-lvl-n");
      var resEl = bd.querySelector("#sb-lvl-res");
      var subEl = bd.querySelector("#sb-lvl-sub");

      // draw stock stack (3 card backs fanned)
      for (var i = 2; i >= 0; i--) {
        var c = document.createElement("span");
        c.className = "sb-card wild";
        c.style.transform = "translate(" + i * 3 + "px," + -i * 3 + "px) rotate(" + (i - 1) * 3 + "deg)";
        c.textContent = "SKIP·BO";
        stackEl.appendChild(c);
      }

      var remaining = stock, num = 1, done = false, timer = null;

      function shedOne() {
        if (done) return;
        if (remaining <= stopAt) return finish();
        remaining--;
        nEl.textContent = remaining;
        var card = document.createElement("span");
        card.className = "sb-card " + colors[num % 3];
        card.textContent = num;
        num = (num % 12) + 1;
        buildEl.appendChild(card);
        if (buildEl.children.length > 6) buildEl.removeChild(buildEl.firstChild);
        var fly = stackEl.lastChild;
        if (fly) { fly.classList.add("sb-lvl-shed"); setTimeout(function () { if (fly.parentNode) { fly.classList.remove("sb-lvl-shed"); } }, 340); }
        SB.haptic(6);
        timer = setTimeout(shedOne, remaining <= 3 ? 300 : 150);
      }

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        nEl.textContent = stopAt;
        bd.querySelector("#sb-lvl-skip").style.visibility = "hidden";
        if (won) {
          resEl.textContent = "LEVEL CLEARED! ⭐";
          resEl.className = "sb-lvl-result win";
          subEl.textContent = hard ? "Hard clear — event rewards ×2!" : "Stockpile emptied!";
          SB.confetti(window.innerWidth / 2, window.innerHeight / 2, 50);
          SB.haptic(30);
        } else {
          resEl.textContent = "SO CLOSE…";
          resEl.className = "sb-lvl-result lose";
          subEl.textContent = "Only " + stopAt + " card" + (stopAt > 1 ? "s" : "") + " left in your stockpile!";
          var lv = bd.querySelector(".sb-lvl");
          lv.classList.add("sb-shake");
        }
        setTimeout(close, 1300);
      }

      function close() {
        bd.classList.remove("on");
        setTimeout(function () { bd.remove(); resolve(result); }, 200);
      }

      bd.querySelector("#sb-lvl-skip").addEventListener("click", function () {
        clearTimeout(timer);
        remaining = stopAt;
        finish();
      });

      setTimeout(shedOne, 420);
    });
  }

  window.SB.playLevel = playLevel;
})();
