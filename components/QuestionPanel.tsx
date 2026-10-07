"use client";

import type { Question, BattlePhase } from "@/lib/types";

interface QuestionPanelProps {
  question: Question | null;
  phase: BattlePhase;
  selectedAnswer: number | null;
  timeLeft: number;
  loading: boolean;
  error: string | null;
  onAnswer: (i: number) => void;
  onRetry: () => void;
}

export default function QuestionPanel({
  question,
  phase,
  selectedAnswer,
  timeLeft,
  loading,
  error,
  onAnswer,
  onRetry,
}: QuestionPanelProps) {
  if (error) {
    return (
      <div className="card border-red-500/40 text-center">
        <div className="text-2xl">⚠️</div>
        <h3 className="mt-2 font-display text-lg font-semibold text-white">
          The dungeon is silent…
        </h3>
        <p className="mt-1 text-sm text-secondary/70">{error}</p>
        <p className="mt-2 text-xs text-secondary/50">
          Check that <code className="rounded bg-ink-900 px-1.5 py-0.5">GEMINI_API_KEY</code> is set
          in your environment.
        </p>
        <button onClick={onRetry} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (loading || !question) {
    return (
      <div className="card animate-pulse text-center">
        <div className="text-4xl">🧙‍♂️</div>
        <p className="mt-3 font-display text-lg text-white">
          The {question?.category ?? "monster"} is preparing a question…
        </p>
        <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-ink-900">
          <div className="h-full w-1/2 animate-[floatIn_1.2s_ease-in-out_infinite_alternate] rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  const isRevealing = phase === "revealing";
  const isVictory = phase === "victory";
  const correctIdx = question.answerIndex;

  return (
    <div className="card animate-float-in">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-secondary/60">
        <span>
          {question.category} · {question.topic}
        </span>
        <span>Level {question.difficulty}/10</span>
      </div>

      <h2 className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
        {question.question}
      </h2>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-900">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            timeLeft < 5 ? "bg-red-500" : "bg-primary"
          }`}
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === correctIdx;
          const showCorrect = isRevealing || isVictory;

          let classes =
            "group flex items-center gap-3 rounded-lg border bg-ink-900/60 px-4 py-3 text-left text-sm transition-all duration-200 hover:scale-[1.02] hover:border-primary/60 hover:bg-ink-800/80";
          if (isRevealing || isVictory) {
            classes += " cursor-default";
            if (isCorrect) {
              classes += " border-emerald-400 bg-emerald-500/10 text-emerald-100";
            } else if (isSelected) {
              classes += " border-red-400 bg-red-500/10 text-red-100";
            } else {
              classes += " border-secondary/10 opacity-60";
            }
          } else {
            classes += " border-secondary/20 text-secondary";
          }

          const letter = String.fromCharCode(65 + i);

          return (
            <button
              key={i}
              type="button"
              disabled={isRevealing || isVictory}
              onClick={() => onAnswer(i)}
              className={classes}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold ${
                  (isRevealing || isVictory) && isCorrect
                    ? "bg-emerald-500/30 text-emerald-100"
                    : isRevealing && isSelected && !isCorrect
                    ? "bg-red-500/30 text-red-100"
                    : "bg-primary/20 text-primary-200 group-hover:bg-primary/30"
                }`}
              >
                {letter}
              </span>
              <span className="flex-1 leading-snug">{choice}</span>
            </button>
          );
        })}
      </div>

      {(isRevealing || isVictory) && question.explanation && (
        <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-secondary/80">
          <span className="mr-1 font-semibold text-primary-200">💡</span>
          {question.explanation}
        </p>
      )}
    </div>
  );
}