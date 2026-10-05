// Jednostavan preglednik fotografija preko cijelog zaslona
export function makeLightbox() {
  const lb = document.getElementById("lightbox"), img = document.getElementById("lb-img"), cnt = document.getElementById("lb-count");
  let list = [], idx = 0, sx = null;
  const show = () => { img.src = list[idx].src; img.alt = list[idx].alt || ""; cnt.textContent = `${idx + 1} / ${list.length}`; };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  const step = (d) => { idx = (idx + d + list.length) % list.length; show(); };
  document.getElementById("lb-close").onclick = close;
  document.getElementById("lb-prev").onclick = () => step(-1);
  document.getElementById("lb-next").onclick = () => step(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close(); if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1);
  });
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  return { open(l, i) { list = l; idx = i; show(); lb.classList.add("open"); document.body.style.overflow = "hidden"; } };
}
