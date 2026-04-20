"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const handleClose = useCallback(() => {
    setZoom(1);
    onClose();
  }, [onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  // Handle mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isOpen && e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
      }
    };

    if (isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="lightbox-overlay fixed inset-0 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
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
            handleZoomIn();
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
            handleZoomOut();
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
            handleResetZoom();
          }}
          className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 sm:p-2"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw size={20} />
        </button>
        <div className="rounded-full bg-white/10 px-2.5 py-1 text-center text-[10px] text-white sm:px-3 sm:text-xs">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Image */}
      <div
        className="relative flex max-h-[calc(100vh-6.5rem)] max-w-[calc(100vw-1.5rem)] items-center justify-center overflow-auto sm:max-h-[calc(100vh-10rem)] sm:max-w-[calc(100vw-10rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={src}
            alt={alt}
            className="rounded-lg object-contain transition-transform"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
              maxHeight: zoom === 1 ? "calc(100vh - 8rem)" : "none",
              maxWidth: zoom === 1 ? "calc(100vw - 2rem)" : "none",
            }}
          />
          {alt && (
            <div className="mt-3 text-center text-xs text-white/80 sm:mt-4 sm:text-sm">
              {alt}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-xs text-white/60 sm:bottom-6 sm:text-sm">
        Tap outside to close • Pinch / Ctrl+Scroll to zoom
      </div>
    </div>,
    document.body
  );
}

interface ZoomableImageProps {
  src?: string;
  alt?: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <img
        src={src}
        alt={alt || ""}
        className="my-6 cursor-pointer rounded-lg border border-[var(--line)] transition-all hover:shadow-lg hover:scale-[1.02]"
        onClick={handleImageClick}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      />
      <ImageLightbox
        src={src}
        alt={alt || ""}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
