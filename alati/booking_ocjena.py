#!/usr/bin/env python3
"""Dohvaća ocjenu i broj recenzija s Booking.com stranice objekta i upisuje ih u js/ocjena.js.
Pokreće ga GitHub Actions svakih 5 dana (.github/workflows/booking-ocjena.yml).
Ako Booking ne vrati podatke, datoteka se ne mijenja (zadržava se zadnja poznata ocjena)."""
import json, re, sys, pathlib, datetime, urllib.request

URL = "https://www.booking.com/hotel/hr/apartmani-dorana.hr.html"
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "ocjena.js"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "hr,en;q=0.8",
}

def fetch():
    req = urllib.request.Request(URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def parse(html):
    # 1) strukturirani podaci (JSON-LD) – najpouzdanije
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        try:
            data = json.loads(block)
        except Exception:
            continue
        for d in (data if isinstance(data, list) else [data]):
            ar = d.get("aggregateRating") if isinstance(d, dict) else None
            if ar and ar.get("ratingValue") and (ar.get("reviewCount") or ar.get("ratingCount")):
                return float(str(ar["ratingValue"]).replace(",", ".")), int(ar.get("reviewCount") or ar.get("ratingCount"))
    # 2) rezervno: tekst stranice
    m = re.search(r'"reviewScore"\s*:\s*([\d.]+).{0,200}?"reviewsCount"\s*:\s*(\d+)', html, re.S)
    if m:
        return float(m.group(1)), int(m.group(2))
    return None

def fetch_browser():
    """Booking prvo prikazuje JavaScript provjeru za robote – pravi preglednik je prođe sam."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(user_agent=HEADERS["User-Agent"], locale="hr-HR")
        pg.goto(URL, wait_until="domcontentloaded", timeout=60000)
        try:
            pg.wait_for_selector('script[type="application/ld+json"]', state="attached", timeout=30000)
        except Exception:
            pass
        html = pg.content()
        b.close()
        return html

def main():
    res = None
    try:
        res = parse(fetch())
    except Exception as e:
        print("Izravni zahtjev nije uspio:", e)
    if not res:
        try:
            res = parse(fetch_browser())
        except Exception as e:
            print("Preglednik nije uspio:", e)
    if not res:
        print("Ocjena nije pronađena (Booking je možda prikazao provjeru za robote). Zadržavam staru vrijednost."); return 0
    ocjena, n = res
    if not (1 <= ocjena <= 10 and n > 0):
        print("Neispravni podaci:", res); return 0
    today = datetime.date.today().isoformat()
    OUT.write_text(
        "// Ocjena s Bookinga – ovu datoteku automatski osvježava GitHub (svakih 5 dana).\n"
        "// Ako provjera ne uspije, ostaje zadnja poznata vrijednost.\n"
        f'export const OCJENA = {{ ocjena: {ocjena}, recenzija: {n}, azurirano: "{today}" }};\n', encoding="utf-8")
    print(f"Ocjena {ocjena}, recenzija {n}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
