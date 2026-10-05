#!/usr/bin/env python3
"""Dodaje ?v=<verzija> na sve lokalne .js/.css poveznice i importe,
da preglednici nakon svake objave učitaju nove datoteke (cache-busting).
Pokretanje:  python3 alati/verzija.py   (iz korijena projekta)"""
import re, pathlib, time
root = pathlib.Path(__file__).resolve().parent.parent
v = time.strftime("%Y%m%d%H%M")
pat = re.compile(r'''((?:src|href)="|from\s+"|import\(\s*"|"three":\s*")((?:\./|\.\./)?(?:js|css|vendor|[\w-]+)[^"?]*?\.(?:js|css))(?:\?v=\w+)?"''')
def fix(path):
    s = path.read_text(encoding="utf-8")
    n = pat.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={v}"' if not m.group(2).startswith("http") else m.group(0), s)
    if n != s:
        path.write_text(n, encoding="utf-8")
for f in list(root.glob("*.html")) + [p for p in root.glob("js/**/*.js") if "three.module" not in p.name]:
    fix(f)
print("verzija", v)
