"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ZoomableImage } from "./image-lightbox";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// Dynamically import mermaid only on client-side
let mermaidModule: typeof import("mermaid").default | null = null;
const syntaxTheme = oneDark as unknown as Record<string, CSSProperties>;

async function initMermaid() {
  if (typeof window === "undefined" || mermaidModule) return mermaidModule;

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "system-ui, -apple-system, sans-serif",
    themeVariables: {
      fontSize: "16px",
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
    },
    sequence: {
      useMaxWidth: true,
    },
    gantt: {
      useMaxWidth: true,
    },
  });

  mermaidModule = mermaid;
  return mermaid;
}

interface MarkdownContentProps {
  content: string;
}

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  node?: unknown;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const mermaidRef = useRef<number>(0);
  const renderedDiagramsRef = useRef<Set<string>>(new Set());
  const [mermaidLightbox, setMermaidLightbox] = useState<{
    isOpen: boolean;
    svgContent: string;
  }>({ isOpen: false, svgContent: "" });
  const [mermaidZoom, setMermaidZoom] = useState(1);
  const closeMermaidLightbox = useCallback(() => {
    setMermaidZoom(1);
    setMermaidLightbox({ isOpen: false, svgContent: "" });
  }, []);

  useEffect(() => {
    // Dynamically load and render mermaid diagrams
    (async () => {
      const mermaid = await initMermaid();
      if (!mermaid) return;

      // Find all mermaid diagrams that haven't been rendered yet
      const mermaidElements = document.querySelectorAll(".mermaid");
      const unrenderedElements: Element[] = [];

      mermaidElements.forEach((element) => {
        const id = element.id;
        // Only render if it hasn't been rendered before and doesn't have an SVG child
        if (id && !renderedDiagramsRef.current.has(id) && !element.querySelector("svg")) {
          unrenderedElements.push(element);
          renderedDiagramsRef.current.add(id);
        }
      });

      // Only run mermaid if there are unrendered diagrams
      if (unrenderedElements.length > 0) {
        await mermaid.run({
          querySelector: ".mermaid",
        });
      }

      // Add click handlers to all mermaid diagrams (including already rendered ones)
      const mermaidContainers = document.querySelectorAll(".mermaid-container");
      mermaidContainers.forEach((element) => {
        const htmlElement = element as HTMLElement;

        // Skip if already has click handler
        if (htmlElement.dataset.hasClickHandler === "true") return;
        htmlElement.dataset.hasClickHandler = "true";

        htmlElement.style.cursor = "pointer";
        htmlElement.onclick = () => {
          const svgElement = element.querySelector("svg");
          if (svgElement) {
            // Clone the SVG to preserve all attributes
            const clonedSvg = svgElement.cloneNode(true) as SVGElement;

            // Get actual rendered dimensions and scale them up for lightbox
            const rect = svgElement.getBoundingClientRect();
            const scaleFactor = 1.5; // Make diagrams 1.5x larger in lightbox
            const width = Math.round(rect.width * scaleFactor);
            const height = Math.round(rect.height * scaleFactor);

            // Set explicit dimensions as attributes (needed for proper rendering in lightbox)
            clonedSvg.setAttribute("width", `${width}`);
            clonedSvg.setAttribute("height", `${height}`);
            clonedSvg.style.backgroundColor = "#ffffff";

            // Set viewBox for proper scaling (use original dimensions for viewBox)
            const viewBox = clonedSvg.getAttribute("viewBox");
            if (!viewBox) {
              const originalWidth = Math.round(rect.width);
              const originalHeight = Math.round(rect.height);
              clonedSvg.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
            }

            setMermaidLightbox({
              isOpen: true,
              svgContent: clonedSvg.outerHTML,
            });
          }
        };
      });
    })();
  }, [content]);

  // Handle ESC key for Mermaid lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mermaidLightbox.isOpen) {
        closeMermaidLightbox();
      }
    };

    if (mermaidLightbox.isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [mermaidLightbox.isOpen, closeMermaidLightbox]);

  // Handle mouse wheel zoom for Mermaid
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mermaidLightbox.isOpen && e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setMermaidZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
      }
    };

    if (mermaidLightbox.isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [mermaidLightbox.isOpen]);

  return (
    <>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-6 mt-12 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-4 mt-10 font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-8 font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)]">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-[var(--foreground)]">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 list-disc space-y-2 pl-6 text-[var(--foreground)]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-6 list-decimal space-y-2 pl-6 text-[var(--foreground)]">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[var(--orange)] underline decoration-[var(--orange)]/30 underline-offset-4 transition-colors hover:decoration-[var(--orange)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => <ZoomableImage src={typeof src === 'string' ? src : undefined} alt={typeof alt === 'string' ? alt : undefined} />,
            code(props) {
              const { inline, className, children, style, ...rest } = props as MarkdownCodeProps;
              void style;
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";

              // Handle mermaid diagrams
              if (language === "mermaid" && !inline) {
                const value = String(children).replace(/\n$/, "");
                const id = `mermaid-${mermaidRef.current++}`;

                return (
                  <div className="mermaid-container my-8 flex w-full cursor-pointer justify-center overflow-x-auto transition-all hover:opacity-80">
                    <div
                      id={id}
                      className="mermaid w-full max-w-full"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                      suppressHydrationWarning
                    >
                      {value}
                    </div>
                  </div>
                );
              }

              // Handle code blocks with syntax highlighting
              if (!inline && match) {
                return (
                  <div className="my-6">
                    <SyntaxHighlighter
                      style={syntaxTheme}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !bg-[#282c34]"
                      customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        fontSize: "0.875rem",
                      }}
                      {...rest}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              // Inline code
              return (
                <code
                  className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-[var(--foreground)]"
                  {...rest}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <>{children}</>, // Let SyntaxHighlighter handle pre
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Mermaid Lightbox - using Portal to render at document root */}
      {mermaidLightbox.isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="lightbox-overlay fixed inset-0 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeMermaidLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeMermaidLightbox}
            className="lightbox-controls absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6 sm:p-2"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Zoom controls */}
          <div className="lightbox-controls absolute left-3 top-3 flex gap-1.5 sm:left-6 sm:top-6 sm:flex-col sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMermaidZoom((prev) => Math.min(prev + 0.25, 3));
              }}
              className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 sm:p-2"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMermaidZoom((prev) => Math.max(prev - 0.25, 0.5));
              }}
              className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 sm:p-2"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMermaidZoom(1);
              }}
              className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 sm:p-2"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <RotateCcw size={20} />
            </button>
            <div className="rounded-full bg-white/10 px-2.5 py-1 text-center text-[10px] text-white sm:px-3 sm:text-xs">
              {Math.round(mermaidZoom * 100)}%
            </div>
          </div>

          {/* Diagram */}
          <div
            className="mermaid-lightbox-content relative transition-transform"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `scale(${mermaidZoom})`,
              transformOrigin: "center",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: mermaidLightbox.svgContent }}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-xs text-white/60 sm:bottom-6 sm:text-sm">
            Tap outside to close • Pinch / Ctrl+Scroll to zoom
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
