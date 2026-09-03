"use client";

import { isValidElement, useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children, ...props }) {
          const chart = extractMermaidChart(children);
          if (chart) return <MermaidDiagram chart={chart.trim()} />;
          return <pre {...props}>{children}</pre>;
        },
        a({ href, children, ...props }) {
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
