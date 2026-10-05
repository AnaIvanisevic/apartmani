import { lang as initialLang } from "./common.js?v=202610051512";
import { t } from "./i18n.js?v=202610051512";
import { KONTAKT, LOKACIJA, JEDINICE } from "./podaci.js?v=202610051512";

let lang = initialLang;
const { lat, lng } = LOKACIJA;
const d = 0.006;

const $ = (id) => document.getElementById(id);
if ($("map")) {
  $("map").src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d * 0.6}%2C${lng + d}%2C${lat + d * 0.6}&layer=mapnik&marker=${lat}%2C${lng}`;
  $("address").textContent = LOKACIJA.adresa;
  $("directions").href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function renderDirect() {
  const parts = [`<strong>${t("host", lang)}:</strong> ${KONTAKT.domacica}`];
  if (KONTAKT.telefon) parts.push(`<a href="tel:${KONTAKT.telefon.replace(/\s/g, "")}">${KONTAKT.telefon}</a> · <a href="https://wa.me/${KONTAKT.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (KONTAKT.email) parts.push(`<a href="mailto:${KONTAKT.email}">${KONTAKT.email}</a>`);
  if ($("direct")) $("direct").innerHTML = parts.join("<br>");
}

const sel = document.getElementById("unit-select");
function renderUnits() {
  if (!sel) return;
  const v = sel.value;
  sel.innerHTML = `<option value="">${t("f_any", lang)}</option>` +
    JEDINICE.map((u) => `<option value="${u.id}">${t("unit", lang)} ${u.id}</option>`).join("");
  sel.value = v;
}

function fmtDate(s) {
  if (!s) return "";
  const [y, m, dd] = s.split("-");
  return `${dd}.${m}.${y}.`;
}

function message() {
  const f = new FormData(document.getElementById("form"));
  const L = (k) => t(k, lang);
  const lines = [L("msg_hello"), ""];
  if (f.get("name")) lines.push(`${L("f_name")}: ${f.get("name")}`);
  if (f.get("arrive") || f.get("depart")) lines.push(`${L("f_arrive")}: ${fmtDate(f.get("arrive"))}  →  ${L("f_depart")}: ${fmtDate(f.get("depart"))}`);
  lines.push(`${L("f_adults")}: ${f.get("adults") || "-"}, ${L("f_kids")}: ${f.get("kids") || "0"}`);
  lines.push(`${L("f_unit")}: ${f.get("unit") ? L("unit") + " " + f.get("unit") : L("f_any")}`);
  if (f.get("msg")) lines.push("", f.get("msg"));
  return lines.join("\n");
}

if (sel) document.getElementById("send-wa").addEventListener("click", () => {
  window.open(`https://wa.me/${KONTAKT.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener");
});
if (sel) document.getElementById("send-mail").addEventListener("click", () => {
  const subj = `Upit / Inquiry – Apartmani Dorana`;
  location.href = `mailto:${KONTAKT.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(message())}`;
});

document.addEventListener("langchange", (e) => { lang = e.detail; renderUnits(); renderDirect(); });

renderUnits();
renderDirect();
const qp = new URLSearchParams(location.search);
const hm = location.hash.match(/upit-(\d)/);
if (sel) {
  const j = qp.get("j") || (hm && hm[1]);
  if (j) sel.value = j;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(qp.get("od") || "")) document.querySelector('[name="arrive"]').value = qp.get("od");
  if (iso.test(qp.get("do") || "")) document.querySelector('[name="depart"]').value = qp.get("do");
}
