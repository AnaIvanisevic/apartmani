import { lang as l0, href } from "./common.js?v=202610051619";
import { t } from "./i18n.js?v=202610051619";
import { JEDINICE } from "./podaci.js?v=202610051619";
import { unitCard, persons } from "./kartice.js?v=202610051619";
import { mountCalendar } from "./kalendar.js?v=202610051619";
import { key, today, nights, fmt, isFree, isISO } from "./zauzetost-util.js?v=202610051619";

let lang = l0;
let unit = 1;
const form = document.getElementById("search");
const tk = key(today());
form.od.min = tk; form.do.min = tk;
form.od.addEventListener("change", () => { form.do.min = form.od.value || tk; if (form.do.value && form.do.value <= form.od.value) form.do.value = ""; });

let last = null;
function search(od, dd, g) {
  last = { od, dd, g };
  const el = document.getElementById("results");
  if (!isISO(od) || !isISO(dd) || dd <= od || od < tk) { el.innerHTML = `<p class="av-msg">${t("s_invalid", lang)}</p>`; return; }
  const free = JEDINICE.filter((u) => u.osoba >= g && isFree(u.id, od, dd));
  const head = `<h2 class="section-h">${t("s_results", lang)}</h2>
    <p class="lead">${fmt(od, lang)} → ${fmt(dd, lang)} · ${nights(od, dd)} ${t("av_nights", lang)} · ${persons(g, lang)}</p>`;
  if (!free.length) {
    const q = new URLSearchParams({ lang, od, do: dd });
    el.innerHTML = head + `<div class="card"><p>${t("s_none", lang)}</p><a class="btn btn-primary" href="upit.html?${q}">${t("btn_inquiry", lang)}</a></div>`;
    return;
  }
  el.innerHTML = head + `<div class="unit-grid">${free.map((u) => {
    const q = new URLSearchParams({ lang, j: u.id, od, do: dd });
    return unitCard(u, lang, `<a class="btn btn-primary" href="upit.html?${q}">${t("av_send", lang)}</a>`);
  }).join("")}</div><p class="price-note">${t("price_note", lang)} ${t("inq_disclaimer", lang)}</p>`;
}
form.addEventListener("submit", () => {
  search(form.od.value, form.do.value, Number(form.g.value));
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
});

function renderTabs() {
  const el = document.getElementById("av-tabs");
  el.innerHTML = JEDINICE.map((u) => `<button class="tab ${u.id === unit ? "on" : ""}" data-id="${u.id}">${t("unit", lang)} ${u.id}</button>`).join("");
  el.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
    unit = Number(b.dataset.id); cal.setUnit(unit); renderTabs(); renderInfo();
    history.replaceState(null, "", `${location.pathname}${location.search}#jedinica-${unit}`);
  }));
}
function renderInfo() {
  const u = JEDINICE.find((x) => x.id === unit);
  document.getElementById("av-unit").innerHTML = `<h3>${t("unit", lang)} ${u.id}</h3>
    <p>${t("beds_" + u.tip, lang)} · ${persons(u.osoba, lang)} · <a href="apartman.html?lang=${lang}&j=${u.id}">${t("unit_open", lang)}</a></p>`;
}

const hm = location.hash.match(/jedinica-(\d)/);
if (hm && JEDINICE.some((u) => u.id === Number(hm[1]))) unit = Number(hm[1]);
const cal = mountCalendar(document.getElementById("av-calendar"), { unit, lang });
renderTabs(); renderInfo();

const qp = new URLSearchParams(location.search);
if (isISO(qp.get("od")) && isISO(qp.get("do"))) {
  form.od.value = qp.get("od"); form.do.value = qp.get("do");
  if (qp.get("g")) form.g.value = qp.get("g");
  search(form.od.value, form.do.value, Number(form.g.value));
}

document.addEventListener("langchange", (e) => {
  lang = e.detail; cal.setLang(lang); renderTabs(); renderInfo();
  if (last) search(last.od, last.dd, last.g);
});
