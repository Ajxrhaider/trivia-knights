"use client";

import type { Enemy } from "@/lib/types";

interface EnemyCardProps {
  enemy: Enemy;
  phase: string;
}

export default function EnemyCard({ enemy, phase }: EnemyCardProps) {
  const isHurt = phase === "revealing";
  const isDead = phase === "victory";

  return (
    <div
      className={`relative mx-auto flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 ${
        isHurt ? "animate-shake" : ""
      } ${isDead ? "opacity-30 grayscale" : ""}`}
      aria-label={enemy.name}
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
      <div className="pulse-ring absolute inset-0 rounded-full" />

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-2 border-primary/40 bg-gradient-to-br from-ink-800 to-ink-900 shadow-glow">
        <span
          className="select-none text-7xl drop-shadow-[0_0_12px_rgba(99,102,241,0.6)] sm:text-8xl"
          role="img"
          aria-label={enemy.name}
        >
          {enemy.emoji}
        </span>
      </div>

      <div className="absolute -bottom-4 left-1/2 z-20 w-max -translate-x-1/2 rounded-full border border-primary/40 bg-ink-900/90 px-4 py-1 text-center shadow-card">
        <div className="font-display text-sm font-bold text-white">
          {enemy.name}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-primary-200">
          {enemy.title}
        </div>
      </div>
    </div>
  );
}