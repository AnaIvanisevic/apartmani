// Kartice apartmana i statični raspored po katovima
import { t } from "./i18n.js?v=202610051553";
import { JEDINICE, KATOVI, FOTOGRAFIJE } from "./podaci.js?v=202610051553";

const OSOBE = {
  hr: { one: "osoba", few: "osobe", other: "osoba" }, en: { one: "guest", other: "guests" },
  de: { one: "Person", other: "Personen" }, it: { one: "persona", other: "persone" },
  sl: { one: "oseba", two: "osebi", few: "osebe", other: "oseb" }, pl: { one: "osoba", few: "osoby", many: "osób", other: "osoby" },
  cs: { one: "osoba", few: "osoby", other: "osob" }, sk: { one: "osoba", few: "osoby", other: "osôb" },
};
export function persons(n, lang) {
  const f = OSOBE[lang] || OSOBE.en;
  const k = new Intl.PluralRules(lang).select(n);
  return `${n} ${f[k] || f.other}`;
}
export const floorName = (k, lang) => t(KATOVI[k].naziv, lang);
export const cover = (u) => `fotografije/jedinica-${u.id}/${u.naslovna || (FOTOGRAFIJE[`jedinica-${u.id}`] || [])[0] || ""}`;
export const unitHref = (u, lang) => `apartman.html?lang=${lang}&j=${u.id}`;

const ICO = {
  guests: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.7 5.5 5.8"/>',
  floor: '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
  bed: '<path d="M3 18v-6h18v6M3 12V7M21 12V9a2 2 0 0 0-2-2h-7v5"/><path d="M3 18v2M21 18v2"/>',
  balc: '<path d="M3 11h18M5 11v9M9 11v9M12 11v9M15 11v9M19 11v9M3 20h18"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;

export function unitCard(u, lang, extra = "") {
  return `<article class="unit-card"><a class="uc-link" href="${unitHref(u, lang)}">
    <div class="uc-img"><img src="${cover(u)}" alt="${t("unit", lang)} ${u.id}" loading="lazy"><span class="uc-num" style="background:${u.boja}">${u.id}</span></div>
    <div class="uc-body">
      <h3>${t("unit", lang)} ${u.id}</h3>
      <ul class="uc-facts">
        <li>${icon("guests")}${persons(u.osoba, lang)}</li>
        <li>${icon("floor")}${floorName(u.kat, lang)}</li>
        <li>${icon("bed")}${t("beds_" + u.tip, lang)}</li>
        <li>${icon("balc")}${t(u.strana === "ulica" ? "balc_street" : "balc_sea", lang)}</li>
      </ul>
      <span class="uc-more">${t("unit_open", lang)} →</span>
    </div>
  </a>${extra ? `<div class="uc-actions">${extra}</div>` : ""}</article>`;
}

// Statični raspored: etaže odozgo prema dolje, ulaz na polukatu
export function layoutHTML(lang, activeId = null) {
  const levels = KATOVI.map((k, i) => i).filter((i) => KATOVI[i].gosti !== false).reverse();
  const ENTRY = 2;
  return `<div class="layout">${levels.map((lv) => {
    const us = JEDINICE.filter((u) => u.kat === lv).sort((a, b) => b.tlocrt.z0 - a.tlocrt.z0);
    return `<div class="ly-row${lv === ENTRY ? " ly-entry" : ""}">
      <div class="ly-floor">${floorName(lv, lang)}</div>
      <div class="ly-units">${us.map((u) => `<a href="${unitHref(u, lang)}" class="ly-unit${u.id === activeId ? " on" : ""}" style="--c:${u.boja}">
          <strong>${t("unit", lang)} ${u.id}</strong><span>${persons(u.osoba, lang)} · ${t(u.strana === "ulica" ? "side_street" : "side_sea", lang)}</span></a>`).join("")}</div>
      ${lv === ENTRY ? `<div class="ly-door">← ${t("entry_here", lang)}</div>` : `<div class="ly-door ly-stairs">${lv < ENTRY ? "↓" : "↑"}</div>`}
    </div>`;
  }).join("")}</div>`;
}
