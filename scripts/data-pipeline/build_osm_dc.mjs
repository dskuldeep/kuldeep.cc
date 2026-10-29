// OpenStreetMap data centers -> src/data/datacenters-existing.json (compact rows for the map).
//   node build_osm_dc.mjs <repo>     (run in the directory holding raw/osm_dc.json)
// Country comes from point-in-polygon against Natural Earth (world-atlas), not OSM address tags,
// which are missing on most features.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { geoArea, geoBounds, geoContains } from "d3-geo";
import { feature } from "topojson-client";

const UPDATED = "2026-10-29";
const repo = process.argv[2];
// A few 10m polygons are wound the wrong way; d3 reads those as "the globe minus the country", so skip them
// (area > half the sphere) and fall back to the 50m outline for points they would have swallowed.
const load = (file) =>
  ((t) => feature(t, t.objects.countries).features)(JSON.parse(readFileSync(join(repo, "node_modules/world-atlas", file), "utf8")))
    .filter((f) => geoArea(f) < 2 * Math.PI)
    .map((f) => ({ f, b: geoBounds(f) }));
const countries = load("countries-10m.json");
const coarse = load("countries-50m.json");
const NAMES = { "United States of America": "United States", "Dem. Rep. Congo": "DR Congo", "Bosnia and Herz.": "Bosnia and Herzegovina", "Czechia": "Czech Republic", "Dominican Rep.": "Dominican Republic", "Central African Rep.": "Central African Republic", "S. Sudan": "South Sudan", "Eq. Guinea": "Equatorial Guinea", "N. Cyprus": "Cyprus", "Macedonia": "North Macedonia", "eSwatini": "Eswatini", "Faeroe Is.": "Faroe Islands", "Côte d'Ivoire": "Ivory Coast" };

function countryOf(lng, lat) {
  return lookup(countries, lng, lat) || lookup(coarse, lng, lat);
}

function lookup(list, lng, lat) {
  for (const { f, b } of list) {
    const [[w, s], [e, n]] = b;
    const inLng = w <= e ? lng >= w && lng <= e : lng >= w || lng <= e;
    if (lat < s || lat > n || !inLng) continue;
    if (geoContains(f, [lng, lat])) return NAMES[f.properties.name] ?? f.properties.name;
  }
  return "";
}

const DEAD = /^(yes|disused|abandoned|demolished|razed)$/;
const els = JSON.parse(readFileSync("raw/osm_dc.json", "utf8"));
const rows = [];
for (const e of els) {
  const t = e.tags ?? {};
  if (DEAD.test(t.disused ?? "") || t["disused:building"] || t["abandoned:building"] || t["demolished:building"]) continue;
  const lat = e.lat ?? e.center?.lat;
  const lng = e.lon ?? e.center?.lon;
  if (lat === undefined || lng === undefined) continue;
  const name = (t["name:en"] ?? t.name ?? "").trim();
  const operator = (t.operator ?? t.brand ?? t.owner ?? "").trim();
  rows.push([Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5, name, operator, countryOf(lng, lat), `${e.type}/${e.id}`]);
}
// Points the outlines miss (reclaimed coast, edge precision): ask Nominatim, 1 request/second
for (const r of rows.filter((x) => !x[4])) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=3&accept-language=en&lat=${r[1]}&lon=${r[0]}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "kuldeep.cc data research (mail@kuldeep.cc)" } });
    const c = (await res.json()).address?.country ?? "";
    r[4] = NAMES[c] ?? (c === "United States of America" ? "United States" : c);
  } catch {
    // leave blank
  }
  await new Promise((ok) => setTimeout(ok, 1100));
}

// Buildings drawn as several parts collapse to one point per ~50 m with the same name
const seen = new Set();
const out = rows.filter((r) => {
  const k = `${r[0].toFixed(3)},${r[1].toFixed(3)},${r[2]}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
out.sort((a, b) => a[4].localeCompare(b[4]) || a[2].localeCompare(b[2]));
writeFileSync(
  join(repo, "src/data/datacenters-existing.json"),
  JSON.stringify({ updated: UPDATED, fetchedAt: UPDATED, rows: out }),
);
console.log(`${els.length} OSM features -> ${out.length} data centers in ${new Set(out.map((r) => r[4])).size} countries`);
