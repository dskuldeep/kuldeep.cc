"use client";

import { useEffect, useState } from "react";

const heroLines: Array<{
  prompt?: string;
  text: string;
  tone?: "g" | "b" | "y" | "r" | "m";
  delay: number;
}> = [
  { prompt: "$", text: "whoami", delay: 0 },
  { text: "kuldeep — head of marketing @ maxim ai", tone: "g", delay: 120 },
  { text: "", delay: 160 },
  { prompt: "$", text: "cat stack.md", delay: 220 },
  { text: "→ ai-native growth, signal-first content", tone: "y", delay: 300 },
  { text: "→ product narrative · data-aware funnels", tone: "y", delay: 360 },
  { text: "→ automation for small, leveraged teams", tone: "y", delay: 420 },
  { text: "", delay: 460 },
  { prompt: "$", text: "ls principles/", delay: 520 },
  { text: "measure_before_ship.sh  trust_the_compounders.md", tone: "b", delay: 600 },
  { text: "rewrite_until_it_sings.sh  build_in_public.md", tone: "b", delay: 660 },
  { text: "", delay: 700 },
  { prompt: "$", text: "echo $STATUS", delay: 760 },
  { text: "shipping · hiring · open for partnerships", tone: "r", delay: 840 },
];

export function HeroArt() {
  const [count, setCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const total = heroLines.length;
    let i = 0;
    const step = () => {
      if (!active) return;
      setCount(i + 1);
      i += 1;
      if (i < total) {
        const next = heroLines[i];
        setTimeout(step, Math.max(60, (next.delay - heroLines[i - 1].delay) || 220));
      }
    };
    setTimeout(step, 250);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const blinkInterval = window.setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 540);

    return () => {
      window.clearInterval(blinkInterval);
    };
  }, []);

  const cursorClassName = `hero-term-cursor${cursorVisible ? "" : " term-cursor-hidden"}`;

  return (
    <div className="relative">
      <div className="term">
        <div className="term-bar">
          <span className="bb" style={{ background: "#e8573d" }} />
          <span className="bb" style={{ background: "#f0d66c" }} />
          <span className="bb" style={{ background: "#9fc57a" }} />
          <span className="ml-2 text-white/45 sm:hidden">~/now</span>
          <span className="ml-2 hidden text-white/45 sm:inline">~/kuldeep/now — bash</span>
          <span className="ml-auto hidden text-white/35 sm:inline">utf-8 · ansi</span>
        </div>

        <div className="term-body min-h-[260px] sm:min-h-[340px]">
          {heroLines.slice(0, count).map((line, idx) => {
            const isLast = idx === count - 1;
            const toneClass = line.tone ? line.tone : "";
            return (
              <span key={idx} className="term-line">
                {line.prompt && (
                  <span style={{ color: "#e8573d" }}>
                    kuldeep@marketing
                  </span>
                )}
                {line.prompt && <span style={{ color: "#9fc57a" }}> ~</span>}
                {line.prompt && <span style={{ color: "#ece8dc" }}> {line.prompt} </span>}
                <span className={toneClass}>{line.text}</span>
                {isLast && <span className={cursorClassName} />}
              </span>
            );
          })}
          {count >= heroLines.length && (
            <span className="term-line" style={{ marginTop: 6 }}>
              <span style={{ color: "#e8573d" }}>kuldeep@marketing</span>
              <span style={{ color: "#9fc57a" }}> ~</span>
              <span> $ </span>
              <span className={cursorClassName} />
            </span>
          )}
        </div>
      </div>

      {/* Meta strip under terminal */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--ink-mute)] sm:gap-x-4 sm:text-[0.7rem] sm:tracking-[0.14em]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse bg-[var(--accent)]" />
          live session
        </span>
        <span>·</span>
        <span>uptime 5y</span>
        <span>·</span>
        <span>shell: marketing@ai</span>
      </div>
    </div>
  );
}
