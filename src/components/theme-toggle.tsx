"use client";

import { Moon, Sun } from "lucide-react";

function isEffectivelyDark(): boolean {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark") return true;
  if (explicit === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const toggle = () => {
    const next = isEffectivelyDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode — the choice just won't persist.
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      title="Toggle light/dark mode"
    >
      <Sun size={17} className="icon-sun" aria-hidden="true" />
      <Moon size={17} className="icon-moon" aria-hidden="true" />
    </button>
  );
}
