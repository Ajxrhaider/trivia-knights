"use client";

import type { DamageEvent } from "@/lib/types";

interface DamageNumberProps {
  event: DamageEvent;
}

export default function DamageNumber({ event }: DamageNumberProps) {
  const color =
    event.kind === "player-attack"
      ? "text-emerald-300"
      : event.kind === "enemy-attack"
      ? "text-red-400"
      : event.kind === "heal"
      ? "text-sky-300"
      : "text-secondary";

  const sign = event.value > 0 && event.kind === "player-attack" ? "−" : "";
  const label = event.kind === "miss" ? "MISS" : `${sign}${Math.abs(event.value)}`;

  return (
    <div
      className={`damage-popup animate-damage ${color}`}
      style={{
        left: `${event.x}%`,
        top: `${event.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {label}
    </div>
  );
}