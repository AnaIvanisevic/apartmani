// Pomoćne funkcije za datume i zauzetost
import { BOOKING } from "./zauzetost-booking.js?v=202610061551";
import { ZAUZETO } from "./zauzetost.js?v=202610061551";

export const pad = (n) => String(n).padStart(2, "0");
export const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
export const nights = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const fmt = (s, lang) => parse(s).toLocaleDateString(lang, { day: "numeric", month: "numeric", year: "numeric" });
export const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

export function busyNights(id) {
  const set = new Set();
  [...(ZAUZETO[id] || []), ...((BOOKING.termini || {})[String(id)] || [])].forEach(([a, b]) => {
    for (let d = parse(a); key(d) < b; d.setDate(d.getDate() + 1)) set.add(key(d));
  });
  return set;
}

export function isFree(id, a, b) {
  const busy = busyNights(id);
  for (let d = parse(a); key(d) < b; d.setDate(d.getDate() + 1)) if (busy.has(key(d))) return false;
  return true;
}

// Datum zadnjeg osvježavanja: noviji od ručnog i Booking datuma
export function lastUpdated(manual) {
  const b = BOOKING.azurirano ? BOOKING.azurirano.slice(0, 10) : null;
  return b && b > manual ? b : manual;
}
