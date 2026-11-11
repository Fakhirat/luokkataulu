/* Luokan infotaulu – luokan työkalut (taulu, opetustila ja erillinen työkalusivu).
   Tarvitsee common.js:n. Värit tulevat sivun omista CSS-muuttujista (--bg, --panel, --ink …). */
var LTT = (function () {
  "use strict";
  var L = LT, esc = L.esc, pad = L.pad;
  var O = { students: function () { return []; }, onTimer: function () { } };
  function setup(o) { for (var k in o) O[k] = o[k]; }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* ---------- tyylit ---------- */
  var css = [
    ".lt-stage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4rem;text-align:center;min-height:0;flex:1}",
    ".lt-big{font-family:var(--display);font-weight:700;font-variant-numeric:tabular-nums;line-height:1}",
    ".lt-row{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center}",
    ".lt-pill{border:2px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:.6rem 1.3rem;font-family:var(--display);font-weight:600;font-size:1.45rem;min-height:3.3rem;cursor:pointer}",
    ".lt-pill.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}",
    ".lt-pill[aria-pressed=\"true\"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}",
    ".lt-pill:disabled{opacity:.5}",
    ".lt-pill.sm{font-size:1.1rem;min-height:2.7rem;padding:.4rem .9rem}",
    ".lt-hint{color:var(--muted);font-size:1.1rem;max-width:50rem;margin:0;line-height:1.4}",
    ".lt-ring{position:relative;width:min(52vh,38rem);max-width:100%;aspect-ratio:1}",
    ".lt-ring svg{width:100%;height:100%;transform:rotate(-90deg)}",
    ".lt-ring .lt-big{position:absolute;inset:0;display:grid;place-items:center;font-size:min(13vh,9.5rem)}",
    ".lt-ring.done .lt-big{color:var(--accent);font-size:min(7vh,5rem);animation:lt-blink 1s steps(2) infinite}",
    ".lt-ring.lt-mini{width:min(19vh,10.5rem)}",
    ".lt-ring.lt-mini .lt-big{font-size:min(5vh,3rem)}",
    ".lt-ring.lt-mini.done .lt-big{font-size:min(2.6vh,1.4rem)}",
    "@keyframes lt-blink{50%{opacity:.25}}",
    ".lt-meter{width:min(80vw,60rem);height:4rem;border-radius:2rem;background:var(--line);overflow:hidden;position:relative}",
    ".lt-meter i{position:absolute;inset:0 auto 0 0;border-radius:2rem;transition:width .12s linear,background .3s}",
    ".lt-meter .lim{position:absolute;top:0;bottom:0;width:.35rem;background:var(--ink)}",
    ".lt-face{font-size:min(26vh,13rem);line-height:1}",
    ".lt-slider{display:flex;align-items:center;gap:1rem;font-size:1.2rem;flex-wrap:wrap;justify-content:center}",
    ".lt-slider input{width:min(50vw,30rem);accent-color:var(--accent)}",
    ".lt-light{display:flex;gap:.5rem;align-items:center;justify-content:center}",
    ".lt-light i{width:2.2rem;height:2.2rem;border-radius:50%;background:var(--line);transition:background .25s,box-shadow .25s}",
    ".lt-light i.on[data-n-dot=\"0\"]{background:var(--ok);box-shadow:0 0 1.2rem var(--ok)}",
    ".lt-light i.on[data-n-dot=\"1\"]{background:var(--warn);box-shadow:0 0 1.2rem var(--warn)}",
    ".lt-light i.on[data-n-dot=\"2\"]{background:var(--danger);box-shadow:0 0 1.2rem var(--danger)}",
    ".lt-name{font-family:var(--display);font-weight:700;font-size:min(17vh,10rem);line-height:1.05;min-height:1.1em;overflow-wrap:anywhere}",
    ".lt-name.spin{color:var(--muted)}",
    ".lt-names{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;max-width:min(90vw,100rem)}",
    ".lt-names button{border:2px solid var(--line);background:var(--panel);color:var(--ink);border-radius:.8rem;padding:.35rem .8rem;font:inherit;font-size:1.15rem;cursor:pointer}",
    ".lt-names button.out{text-decoration:line-through;opacity:.45}",
    ".lt-names button.drawn{background:var(--s4);color:var(--chip-ink)}",
    ".lt-groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.8rem;width:100%;max-width:100rem;overflow:auto;max-height:55vh}",
    ".lt-group{background:var(--panel);border:2px solid var(--line);border-radius:1.1rem;padding:.8rem 1rem;text-align:left}",
    ".lt-group h3{font-family:var(--display);margin:0 0 .3rem;font-size:1.4rem;color:var(--accent)}",
    ".lt-group div{font-size:1.45rem;font-weight:700}",
    ".lt-breath{width:min(48vh,30rem);max-width:80vw;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;",
    "background:radial-gradient(circle at 50% 40%,var(--s6),var(--teal));color:var(--chip-ink);transform:scale(.55);transition-property:transform;transition-timing-function:ease-in-out}",
    ".lt-breath span{font-family:var(--display);font-weight:600;font-size:min(5vh,2.6rem);transform:scale(1.4)}",
    ".lt-breath.in,.lt-breath.hold{transform:scale(1)}",
    ".lt-breath.in span,.lt-breath.hold span{transform:none}",
    ".lt-move{font-size:min(24vh,12rem);line-height:1}",
    ".lt-movename{font-family:var(--display);font-weight:700;font-size:min(7vh,4rem);line-height:1.1;max-width:60rem}",
    ".lt-movet{font-family:var(--display);font-weight:700;font-size:min(10vh,6rem);color:var(--accent);font-variant-numeric:tabular-nums}",
    ".lt-dots{display:flex;gap:.5rem}",
    ".lt-dots i{width:1rem;height:1rem;border-radius:50%;background:var(--line)}",
    ".lt-dots i.done{background:var(--accent)}",
    ".lt-dots i.cur{background:var(--ink)}",
    ".lt-moods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;width:min(95vw,90rem)}",
    ".lt-moods button{border:3px solid var(--line);background:var(--panel);color:var(--ink);border-radius:1.6rem;padding:1.2rem .5rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:.5rem;font:inherit}",
    ".lt-moods button span{font-size:min(16vh,8rem);line-height:1}",
    ".lt-moods button b{font-family:var(--display);font-size:1.5rem}",
    ".lt-moods button:active{transform:scale(.96)}",
    ".lt-thanks{font-family:var(--display);font-weight:700;font-size:2.4rem;color:var(--ok);min-height:1.2em}",
    "@media (max-width:640px){.lt-moods{grid-template-columns:repeat(2,minmax(0,1fr))}}",
    "@media (prefers-reduced-motion:reduce){.lt-breath{transition:none!important;transform:scale(.85)!important}.lt-breath span{transform:none!important}}"
  ].join("\n");
  (function () { var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); })();

  /* ---------- ääni ---------- */
  var AC = null;
  function unlockAudio() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) { } }
  function tones(fr, gap, vol, len) {
    unlockAudio(); if (!AC) return;
    fr.forEach(function (f, i) {
      var t = AC.currentTime + i * gap, o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .03); g.gain.exponentialRampToValueAtTime(0.0001, t + (len || .9));
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + (len || .9) + .1);
    });
  }
  function chime() { tones([784, 988, 1319], .35, .35); }
  function softChime() { tones([523, 659, 784], .5, .18, 1.6); }
  function beep() { tones([880], 0, .25, .25); }

  /* =================== AJASTIN =================== */
  var T = { total: 300, left: 300, end: 0, running: false, done: false, iv: null };
  function fmtT(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ":" + pad(sec % 60); }
  function tLeft() { return T.running ? (T.end - Date.now()) / 1000 : T.left; }
  function ring(mini) {
    return '<div class="lt-ring' + (mini ? " lt-mini" : "") + '" data-t-ring><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--line)" stroke-width="' + (mini ? 9 : 7) + '"/>' +
      '<circle data-t-arc cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="' + (mini ? 9 : 7) + '" stroke-linecap="round" stroke-dasharray="282.74" stroke-dashoffset="0"/></svg><div class="lt-big" data-t-big role="timer"></div></div>';
  }
  function renderTimer(el) {
    el.innerHTML = ring(false) +
      '<div class="lt-row">' + [1, 2, 3, 5, 10, 15, 20, 30].map(function (p) { return '<button class="lt-pill" type="button" data-p="' + p + '">' + p + ' min</button>'; }).join("") + '</div>' +
      '<div class="lt-row"><button class="lt-pill" type="button" data-t-minus>− 1 min</button><button class="lt-pill primary" type="button" data-t-go></button><button class="lt-pill" type="button" data-t-plus>+ 1 min</button><button class="lt-pill" type="button" data-t-reset>Alusta</button></div>';
    bindTimer(el); drawTimer();
  }
  function renderTimerMini(el) {
    el.innerHTML = ring(true) +
      '<div class="lt-row">' + [1, 3, 5, 10].map(function (p) { return '<button class="lt-pill sm" type="button" data-p="' + p + '">' + p + '</button>'; }).join("") + '</div>' +
      '<div class="lt-row"><button class="lt-pill sm primary" type="button" data-t-go></button><button class="lt-pill sm" type="button" data-t-plus>+1</button><button class="lt-pill sm" type="button" data-t-reset aria-label="Alusta">↺</button></div>';
    bindTimer(el); drawTimer();
  }
  function bindTimer(el) {
    el.querySelectorAll("[data-p]").forEach(function (b) { b.onclick = function () { setTimer(+b.dataset.p * 60, true); }; });
    el.querySelectorAll("[data-t-go]").forEach(function (b) { b.onclick = function () { if (T.done) { setTimer(T.total, false); return; } T.running ? pauseTimer() : startTimer(); }; });
    el.querySelectorAll("[data-t-plus]").forEach(function (b) { b.onclick = function () { adjust(60); }; });
    el.querySelectorAll("[data-t-minus]").forEach(function (b) { b.onclick = function () { adjust(-60); }; });
    el.querySelectorAll("[data-t-reset]").forEach(function (b) { b.onclick = function () { setTimer(T.total, false); }; });
  }
  function setTimer(sec, start) { T.total = sec; T.left = sec; T.running = false; T.done = false; clearInterval(T.iv); if (start) startTimer(); else drawTimer(); }
  function startTimer() { if (T.left <= 0) T.left = T.total; T.end = Date.now() + T.left * 1000; T.running = true; T.done = false; unlockAudio(); clearInterval(T.iv); T.iv = setInterval(timerTick, 200); drawTimer(); }
  function pauseTimer() { T.left = tLeft(); T.running = false; clearInterval(T.iv); drawTimer(); }
  function adjust(d) {
    if (T.running) { T.end += d * 1000; T.total = Math.max(T.total + d, 60); if (tLeft() < 1) T.end = Date.now() + 1000; }
    else { T.left = Math.max(T.left + d, 0); T.total = Math.max(T.left, 60); }
    T.done = false; drawTimer();
  }
  function timerTick() { if (tLeft() <= 0) { T.running = false; T.left = 0; T.done = true; clearInterval(T.iv); chime(); } drawTimer(); }
  function drawTimer() {
    var left = tLeft();
    each("[data-t-big]", function (e) { e.textContent = T.done ? "Aika loppui!" : fmtT(left); });
    each("[data-t-ring]", function (e) { e.classList.toggle("done", T.done); });
    each("[data-t-arc]", function (e) { e.setAttribute("stroke-dashoffset", String(282.74 * (1 - Math.max(0, left) / Math.max(T.total, 1)))); });
    each("[data-t-go]", function (e) { var mini = e.classList.contains("sm"); e.textContent = T.done ? (mini ? "↺" : "Uudestaan") : T.running ? (mini ? "⏸" : "⏸ Tauko") : (mini ? "▶" : "▶ Käynnistä"); });
    O.onTimer(T, T.done ? "Aika loppui!" : fmtT(left));
  }

  /* =================== ÄÄNITASO =================== */
  var MIC = { stream: null, raf: 0, level: 0, err: "" };
  function limit() { return +L.lsGet("lt-noise-limit", "60"); }
  function renderNoise(el) {
    var lim = limit();
    el.innerHTML = '<div class="lt-face" data-n-face>🙂</div><div class="lt-big" data-n-lbl style="font-size:2.6rem">Äänitaso</div>' +
      '<div class="lt-meter"><i data-n-bar style="width:0"></i><span class="lim" data-n-lim style="left:' + lim + '%"></span></div>' +
      '<div class="lt-slider"><span>Herkkä</span><input type="range" data-n-range min="25" max="90" value="' + lim + '" aria-label="Äänitason raja"><span>Salliva</span></div>' +
      '<div class="lt-row"><button class="lt-pill primary" type="button" data-n-go></button></div>' +
      '<p class="lt-hint">Mittari kuuntelee mikrofonia vain tällä laitteella. Mitään ei tallenneta eikä lähetetä minnekään.</p>';
    bindNoise(el);
  }
  function renderNoiseMini(el) {
    el.innerHTML = '<div class="lt-light" aria-hidden="true"><i data-n-dot="0"></i><i data-n-dot="1"></i><i data-n-dot="2"></i></div>' +
      '<div data-n-lbl style="font-weight:700;font-size:1.15rem;min-height:1.4em">Äänitaso</div><button class="lt-pill sm" type="button" data-n-go></button>';
    bindNoise(el);
  }
  function bindNoise(el) {
    el.querySelectorAll("[data-n-range]").forEach(function (r) { r.oninput = function () { L.lsSet("lt-noise-limit", r.value); each("[data-n-lim]", function (x) { x.style.left = r.value + "%"; }); }; });
    el.querySelectorAll("[data-n-go]").forEach(function (b) { b.onclick = function () { if (MIC.stream) { L.lsSet("lt-mic-ok", ""); stopMic(); } else startMic(); }; });
    updateNoise(MIC.level, !!MIC.stream);
    if (!MIC.stream && L.lsGet("lt-mic-ok", "") === "1") startMic();
  }
  function startMic() {
    if (MIC.stream) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { MIC.err = "Mikrofoni ei ole käytettävissä"; updateNoise(0, false); return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (st) {
      L.lsSet("lt-mic-ok", "1"); unlockAudio(); MIC.stream = st; MIC.err = "";
      var src = AC.createMediaStreamSource(st), an = AC.createAnalyser(); an.fftSize = 1024; src.connect(an);
      var buf = new Float32Array(an.fftSize);
      (function loop() {
        if (!MIC.stream) return;
        an.getFloatTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        var db = 20 * Math.log10(Math.sqrt(sum / buf.length) + 1e-8);
        MIC.level = MIC.level * .8 + Math.max(0, Math.min(100, (db + 70) * 1.6)) * .2;
        updateNoise(MIC.level, true);
        MIC.raf = requestAnimationFrame(loop);
      })();
    }).catch(function () { L.lsSet("lt-mic-ok", ""); MIC.err = "Mikrofonin käyttö estettiin"; updateNoise(0, false); });
  }
  function stopMic() {
    cancelAnimationFrame(MIC.raf);
    if (MIC.stream) { MIC.stream.getTracks().forEach(function (t) { t.stop(); }); MIC.stream = null; }
    MIC.level = 0; updateNoise(0, false);
  }
  function updateNoise(v, on) {
    var lim = limit(), st = !on ? -1 : v > lim ? 2 : v > lim * .7 ? 1 : 0;
    var col = ["var(--ok)", "var(--warn)", "var(--danger)"][st] || "var(--line)";
    var lbl = !on ? (MIC.err || "Äänitaso") : st === 2 ? "Liian kovaa!" : st === 1 ? "Vähän hiljempaa" : v < lim * .25 ? "Hiljaista" : "Hyvä työrauha";
    var face = !on ? "🙂" : st === 2 ? "😮" : st === 1 ? "😐" : v < lim * .25 ? "🤫" : "🙂";
    each("[data-n-bar]", function (e) { e.style.width = (on ? v : 0) + "%"; e.style.background = col; });
    each("[data-n-face]", function (e) { e.textContent = face; });
    each("[data-n-lbl]", function (e) { e.textContent = lbl; });
    each("[data-n-dot]", function (e) { e.classList.toggle("on", +e.dataset.nDot === st); });
    each("[data-n-go]", function (e) { var mini = e.classList.contains("sm"); e.textContent = on ? (mini ? "⏹ Pysäytä" : "⏹ Pysäytä mittari") : (mini ? "🎤 Käynnistä" : "🎤 Käynnistä mittari"); });
  }

  /* =================== OPPILAAT: poissa, arvonta, ryhmät =================== */
  function absentKey() { return "lt-absent-" + L.ymd(new Date()); }
  function absent() { try { return JSON.parse(L.lsGet(absentKey(), "[]")); } catch (e) { return []; } }
  function present() { var a = absent(); return O.students().filter(function (n) { return n && a.indexOf(n) < 0; }); }
  function noStudents(el) { el.innerHTML = '<div class="lt-face">🧑‍🏫</div><p class="lt-hint" style="font-size:1.4rem">' + esc(O.noStudentsText || "Lisää oppilaiden etunimet, niin arvonta ja ryhmät toimivat.") + '</p>' + (O.editNames ? '<button class="lt-pill primary" type="button" data-edit-names>Lisää nimet</button>' : ""); bindEdit(el); }
  function bindEdit(el) { var b = el.querySelector("[data-edit-names]"); if (b) b.onclick = function () { O.editNames(); }; }
  function namesHtml(drawn) {
    var a = absent();
    return '<p class="lt-hint">Napauta poissaolijat, niin heitä ei arvota tänään.' + (O.editNames ? ' <button class="lt-pill sm" type="button" data-edit-names>Muokkaa nimiä</button>' : "") + '</p><div class="lt-names">' + O.students().map(function (n) {
      return '<button type="button" data-n="' + esc(n) + '" class="' + (a.indexOf(n) >= 0 ? "out" : (drawn && drawn.indexOf(n) >= 0 ? "drawn" : "")) + '">' + esc(n) + '</button>';
    }).join("") + '</div>';
  }
  function bindNames(el, redraw) {
    el.querySelectorAll(".lt-names button").forEach(function (b) {
      b.onclick = function () { var a = absent(), n = b.dataset.n, i = a.indexOf(n); if (i >= 0) a.splice(i, 1); else a.push(n); L.lsSet(absentKey(), JSON.stringify(a)); redraw(); };
    });
    bindEdit(el);
  }
  var DRAW = { drawn: [], last: "" };
  function renderDraw(el) {
    if (!O.students().length) return noStudents(el);
    var pres = present();
    DRAW.drawn = DRAW.drawn.filter(function (n) { return pres.indexOf(n) >= 0; });
    el.innerHTML = '<div class="lt-name" data-nc>' + esc(DRAW.last || "🎲") + '</div>' +
      '<div class="lt-row"><button class="lt-pill primary" type="button" data-go>🎲 Arvo</button><button class="lt-pill" type="button" data-reset>Aloita alusta</button></div>' +
      '<p class="lt-hint">Arvottu ' + DRAW.drawn.length + '/' + pres.length + ' · sama nimi ei tule uudelleen ennen kuin kaikki on arvottu</p>' + namesHtml(DRAW.drawn);
    bindNames(el, function () { renderDraw(el); });
    el.querySelector("[data-reset]").onclick = function () { DRAW.drawn = []; DRAW.last = ""; renderDraw(el); };
    el.querySelector("[data-go]").onclick = function () {
      var pres = present(); if (!pres.length) return;
      var pool = pres.filter(function (n) { return DRAW.drawn.indexOf(n) < 0; });
      if (!pool.length) { DRAW.drawn = []; pool = pres.slice(); }
      var pick = pool[Math.floor(Math.random() * pool.length)], nc = el.querySelector("[data-nc]"), n = 0;
      this.disabled = true; nc.classList.add("spin");
      var iv = setInterval(function () {
        nc.textContent = pres[Math.floor(Math.random() * pres.length)];
        if (++n >= 14) { clearInterval(iv); DRAW.drawn.push(pick); DRAW.last = pick; beep(); renderDraw(el); }
      }, 70);
    };
  }
  var GROUPS = { size: +L.lsGet("lt-group-size", "3"), result: null };
  function renderGroups(el) {
    if (!O.students().length) return noStudents(el);
    el.innerHTML = '<div class="lt-row">' + [2, 3, 4, 5, 6].map(function (n) { return '<button class="lt-pill" type="button" data-g="' + n + '" aria-pressed="' + (GROUPS.size === n) + '">' + n + ' hengen</button>'; }).join("") +
      '<button class="lt-pill primary" type="button" data-go>👥 Jaa ryhmät</button></div><div class="lt-groups" data-out></div>' + namesHtml();
    bindNames(el, function () { GROUPS.result = null; renderGroups(el); });
    el.querySelectorAll("[data-g]").forEach(function (b) { b.onclick = function () { GROUPS.size = +b.dataset.g; L.lsSet("lt-group-size", b.dataset.g); renderGroups(el); }; });
    el.querySelector("[data-go]").onclick = function () {
      var p = present().slice();
      for (var i = p.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = p[i]; p[i] = p[j]; p[j] = x; }
      var count = Math.max(1, Math.round(p.length / GROUPS.size)), g = []; for (i = 0; i < count; i++) g.push([]);
      p.forEach(function (n, i) { g[i % count].push(n); }); GROUPS.result = g; drawGroups(el);
    };
    drawGroups(el);
  }
  function drawGroups(el) {
    var out = el.querySelector("[data-out]"); if (!out) return;
    out.innerHTML = GROUPS.result ? GROUPS.result.map(function (g, i) { return '<div class="lt-group"><h3>Ryhmä ' + (i + 1) + '</h3>' + g.map(function (n) { return '<div>' + esc(n) + '</div>'; }).join("") + '</div>'; }).join("") : "";
  }

  /* =================== RAUHOITTUMINEN =================== */
  var CALM = { end: 0, t: null, min: +L.lsGet("lt-calm-min", "2") };
  var PHASES = [["Hengitä sisään", 4000, "in"], ["Pidätä", 2000, "hold"], ["Hengitä ulos", 6000, "out"]];
  function renderCalm(el) {
    el.innerHTML = '<div class="lt-breath" data-calm><span data-calm-t>Valmiina?</span></div>' +
      '<div class="lt-row">' + [1, 2, 3, 5].map(function (m) { return '<button class="lt-pill" type="button" data-m="' + m + '" aria-pressed="' + (CALM.min === m) + '">' + m + ' min</button>'; }).join("") +
      '<button class="lt-pill primary" type="button" data-go>' + (CALM.end ? "⏹ Lopeta" : "▶ Aloita") + '</button></div>' +
      '<p class="lt-hint">Hengitä sisään, kun pallo kasvaa, ja ulos, kun se pienenee. Lopuksi kuuluu pehmeä merkkiääni.</p>';
    el.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { CALM.min = +b.dataset.m; L.lsSet("lt-calm-min", b.dataset.m); renderCalm(el); }; });
    el.querySelector("[data-go]").onclick = function () { if (CALM.end) { stopCalm(false); renderCalm(el); } else { unlockAudio(); CALM.end = Date.now() + CALM.min * 60000; renderCalm(el); phase(0); } };
    if (CALM.end) phase(CALM.i || 0);
  }
  function phase(i) {
    clearTimeout(CALM.t);
    var c = document.querySelector("[data-calm]"), t = document.querySelector("[data-calm-t]");
    if (!c) { stopCalm(false); return; }
    if (Date.now() >= CALM.end && i === 0) { stopCalm(true); return; }
    var p = PHASES[i]; CALM.i = i;
    c.style.transitionDuration = p[1] + "ms"; c.className = "lt-breath " + p[2]; t.textContent = p[0];
    CALM.t = setTimeout(function () { phase((i + 1) % PHASES.length); }, p[1]);
  }
  function stopCalm(done) {
    clearTimeout(CALM.t); CALM.end = 0; CALM.i = 0;
    var c = document.querySelector("[data-calm]"), t = document.querySelector("[data-calm-t]");
    if (c) { c.style.transitionDuration = "1500ms"; c.className = "lt-breath"; }
    if (t) t.textContent = done ? "Hienoa! 🌿" : "Valmiina?";
    var g = document.querySelector(".lt-breath ~ .lt-row [data-go]"); if (g) g.textContent = "▶ Aloita";
    if (done) softChime();
  }

  /* =================== TAUKOJUMPPA =================== */
  var MOVES = [
    ["⭐", "Tähtihypyt"], ["🏃", "Juokse paikallasi"], ["🙆", "Kurota kädet kattoon ja varpaille"], ["🦩", "Seiso yhdellä jalalla, vaihda puolta puolivälissä"],
    ["🔄", "Pyöritä olkapäitä eteen ja taakse"], ["🥊", "Ilmanyrkkeily"], ["🙇", "Koske varpaita ja nouse rauhassa ylös"], ["🥁", "Marssi polvet korkealla"],
    ["💃", "Ravistele koko keho rennoksi"], ["🌾", "Kallistele sivulle vuorotellen"], ["✈️", "Lentokone: kädet sivuille, kallistele"], ["⛷️", "Hiihdä paikallasi"],
    ["🌀", "Pyöritä ranteita ja nilkkoja"], ["🌳", "Puu-asento: kädet ylös ja tasapainoile"], ["🏋️", "Kyykky ja ylös"], ["🦘", "Kenguruhypyt paikallaan"],
    ["🐢", "Hidas kilpikonna: kyyristy pieneksi ja kasva isoksi"], ["🎹", "Pianon soitto ilmassa niin nopeasti kuin pystyt"]
  ];
  var MV = { list: [], i: -1, prep: false, end: 0, iv: null, count: +L.lsGet("lt-mv-count", "3"), secs: +L.lsGet("lt-mv-secs", "30") };
  function renderMove(el) {
    var cur = MV.i >= 0 ? MV.list[MV.i] : null, left = Math.max(0, Math.ceil((MV.end - Date.now()) / 1000));
    el.innerHTML = '<div class="lt-move" data-mv-i>' + (cur ? cur[0] : "🤸") + '</div>' +
      '<div class="lt-movename" data-mv-n>' + (cur ? (MV.prep ? "Valmistaudu: " : "") + esc(cur[1]) : "Taukojumppa") + '</div>' +
      '<div class="lt-movet" data-mv-t>' + (cur ? left : "") + '</div>' +
      '<div class="lt-dots" data-mv-d>' + MV.list.map(function (_, k) { return '<i class="' + (k < MV.i ? "done" : k === MV.i ? "cur" : "") + '"></i>'; }).join("") + '</div>' +
      (MV.iv ? '<div class="lt-row"><button class="lt-pill" type="button" data-skip>Seuraava ›</button><button class="lt-pill primary" type="button" data-stop>⏹ Lopeta</button></div>' :
        '<div class="lt-row">' + [3, 5].map(function (n) { return '<button class="lt-pill" type="button" data-c="' + n + '" aria-pressed="' + (MV.count === n) + '">' + n + ' liikettä</button>'; }).join("") +
        [20, 30, 45].map(function (n) { return '<button class="lt-pill" type="button" data-s="' + n + '" aria-pressed="' + (MV.secs === n) + '">' + n + ' s</button>'; }).join("") + '</div>' +
        '<div class="lt-row"><button class="lt-pill primary" type="button" data-go>🎲 Arvo ja aloita</button></div><p class="lt-hint">Jokaista liikettä ennen on 5 sekuntia aikaa valmistautua.</p>');
    var q = function (s) { return el.querySelector(s); };
    el.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { MV.count = +b.dataset.c; L.lsSet("lt-mv-count", b.dataset.c); renderMove(el); }; });
    el.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { MV.secs = +b.dataset.s; L.lsSet("lt-mv-secs", b.dataset.s); renderMove(el); }; });
    if (q("[data-go]")) q("[data-go]").onclick = function () {
      unlockAudio(); var pool = MOVES.slice(); MV.list = [];
      while (MV.list.length < MV.count && pool.length) MV.list.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      MV.i = 0; MV.prep = true; MV.end = Date.now() + 5000; clearInterval(MV.iv); MV.iv = setInterval(function () { moveTick(el); }, 250); renderMove(el);
    };
    if (q("[data-stop]")) q("[data-stop]").onclick = function () { stopMove(); renderMove(el); };
    if (q("[data-skip]")) q("[data-skip]").onclick = function () { MV.end = 0; moveTick(el); };
  }
  function moveTick(el) {
    if (!document.body.contains(el) || !el.querySelector("[data-mv-t]")) { stopMove(); return; }
    var left = (MV.end - Date.now()) / 1000;
    if (left <= 0) {
      if (MV.prep) { MV.prep = false; MV.end = Date.now() + MV.secs * 1000; beep(); }
      else if (MV.i < MV.list.length - 1) { MV.i++; MV.prep = true; MV.end = Date.now() + 5000; beep(); }
      else { stopMove(); chime(); renderMove(el); el.querySelector("[data-mv-n]").textContent = "Hyvä! Takaisin töihin 💪"; return; }
      renderMove(el); return;
    }
    el.querySelector("[data-mv-t]").textContent = Math.ceil(left);
  }
  function stopMove() { clearInterval(MV.iv); MV.iv = null; MV.i = -1; MV.list = []; }

  /* =================== FIILISMITTARI =================== */
  var MOODS = [["😄", "Tosi kiva"], ["🙂", "Ihan hyvä"], ["😐", "Niin ja näin"], ["🙁", "Vaikea tai tylsä"]];
  function renderMood(el, o) {
    o = o || {};
    var counts = [0, 0, 0, 0], tt = null;
    el.innerHTML = '<div class="lt-big" style="font-size:3rem">' + esc(o.title || "Miltä tunti tuntui?") + '</div>' +
      (o.sub ? '<p class="lt-hint" style="font-size:1.3rem">' + esc(o.sub) + '</p>' : "") +
      '<div class="lt-moods">' + MOODS.map(function (m, i) { return '<button type="button" data-mood="' + i + '"><span>' + m[0] + '</span><b>' + m[1] + '</b></button>'; }).join("") + '</div>' +
      '<div class="lt-thanks" data-thanks></div><p class="lt-hint" data-count>Jokainen napauttaa omaa fiilistään lähtiessään.</p>' +
      '<div class="lt-row"><button class="lt-pill primary" type="button" data-done>Valmis</button></div>';
    el.querySelectorAll("[data-mood]").forEach(function (b) {
      b.onclick = function () {
        counts[+b.dataset.mood]++; unlockAudio(); tones([660 + 110 * (3 - b.dataset.mood)], 0, .15, .3);
        var th = el.querySelector("[data-thanks]"); th.textContent = "Kiitos! 💛"; clearTimeout(tt); tt = setTimeout(function () { th.textContent = ""; }, 1200);
        var n = counts.reduce(function (a, b) { return a + b; }, 0);
        el.querySelector("[data-count]").textContent = n + (n === 1 ? " vastaus" : " vastausta");
      };
    });
    el.querySelector("[data-done]").onclick = function () {
      var n = counts.reduce(function (a, b) { return a + b; }, 0);
      if (o.onDone) o.onDone(counts, n);
      el.innerHTML = '<div class="lt-face">💛</div><div class="lt-big" style="font-size:2.6rem">' + (n ? "Kiitos kaikille!" : "Ei vastauksia") + '</div>' +
        (n ? '<p class="lt-hint">' + n + (n === 1 ? " vastaus" : " vastausta") + (o.saved ? " tallennettiin opettajalle." : ".") + '</p>' : "");
    };
  }

  /* ---------- yhteiset ---------- */
  var TOOLS = [
    ["timer", "⏱️", "Ajastin", renderTimer], ["noise", "🔊", "Äänitaso", renderNoise], ["draw", "🎲", "Arvonta", renderDraw], ["groups", "👥", "Ryhmät", renderGroups],
    ["calm", "🧘", "Rauhoitu", renderCalm], ["move", "🤸", "Taukojumppa", renderMove]
  ];
  function render(id, el, o) {
    if (id !== "noise" && !O.keepMic) stopMic();
    if (id !== "calm" && CALM.end) stopCalm(false);
    if (id !== "move" && MV.iv) stopMove();
    if (id === "mood") return renderMood(el, o);
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i][0] === id) return TOOLS[i][3](el, o);
  }
  function leave() { if (!O.keepMic) stopMic(); if (CALM.end) stopCalm(false); if (MV.iv) stopMove(); }

  return {
    setup: setup, TOOLS: TOOLS, render: render, leave: leave, renderTimerMini: renderTimerMini, renderNoiseMini: renderNoiseMini,
    timer: T, fmtT: fmtT, tLeft: tLeft, stopMic: stopMic, micOn: function () { return !!MIC.stream; }, unlockAudio: unlockAudio
  };
})();
