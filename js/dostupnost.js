import { lang as l0, href } from "./common.js?v=202610051512";
import { t } from "./i18n.js?v=202610051512";
import { JEDINICE } from "./podaci.js?v=202610051512";
import { ZAUZETO, AZURIRANO } from "./zauzetost.js?v=202610051512";

let lang = l0;
let unit = 1;
let offset = 0;                 // pomak u mjesecima od tekućeg
let arr = null, dep = null;     // odabrani dolazak / odlazak (string GGGG-MM-DD)
let msg = "";

const pad = (n) => String(n).padStart(2, "0");
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); })();
const todayKey = key(today);

function busyNights(id) {
  const set = new Set();
  (ZAUZETO[id] || []).forEach(([a, b]) => {
    for (let d = parse(a); key(d) < b; d.setDate(d.getDate() + 1)) set.add(key(d));
  });
  return set;
}
let busy = busyNights(unit);

function nightsBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
function rangeFree(a, b) {
  for (let d = parse(a); key(d) < b; d.setDate(d.getDate() + 1)) if (busy.has(key(d))) return false;
  return true;
}
function fmt(s) { return parse(s).toLocaleDateString(lang, { day: "numeric", month: "numeric", year: "numeric" }); }

function monthsToShow() { return window.innerWidth < 640 ? 1 : window.innerWidth < 1000 ? 2 : 3; }

function renderTabs() {
  const el = document.getElementById("av-tabs");
  el.innerHTML = JEDINICE.map((u) =>
    `<button class="tab ${u.id === unit ? "on" : ""}" data-id="${u.id}">${t("unit", lang)} ${u.id}</button>`).join("");
  el.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
    unit = Number(b.dataset.id); busy = busyNights(unit); arr = dep = null; msg = "";
    history.replaceState(null, "", `${location.pathname}${location.search}#jedinica-${unit}`);
    render();
  }));
}

function renderInfo() {
  const u = JEDINICE.find((x) => x.id === unit);
  document.getElementById("av-unit").innerHTML =
    `<h2>${t("unit", lang)} ${u.id}</h2><p>${t("desc_" + u.tip, lang)}</p>
     <p class="av-meta">${t("guests", lang)}: <strong>${u.osoba ?? "—"}</strong> · ${t(u.strana === "ulica" ? "side_street" : "side_sea", lang)}
      · <a href="${href("fotografije.html")}#jedinica-${u.id}">${t("nav_photos", lang)}</a>
      · <a href="${href("kuca-3d.html")}#jedinica-${u.id}">${t("nav_3d", lang)}</a></p>`;
}

function weekdayNames() {
  return [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "short" }));
}

function renderCalendars() {
  const wd = weekdayNames();
  const n = monthsToShow();
  let html = "";
  for (let k = 0; k < n; k++) {
    const first = new Date(today.getFullYear(), today.getMonth() + offset + k, 1);
    const title = first.toLocaleDateString(lang, { month: "long", year: "numeric" });
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    let cells = wd.map((w) => `<div class="cal-wd">${w}</div>`).join("") + "<div></div>".repeat(lead);
    for (let d = 1; d <= days; d++) {
      const dk = key(new Date(first.getFullYear(), first.getMonth(), d));
      const cls = ["cal-day"];
      if (dk < todayKey) cls.push("past");
      else if (busy.has(dk)) cls.push("busy");
      else cls.push("free");
      if (arr && dk === arr) cls.push("sel", "sel-start");
      if (dep && dk === dep) cls.push("sel", "sel-end");
      if (arr && dep && dk > arr && dk < dep) cls.push("sel-mid");
      cells += `<button class="${cls.join(" ")}" data-d="${dk}" ${dk < todayKey ? "disabled" : ""}>${d}</button>`;
    }
    html += `<div class="cal"><div class="cal-title">${title}</div><div class="cal-grid">${cells}</div></div>`;
  }
  const el = document.getElementById("av-cal");
  el.innerHTML = html;
  el.querySelectorAll(".cal-day:not([disabled])").forEach((b) => b.addEventListener("click", () => pick(b.dataset.d)));
  document.getElementById("av-prev").disabled = offset <= 0;
}

function pick(d) {
  msg = "";
  if (!arr || dep || d <= arr) {
    if (busy.has(d)) { arr = dep = null; msg = t("av_conflict", lang); }
    else { arr = d; dep = null; }
  } else {
    if (rangeFree(arr, d)) dep = d;
    else { msg = t("av_conflict", lang); }
  }
  render();
}

function renderSelection() {
  const el = document.getElementById("av-sel");
  let s = "";
  if (!arr) s = `<span>${t("av_pick1", lang)}</span>`;
  else if (!dep) s = `<span><strong>${fmt(arr)}</strong> → … · ${t("av_pick2", lang)}</span>`;
  else {
    const q = new URLSearchParams({ lang, j: unit, od: arr, do: dep });
    s = `<span>${t("av_sel", lang)}: <strong>${fmt(arr)} → ${fmt(dep)}</strong> · ${nightsBetween(arr, dep)} ${t("av_nights", lang)}</span>
      <a class="btn btn-primary" href="upit.html?${q}">${t("av_send", lang)}</a>`;
  }
  if (arr) s += `<button class="btn btn-ghost" id="av-clear">${t("av_clear", lang)}</button>`;
  if (msg) s += `<span class="av-msg">${msg}</span>`;
  el.innerHTML = s;
  const c = document.getElementById("av-clear");
  if (c) c.addEventListener("click", () => { arr = dep = null; msg = ""; render(); });
}

function render() {
  renderTabs(); renderInfo(); renderCalendars(); renderSelection();
  document.getElementById("av-updated").textContent = `${t("av_updated", lang)}: ${fmt(AZURIRANO)}`;
}

document.getElementById("av-prev").addEventListener("click", () => { if (offset > 0) { offset--; renderCalendars(); } });
document.getElementById("av-next").addEventListener("click", () => { if (offset < 23) { offset++; renderCalendars(); } });
document.addEventListener("langchange", (e) => { lang = e.detail; render(); });
let lastN = monthsToShow();
window.addEventListener("resize", () => { const n = monthsToShow(); if (n !== lastN) { lastN = n; renderCalendars(); } });

const hm = location.hash.match(/jedinica-(\d)/) || location.search.match(/[?&]j=(\d)/);
if (hm && JEDINICE.some((u) => u.id === Number(hm[1]))) { unit = Number(hm[1]); busy = busyNights(unit); }
render();
