"use client";

import { useEffect, useState } from "react";

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  variant: "player" | "enemy";
  animated?: boolean;
}

export default function HealthBar({
  current,
  max,
  label,
  variant,
  animated = true,
}: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const [display, setDisplay] = useState(pct);

  useEffect(() => {
    if (!animated) {
      setDisplay(pct);
      return;
    }
    let raf = 0;
    const start = display;
    const end = pct;
    const t0 = performance.now();
    const dur = 450;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(start + (end - start) * eased);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, animated]);

  const isPlayer = variant === "player";
  const fillColor = isPlayer
    ? "from-emerald-500 to-emerald-300"
    : "from-primary to-primary-300";
  const trackColor = isPlayer ? "bg-emerald-950/50" : "bg-ink-900/60";

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-secondary/80">
        <span className="font-display font-semibold">{label}</span>
        <span>
          {Math.max(0, Math.round(current))} / {max}
        </span>
      </div>
      <div
        className={`relative h-4 w-full overflow-hidden rounded-full border border-secondary/20 ${trackColor}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${fillColor} transition-[width] duration-150`}
          style={{ width: `${display}%` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.05) 6px 12px)",
          }}
        />
      </div>
    </div>
  );
}