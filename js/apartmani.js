import { lang as l0 } from "./common.js?v=202610061139";
import { JEDINICE } from "./podaci.js?v=202610061139";
import { unitCard, layoutHTML } from "./kartice.js?v=202610061139";

let lang = l0;
function render() {
  document.getElementById("unit-grid").innerHTML = JEDINICE.map((u) => unitCard(u, lang)).join("");
  document.getElementById("layout").innerHTML = layoutHTML(lang);
}
document.addEventListener("langchange", (e) => { lang = e.detail; render(); });
render();
