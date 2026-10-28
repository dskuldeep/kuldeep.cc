import { hostOf } from "@/lib/data";

/** Outbound source link labelled with the source domain; opens in a new tab. */
export function SourceLink({ url, label }: { url: string | null; label?: string }) {
  if (!url) return <span className="text-[var(--faint)]">—</span>;
  return (
    <a className="link" href={url} target="_blank" rel="noopener">
      {label ?? hostOf(url)}
    </a>
  );
}
