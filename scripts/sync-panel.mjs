// Genera content/panel.json (biomarcadores del panel de laboratorio, ES/EN, por sistema)
// a partir de la base de conocimiento de la app, que es la fuente de verdad:
//   node scripts/sync-panel.mjs [ruta a HomeTest/knowledge/biomarcadores]
// Solo nombres, categoría y tipo de muestra: las fichas médicas de la app están pendientes de
// revisión clínica y NO se publican en la web.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2] ?? join("..", "HomeTest", "knowledge", "biomarcadores");

// Nombre de cada sistema en la web (ES y, si cambia, EN) y orden de aparición.
const SYSTEMS = {
  metabolico: "Metabolismo",
  lipidico: "Corazón y lípidos",
  hormonas: "Hormonas",
  tiroides: "Tiroides",
  endocrino: ["Estrés y suprarrenales", "Stress & adrenal"],
  nutrientes: "Nutrientes y vitaminas",
  electrolitos: "Electrolitos y minerales",
  hematologia: "Hemograma",
  regulacion_inmune: ["Sistema inmune e inflamación", "Immune system & inflammation"],
  hepatico: "Hígado",
  renal: "Riñón",
  pancreas: "Páncreas",
  autoinmunidad: "Autoinmunidad",
  salud_femenina: "Salud femenina",
  salud_masculina: "Salud masculina",
  toxinas_ambientales: "Tóxicos ambientales",
  orina: "Orina",
};
const SAMPLES = { Sangre: { es: "Sangre", en: "Blood" }, Orina: { es: "Orina", en: "Urine" } };

const systems = [];
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join(SRC, file), "utf8"));
  if (!(data.categoria in SYSTEMS)) continue; // constantes vitales y edad biológica no son del panel
  const markers = data.biomarcadores
    .filter((b) => b.sample_type in SAMPLES)
    .map((b) => ({
      id: b.canonical_id,
      es: b.canonical_name,
      en: b.canonical_name_en ?? b.canonical_name,
      sample: SAMPLES[b.sample_type],
    }));
  const [es, en = data.categoria_en] = [SYSTEMS[data.categoria]].flat();
  if (markers.length) systems.push({ id: data.categoria, es, en, markers });
}
const order = Object.keys(SYSTEMS);
systems.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

const total = systems.reduce((n, s) => n + s.markers.length, 0);
writeFileSync(
  join("content", "panel.json"),
  JSON.stringify({ _generated: "scripts/sync-panel.mjs — no editar a mano", total, systems }, null, 2) + "\n",
);
console.log(`content/panel.json: ${total} biomarcadores en ${systems.length} sistemas`);
