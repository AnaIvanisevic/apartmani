// Kalendar zauzetosti jednog apartmana (koristi se na stranicama Dostupnost i Apartman)
import { t } from "./i18n.js?v=202610061551";
import { AZURIRANO } from "./zauzetost.js?v=202610061551";
import { key, parse, today, nights, fmt, busyNights, lastUpdated } from "./zauzetost-util.js?v=202610061551";

export function mountCalendar(root, opts) {
  let unit = opts.unit, lang = opts.lang;
  let offset = 0, arr = null, dep = null, msg = "";
  let busy = busyNights(unit);
  const T0 = today(), tk = key(T0);

  root.classList.add("avcal");
  root.innerHTML = `
    <div class="av-nav">
      <button class="lb-btn av-arrow" data-a="prev" aria-label="‹">‹</button>
      <label class="av-month"><span></span><select></select></label>
      <button class="lb-btn av-arrow" data-a="next" aria-label="›">›</button>
    </div>
    <div class="av-legend"></div>
    <div class="av-cal"></div>
    <div class="av-sel"></div>
    <p class="av-updated"></p>`;
  const $ = (s) => root.querySelector(s);

  const nMonths = () => (root.clientWidth < 560 ? 1 : root.clientWidth < 900 ? 2 : 3);

  function renderNav() {
    $(".av-month span").textContent = t("s_month", lang);
    const sel = $(".av-month select");
    sel.innerHTML = [...Array(24)].map((_, i) => {
      const d = new Date(T0.getFullYear(), T0.getMonth() + i, 1);
      return `<option value="${i}">${d.toLocaleDateString(lang, { month: "long", year: "numeric" })}</option>`;
    }).join("");
    sel.value = String(offset);
    $(".av-legend").innerHTML = `<span><i class="lg free"></i>${t("av_free", lang)}</span>
      <span><i class="lg busy"></i>${t("av_busy", lang)}</span><span><i class="lg sel"></i>${t("av_sel", lang)}</span>`;
    $('[data-a="prev"]').disabled = offset <= 0;
    $('[data-a="next"]').disabled = offset >= 23;
  }

  function renderCal() {
    const wd = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "short" }));
    let html = "";
    for (let k = 0; k < nMonths(); k++) {
      const first = new Date(T0.getFullYear(), T0.getMonth() + offset + k, 1);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      let cells = wd.map((w) => `<div class="cal-wd">${w}</div>`).join("") + "<div></div>".repeat(lead);
      for (let d = 1; d <= days; d++) {
        const dk = key(new Date(first.getFullYear(), first.getMonth(), d));
        const c = ["cal-day", dk < tk ? "past" : busy.has(dk) ? "busy" : "free"];
        if (dk === arr) c.push("sel");
        if (dk === dep) c.push("sel");
        if (arr && dep && dk > arr && dk < dep) c.push("sel-mid");
        cells += `<button class="${c.join(" ")}" data-d="${dk}" ${dk < tk ? "disabled" : ""}>${d}</button>`;
      }
      html += `<div class="cal"><div class="cal-title">${first.toLocaleDateString(lang, { month: "long", year: "numeric" })}</div><div class="cal-grid">${cells}</div></div>`;
    }
    $(".av-cal").innerHTML = html;
    root.querySelectorAll(".cal-day:not([disabled])").forEach((b) => b.addEventListener("click", () => pick(b.dataset.d)));
  }

  function rangeFree(a, b) {
    for (let d = parse(a); key(d) < b; d.setDate(d.getDate() + 1)) if (busy.has(key(d))) return false;
    return true;
  }
  function pick(d) {
    msg = "";
    if (!arr || dep || d <= arr) {
      if (busy.has(d)) { arr = dep = null; msg = t("av_conflict", lang); } else { arr = d; dep = null; }
    } else if (rangeFree(arr, d)) dep = d;
    else msg = t("av_conflict", lang);
    renderCal(); renderSel();
  }

  function renderSel() {
    let s;
    if (!arr) s = `<span>${t("av_pick1", lang)}</span>`;
    else if (!dep) s = `<span><strong>${fmt(arr, lang)}</strong> → … · ${t("av_pick2", lang)}</span>`;
    else {
      const q = new URLSearchParams({ lang, j: unit, od: arr, do: dep });
      s = `<span>${t("av_sel", lang)}: <strong>${fmt(arr, lang)} → ${fmt(dep, lang)}</strong> · ${nights(arr, dep)} ${t("av_nights", lang)}</span>
        <a class="btn btn-primary" href="upit.html?${q}">${t("av_send", lang)}</a>`;
    }
    if (arr) s += `<button class="btn btn-ghost av-clear">${t("av_clear", lang)}</button>`;
    if (msg) s += `<span class="av-msg">${msg}</span>`;
    s += `<span class="av-hint">${t("price_note", lang)} ${t("inq_disclaimer", lang)}</span>`;
    $(".av-sel").innerHTML = s;
    const c = root.querySelector(".av-clear");
    if (c) c.addEventListener("click", () => { arr = dep = null; msg = ""; renderCal(); renderSel(); });
    $(".av-updated").textContent = `${t("av_updated", lang)}: ${fmt(lastUpdated(AZURIRANO), lang)}`;
  }

  function render() { renderNav(); renderCal(); renderSel(); }

  $('[data-a="prev"]').addEventListener("click", () => { if (offset > 0) { offset--; render(); } });
  $('[data-a="next"]').addEventListener("click", () => { if (offset < 23) { offset++; render(); } });
  $(".av-month select").addEventListener("change", (e) => { offset = Number(e.target.value); render(); });
  let lastN = 0;
  new ResizeObserver(() => { const n = nMonths(); if (n !== lastN) { lastN = n; renderCal(); } }).observe(root);

  render();
  return {
    setUnit(id) { unit = id; busy = busyNights(id); arr = dep = null; msg = ""; render(); },
    setLang(l) { lang = l; render(); },
    setRange(a, b) { arr = a; dep = b; const d = parse(a); offset = Math.max(0, (d.getFullYear() - T0.getFullYear()) * 12 + d.getMonth() - T0.getMonth()); render(); },
  };
}
