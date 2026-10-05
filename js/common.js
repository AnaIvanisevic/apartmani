import { JEZICI, getLang, setLang, applyI18n, t } from "./i18n.js?v=202610051548";
import { KONTAKT, LOKACIJA } from "./podaci.js?v=202610051548";

export let lang = getLang();

const PAGES = [
  ["index.html", "nav_home"],
  ["apartmani.html", "nav_units"],
  ["kuca-3d.html", "nav_3d"],
  ["fotografije.html", "nav_photos"],
  ["sadrzaji.html", "nav_amen"],
  ["dostupnost.html", "nav_avail"],
  ["lokacija.html", "nav_contact"],
  ["upit.html", "nav_inquiry", "nav-cta"],
];

const LOGO = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="19" fill="#c0623b"/>
  <path d="M8 23 L20 12 L32 23" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M11 22 V30 H29 V22" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M6 33 Q13 30 20 33 T34 33" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
</svg>`;

function current() {
  let p = location.pathname.split("/").pop() || "index.html";
  if (p === "apartman.html") p = "apartmani.html";
  return p === "" ? "index.html" : p;
}

export function href(page) { return `${page}?lang=${lang}`; }

function buildHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const cur = current();
  el.className = "site-header";
  el.innerHTML = `<div class="wrap">
      <a class="brand" href="${href("index.html")}">${LOGO}<span class="brand-name">Apartmani Dorana</span></a>
      <nav class="nav" id="nav">${PAGES.map(([p, k, c]) =>
        `<a href="${href(p)}" data-i18n="${k}" class="${[c, p === cur ? "active" : ""].filter(Boolean).join(" ")}"${p === cur ? ' aria-current="page"' : ""}></a>`).join("")}</nav>
      <select class="lang-select" id="lang-select" aria-label="Language">${JEZICI.map(([c, s, n]) =>
        `<option value="${c}" ${c === lang ? "selected" : ""} title="${n}">${s}</option>`).join("")}</select>
      <button class="menu-btn" id="menu-btn" aria-label="Menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>`;
  const nav = el.querySelector("#nav"), btn = el.querySelector("#menu-btn");
  btn.addEventListener("click", () => {
    const o = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", o);
  });
  el.querySelector("#lang-select").addEventListener("change", (e) => {
    lang = e.target.value;
    setLang(lang);
    el.querySelectorAll(".nav a, .brand").forEach((a) => {
      const u = new URL(a.href); u.searchParams.set("lang", lang); a.href = u;
    });
    applyI18n(lang);
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  });
}

function buildFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "site-footer";
  el.innerHTML = `<div class="wrap">
    <div><strong>Apartmani Dorana</strong><br><span data-i18n="footer_note"></span><br>${LOKACIJA.adresa}</div>
    <div>${KONTAKT.telefon ? `<a href="tel:${KONTAKT.telefon.replace(/\s/g, "")}">${KONTAKT.telefon}</a><br>` : ""}
      ${KONTAKT.email ? `<a href="mailto:${KONTAKT.email}">${KONTAKT.email}</a><br>` : ""}
      © ${new Date().getFullYear()} Apartmani Dorana</div>
  </div>`;
}

function setTitle() {
  const k = document.body.dataset.title;
  if (k) document.title = `${t(k, lang)} – Apartmani Dorana`;
}

export function fixLinks(root = document) {
  root.querySelectorAll("[data-page]").forEach((a) => { a.href = href(a.dataset.page) + (a.dataset.hash || ""); });
}

buildHeader();
buildFooter();
applyI18n(lang);
fixLinks();
setTitle();
document.addEventListener("langchange", () => { fixLinks(); setTitle(); });
