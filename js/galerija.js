import { lang as initialLang } from "./common.js?v=202610051553";
import { t } from "./i18n.js?v=202610051553";
import { FOTOGRAFIJE, JEDINICE } from "./podaci.js?v=202610051553";

let lang = initialLang;
const MAPE = ["zajednicko", ...JEDINICE.map((u) => `jedinica-${u.id}`)];
let active = "sve";
let list = [];       // trenutno prikazane slike (za lightbox)
let idx = 0;

function folderName(f) {
  if (f === "zajednicko") return t("ph_common", lang);
  return `${t("unit", lang)} ${f.split("-")[1]}`;
}
function photos(f) { return (FOTOGRAFIJE[f] || []).map((n) => ({ src: `fotografije/${f}/${n}`, folder: f })); }

function renderTabs() {
  const tabs = [["sve", t("ph_all", lang)], ...MAPE.map((f) => [f, folderName(f)])];
  const el = document.getElementById("tabs");
  el.innerHTML = tabs.map(([k, n]) => `<button class="tab ${k === active ? "on" : ""}" role="tab" aria-selected="${k === active}" data-k="${k}">${n}</button>`).join("");
  el.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
    active = b.dataset.k;
    history.replaceState(null, "", `${location.pathname}${location.search}${active === "sve" ? "" : "#" + active}`);
    render();
  }));
}

function renderGallery() {
  const el = document.getElementById("gallery");
  const groups = active === "sve" ? MAPE : [active];
  list = [];
  let html = "";
  groups.forEach((f) => {
    const p = photos(f);
    if (active === "sve" && p.length === 0) return;
    if (active === "sve") html += `<div class="gallery-group">${folderName(f)}</div>`;
    p.forEach((ph) => {
      html += `<button data-i="${list.length}" aria-label="${folderName(f)}"><img src="${ph.src}" alt="${folderName(f)}" loading="lazy"></button>`;
      list.push(ph);
    });
  });
  if (list.length === 0) html = `<div class="empty">${t("ph_empty", lang)}</div>`;
  if (active.startsWith("jedinica-")) {
    const u = JEDINICE.find((x) => `jedinica-${x.id}` === active);
    html = `<div class="unit-intro"><h2>${folderName(active)}</h2><p>${t("desc_" + u.tip, lang)}</p>
      <a class="btn btn-ghost" href="apartman.html?lang=${lang}&j=${u.id}">${t("unit_open", lang)}</a>
      <a class="btn btn-ghost" href="dostupnost.html?lang=${lang}#jedinica-${u.id}">${t("btn_avail", lang)}</a>
      <a class="btn btn-primary" href="upit.html?lang=${lang}&j=${u.id}">${t("unit_inquiry", lang)}</a></div>` + html;
  }
  el.innerHTML = html;
  el.querySelectorAll("button[data-i]").forEach((b) => b.addEventListener("click", () => open(Number(b.dataset.i))));
}

function render() { renderTabs(); renderGallery(); }

// ---------- Lightbox ----------
const lb = document.getElementById("lightbox"), img = document.getElementById("lb-img"), cnt = document.getElementById("lb-count");
function show() { img.src = list[idx].src; img.alt = folderName(list[idx].folder); cnt.textContent = `${idx + 1} / ${list.length}`; }
function open(i) { idx = i; show(); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
function step(d) { idx = (idx + d + list.length) % list.length; show(); }
document.getElementById("lb-close").onclick = close;
document.getElementById("lb-prev").onclick = () => step(-1);
document.getElementById("lb-next").onclick = () => step(1);
lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
let sx = null;
lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  if (sx == null) return;
  const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});

document.addEventListener("langchange", (e) => { lang = e.detail; render(); });

const h = location.hash.slice(1);
if (MAPE.includes(h)) active = h;
render();
