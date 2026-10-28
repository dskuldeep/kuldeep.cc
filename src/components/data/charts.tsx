/**
 * Server-rendered SVG charts for /data. Ink comes from the site's CSS
 * variables, so charts follow the light/dark theme like the rest of the type.
 * Every chart is a <figure> with an accessible label and a caption, and the
 * values are in the SVG text itself, so crawlers read the same numbers.
 */

const W = 640;
const FONT = { fontFamily: "var(--font-sans)" };

interface FigureProps {
  title: string;
  caption?: string;
  source?: string;
  children: React.ReactNode;
}

function Figure({ title, caption, source, children }: FigureProps) {
  return (
    <figure className="chart">
      <p className="chart-title">{title}</p>
      {children}
      {(caption || source) && (
        <figcaption className="meta mt-2">
          {caption}
          {caption && source ? " " : ""}
          {source && <span>Source: {source}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export interface BarItem {
  label: string;
  value: number;
  /** Rendered in full ink; others are muted. Omit on every item to ink all bars. */
  highlight?: boolean;
}

export function HBarChart({
  title,
  items,
  format = (v) => `${v}`,
  max,
  caption,
  source,
  labelWidth = 190,
}: {
  title: string;
  items: BarItem[];
  format?: (v: number) => string;
  max?: number;
  caption?: string;
  source?: string;
  labelWidth?: number;
}) {
  const row = 30;
  const h = items.length * row + 8;
  const x0 = labelWidth;
  const x1 = W - 70;
  const mx = max ?? Math.max(...items.map((i) => i.value));
  const anyHighlight = items.some((i) => i.highlight);
  return (
    <Figure title={title} caption={caption} source={source}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={title} style={FONT}>
        <desc>{items.map((i) => `${i.label}: ${format(i.value)}`).join("; ")}</desc>
        {items.map((it, i) => {
          const y = i * row + 4;
          const w = Math.max(((x1 - x0) * it.value) / mx, 1.5);
          const strong = !anyHighlight || it.highlight;
          return (
            <g key={it.label}>
              <text x={x0 - 10} y={y + 17} fontSize="13" textAnchor="end" fill="var(--fg)">
                {it.label}
              </text>
              <rect x={x0} y={y + 5} width={x1 - x0} height={16} fill="var(--rule)" opacity={0.5} />
              <rect x={x0} y={y + 5} width={w} height={16} fill={strong ? "var(--fg)" : "var(--faint)"} />
              <text x={x0 + w + 8} y={y + 17} fontSize="13" fontWeight="650" fill="var(--fg)">
                {format(it.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

export function ColumnChart({
  title,
  items,
  format = (v) => `${v}`,
  caption,
  source,
}: {
  title: string;
  items: BarItem[];
  format?: (v: number) => string;
  caption?: string;
  source?: string;
}) {
  const h = 240;
  const top = 24;
  const bot = h - 34;
  const x0 = 8;
  const x1 = W - 8;
  const mx = Math.max(...items.map((i) => i.value), 1);
  const bw = (x1 - x0) / items.length;
  const anyHighlight = items.some((i) => i.highlight);
  return (
    <Figure title={title} caption={caption} source={source}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={title} style={FONT}>
        <desc>{items.map((i) => `${i.label}: ${format(i.value)}`).join("; ")}</desc>
        <line x1={x0} x2={x1} y1={bot} y2={bot} stroke="var(--fg)" strokeWidth={1.5} />
        {items.map((it, i) => {
          const bh = ((bot - top) * it.value) / mx;
          const x = x0 + i * bw + bw * 0.2;
          const strong = !anyHighlight || it.highlight;
          return (
            <g key={it.label}>
              <rect x={x} y={bot - bh} width={bw * 0.6} height={bh} fill={strong ? "var(--fg)" : "var(--faint)"} />
              <text x={x + bw * 0.3} y={bot - bh - 6} fontSize="13" fontWeight="650" textAnchor="middle" fill="var(--fg)">
                {format(it.value)}
              </text>
              <text x={x + bw * 0.3} y={bot + 18} fontSize="12" textAnchor="middle" fill="var(--muted)">
                {it.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

export function LineChart({
  title,
  points,
  format = (v) => `${v}`,
  max,
  step = false,
  caption,
  source,
}: {
  title: string;
  points: { label: string; value: number | null }[];
  format?: (v: number) => string;
  max?: number;
  step?: boolean;
  caption?: string;
  source?: string;
}) {
  const h = 240;
  const top = 20;
  const bot = h - 34;
  const x0 = 54;
  const x1 = W - 70;
  const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
  const mx = max ?? Math.max(...vals) * 1.15;
  const X = (i: number) => x0 + ((x1 - x0) * i) / Math.max(points.length - 1, 1);
  const Y = (v: number) => bot - ((bot - top) * v) / mx;
  const pts = points.map((p, i) => (p.value === null ? null : { x: X(i), y: Y(p.value), v: p.value })).filter(Boolean) as {
    x: number;
    y: number;
    v: number;
  }[];
  const d = step
    ? `M${pts[0].x},${pts[0].y}` + pts.slice(1).map((p) => ` H${p.x} V${p.y}`).join("")
    : "M" + pts.map((p) => `${p.x},${p.y}`).join(" L");
  const last = pts[pts.length - 1];
  return (
    <Figure title={title} caption={caption} source={source}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={title} style={FONT}>
        <desc>{points.map((p) => `${p.label}: ${p.value === null ? "no data" : format(p.value)}`).join("; ")}</desc>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={x0} x2={x1} y1={Y(mx * t)} y2={Y(mx * t)} stroke="var(--rule)" />
            <text x={x0 - 8} y={Y(mx * t) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">
              {format(Math.round(mx * t * 100) / 100)}
            </text>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={p.label} x={X(i)} y={bot + 20} fontSize="12" textAnchor="middle" fill="var(--muted)">
            {p.label}
          </text>
        ))}
        <path d={d} fill="none" stroke="var(--fg)" strokeWidth={2.5} strokeLinejoin="round" />
        {pts.map((p) => (
          <circle key={`${p.x}`} cx={p.x} cy={p.y} r={3.5} fill="var(--bg)" stroke="var(--fg)" strokeWidth={2} />
        ))}
        <text x={last.x + 10} y={last.y + 4} fontSize="13" fontWeight="650" fill="var(--fg)">
          {format(last.v)}
        </text>
      </svg>
    </Figure>
  );
}

export function GroupedHBarChart({
  title,
  series,
  groups,
  format = (v) => `${v}`,
  max,
  caption,
  source,
}: {
  title: string;
  series: string[];
  groups: { label: string; values: (number | null)[] }[];
  format?: (v: number) => string;
  max?: number;
  caption?: string;
  source?: string;
}) {
  const shades = ["var(--fg)", "var(--muted)", "var(--faint)"];
  const bar = 12;
  const gap = 3;
  const groupH = series.length * (bar + gap) + 14;
  const legendH = 26;
  const h = legendH + groups.length * groupH;
  const x0 = 110;
  const x1 = W - 60;
  const mx = max ?? Math.max(...groups.flatMap((g) => g.values.filter((v): v is number => v !== null)));
  return (
    <Figure title={title} caption={caption} source={source}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={title} style={FONT}>
        <desc>
          {groups
            .map((g) => `${g.label}: ${g.values.map((v, i) => `${series[i]} ${v === null ? "n/a" : format(v)}`).join(", ")}`)
            .join("; ")}
        </desc>
        {series.map((s, i) => (
          <g key={s}>
            <rect x={x0 + i * 170} y={4} width={11} height={11} fill={shades[i]} />
            <text x={x0 + i * 170 + 17} y={14} fontSize="12" fill="var(--fg)">
              {s}
            </text>
          </g>
        ))}
        {groups.map((g, gi) => {
          const y0 = legendH + gi * groupH;
          return (
            <g key={g.label}>
              <text x={x0 - 10} y={y0 + (series.length * (bar + gap)) / 2 + 4} fontSize="13" fontWeight="650" textAnchor="end" fill="var(--fg)">
                {g.label}
              </text>
              {g.values.map((v, i) => {
                const y = y0 + i * (bar + gap);
                if (v === null)
                  return (
                    <text key={i} x={x0 + 2} y={y + bar - 2} fontSize="11" fill="var(--faint)">
                      none
                    </text>
                  );
                const w = Math.max(((x1 - x0) * v) / mx, 1.5);
                return (
                  <g key={i}>
                    <rect x={x0} y={y} width={w} height={bar} fill={shades[i]} />
                    <text x={x0 + w + 6} y={y + bar - 2} fontSize="11" fill="var(--fg)">
                      {format(v)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}
