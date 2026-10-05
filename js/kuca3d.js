import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "./vendor/CSS2DRenderer.js";
import { lang as initialLang, href } from "./common.js";
import { t } from "./i18n.js";
import { JEDINICE, OSTALO, KATOVI } from "./podaci.js";

let lang = initialLang;

// ---------------- Dimenzije (metri, okvirno prema satelitskoj snimci) ----------------
const W = 13, D = 10.5;               // tlocrt kuće
const HX = W / 2, HZ = D / 2;
const FLOOR_H = 2.8;                  // visina etaže
const SLAB = 0.25;
const ROOM_H = 2.55;
const PLINTH = 0.35;                  // kuća je malo podignuta od terena
const EXPLODE = 2.6;                  // razmak katova kod "razdvoji katove"
const N_FLOORS = KATOVI.length;

const COL = {
  wall: 0xe7a7a2, wallEdge: 0xb87a74, slab: 0xf3ece2, roof: 0xb4533a, roofEdge: 0x8f3f2a,
  rail: 0xffffff, ground: 0xe9dfcb, grass: 0xa9b878, gravel: 0xd8cdb8, road: 0x9a948a,
  common: 0xcfc6b8, stair: 0xd8d0c4, olive: 0x5f7436, trunk: 0x5a4532, sea: 0x3f8fae, entrance: 0xc0623b,
};

// ---------------- Scena ----------------
const host = document.getElementById("viewer");
const loadingEl = document.getElementById("viewer-loading");

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}
if (!webglOK()) {
  loadingEl.dataset.i18n = "no_webgl";
  loadingEl.textContent = t("no_webgl", lang);
  throw new Error("WebGL not available");
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
host.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 400);
const HOME = { pos: new THREE.Vector3(34, 28, 36), target: new THREE.Vector3(0, 6, 0) };
const EXPL_HOME = { pos: new THREE.Vector3(42, 38, 46), target: new THREE.Vector3(0, 11, 0) };
camera.position.copy(EXPL_HOME.pos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(EXPL_HOME.target);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 110;
controls.maxPolarAngle = Math.PI * 0.47;
controls.screenSpacePanning = true;

scene.add(new THREE.HemisphereLight(0xfff6e8, 0xb9a98c, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-25, 40, 18);           // popodnevno sunce sa zapada (more)
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(sun);

// ---------------- Pomoćne funkcije ----------------
function box(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts })
  );
  m.castShadow = opts.transparent ? false : true;
  m.receiveShadow = true;
  return m;
}
function edges(mesh, color, opacity = 1) {
  const l = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
  );
  mesh.add(l);
  return l;
}
function label(text, cls, i18nKey) {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  if (i18nKey) el.dataset.k = i18nKey;
  return new CSS2DObject(el);
}
const i18nLabels = [];
function tLabel(key, cls) {
  const o = label(t(key, lang), cls, key);
  i18nLabels.push(o);
  return o;
}

// ---------------- Teren i okoliš ----------------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: COL.ground, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const garden = new THREE.Mesh(new THREE.PlaneGeometry(30, 26), new THREE.MeshStandardMaterial({ color: COL.grass, roughness: 1 }));
garden.rotation.x = -Math.PI / 2;
garden.position.set(-2, 0.01, 1);
garden.receiveShadow = true;
scene.add(garden);

// parking (istok) – šljunak među maslinama
const parking = new THREE.Mesh(new THREE.PlaneGeometry(11, 20), new THREE.MeshStandardMaterial({ color: COL.gravel, roughness: 1 }));
parking.rotation.x = -Math.PI / 2;
parking.position.set(14.5, 0.02, 0);
parking.receiveShadow = true;
scene.add(parking);
const parkLbl = tLabel("lbl_parking", "lbl-place");
parkLbl.position.set(15.5, 0.3, 9);
scene.add(parkLbl);

// automobili
[[-6], [-1.5], [3], [7.5]].forEach(([z], i) => {
  const car = new THREE.Group();
  const body = box(4.2, 0.8, 1.8, [0xf2f2f2, 0x4a6a8a, 0x9c3b30, 0x30343a][i]);
  body.position.y = 0.6;
  const top = box(2.3, 0.6, 1.6, 0x26323b);
  top.position.set(-0.2, 1.3, 0);
  car.add(body, top);
  car.position.set(16.5, 0, z);
  scene.add(car);
});

// ulica (sjever)
const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), new THREE.MeshStandardMaterial({ color: COL.road, roughness: 1 }));
road.rotation.x = -Math.PI / 2;
road.position.set(24, 0.03, 0);
road.receiveShadow = true;
scene.add(road);
const streetLbl = tLabel("lbl_street", "lbl-place");
streetLbl.position.set(24, 0.4, -14);
scene.add(streetLbl);

// more (zapad, ~200 m) – plavi pojas na rubu
const sea = new THREE.Mesh(new THREE.PlaneGeometry(40, 160), new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.35, metalness: 0.1 }));
sea.rotation.x = -Math.PI / 2;
sea.position.set(-62, 0.02, 0);
scene.add(sea);
const seaLbl = tLabel("lbl_sea", "lbl-place lbl-sea");
seaLbl.position.set(-44, 0.5, 0);
scene.add(seaLbl);

// kompas – sjever
const north = new THREE.Group();
const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2, 3), new THREE.MeshStandardMaterial({ color: 0x2e2a25 }));
arrow.rotation.x = -Math.PI / 2;
north.add(arrow);
const nLbl = label("N", "lbl-place");
nLbl.position.set(0, 0.6, -1.8);
north.add(nLbl);
north.position.set(-9, 0.4, 12);
scene.add(north);

// masline
function olive(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 1.8 * s, 6), new THREE.MeshStandardMaterial({ color: COL.trunk }));
  trunk.position.y = 0.9 * s;
  trunk.castShadow = true;
  g.add(trunk);
  const mat = new THREE.MeshStandardMaterial({ color: COL.olive, roughness: 1, flatShading: true });
  [[0, 2.3, 0, 1.5], [0.9, 2.0, 0.4, 1.0], [-0.8, 2.1, -0.3, 1.1]].forEach(([x2, y2, z2, r]) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0), mat);
    c.position.set(x2 * s, y2 * s, z2 * s);
    c.castShadow = true;
    g.add(c);
  });
  g.position.set(x, 0, z);
  scene.add(g);
}
[[11, -9], [11, -3.8], [11, 1.2], [11, 6], [19.5, -8.5], [20, -2.5], [20, 3.5], [19.5, 9],
 [-11, 8], [-14, -4], [-12, 13], [2, 11], [6, 12.5], [-4, -10.5], [4, -10.5]].forEach(([x, z]) => olive(x, z, 0.9 + Math.random() * 0.3));

// ---------------- Kuća ----------------
const house = new THREE.Group();
scene.add(house);

const plinth = box(W + 0.3, PLINTH, D + 0.3, 0xd8cbb7);
plinth.position.y = PLINTH / 2;
house.add(plinth);

const floors = [];          // THREE.Group po etaži
const unitMeshes = [];      // za raycast
const unitById = new Map();

const wallMat = new THREE.MeshStandardMaterial({ color: COL.wall, transparent: true, opacity: 0.22, roughness: 0.9, depthWrite: false, side: THREE.DoubleSide });

for (let f = 0; f < N_FLOORS; f++) {
  const g = new THREE.Group();
  g.userData = { baseY: PLINTH + f * FLOOR_H, offset: 0, targetOffset: 0 };
  g.position.y = g.userData.baseY;
  house.add(g);
  floors.push(g);

  // ploča
  const slab = box(W, SLAB, D, COL.slab);
  slab.position.y = SLAB / 2;
  g.add(slab);
  edges(slab, 0xcbbfae);

  // vanjski zidovi (prozirni da se vide jedinice)
  const wallH = FLOOR_H - SLAB;
  const shell = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, D), wallMat);
  shell.position.y = SLAB + wallH / 2;
  shell.renderOrder = 2;
  g.add(shell);
  edges(shell, COL.wallEdge, 0.9);

  // balkoni prema moru (zapad) na katovima, terasa na jugu u prizemlju
  if (f > 0) {
    const bal = box(1.6, 0.18, D - 1.5, COL.slab);
    bal.position.set(-HX - 0.8, 0.09, 0);
    g.add(bal);
    const rail = new THREE.Group();
    const railMat = { color: COL.rail };
    const r1 = box(0.06, 1.0, D - 1.5, railMat.color); r1.position.set(-HX - 1.57, 0.68, 0); rail.add(r1);
    const r2 = box(1.6, 1.0, 0.06, railMat.color); r2.position.set(-HX - 0.8, 0.68, (D - 1.5) / 2); rail.add(r2);
    const r3 = r2.clone(); r3.position.z = -(D - 1.5) / 2; rail.add(r3);
    rail.children.forEach((m) => { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.85; });
    g.add(rail);
  } else {
    const ter = box(W - 1, 0.12, 3, 0xd9c7a6);
    ter.position.set(-0.5, -PLINTH + 0.06, HZ + 1.6);
    g.add(ter);
  }

  // zajednički prostori
  OSTALO.filter((o) => o.kat === f).forEach((o) => {
    const { x0, x1, z0, z1 } = o.tlocrt;
    const h = o.vrsta === "hodnik" ? 0.4 : ROOM_H * 0.5;
    const m = box(x1 - x0 - 0.2, h, z1 - z0 - 0.2, COL.common, { transparent: true, opacity: 0.55 });
    m.position.set((x0 + x1) / 2, SLAB + h / 2, (z0 + z1) / 2);
    g.add(m);
    if (o.vrsta === "hodnik") {
      // unutarnje stubište
      for (let s = 0; s < 8; s++) {
        const st = box(0.5, 0.18, 1.2, COL.stair);
        st.position.set(x0 + 2 + s * 0.5, SLAB + 0.45 + s * 0.3, (z0 + z1) / 2);
        g.add(st);
      }
    }
  });
}

// jedinice
JEDINICE.forEach((u) => {
  const g = floors[u.kat];
  const { x0, x1, z0, z1 } = u.tlocrt;
  const inset = 0.15;
  const m = box(x1 - x0 - inset * 2, ROOM_H, z1 - z0 - inset * 2, u.boja, { transparent: true, opacity: 0.82, emissive: 0x000000 });
  m.position.set((x0 + x1) / 2, SLAB + ROOM_H / 2, (z0 + z1) / 2);
  m.castShadow = false;
  m.userData.unit = u;
  edges(m, 0xffffff, 0.7);
  g.add(m);
  unitMeshes.push(m);

  const lbl = label(String(u.id), "lbl-unit");
  lbl.position.set(0, ROOM_H / 2 + 0.3, 0);
  lbl.element.addEventListener("click", (e) => { e.stopPropagation(); select(u.id); });
  lbl.element.style.pointerEvents = "auto";
  lbl.element.title = `${t("unit", lang)} ${u.id}`;
  m.add(lbl);
  unitById.set(u.id, { mesh: m, label: lbl, data: u });
});

// krov – četverostrešni
const roof = new THREE.Group();
roof.userData = { baseY: PLINTH + N_FLOORS * FLOOR_H, offset: 0, targetOffset: 0 };
roof.position.y = roof.userData.baseY;
{
  const o = 0.6, h = 2.6;               // prepust i visina
  const x = HX + o, z = HZ + o, r = x - z;   // greben duž x osi
  const v = [
    -x, 0, -z,   x, 0, -z,   x, 0, z,   -x, 0, z,   // baza 0-3
    -r, h, 0,    r, h, 0,                           // greben 4-5
  ];
  const idx = [0, 4, 5, 0, 5, 1, 1, 5, 2, 2, 5, 4, 2, 4, 3, 3, 4, 0, 0, 1, 2, 0, 2, 3];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const rm = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COL.roof, roughness: 0.8, flatShading: true, side: THREE.DoubleSide }));
  rm.castShadow = true;
  roof.add(rm);
  roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color: COL.roofEdge })));
  [[-2.5, -1.2], [3.2, 1.0]].forEach(([cx, cz]) => {
    const ch = box(0.7, 2.4, 0.7, 0xd49b93);
    ch.position.set(cx, 1.6, cz);
    roof.add(ch);
  });
}
house.add(roof);

// ---------------- Glavni ulaz za goste: vanjsko stubište s parkirališta ----------------
const entrance = new THREE.Group();
{
  const landY = FLOOR_H;                       // podest na razini 1. kata
  const sx0 = HX + 0.15, sx1 = HX + 1.55;      // širina stubišta
  const steps = 16, run = 0.3, rise = (landY + PLINTH) / steps;
  const startZ = 1.6;                          // kreće s parkirališta prema podestu uz stubište
  for (let s = 0; s < steps; s++) {
    const st = box(sx1 - sx0, rise * (s + 1), run, COL.stair);
    st.position.set((sx0 + sx1) / 2, (rise * (s + 1)) / 2, startZ - s * run);
    entrance.add(st);
  }
  const landZ = startZ - steps * run - 0.8;
  const land = box(sx1 - sx0, 0.2, 1.8, COL.stair);
  land.position.set((sx0 + sx1) / 2, landY + PLINTH - 0.1, landZ);
  entrance.add(land);
  const post = box(0.25, landY + PLINTH, 0.25, COL.stair);
  post.position.set(sx1 - 0.15, (landY + PLINTH) / 2, landZ - 0.7);
  entrance.add(post);
  const rail = box(0.05, 1, steps * run + 1.8, COL.rail);
  rail.position.set(sx1, landY / 2 + 0.9, startZ - (steps * run) / 2 - 0.4);
  rail.rotation.x = Math.atan2(landY, steps * run) * 0.75;
  entrance.add(rail);
  // vrata
  const door = box(0.12, 2.1, 1.1, 0x8a4f35);
  door.position.set(HX + 0.06, landY + PLINTH + 1.05, landZ);
  entrance.add(door);
  // istaknuta staza od parkinga do stubišta
  const path = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ color: COL.entrance, transparent: true, opacity: 0.85 }));
  path.rotation.x = -Math.PI / 2;
  path.position.set((sx0 + sx1) / 2 + 0.6, 0.04, startZ + 1);
  entrance.add(path);

  const eLbl = tLabel("lbl_entrance", "lbl-entrance");
  eLbl.position.set((sx0 + sx1) / 2 + 0.3, landY + PLINTH + 2.8, landZ);
  entrance.add(eLbl);
}
scene.add(entrance);

// ---------------- Prikazi / animacija ----------------
let currentView = "all";
let exploded = true;
let roofOn = true;
let selected = null;

const camAnim = { active: false, pos: new THREE.Vector3(), target: new THREE.Vector3() };
function flyTo(pos, target) {
  camAnim.active = true;
  camAnim.pos.copy(pos);
  camAnim.target.copy(target);
}

function floorY(f) { return floors[f].userData.baseY + floors[f].userData.targetOffset; }

function applyView() {
  floors.forEach((g, i) => {
    g.userData.targetOffset = exploded ? i * EXPLODE : 0;
    g.visible = currentView === "all" || i <= Number(currentView);
  });
  roof.userData.targetOffset = exploded ? N_FLOORS * EXPLODE : 0;
  roof.visible = roofOn && currentView === "all";
  entrance.visible = currentView === "all" || Number(currentView) >= 1;

  document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === currentView));
  document.getElementById("tb-explode").classList.toggle("on", exploded);
  document.getElementById("tb-roof").classList.toggle("on", roofOn && currentView === "all");
}

function setView(v, fly = true) {
  currentView = v;
  applyView();
  if (!fly) return;
  if (v === "all") {
    flyTo(exploded ? EXPL_HOME.pos : HOME.pos, exploded ? EXPL_HOME.target : HOME.target);
  } else {
    const y = floorY(Number(v)) + 1;
    flyTo(new THREE.Vector3(14, y + 22, 18), new THREE.Vector3(0, y, 0));
  }
}

{
  const allBtn = document.querySelector('[data-view="all"]');
  let prev = allBtn;
  KATOVI.forEach((k, i) => {
    if (k.gosti === false) return;
    const b = document.createElement("button");
    b.className = "tb-btn"; b.dataset.view = String(i); b.dataset.i18n = k.naziv; b.textContent = t(k.naziv, lang);
    prev.after(b); prev = b;
  });
}
document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
document.getElementById("tb-explode").addEventListener("click", () => {
  exploded = !exploded;
  applyView();
  if (currentView === "all") flyTo(exploded ? EXPL_HOME.pos : HOME.pos, exploded ? EXPL_HOME.target : HOME.target);
});
document.getElementById("tb-roof").addEventListener("click", () => {
  if (currentView !== "all") setView("all", false);
  roofOn = !roofOn;
  applyView();
});
document.getElementById("tb-reset").addEventListener("click", () => {
  exploded = true; roofOn = true; select(null);
  setView("all");
});

// ---------------- Odabir jedinice ----------------
function select(id) {
  selected = id;
  unitById.forEach(({ mesh, label: l }, uid) => {
    const on = id === uid;
    mesh.material.opacity = id == null ? 0.82 : on ? 0.95 : 0.25;
    mesh.material.emissive.setHex(on ? 0x332211 : 0x000000);
    l.element.classList.toggle("sel", on);
  });
  document.querySelectorAll("#unit-list button").forEach((b) => b.classList.toggle("sel", Number(b.dataset.id) === id));
  renderInfo();
  if (id == null) { history.replaceState(null, "", location.pathname + location.search); return; }
  history.replaceState(null, "", `${location.pathname}${location.search}#jedinica-${id}`);

  const u = unitById.get(id).data;
  // prikaži kat jedinice (sakrij gornje katove i krov)
  if (currentView !== "all" && Number(currentView) !== u.kat) setView(String(u.kat));
  else if (currentView === "all" && !exploded) setView(String(u.kat));
}

function floorName(k) { return t(KATOVI[k].naziv, lang); }

function renderInfo() {
  const box = document.getElementById("unit-info");
  if (selected == null) {
    box.innerHTML = `<p>${t("pick_unit", lang)}</p>`;
    return;
  }
  const u = unitById.get(selected).data;
  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px"><span class="swatch" style="background:${u.boja};width:18px;height:18px"></span>
      <h3>${t("unit", lang)} ${u.id}</h3></div>
    <p style="margin:10px 0 0;color:var(--muted)">${t("desc_" + u.tip, lang)}</p>
    <div class="meta">
      <div><span>${t("floor", lang)}</span><strong>${floorName(u.kat)}</strong></div>
      <div><span>${t("guests", lang)}</span><strong>${u.osoba ?? "—"}</strong></div>
      <div><span>${t("side", lang)}</span><strong>${t(u.strana === "ulica" ? "side_street" : "side_sea", lang)}</strong></div>
      <div><span>${t("size", lang)}</span><strong>${u.m2 ? u.m2 + " m²" : "—"}</strong></div>
    </div>
    <a class="btn btn-ghost" href="${href("fotografije.html")}#jedinica-${u.id}">${t("unit_photos", lang)}</a>
    <a class="btn btn-primary" href="${href("lokacija.html")}#upit-${u.id}">${t("unit_inquiry", lang)}</a>`;
}

function renderList() {
  document.getElementById("unit-list").innerHTML = JEDINICE.map((u) =>
    `<li><button data-id="${u.id}" class="${u.id === selected ? "sel" : ""}"><span class="swatch" style="background:${u.boja}"></span>${t("unit", lang)} ${u.id}</button></li>`).join("");
  document.querySelectorAll("#unit-list button").forEach((b) => b.addEventListener("click", () => select(Number(b.dataset.id))));
}

// raycast klik (razlikuje klik od povlačenja)
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let downAt = null;
renderer.domElement.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return;
  const hit = pick(e);
  select(hit ? hit.userData.unit.id : null);
});
let hovered = null;
renderer.domElement.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const hit = pick(e);
  if (hit === hovered) return;
  if (hovered && hovered.userData.unit.id !== selected) hovered.material.emissive.setHex(0x000000);
  hovered = hit;
  if (hovered && hovered.userData.unit.id !== selected) hovered.material.emissive.setHex(0x221a10);
  renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
});
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const vis = unitMeshes.filter((m) => m.parent.visible);
  const hits = ray.intersectObjects(vis, false);
  return hits.length ? hits[0].object : null;
}

// ---------------- Jezik ----------------
document.addEventListener("langchange", (e) => {
  lang = e.detail;
  i18nLabels.forEach((o) => { o.element.textContent = t(o.element.dataset.k, lang); });
  unitById.forEach(({ label: l, data }) => { l.element.title = `${t("unit", lang)} ${data.id}`; });
  renderList();
  renderInfo();
});

// ---------------- Petlja ----------------
function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  // na uskim ekranima odmakni kameru
  camera.fov = w < 600 ? 52 : 40;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const k = 1 - Math.pow(0.001, dt);          // glatko približavanje
  [...floors, roof].forEach((g) => {
    const u = g.userData;
    u.offset += (u.targetOffset - u.offset) * k;
    g.position.y = u.baseY + u.offset;
  });
  entrance.position.y = floors[1].userData.offset;   // stubište prati 1. kat
  const roofCover = roof.visible && !exploded;
  unitById.forEach(({ label: l, data }) => {
    l.visible = !roofCover && (currentView === "all" || data.kat === Number(currentView));
  });
  if (camAnim.active) {
    camera.position.lerp(camAnim.pos, k * 0.9);
    controls.target.lerp(camAnim.target, k * 0.9);
    if (camera.position.distanceTo(camAnim.pos) < 0.05) camAnim.active = false;
  }
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(tick);
}
controls.addEventListener("start", () => { camAnim.active = false; });

renderList();
renderInfo();
applyView();
loadingEl.remove();
renderer.domElement.style.cursor = "grab";
tick();

const m = location.hash.match(/jedinica-(\d)/);
if (m && unitById.has(Number(m[1]))) select(Number(m[1]));
