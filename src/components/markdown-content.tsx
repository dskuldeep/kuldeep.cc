"use client";

import type { Element } from "hast";
import { isValidElement, useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Embed, resolveEmbed } from "@/components/embed";
import { ImageLightbox, ZoomableImage } from "@/components/image-lightbox";

function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reactId = useId();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "inherit",
        });
        const renderId = `mmd${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
        const { svg: rendered } = await mermaid.render(renderId, chart);
        if (!cancelled) setSvg(rendered);
      } catch {
        // Invalid diagram source — fall back to showing the raw code.
        if (!cancelled) setSvg("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (!svg) {
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    );
  }

  // Strip mermaid's inline max-width so the SVG scales freely in the lightbox.
  const lightboxSvg = svg.replace(/max-width:\s*[\d.]+px;?/g, "");
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(lightboxSvg)}`;

  return (
    <>
      <div
        className="mermaid-container"
        role="button"
        tabIndex={0}
        aria-label="Expand diagram"
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <ImageLightbox
        src={dataUrl}
        alt="Diagram"
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        wide
      />
    </>
  );
}

function extractMermaidChart(children: React.ReactNode): string | null {
  if (!isValidElement(children)) return null;
  const props = children.props as { className?: string; children?: React.ReactNode };
  if (typeof props.className === "string" && props.className.includes("language-mermaid")) {
    return typeof props.children === "string" ? props.children : null;
  }
  return null;
}

/** A paragraph whose only content is a link to its own URL, i.e. a pasted bare URL. */
function bareUrl(node: Element | undefined): string | null {
  const kids = (node?.children ?? []).filter(
    (child) => child.type !== "text" || child.value.trim() !== "",
  );
  if (kids.length !== 1) return null;
  const [only] = kids;
  if (only.type !== "element" || only.tagName !== "a") return null;
  const href = only.properties?.href;
  if (typeof href !== "string") return null;
  const text = only.children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
    .trim();
  return text === href || text === href.replace(/\/$/, "") ? href : null;
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ node, children, ...props }) {
          const url = bareUrl(node);
          const embed = url ? resolveEmbed(url) : null;
          if (embed) return <Embed embed={embed} />;
          return <p {...props}>{children}</p>;
        },
        pre({ node: _node, children, ...props }) {
          const chart = extractMermaidChart(children);
          if (chart) return <MermaidDiagram chart={chart.trim()} />;
          return <pre {...props}>{children}</pre>;
        },
        a({ node: _node, href, children, ...props }) {
          const external = typeof href === "string" && /^https?:\/\//.test(href);
          return (
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              {...props}
            >
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          return <ZoomableImage src={typeof src === "string" ? src : undefined} alt={alt} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
