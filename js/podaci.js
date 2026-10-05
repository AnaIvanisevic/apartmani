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

export const BOOKING_URL = "https://www.booking.com/hotel/hr/apartmani-dorana.html";

export const LOKACIJA = {
  adresa: "don Ive Prodana 17, 23235 Vrsi, Hrvatska",
  lat: 44.265808,
  lng: 15.2087186,
};

// ---------------------------------------------------------------------
//  JEDINICE
//  kat: indeks u KATOVI (0 = prizemlje, 1 = 1. kat, 2 = polukat, 3 = 2. kat, 4 = 3. kat)
//  strana: "more" ili "ulica" – određuje stranu balkona (more = zapad, ulica = istok)
//  ulaz je s istoka (ulica): desno = sjever (z < 0), lijevo = jug (z > 0)
//  tlocrt: pravokutnik u metrima unutar kuće (x: zapad -> istok, z: sjever -> jug)
//          kuća ide od x -6.5 do 6.5 i od z -5.25 do 5.25
//  tip: A = spavaća soba + kauč na razvlačenje, B = spavaća soba + 2 kauča, S = studio (opisi su u js/i18n-sadrzaji.js)
//  naslovna: fotografija kartice (iz mape fotografije/jedinica-N)
//  osoba / m2: null = još nije upisano
//  Raspored je shematski (kat i strana su točni, točni tlocrti nisu poznati)
// ---------------------------------------------------------------------
export const KATOVI = [
  { naziv: "v_f0", gosti: false },   // prizemlje – privatno, prikazuje se samo kao zatvoreni zid
  { naziv: "v_f1" },                 // 1. kat
  { naziv: "v_half" },               // polukat
  { naziv: "v_f2" },                 // 2. kat
  { naziv: "v_f3" },                 // 3. kat
];

export const JEDINICE = [
  { id: 1, tip: "A", kat: 1, strana: "more",  naslovna: "jedinica-1-10.jpg", boja: "#d9825b", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: 0.9, z1: 5.25 } },
  { id: 2, tip: "S", kat: 1, strana: "more",  naslovna: "jedinica-2-10.jpg", boja: "#7f9a4a", osoba: 2, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: -5.25, z1: -0.9 } },
  { id: 3, tip: "B", kat: 2, strana: "ulica", naslovna: "jedinica-3-04.jpg", boja: "#3f8fae", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: -5.25, z1: -0.9 } },
  { id: 4, tip: "A", kat: 2, strana: "more",  naslovna: "jedinica-4-04.jpg", boja: "#e2b04a", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: 0.9, z1: 5.25 } },
  { id: 5, tip: "A", kat: 3, strana: "more",  naslovna: "jedinica-5-01.jpg", boja: "#a86a9c", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: -5.25, z1: -0.9 } },
  { id: 6, tip: "S", kat: 3, strana: "more",  naslovna: "jedinica-6-06.jpg", boja: "#c95454", osoba: 2, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: 0.9, z1: 5.25 } },
  { id: 7, tip: "B", kat: 4, strana: "ulica", naslovna: "jedinica-7-01.jpg", boja: "#4f9d8a", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: -5.25, z1: -0.9 } },
  { id: 8, tip: "A", kat: 4, strana: "more",  naslovna: "jedinica-8-02.jpg", boja: "#6c7fc4", osoba: 4, m2: null, tlocrt: { x0: -6.5, x1: 6.5, z0: 0.9, z1: 5.25 } },
];

// Zajednički / ostali prostori po katovima (nisu apartmani)
export const OSTALO = [
  { kat: 1, vrsta: "hodnik", tlocrt: { x0: -6.5, x1: 6.5, z0: -0.9, z1: 0.9 } },
  { kat: 2, vrsta: "hodnik", tlocrt: { x0: -6.5, x1: 6.5, z0: -0.9, z1: 0.9 } },
  { kat: 3, vrsta: "hodnik", tlocrt: { x0: -6.5, x1: 6.5, z0: -0.9, z1: 0.9 } },
  { kat: 4, vrsta: "hodnik", tlocrt: { x0: -6.5, x1: 6.5, z0: -0.9, z1: 0.9 } },
];

// ---------------------------------------------------------------------
//  FOTOGRAFIJE — popis datoteka po mapama u /fotografije/
//  Primjer:  "jedinica-1": ["dnevna.jpg", "spavaca.jpg"],
// ---------------------------------------------------------------------
export const FOTOGRAFIJE = {
  "jedinica-1": ["jedinica-1-01.jpg", "jedinica-1-02.jpg", "jedinica-1-03.jpg", "jedinica-1-04.jpg", "jedinica-1-05.jpg", "jedinica-1-06.jpg", "jedinica-1-07.jpg", "jedinica-1-08.jpg", "jedinica-1-09.jpg", "jedinica-1-10.jpg", "jedinica-1-11.jpg", "jedinica-1-12.jpg", "jedinica-1-13.jpg"],
  "jedinica-2": ["jedinica-2-01.jpg", "jedinica-2-02.jpg", "jedinica-2-03.jpg", "jedinica-2-04.jpg", "jedinica-2-05.jpg", "jedinica-2-06.jpg", "jedinica-2-07.jpg", "jedinica-2-08.jpg", "jedinica-2-09.jpg", "jedinica-2-10.jpg"],
  "jedinica-3": ["jedinica-3-01.jpg", "jedinica-3-02.jpg", "jedinica-3-03.jpg", "jedinica-3-04.jpg", "jedinica-3-05.jpg", "jedinica-3-06.jpg", "jedinica-3-07.jpg", "jedinica-3-08.jpg", "jedinica-3-09.jpg", "jedinica-3-10.jpg"],
  "jedinica-4": ["jedinica-4-01.jpg", "jedinica-4-02.jpg", "jedinica-4-03.jpg", "jedinica-4-04.jpg", "jedinica-4-05.jpg", "jedinica-4-06.jpg", "jedinica-4-07.jpg", "jedinica-4-08.jpg", "jedinica-4-09.jpg"],
  "jedinica-5": ["jedinica-5-01.jpg", "jedinica-5-02.jpg", "jedinica-5-03.jpg", "jedinica-5-04.jpg", "jedinica-5-05.jpg", "jedinica-5-06.jpg", "jedinica-5-07.jpg", "jedinica-5-08.jpg", "jedinica-5-09.jpg", "jedinica-5-10.jpg", "jedinica-5-11.jpg", "jedinica-5-12.jpg", "jedinica-5-13.jpg", "jedinica-5-14.jpg", "jedinica-5-15.jpg", "jedinica-5-16.jpg", "jedinica-5-17.jpg"],
  "jedinica-6": ["jedinica-6-01.jpg", "jedinica-6-02.jpg", "jedinica-6-03.jpg", "jedinica-6-04.jpg", "jedinica-6-05.jpg", "jedinica-6-06.jpg", "jedinica-6-07.jpg", "jedinica-6-08.jpg", "jedinica-6-09.jpg", "jedinica-6-10.jpg", "jedinica-6-11.jpg", "jedinica-6-12.jpg", "jedinica-6-13.jpg", "jedinica-6-14.jpg"],
  "jedinica-7": ["jedinica-7-01.jpg", "jedinica-7-02.jpg", "jedinica-7-03.jpg", "jedinica-7-04.jpg", "jedinica-7-05.jpg", "jedinica-7-06.jpg", "jedinica-7-07.jpg", "jedinica-7-08.jpg", "jedinica-7-09.jpg", "jedinica-7-10.jpg", "jedinica-7-11.jpg", "jedinica-7-12.jpg", "jedinica-7-13.jpg", "jedinica-7-14.jpg", "jedinica-7-15.jpg", "jedinica-7-16.jpg"],
  "jedinica-8": ["jedinica-8-01.jpg", "jedinica-8-02.jpg", "jedinica-8-03.jpg", "jedinica-8-04.jpg", "jedinica-8-05.jpg", "jedinica-8-06.jpg", "jedinica-8-07.jpg", "jedinica-8-08.jpg", "jedinica-8-09.jpg", "jedinica-8-10.jpg"],
  "zajednicko": ["zajednicko-01.jpg", "zajednicko-02.jpg", "zajednicko-03.jpg", "zajednicko-04.jpg", "zajednicko-05.jpg", "zajednicko-06.jpg", "zajednicko-07.jpg", "zajednicko-08.jpg", "zajednicko-09.jpg", "zajednicko-10.jpg", "zajednicko-11.jpg", "zajednicko-12.jpg", "zajednicko-13.jpg", "zajednicko-14.jpg", "zajednicko-15.jpg", "zajednicko-16.jpg"],
};

// Naslovna fotografija (npr. "fotografije/zajednicko/pogled.jpg"); prazno = ilustracija
export const NASLOVNA_FOTO = "fotografije/zajednicko/zajednicko-10.jpg";
