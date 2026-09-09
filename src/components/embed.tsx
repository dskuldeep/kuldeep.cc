"use client";

import { useEffect, useRef, useState } from "react";

export type ResolvedEmbed =
  | { kind: "iframe"; src: string; title: string; ratio?: number; height?: number }
  | { kind: "tweet"; id: string };

function seconds(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

function youtube(u: URL): ResolvedEmbed | null {
  const path = u.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  let ratio = 16 / 9;

  if (u.hostname.endsWith("youtu.be")) {
    id = path[0];
  } else if (path[0] === "watch") {
    id = u.searchParams.get("v") ?? undefined;
  } else if (path[0] === "shorts") {
    id = path[1];
    ratio = 9 / 16;
  } else if (path[0] === "embed" || path[0] === "live") {
    id = path[1];
  }
  if (!id || !/^[\w-]{6,}$/.test(id)) return null;

  const start = seconds(u.searchParams.get("t") ?? u.searchParams.get("start"));
  const src = `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ""}`;
  return { kind: "iframe", src, title: "YouTube video", ratio };
}

function vimeo(u: URL): ResolvedEmbed | null {
  const id = u.pathname.split("/").filter(Boolean).pop();
  if (!id || !/^\d+$/.test(id)) return null;
  return {
    kind: "iframe",
    src: `https://player.vimeo.com/video/${id}`,
    title: "Vimeo video",
    ratio: 16 / 9,
  };
}

function loom(u: URL): ResolvedEmbed | null {
  const path = u.pathname.split("/").filter(Boolean);
  if (path[0] !== "share" && path[0] !== "embed") return null;
  const id = path[1];
  if (!id || !/^[\w-]+$/.test(id)) return null;
  return {
    kind: "iframe",
    src: `https://www.loom.com/embed/${id}`,
    title: "Loom recording",
    ratio: 16 / 9,
  };
}

const SPOTIFY_HEIGHTS: Record<string, number> = {
  track: 152,
  episode: 232,
  album: 380,
  playlist: 380,
  show: 232,
  artist: 380,
};

function spotify(u: URL): ResolvedEmbed | null {
  const [type, id] = u.pathname.split("/").filter(Boolean);
  const height = SPOTIFY_HEIGHTS[type];
  if (!height || !id || !/^\w+$/.test(id)) return null;
  return {
    kind: "iframe",
    src: `https://open.spotify.com/embed/${type}/${id}`,
    title: "Spotify player",
    height,
  };
}

function figma(u: URL): ResolvedEmbed | null {
  if (!/^\/(file|design|proto|board|slides)\//.test(u.pathname)) return null;
  return {
    kind: "iframe",
    src: `https://embed.figma.com/${u.pathname.slice(1)}?embed-host=share`,
    title: "Figma file",
    ratio: 16 / 9,
  };
}

function codepen(u: URL): ResolvedEmbed | null {
  // Personal pens are /user/pen/ID; team pens are /team/name/pen/ID.
  const parts = u.pathname.split("/").filter(Boolean);
  const at = parts.indexOf("pen");
  const id = parts[at + 1];
  if (at < 1 || !id) return null;
  const owner = parts.slice(0, at).join("/");
  return {
    kind: "iframe",
    src: `https://codepen.io/${owner}/embed/${id}?default-tab=result`,
    title: "CodePen",
    height: 420,
  };
}

function tweet(u: URL): ResolvedEmbed | null {
  const [, status, id] = u.pathname.split("/").filter(Boolean);
  if (status !== "status" || !id || !/^\d+$/.test(id)) return null;
  return { kind: "tweet", id };
}

const PROVIDERS: Array<[RegExp, (u: URL) => ResolvedEmbed | null]> = [
  [/^(www\.|m\.)?youtube(-nocookie)?\.com$|^youtu\.be$/, youtube],
  [/^(www\.|player\.)?vimeo\.com$/, vimeo],
  [/^(www\.)?loom\.com$/, loom],
  [/^open\.spotify\.com$/, spotify],
  [/^(www\.|embed\.)?figma\.com$/, figma],
  [/^(www\.)?codepen\.io$/, codepen],
  [/^(www\.)?(twitter|x)\.com$/, tweet],
];

/** Maps a bare URL to an embed, or null when the host isn't on the allowlist. */
export function resolveEmbed(raw: string): ResolvedEmbed | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const provider = PROVIDERS.find(([host]) => host.test(url.hostname));
  return provider ? provider[1](url) : null;
}

const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";

function TweetEmbed({ id }: { id: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://platform.twitter.com") return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const payload = (event.data as Record<string, unknown> | null)?.["twttr.embed"] as
        | { method?: string; params?: Array<{ height?: number }> }
        | undefined;
      if (payload?.method !== "twttr.private.resize") return;
      const next = payload.params?.[0]?.height;
      if (typeof next === "number" && next > 0) setHeight(next);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="embed embed-tweet" style={{ height }}>
      <iframe
        ref={frameRef}
        src={`https://platform.twitter.com/embed/Tweet.html?id=${id}&dnt=true`}
        title="Post on X"
        loading="lazy"
        scrolling="no"
      />
    </div>
  );
}

export function Embed({ embed }: { embed: ResolvedEmbed }) {
  if (embed.kind === "tweet") return <TweetEmbed id={embed.id} />;

  return (
    <div
      className="embed"
      style={embed.height ? { height: embed.height } : { aspectRatio: embed.ratio ?? 16 / 9 }}
    >
      <iframe
        src={embed.src}
        title={embed.title}
        loading="lazy"
        allow={ALLOW}
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
