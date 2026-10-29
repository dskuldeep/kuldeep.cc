"use client";

import { geoEqualEarth, geoPath } from "d3-geo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { DcProject } from "@/lib/datacenters";

/**
 * Canvas world map for /data/datacenters. The basemap is Natural Earth country
 * outlines drawn with the site's own ink (CSS variables), so it follows the
 * light/dark theme and stays black and white. Two layers: existing facilities
 * (OpenStreetMap, fetched lazily) as faint dots, and new builds (sized by MW,
 * filled once construction starts) on top. The server-rendered table below the
 * map carries the same data for crawlers and screen readers.
 */

const REF_W = 1000;
const MAX_ZOOM = 48;

type Existing = [number, number, string, string, string, string]; // lng, lat, name, operator, country, osm ref

export const STATUS_ORDER = ["under construction", "operational", "announced", "planned", "paused", "cancelled"] as const;

interface View {
  k: number;
  x: number;
  y: number;
}

type Hit = { kind: "new"; p: DcProject } | { kind: "existing"; e: Existing };

function ink(el: Element) {
  const s = getComputedStyle(el);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { bg: v("--bg"), fg: v("--fg"), muted: v("--muted"), faint: v("--faint"), rule: v("--rule"), land: v("--code-bg") };
}

function radius(p: DcProject) {
  return p.capacityMw ? Math.min(16, 3 + Math.sqrt(p.capacityMw) / 5) : 3.5;
}

function isBuilt(status: string) {
  return status === "under construction" || status === "operational";
}

function isStopped(status: string) {
  return status === "cancelled" || status === "paused";
}

function fmtMw(mw: number) {
  return mw >= 1000 ? `${(mw / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} GW` : `${mw.toLocaleString("en-US")} MW`;
}

export function DatacenterMap({
  projects,
  existingUrl,
  existingCount,
  existingOnByDefault = true,
}: {
  /** New builds; pass [] for the existing-only map. */
  projects: DcProject[];
  existingUrl: string;
  existingCount: number;
  /** The existing layer is fetched only once it is switched on. */
  existingOnByDefault?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [land, setLand] = useState<{ land: Path2D; borders: Path2D; sphere: Path2D } | null>(null);
  const [existing, setExisting] = useState<Existing[] | null>(null);
  const existingOnly = projects.length === 0;
  const [showExisting, setShowExisting] = useState(existingOnByDefault || existingOnly);
  const [showNew, setShowNew] = useState(true);
  const [statuses, setStatuses] = useState<Set<string>>(() => new Set(STATUS_ORDER));
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{ hit: Hit; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<Hit | null>(null);
  const [hint, setHint] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const viewRef = useRef(view);
  viewRef.current = view;

  const height = Math.round(width * 0.52);
  const projection = useMemo(() => geoEqualEarth().fitExtent([[2, 2], [REF_W - 2, REF_W * 0.52 - 2]], { type: "Sphere" }), []);

  // Basemap
  useEffect(() => {
    let live = true;
    fetch("/geo/countries-50m.json")
      .then((r) => r.json() as Promise<Topology<{ countries: GeometryCollection }>>)
      .then((topo) => {
        if (!live) return;
        const path = geoPath(projection);
        const countries = topo.objects.countries;
        setLand({
          land: new Path2D(path(feature(topo, countries)) ?? ""),
          borders: new Path2D(path(mesh(topo, countries, (a, b) => a !== b)) ?? ""),
          sphere: new Path2D(path({ type: "Sphere" }) ?? ""),
        });
      });
    return () => {
      live = false;
    };
  }, [projection]);

  // Existing facilities, fetched after first paint (or when first switched on)
  const wantExisting = showExisting || existing !== null;
  useEffect(() => {
    if (!wantExisting) return;
    let live = true;
    fetch(existingUrl)
      .then((r) => r.json() as Promise<{ rows: Existing[] }>)
      .then((d) => live && setExisting(d.rows));
    return () => {
      live = false;
    };
  }, [existingUrl, wantExisting]);

  // Size + theme
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    const mo = new MutationObserver(() => setThemeTick((t) => t + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => setThemeTick((t) => t + 1);
    mq.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const visibleNew = useMemo(
    () =>
      showNew
        ? projects.filter(
            (p) =>
              statuses.has(p.status) &&
              (!q || `${p.name} ${p.operator} ${p.tenant} ${p.city} ${p.region} ${p.country}`.toLowerCase().includes(q)),
          )
        : [],
    [projects, showNew, statuses, q],
  );
  const visibleExisting = useMemo(
    () => (showExisting && existing ? (q ? existing.filter((e) => `${e[2]} ${e[3]} ${e[4]}`.toLowerCase().includes(q)) : existing) : []),
    [existing, showExisting, q],
  );

  // Projected reference coordinates, computed once per dataset
  const newXY = useMemo(() => new Map(projects.map((p) => [p.id, projection([p.lng, p.lat]) ?? [0, 0]])), [projects, projection]);
  const existingXY = useMemo(() => {
    const out = new Float32Array((existing?.length ?? 0) * 2);
    existing?.forEach((e, i) => {
      const xy = projection([e[0], e[1]]) ?? [-1e6, -1e6];
      out[i * 2] = xy[0];
      out[i * 2 + 1] = xy[1];
    });
    return out;
  }, [existing, projection]);
  const existingIndex = useMemo(() => new Map(existing?.map((e, i) => [e, i]) ?? []), [existing]);

  /** Reference coords → CSS pixels for the current view. */
  const toScreen = useCallback(
    (rx: number, ry: number, v: View = viewRef.current) => {
      const s = (width / REF_W) * v.k;
      return [rx * s + v.x, ry * s + v.y] as const;
    },
    [width],
  );

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ink(canvas);
    const s = (width / REF_W) * view.k;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, width, height);

    if (land) {
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * view.x, dpr * view.y);
      ctx.lineWidth = 1 / s;
      ctx.strokeStyle = c.rule;
      ctx.stroke(land.sphere);
      ctx.fillStyle = c.land;
      ctx.fill(land.land);
      ctx.lineWidth = 0.6 / s;
      ctx.stroke(land.borders);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Existing: faint dots, a touch larger when zoomed in
    const er = Math.min(4, 1.6 + view.k * 0.15);
    ctx.fillStyle = c.muted;
    ctx.globalAlpha = 0.7;
    for (const e of visibleExisting) {
      const i = existingIndex.get(e)!;
      const [x, y] = toScreen(existingXY[i * 2], existingXY[i * 2 + 1], view);
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;
      ctx.fillRect(x - er / 2, y - er / 2, er, er);
    }
    ctx.globalAlpha = 1;

    // New builds: big first so small ones stay clickable on top
    const sorted = [...visibleNew].sort((a, b) => (b.capacityMw ?? 0) - (a.capacityMw ?? 0));
    for (const p of sorted) {
      const [rx, ry] = newXY.get(p.id)!;
      const [x, y] = toScreen(rx, ry, view);
      const r = radius(p);
      if (x < -r || y < -r || x > width + r || y > height + r) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (isBuilt(p.status)) {
        ctx.fillStyle = c.fg;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.bg;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = c.bg;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = isStopped(p.status) ? c.muted : c.fg;
        ctx.lineWidth = 1.5;
        ctx.setLineDash(isStopped(p.status) ? [2, 2] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Selection ring
    if (selected) {
      let x: number, y: number, r: number;
      if (selected.kind === "new") {
        const [rx, ry] = newXY.get(selected.p.id)!;
        [x, y] = toScreen(rx, ry, view);
        r = radius(selected.p) + 4;
      } else {
        const i = existingIndex.get(selected.e)!;
        [x, y] = toScreen(existingXY[i * 2], existingXY[i * 2 + 1], view);
        r = 6;
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = c.fg;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [width, height, land, view, visibleNew, visibleExisting, selected, newXY, existingXY, existingIndex, toScreen, themeTick]);

  const hitTest = useCallback(
    (mx: number, my: number): Hit | null => {
      let best: Hit | null = null;
      let bestD = Infinity;
      for (const p of visibleNew) {
        const [rx, ry] = newXY.get(p.id)!;
        const [x, y] = toScreen(rx, ry);
        const d = Math.hypot(x - mx, y - my);
        if (d <= radius(p) + 4 && d < bestD) {
          best = { kind: "new", p };
          bestD = d;
        }
      }
      if (best) return best;
      for (const e of visibleExisting) {
        const i = existingIndex.get(e)!;
        const [x, y] = toScreen(existingXY[i * 2], existingXY[i * 2 + 1]);
        const d = Math.hypot(x - mx, y - my);
        if (d <= 6 && d < bestD) {
          best = { kind: "existing", e };
          bestD = d;
        }
      }
      return best;
    },
    [visibleNew, visibleExisting, newXY, existingXY, existingIndex, toScreen],
  );

  // ----- view changes

  const clamp = useCallback(
    (v: View): View => {
      const k = Math.min(MAX_ZOOM, Math.max(1, v.k));
      const w = width * k;
      const h = height * k;
      return { k, x: Math.min(0, Math.max(width - w, v.x)), y: Math.min(0, Math.max(height - h, v.y)) };
    },
    [width, height],
  );

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setView((v) => {
        const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
        const f = k / v.k;
        return clamp({ k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f });
      });
    },
    [clamp],
  );

  const animRef = useRef(0);
  const flyTo = useCallback(
    (rx: number, ry: number, k: number) => {
      cancelAnimationFrame(animRef.current);
      const from = viewRef.current;
      const s = (width / REF_W) * k;
      const to = clamp({ k, x: width / 2 - rx * s, y: height / 2 - ry * s });
      const t0 = performance.now();
      const step = (t: number) => {
        const u = Math.min(1, (t - t0) / 450);
        const e = 1 - Math.pow(1 - u, 3);
        setView({ k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
        if (u < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    },
    [width, height, clamp],
  );

  // Ctrl/⌘ + wheel zooms; plain wheel keeps scrolling the page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let timer = 0;
    const onWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) {
        setHint(true);
        clearTimeout(timer);
        timer = window.setTimeout(() => setHint(false), 1200);
        return;
      }
      ev.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomAt(Math.exp(-ev.deltaY * 0.004), ev.clientX - r.left, ev.clientY - r.top);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
    };
  }, [zoomAt]);

  // Drag to pan, pinch to zoom
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(0);
  const onPointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    moved.current = 0;
  };
  const onPointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    const prev = pointers.current.get(ev.pointerId);
    if (!prev) {
      const hit = hitTest(ev.clientX - r.left, ev.clientY - r.top);
      setHover(hit ? { hit, x: ev.clientX - r.left, y: ev.clientY - r.top } : null);
      return;
    }
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const other = [...pointers.current.entries()].find(([id]) => id !== ev.pointerId)![1];
      const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
      const d1 = Math.hypot(ev.clientX - other.x, ev.clientY - other.y);
      if (d0 > 0) zoomAt(d1 / d0, (ev.clientX + other.x) / 2 - r.left, (ev.clientY + other.y) / 2 - r.top);
    } else {
      const dx = ev.clientX - prev.x;
      const dy = ev.clientY - prev.y;
      moved.current += Math.abs(dx) + Math.abs(dy);
      setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
    }
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    setHover(null);
  };
  const onPointerUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const wasTap = pointers.current.size === 1 && moved.current < 5;
    pointers.current.delete(ev.pointerId);
    if (!wasTap) return;
    const r = ev.currentTarget.getBoundingClientRect();
    setSelected(hitTest(ev.clientX - r.left, ev.clientY - r.top));
  };

  // "Map" links in the table below focus a project here
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as Element).closest<HTMLElement>("[data-dc-focus]");
      if (!a) return;
      const p = projects.find((x) => x.id === a.dataset.dcFocus);
      if (!p) return;
      ev.preventDefault();
      setShowNew(true);
      setStatuses((s) => new Set(s).add(p.status));
      setQuery("");
      setSelected({ kind: "new", p });
      const [rx, ry] = newXY.get(p.id)!;
      flyTo(rx, ry, 8);
      wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [projects, newXY, flyTo]);

  // Searching frames the matches
  useEffect(() => {
    if (!q || !width) return;
    const t = window.setTimeout(() => {
      const pts = visibleNew.map((p) => newXY.get(p.id)! as [number, number]);
      for (const e of visibleExisting) {
        const i = existingIndex.get(e)!;
        pts.push([existingXY[i * 2], existingXY[i * 2 + 1]]);
      }
      if (!pts.length) return;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const k = Math.min(12, Math.max(1, 0.8 * Math.min(REF_W / Math.max(x1 - x0, 1), (REF_W * 0.52) / Math.max(y1 - y0, 1))));
      flyTo((x0 + x1) / 2, (y0 + y1) / 2, k);
    }, 400);
    return () => clearTimeout(t);
  }, [q, width, visibleNew, visibleExisting, newXY, existingXY, existingIndex, flyTo]);

  const toggleStatus = (s: string) =>
    setStatuses((cur) => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const statusCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) m.set(p.status, (m.get(p.status) ?? 0) + 1);
    return m;
  }, [projects]);

  return (
    <section id="map" className="bleed dc-map" aria-label="Interactive data center map">
      <div className="dc-controls">
        <input
          type="search"
          className="field"
          placeholder={existingOnly ? "Search name, operator or country" : "Search operator, project, city or country"}
          aria-label="Search the map"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {!existingOnly && (
          <>
            <div className="dc-chips" role="group" aria-label="Layers">
              <button type="button" className="dc-chip" aria-pressed={showNew} onClick={() => setShowNew((v) => !v)}>
                <span className="dc-key dc-key-built" aria-hidden="true" />
                New builds <span className="meta">{projects.length}</span>
              </button>
              <button type="button" className="dc-chip" aria-pressed={showExisting} onClick={() => setShowExisting((v) => !v)}>
                <span className="dc-key dc-key-existing" aria-hidden="true" />
                Existing <span className="meta">{existingCount.toLocaleString("en-US")}</span>
              </button>
            </div>
            <div className="dc-chips" role="group" aria-label="Project status">
              {STATUS_ORDER.filter((s) => statusCounts.get(s)).map((s) => (
                <button key={s} type="button" className="dc-chip" aria-pressed={statuses.has(s)} onClick={() => toggleStatus(s)} disabled={!showNew}>
                  <span className={`dc-key ${isBuilt(s) ? "dc-key-built" : isStopped(s) ? "dc-key-stopped" : "dc-key-planned"}`} aria-hidden="true" />
                  {s[0].toUpperCase() + s.slice(1)} <span className="meta">{statusCounts.get(s)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div ref={wrapRef} className="dc-canvas-wrap" style={{ height: height || undefined }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={
            existingOnly
              ? `World map of ${existingCount} existing data centers`
              : `World map of ${projects.length} new data center projects`
          }
          style={{ width, height, cursor: hover ? "pointer" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={(ev) => pointers.current.delete(ev.pointerId)}
          onPointerLeave={() => setHover(null)}
        />
        <div className="dc-zoom">
          <button type="button" aria-label="Zoom in" onClick={() => zoomAt(2, width / 2, height / 2)}>
            +
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => zoomAt(0.5, width / 2, height / 2)}>
            −
          </button>
          <button type="button" aria-label="Reset view" onClick={() => flyTo(REF_W / 2, (REF_W * 0.52) / 2, 1)}>
            ⤢
          </button>
        </div>
        {hint && <p className="dc-hint meta">Hold ⌘ or Ctrl and scroll to zoom</p>}
        {hover && (
          <div className="dc-tip meta" style={{ left: hover.x + 12, top: hover.y + 12 }}>
            {hover.hit.kind === "new" ? (
              <>
                <strong>{hover.hit.p.name}</strong>
                <br />
                {hover.hit.p.operator} · {hover.hit.p.capacityMw ? fmtMw(hover.hit.p.capacityMw) : hover.hit.p.status}
              </>
            ) : (
              <>
                <strong>{hover.hit.e[2] || "Unnamed data center"}</strong>
                {hover.hit.e[3] && (
                  <>
                    <br />
                    {hover.hit.e[3]}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <p className="meta mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {existingOnly ? (
          <span>
            Showing {visibleExisting.length.toLocaleString("en-US")} of {existingCount.toLocaleString("en-US")} data centers
            {existing ? "" : " (loading…)"}.
          </span>
        ) : (
          <>
            <span>
              Showing {visibleNew.length} of {projects.length} new builds
              {showExisting && existing ? ` and ${visibleExisting.length.toLocaleString("en-US")} existing sites` : ""}.
            </span>
            <span>Circle size = planned capacity (MW). Filled = under construction or operating; hollow = announced; dashed = paused or cancelled.</span>
          </>
        )}
        <span>Drag to pan, ⌘/Ctrl + scroll or pinch to zoom, click a site for details.</span>
      </p>

      <div aria-live="polite">{selected && <Detail hit={selected} onClose={() => setSelected(null)} />}</div>
    </section>
  );
}

function Detail({ hit, onClose }: { hit: Hit; onClose: () => void }) {
  if (hit.kind === "existing") {
    const [lng, lat, name, operator, country, ref] = hit.e;
    return (
      <div className="dc-detail">
        <div className="dc-detail-head">
          <h3>{name || "Unnamed data center"}</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <dl className="facts">
          <dt>Operator</dt>
          <dd>{operator || "Not tagged"}</dd>
          <dt>Country</dt>
          <dd>{country || "—"}</dd>
          <dt>Location</dt>
          <dd className="mono">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </dd>
          <dt>Source</dt>
          <dd>
            <a className="link" href={`https://www.openstreetmap.org/${ref}`} target="_blank" rel="noopener noreferrer">
              OpenStreetMap {ref}
            </a>
          </dd>
        </dl>
      </div>
    );
  }
  const p = hit.p;
  const place = [p.city, p.region, p.country].filter(Boolean).join(", ");
  return (
    <div className="dc-detail">
      <div className="dc-detail-head">
        <h3>{p.name}</h3>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
      {p.detail && <p className="mb-4 max-w-[44rem]">{p.detail}</p>}
      <dl className="facts">
        <dt>Developer</dt>
        <dd>{p.operator}</dd>
        {p.tenant && (
          <>
            <dt>Anchor tenant</dt>
            <dd>{p.tenant}</dd>
          </>
        )}
        <dt>Location</dt>
        <dd>{place}</dd>
        <dt>Status</dt>
        <dd>{p.status[0].toUpperCase() + p.status.slice(1)}</dd>
        {p.capacityMw !== null && (
          <>
            <dt>Planned capacity</dt>
            <dd>{fmtMw(p.capacityMw)}</dd>
          </>
        )}
        {p.investmentUsdBn !== null && (
          <>
            <dt>Investment</dt>
            <dd>${p.investmentUsdBn.toLocaleString("en-US", { maximumFractionDigits: 1 })} billion</dd>
          </>
        )}
        {p.purpose && (
          <>
            <dt>Use</dt>
            <dd>{p.purpose}</dd>
          </>
        )}
        {p.announced && (
          <>
            <dt>Announced</dt>
            <dd>{p.announced}</dd>
          </>
        )}
        {p.expectedOnline && (
          <>
            <dt>Expected online</dt>
            <dd>{p.expectedOnline}</dd>
          </>
        )}
        <dt>Sources</dt>
        <dd>
          <ul className="m-0 list-none p-0">
            {p.sources.map((s) => (
              <li key={s.url}>
                <a className="link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title || new URL(s.url).hostname}
                </a>{" "}
                {s.published && <span className="meta">{s.published}</span>}
              </li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>
  );
}
