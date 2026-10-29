import { dcExisting } from "@/lib/datacenters";

/** Compact existing-facility rows for the map, fetched after the page renders so the HTML stays small. */
export function GET() {
  return Response.json(
    { license: "ODbL 1.0, © OpenStreetMap contributors", updated: dcExisting.updated, rows: dcExisting.rows },
    { headers: { "Cache-Control": "public, max-age=3600", "X-Robots-Tag": "noindex" } },
  );
}
