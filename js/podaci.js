// =====================================================================
//  PODACI O APARTMANIMA — ovdje se mijenja sadržaj stranice.
//  (Tekstovi sučelja i prijevodi su u js/i18n.js)
// =====================================================================

export const KONTAKT = {
  email: "apartmanidorana@gmail.com",
  whatsapp: "385914238205",       // međunarodni format bez + i razmaka
  telefon: "+385 91 4238 205",    // za prikaz
  domacica: "Sandra",
};

export const LOKACIJA = {
  adresa: "don Ive Prodana 17, 23235 Vrsi, Hrvatska",
  lat: 44.265808,
  lng: 15.2087186,
};

// ---------------------------------------------------------------------
//  JEDINICE
//  kat: 0 = prizemlje, 1 = 1. kat, 2 = 2. kat
//  tlocrt: pravokutnik u metrima unutar kuće (x: zapad -> istok, z: sjever -> jug)
//          kuća ide od x -6.5 do 6.5 i od z -5.25 do 5.25
//  osoba / m2: null = još nije upisano
//  !!! RASPORED JE PRIVREMEN — ispravit ćemo ga prema stvarnom stanju !!!
// ---------------------------------------------------------------------
export const JEDINICE = [
  { id: 1, kat: 0, boja: "#d9825b", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: -5.25, z1: 0 } },
  { id: 2, kat: 0, boja: "#7f9a4a", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: 0, z1: 5.25 } },
  { id: 3, kat: 1, boja: "#3f8fae", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: -5.25, z1: 0 } },
  { id: 4, kat: 1, boja: "#e2b04a", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: 0, z1: 5.25 } },
  { id: 5, kat: 1, boja: "#a86a9c", osoba: null, m2: null, tlocrt: { x0: -1, x1: 4.5, z0: -5.25, z1: 5.25 } },
  { id: 6, kat: 2, boja: "#c95454", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: -5.25, z1: 0 } },
  { id: 7, kat: 2, boja: "#4f9d8a", osoba: null, m2: null, tlocrt: { x0: -6.5, x1: -1, z0: 0, z1: 5.25 } },
  { id: 8, kat: 2, boja: "#6c7fc4", osoba: null, m2: null, tlocrt: { x0: -1, x1: 4.5, z0: -5.25, z1: 5.25 } },
];

// Zajednički / ostali prostori po katovima (nisu apartmani)
export const OSTALO = [
  { kat: 0, vrsta: "hodnik", tlocrt: { x0: 4.5, x1: 6.5, z0: -5.25, z1: 5.25 } },
  { kat: 0, vrsta: "ostalo", tlocrt: { x0: -1, x1: 4.5, z0: -5.25, z1: 5.25 } },
  { kat: 1, vrsta: "hodnik", tlocrt: { x0: 4.5, x1: 6.5, z0: -5.25, z1: 5.25 } },
  { kat: 2, vrsta: "hodnik", tlocrt: { x0: 4.5, x1: 6.5, z0: -5.25, z1: 5.25 } },
];

// ---------------------------------------------------------------------
//  FOTOGRAFIJE — popis datoteka po mapama u /fotografije/
//  Primjer:  "jedinica-1": ["dnevna.jpg", "spavaca.jpg"],
// ---------------------------------------------------------------------
export const FOTOGRAFIJE = {
  "zajednicko": [],
  "jedinica-1": [],
  "jedinica-2": [],
  "jedinica-3": [],
  "jedinica-4": [],
  "jedinica-5": [],
  "jedinica-6": [],
  "jedinica-7": [],
  "jedinica-8": [],
};

// Naslovna fotografija (npr. "fotografije/zajednicko/pogled.jpg"); prazno = ilustracija
export const NASLOVNA_FOTO = "";
