import existingJson from "@/data/datacenters-existing.json";
import newJson from "@/data/datacenters-new.json";

/**
 * Data center map datasets. New builds are researched and deduplicated by the
 * pipeline (scripts/data-pipeline/build_dc.py); existing facilities are
 * OpenStreetMap features tagged as data centers, kept under ODbL and served
 * to the map as compact rows so the page HTML stays small.
 */

export interface DcSource {
  url: string;
  title: string;
  published: string | null;
}

export interface DcProject {
  id: string;
  name: string;
  operator: string;
  tenant: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  capacityMw: number | null;
  investmentUsdBn: number | null;
  status: "announced" | "planned" | "under construction" | "operational" | "paused" | "cancelled";
  purpose: string;
  announced: string | null;
  expectedOnline: string | null;
  detail: string;
  sources: DcSource[];
}

/** lng, lat, name, operator, country, OSM ref ("way/123") */
export type DcExisting = [number, number, string, string, string, string];

export const dcNew = newJson as { updated: string; rows: DcProject[] };
export const dcExisting = existingJson as {
  updated: string;
  fetchedAt: string;
  rows: DcExisting[];
};

export function dcTotals() {
  const rows = dcNew.rows;
  const live = rows.filter((p) => p.status !== "cancelled");
  return {
    projects: rows.length,
    countries: new Set(rows.map((p) => p.country)).size,
    gw: live.reduce((n, p) => n + (p.capacityMw ?? 0), 0) / 1000,
    usdBn: live.reduce((n, p) => n + (p.investmentUsdBn ?? 0), 0),
    withMw: live.filter((p) => p.capacityMw).length,
    withUsd: live.filter((p) => p.investmentUsdBn).length,
    existing: dcExisting.rows.length,
    existingCountries: new Set(dcExisting.rows.map((r) => r[4]).filter(Boolean)).size,
  };
}

/** Sum of a numeric field grouped by a key, largest first. */
export function groupSum(rows: DcProject[], key: (p: DcProject) => string, value: (p: DcProject) => number) {
  const m = new Map<string, number>();
  for (const p of rows) m.set(key(p), (m.get(key(p)) ?? 0) + value(p));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
