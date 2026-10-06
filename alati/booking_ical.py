#!/usr/bin/env python3
"""Povlači Booking.com iCal kalendare (izvoz) za svaki apartman i upisuje zauzete termine u js/zauzetost-booking.js.
Linkovi se čuvaju kao GitHub tajna BOOKING_ICAL, jedan po retku u obliku:
    1=https://admin.booking.com/hotel/hoteladmin/ical.html?t=...
    2=https://...
Pokreće ga GitHub Actions svakih 30 minuta (.github/workflows/booking-kalendar.yml).
Ako neki kalendar nije dostupan, za tu jedinicu ostaju zadnji poznati termini."""
import os, re, sys, json, pathlib, datetime, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "zauzetost-booking.js"

def load_old():
    try:
        m = re.search(r"export const BOOKING = (\{.*\});", OUT.read_text(encoding="utf-8"), re.S)
        return json.loads(m.group(1))
    except Exception:
        return {"termini": {}, "azurirano": None}

def parse_links(raw):
    links = {}
    for line in raw.splitlines():
        line = line.strip()
        m = re.match(r"^(\d+)\s*[=:]\s*(https?://\S+)$", line)
        if m:
            links.setdefault(m.group(1), []).append(m.group(2))
    return links

def ical_date(v):
    v = v.strip()[:8]
    return f"{v[:4]}-{v[4:6]}-{v[6:8]}"

def fetch_ranges(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (apartmani-dorana kalendar)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8", "replace")
    if "BEGIN:VCALENDAR" not in text:
        raise ValueError("odgovor nije iCal kalendar")
    text = re.sub(r"\r?\n[ \t]", "", text)          # spoji prelomljene retke
    ranges = []
    for ev in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", text, re.S):
        s = re.search(r"^DTSTART[^:]*:(\d{8})", ev, re.M)
        e = re.search(r"^DTEND[^:]*:(\d{8})", ev, re.M)
        if s:
            a = ical_date(s.group(1))
            b = ical_date(e.group(1)) if e else (datetime.date.fromisoformat(a) + datetime.timedelta(days=1)).isoformat()
            if b > a:
                ranges.append([a, b])
    return ranges

def main():
    links = parse_links(os.environ.get("BOOKING_ICAL", ""))
    if not links:
        print("Tajna BOOKING_ICAL nije postavljena – nema što povući."); return 0
    old = load_old()
    termini = dict(old.get("termini", {}))
    today = datetime.date.today().isoformat()
    ok = 0
    for unit, urls in sorted(links.items()):
        try:
            rs = []
            for u in urls:
                rs += fetch_ranges(u)
            termini[unit] = sorted([r for r in rs if r[1] >= today])
            ok += 1
            print(f"Apartman {unit}: {len(termini[unit])} termina")
        except Exception as e:
            print(f"Apartman {unit}: kalendar nije dostupan ({e}) – zadržavam stare termine")
    if ok == 0:
        print("Nijedan kalendar nije dostupan."); return 0
    new = {"termini": termini, "azurirano": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ")}
    if new["termini"] == old.get("termini"):
        print("Nema promjena u zauzetosti."); return 0
    OUT.write_text(
        "// Zauzetost povučena s Bookinga – ovu datoteku automatski osvježava GitHub (svakih 30 min).\n"
        "// Ne mijenjati ručno; ručni termini idu u zauzetost.js\n"
        f"export const BOOKING = {json.dumps(new, ensure_ascii=False)};\n", encoding="utf-8")
    print("Zauzetost osvježena.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
