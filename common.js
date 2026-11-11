/* Luokan infotaulu – yhteiset apufunktiot (index.html ja opettaja.html) */
var LT = (function () {
  "use strict";
  var DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
  var DAYS_LONG = ["maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai", "sunnuntai"];
  var MONTHS = ["tammikuuta", "helmikuuta", "maaliskuuta", "huhtikuuta", "toukokuuta", "kesäkuuta", "heinäkuuta", "elokuuta", "syyskuuta", "lokakuuta", "marraskuuta", "joulukuuta"];

  /* Oppiaineet: tunnistus nimen alusta, kuvake ja väri. Muut aineet saavat värin nimen perusteella. */
  var SUBJECTS = [
    ["äidinkieli", "📖", "s1", "Äidinkieli"], ["äi", "📖", "s1"], ["suomi", "📖", "s1"], ["lukeminen", "📚", "s1"],
    ["matematiikka", "➗", "s2", "Matematiikka"], ["matikka", "➗", "s2"], ["ma ", "➗", "s2"],
    ["englanti", "💬", "s3", "Englanti"], ["ruotsi", "💬", "s3", "Ruotsi"], ["saksa", "💬", "s3"], ["ranska", "💬", "s3"], ["espanja", "💬", "s3"],
    ["ympäristöoppi", "🌱", "s4", "Ympäristöoppi"], ["ympäristö", "🌱", "s4"], ["yo", "🌱", "s4"], ["luonnontieto", "🔬", "s4"],
    ["historia", "🏛️", "s5", "Historia"], ["yhteiskuntaoppi", "🏛️", "s5", "Yhteiskuntaoppi"],
    ["uskonto", "🕊️", "s5", "Uskonto"], ["elämänkatsomustieto", "🕊️", "s5", "Elämänkatsomustieto"], ["et", "🕊️", "s5"], ["katsomus", "🕊️", "s5"],
    ["liikunta", "⚽", "s6", "Liikunta"], ["lii", "⚽", "s6"], ["uinti", "🏊", "s6"],
    ["musiikki", "🎵", "s7", "Musiikki"], ["mu", "🎵", "s7"],
    ["kuvataide", "🎨", "s7", "Kuvataide"], ["kuviksen", "🎨", "s7"], ["ku", "🎨", "s7"],
    ["käsityö", "🧵", "s8", "Käsityö"], ["kä", "🧵", "s8"], ["tekninen", "🔨", "s8"], ["tekstiili", "🧵", "s8"],
    ["ohjelmointi", "💻", "s2"], ["tvt", "💻", "s2"], ["kerho", "🧩", "s8"],
    ["oppilaanohjaus", "🧭", "s5"], ["luokanohjaus", "🧭", "s5"], ["luokan tunti", "🧭", "s5"], ["kirjasto", "📚", "s1"],
    ["ruokailu", "🍽️", "lunch", "Ruokailu"], ["ruoka", "🍽️", "lunch"], ["lounas", "🍽️", "lunch"],
    ["välitunti", "🛝", "break", "Välitunti"], ["retki", "🚌", "s4"]
  ];
  var SUBJECT_NAMES = SUBJECTS.filter(function (s) { return s[3]; }).map(function (s) { return s[3]; });

  function subject(name) {
    var n = String(name || "").trim(), low = n.toLowerCase();
    for (var i = 0; i < SUBJECTS.length; i++) {
      var k = SUBJECTS[i][0].trim();
      if (low === k || (k.length >= 4 && low.indexOf(k) === 0) || (k.length < 4 && low.indexOf(k + " ") === 0)) {
        return { name: n, icon: SUBJECTS[i][1], color: SUBJECTS[i][2] };
      }
    }
    var h = 0;
    for (var j = 0; j < low.length; j++) h = (h * 31 + low.charCodeAt(j)) >>> 0;
    return { name: n, icon: "✏️", color: "s" + (1 + h % 8) };
  }

  var DEFAULT_BELLS = [
    { start: "08:15", end: "09:00" }, { start: "09:15", end: "10:00" }, { start: "10:15", end: "11:00" },
    { start: "11:00", end: "11:30" }, { start: "11:45", end: "12:30" }, { start: "12:45", end: "13:30" }, { start: "13:45", end: "14:30" }
  ];
  var DEFAULTS = {
    className: "", place: "Turku", lat: 60.4518, lon: 22.2666,
    bells: DEFAULT_BELLS, timetable: {}, students: [], duty: { size: 2, mode: "week", offset: 0 },
    birthdays: "", homeNotes: "", visual: false
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseYmd(s) { var p = String(s).split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  function dow(d) { return (d.getDay() + 6) % 7; }
  function addDays(d, n) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + n); return x; }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }
  function monday(d) { return addDays(d, -dow(d)); }
  function toMin(hhmm) { var p = String(hhmm || "").split(/[:.]/); return p.length < 2 ? NaN : (+p[0]) * 60 + (+p[1]); }
  function fmt(hhmm) { var m = toMin(hhmm); return isNaN(m) ? "" : Math.floor(m / 60) + "." + pad(m % 60); }
  function nowMin(d) { d = d || new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  function shortDate(d) { return d.getDate() + "." + (d.getMonth() + 1) + "."; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function minus(n) { return String(n).replace("-", "−"); }

  function withDefaults(st) {
    var s = clone(DEFAULTS);
    st = st || {};
    for (var k in st) if (st[k] !== undefined && st[k] !== null) s[k] = st[k];
    if (!Array.isArray(s.bells) || !s.bells.length) s.bells = clone(DEFAULT_BELLS);
    if (!s.duty) s.duty = clone(DEFAULTS.duty);
    if (!Array.isArray(s.students)) s.students = [];
    return s;
  }

  /* Päivän tunnit: kellonajat (bells) + lukujärjestys[viikonpäivä][tunnin nro] */
  function lessonsFor(st, date) {
    var day = dow(date);
    if (day > 4) return [];
    var row = (st.timetable || {})[day] || [];
    var out = [];
    (st.bells || []).forEach(function (b, i) {
      var subj = String(row[i] || "").trim();
      if (!subj || isNaN(toMin(b.start)) || isNaN(toMin(b.end))) return;
      out.push({ start: b.start, end: b.end, s: toMin(b.start), e: toMin(b.end), subject: subj, slot: i });
    });
    out.sort(function (a, b) { return a.s - b.s; });
    return out;
  }
  function nextSchoolDate(st, from, includeSelf) {
    for (var i = includeSelf ? 0 : 1; i <= 14; i++) {
      var d = addDays(from, i);
      if (lessonsFor(st, d).length) return d;
    }
    for (i = includeSelf ? 0 : 1; i <= 7; i++) { d = addDays(from, i); if (dow(d) < 5) return d; }
    return addDays(from, 1);
  }

  /* Järjestäjät kiertävät oppilaslistan järjestyksessä viikoittain tai päivittäin. */
  var EPOCH = new Date(2024, 0, 1); // maanantai
  function dutyFor(st, date) {
    var list = (st.students || []).filter(Boolean), size = Math.max(1, Math.min(4, +((st.duty || {}).size) || 2));
    if (!list.length) return [];
    var mode = (st.duty || {}).mode === "day" ? "day" : "week", k;
    if (mode === "week") k = Math.round((monday(date) - EPOCH) / (7 * 864e5));
    else { var wk = Math.round((monday(date) - EPOCH) / (7 * 864e5)); k = wk * 5 + Math.min(dow(date), 4); }
    k += +((st.duty || {}).offset) || 0;
    var out = [], startIdx = ((k * size) % list.length + list.length) % list.length;
    for (var i = 0; i < Math.min(size, list.length); i++) out.push(list[(startIdx + i) % list.length]);
    return out;
  }

  /* Taustapalvelu */
  function configured() { return typeof BACKEND_URL === "string" && /^https:\/\/script\.google\.com\//.test(BACKEND_URL); }
  function parse(r) {
    return r.text().then(function (t) {
      var j; try { j = JSON.parse(t); } catch (e) { throw new Error("html"); }
      if (!j || j.ok === false) throw new Error((j && j.error) || "virhe");
      return j;
    });
  }
  function getState(key) {
    return fetch(BACKEND_URL + "?action=state&key=" + encodeURIComponent(key) + "&t=" + Date.now()).then(parse);
  }
  var IMG = {};
  function getImg(key, id) {
    if (!id) return Promise.resolve("");
    if (IMG[id]) return IMG[id];
    IMG[id] = fetch(BACKEND_URL + "?action=img&id=" + encodeURIComponent(id) + "&key=" + encodeURIComponent(key)).then(parse)
      .then(function (j) { return j.data || ""; }, function (e) { delete IMG[id]; throw e; });
    return IMG[id];
  }
  function getAll(key) {
    return fetch(BACKEND_URL + "?key=" + encodeURIComponent(key) + "&t=" + Date.now()).then(parse);
  }
  function post(key, body) {
    body.key = key;
    return fetch(BACKEND_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }).then(parse);
  }
  function errText(e) {
    var m = e && e.message;
    if (m === "key") return "Avain ei kelpaa. Tarkista kirjoitusasu.";
    if (m === "readonly") return "Tämä on luokan näytön avain. Muokkaamiseen tarvitaan opettajan avain.";
    if (m === "html") return "Taustapalvelu ei vastaa oikein. Onko Code.gs julkaistu verkkosovelluksena?";
    return "Ei yhteyttä. Tarkista nettiyhteys.";
  }
  /* Työtavat tehtäväkorttiin */
  var MODES = [
    ["", "", "Ei työtapaa"], ["alone", "🤫", "Yksin hiljaa"], ["whisper", "🤏", "Yksin, saa kuiskata"], ["pair", "👥", "Pareittain"],
    ["group", "🧑‍🤝‍🧑", "Ryhmissä"], ["ask", "🙋", "Kysy ensin kaverilta"], ["listen", "👂", "Kuuntele opettajaa"], ["move", "🚶", "Saa liikkua"]
  ];
  function mode(id) { for (var i = 0; i < MODES.length; i++) if (MODES[i][0] === id) return { id: id, icon: MODES[i][1], label: MODES[i][2] }; return { id: "", icon: "", label: "" }; }

  /* Syntymäpäivät tekstinä: "Aino 14.3." yksi per rivi */
  function birthdays(st) {
    return String(st.birthdays || "").split(/\r?\n/).map(function (l) {
      var m = l.trim().match(/^(.+?)[\s,:–-]+(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?$/);
      if (!m) return null;
      var d = +m[2], mo = +m[3];
      if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
      return { name: m[1].trim(), d: d, m: mo };
    }).filter(Boolean);
  }
  function nextBirthday(b, from) {
    var y = from.getFullYear(), d = new Date(y, b.m - 1, b.d);
    if (d < from) d = new Date(y + 1, b.m - 1, b.d);
    return d;
  }
  function daysBetween(a, b) { var x = new Date(a); x.setHours(0, 0, 0, 0); var y = new Date(b); y.setHours(0, 0, 0, 0); return Math.round((y - x) / 864e5); }

  /* Kuva puhelimesta: pienennetään ennen lähetystä */
  function resizeImage(file, max) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onerror = function () { rej(new Error("kuva")); };
      fr.onload = function () {
        var im = new Image();
        im.onerror = function () { rej(new Error("kuva")); };
        im.onload = function () {
          var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas");
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.82));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  return {
    DAYS: DAYS, DAYS_LONG: DAYS_LONG, MONTHS: MONTHS, SUBJECT_NAMES: SUBJECT_NAMES, DEFAULT_BELLS: DEFAULT_BELLS, DEFAULTS: DEFAULTS,
    subject: subject, pad: pad, ymd: ymd, parseYmd: parseYmd, dow: dow, addDays: addDays, isoWeek: isoWeek, monday: monday,
    toMin: toMin, fmt: fmt, nowMin: nowMin, shortDate: shortDate, cap: cap, esc: esc, clone: clone, lsGet: lsGet, lsSet: lsSet, minus: minus,
    withDefaults: withDefaults, lessonsFor: lessonsFor, nextSchoolDate: nextSchoolDate, dutyFor: dutyFor,
    configured: configured, getAll: getAll, getState: getState, getImg: getImg, MODES: MODES, mode: mode, birthdays: birthdays, nextBirthday: nextBirthday, daysBetween: daysBetween, resizeImage: resizeImage, post: post, errText: errText, newId: newId
  };
})();
