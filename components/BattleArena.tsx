"use client";

import Link from "next/link";
import { useGameState } from "@/lib/gameState";
import EnemyCard from "./EnemyCard";
import HealthBar from "./HealthBar";
import QuestionPanel from "./QuestionPanel";
import DamageNumber from "./DamageNumber";

export default function BattleArena() {
  const { state, actions, derived } = useGameState();
  const { startGame, answer } = actions;

  if (!state.enemy && state.phase !== "error") {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <Link
          href="/"
          className="absolute left-6 top-6 btn-ghost text-sm"
          aria-label="Back to title"
        >
          ← Back
        </Link>
        <div className="text-6xl">⚔️</div>
        <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          The Dungeon Awaits
        </h1>
        <p className="mt-3 max-w-xl text-secondary/70">
          Each floor brings a new monster and an infinite stream of trivia from
          Gemini. Answer correctly to strike. Answer wrong, and you bleed.
        </p>
        <button
          onClick={startGame}
          className="btn-primary mt-8 animate-pulse-glow text-lg"
        >
          ⚔️ Begin Battle
        </button>
        <p className="mt-4 text-xs text-secondary/50">
          Tip: questions get harder as you go. Don't let the streak break.
        </p>
      </div>
    );
  }

  if (state.phase === "defeat") {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-7xl">💀</div>
        <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          You Have Fallen
        </h1>
        <p className="mt-2 text-secondary/70">The dungeon claims another hero.</p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <Stat label="Enemies Slain" value={state.enemyIndex} />
          <Stat label="Final Score" value={state.score} />
          <Stat label="Best Streak" value={state.bestStreak} />
        </div>
        <button onClick={startGame} className="btn-primary mt-8 text-lg">
          🛡️ Try Again
        </button>
        <Link href="/" className="btn-ghost mt-3 text-sm">
          Back to Title
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between text-sm text-secondary/70">
        <Link
          href="/"
          className="rounded-lg border border-secondary/20 bg-ink-800/60 px-3 py-1.5 transition-all hover:scale-105 hover:border-primary/60"
        >
          ← Title
        </Link>
        <div className="flex items-center gap-4 font-display">
          <span>
            ⚔️ <span className="text-white">Score</span>{" "}
            <span className="text-primary-200">{state.score}</span>
          </span>
          <span>
            🔥 <span className="text-white">Streak</span>{" "}
            <span className="text-primary-200">{state.streak}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card relative flex flex-col items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            {state.events.map((e) => (
              <DamageNumber key={e.id} event={e} />
            ))}
          </div>

          <div className="mb-6 w-full">
            <HealthBar
              current={state.enemyHp}
              max={state.enemy!.maxHp}
              label={`Enemy · ${state.enemy!.name}`}
              variant="enemy"
            />
          </div>

          <div className="relative">
            <EnemyCard enemy={state.enemy!} phase={state.phase} />
            {(state.phase === "revealing" || state.phase === "victory") && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-7xl text-primary opacity-80 animate-slash">
                💥
              </div>
            )}
          </div>

          <p className="mt-10 max-w-md text-center text-sm italic text-secondary/60">
            "{state.enemy!.flavor}"
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="card">
            <HealthBar
              current={state.playerHp}
              max={state.playerMaxHp}
              label="Hero"
              variant="player"
            />
            <div className="mt-3 flex justify-between text-xs text-secondary/60">
              <span>Encounter {state.enemyIndex + 1}</span>
              <span>
                {state.enemyIndex === 0 ? "First blood" : `${state.enemyIndex} down`}
              </span>
            </div>
          </div>

          <QuestionPanel
            question={state.question}
            phase={state.phase}
            selectedAnswer={state.selectedAnswer}
            timeLeft={state.timeLeft}
            loading={state.phase === "loading"}
            error={state.phase === "error" ? state.error : null}
            onAnswer={answer}
            onRetry={startGame}
          />
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-secondary/20 bg-ink-800/60 px-4 py-3">
      <div className="font-display text-2xl font-bold text-primary-200">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-secondary/60">
        {label}
      </div>
    </div>
  );
}