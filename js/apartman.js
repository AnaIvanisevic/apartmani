import { lang as l0, href } from "./common.js?v=202610051620";
import { t } from "./i18n.js?v=202610051620";
import { JEDINICE, FOTOGRAFIJE } from "./podaci.js?v=202610051620";
import { floorName, layoutHTML, unitHref, persons } from "./kartice.js?v=202610051620";
import { mountCalendar } from "./kalendar.js?v=202610051620";
import { makeLightbox } from "./lightbox.js?v=202610051620";

let lang = l0;
const qp = new URLSearchParams(location.search);
const id = Number(qp.get("j")) || 1;
const u = JEDINICE.find((x) => x.id === id) || JEDINICE[0];
const photos = (FOTOGRAFIJE[`jedinica-${u.id}`] || []).map((n) => ({ src: `fotografije/jedinica-${u.id}/${n}` }));
const lb = makeLightbox();

function render() {
  document.title = `${t("unit", lang)} ${u.id} – Apartmani Dorana`;
  const i = JEDINICE.indexOf(u), prev = JEDINICE[(i + 7) % 8], next = JEDINICE[(i + 1) % 8];
  document.getElementById("ap-pn").innerHTML =
    `<a href="${unitHref(prev, lang)}">‹ ${t("unit", lang)} ${prev.id}</a><a href="${unitHref(next, lang)}">${t("unit", lang)} ${next.id} ›</a>`;
  document.getElementById("ap-head").innerHTML = `
    <div class="ap-title"><span class="uc-num" style="background:${u.boja}">${u.id}</span><h1>${t("unit", lang)} ${u.id}</h1></div>
    <p class="lead">${t("desc_" + u.tip, lang)}</p>
    <div class="ap-chips">
      <span>${persons(u.osoba, lang)}</span><span>${floorName(u.kat, lang)}</span>
      <span>${t("beds_" + u.tip, lang)}</span><span>${t(u.strana === "ulica" ? "balc_street" : "balc_sea", lang)}</span>
      <span>${t("price_short", lang)}</span>
    </div>
    <div class="btn-row">
      <a class="btn btn-primary" href="${href("upit.html")}&j=${u.id}">${t("unit_inquiry", lang)}</a>
      <a class="btn btn-ghost" href="#ap-calendar">${t("up_avail", lang)}</a>
      <a class="btn btn-ghost" href="${href("kuca-3d.html")}#jedinica-${u.id}">${t("nav_3d", lang)}</a>
    </div>`;
  const g = document.getElementById("ap-gallery");
  g.innerHTML = photos.map((p, k) => `<button data-k="${k}"><img src="${p.src}" alt="${t("unit", lang)} ${u.id}" loading="${k < 3 ? "eager" : "lazy"}"></button>`).join("");
  g.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => lb.open(photos, Number(b.dataset.k))));
  document.getElementById("ap-layout").innerHTML = layoutHTML(lang, u.id);
}

const cal = mountCalendar(document.getElementById("ap-calendar"), { unit: u.id, lang });
document.addEventListener("langchange", (e) => { lang = e.detail; render(); cal.setLang(lang); });
render();
