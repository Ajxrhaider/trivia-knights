"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BattlePhase,
  DamageEvent,
  Enemy,
  Question,
} from "./types";
import { pickNextEnemy } from "./enemies";

const PLAYER_MAX_HP = 100;
const QUESTION_TIME_SEC = 20;
const TIMER_TICK_MS = 100;

export interface GameState {
  playerHp: number;
  playerMaxHp: number;
  score: number;
  streak: number;
  bestStreak: number;
  enemy: Enemy | null;
  enemyHp: number;
  enemyIndex: number;
  phase: BattlePhase;
  question: Question | null;
  selectedAnswer: number | null;
  timeLeft: number;
  error: string | null;
  events: DamageEvent[];
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    score: 0,
    streak: 0,
    bestStreak: 0,
    enemy: null,
    enemyHp: 0,
    enemyIndex: 0,
    phase: "loading",
    question: null,
    selectedAnswer: null,
    timeLeft: QUESTION_TIME_SEC,
    error: null,
    events: [],
  });

  const eventIdRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const pushEvent = useCallback(
    (kind: DamageEvent["kind"], value: number, x = 50, y = 50) => {
      eventIdRef.current += 1;
      const id = eventIdRef.current;
      setState((s) => ({
        ...s,
        events: [...s.events, { id, value, kind, x, y }],
      }));
      setTimeout(() => {
        setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
      }, 950);
    },
    []
  );

  const fetchQuestion = useCallback(async (enemy: Enemy, difficulty: number) => {
    setState((s) => ({
      ...s,
      phase: "loading",
      question: null,
      selectedAnswer: null,
      timeLeft: QUESTION_TIME_SEC,
      error: null,
    }));

    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: enemy.category, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const q: Question = data;
      setState((s) => ({
        ...s,
        question: q,
        phase: "asking",
        timeLeft: QUESTION_TIME_SEC,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        phase: "error",
        error: (err as Error).message || "Failed to fetch question.",
      }));
    }
  }, []);

  const startGame = useCallback(() => {
    const firstEnemy = pickNextEnemy(0);
    eventIdRef.current = 0;
    setState({
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
      score: 0,
      streak: 0,
      bestStreak: 0,
      enemy: firstEnemy,
      enemyHp: firstEnemy.maxHp,
      enemyIndex: 0,
      phase: "loading",
      question: null,
      selectedAnswer: null,
      timeLeft: QUESTION_TIME_SEC,
      error: null,
      events: [],
    });
    fetchQuestion(firstEnemy, 1);
  }, [fetchQuestion]);

  const answer = useCallback(
    (index: number) => {
      setState((s) => {
        if (s.phase !== "asking" || !s.question) return s;
        return { ...s, selectedAnswer: index, phase: "revealing" };
      });

      if (tickRef.current) clearInterval(tickRef.current);

      setState((s) => {
        if (!s.question || !s.enemy) return s;

        const correct = index === s.question.answerIndex;

        if (correct) {
          const dmg = s.question.damage;
          const newHp = Math.max(0, s.enemyHp - dmg);
          const newStreak = s.streak + 1;
          pushEvent("player-attack", dmg, 30 + Math.random() * 40, 35);

          if (newHp === 0) {
            revealTimeoutRef.current = setTimeout(() => {
              setState((prev) => {
                const nextIdx = prev.enemyIndex + 1;
                const nextEnemy = pickNextEnemy(nextIdx);
                return {
                  ...prev,
                  enemy: nextEnemy,
                  enemyHp: nextEnemy.maxHp,
                  enemyIndex: nextIdx,
                  score: prev.score + 100 + prev.streak * 10,
                  streak: newStreak,
                  bestStreak: Math.max(prev.bestStreak, newStreak),
                  phase: "victory",
                };
              });
            }, 900);
            return {
              ...s,
              enemyHp: newHp,
              streak: newStreak,
              bestStreak: Math.max(s.bestStreak, newStreak),
              phase: "revealing",
            };
          }

          const nextDifficulty = Math.min(10, s.question.difficulty + 1);
          const enemyForNext = s.enemy;
          revealTimeoutRef.current = setTimeout(() => {
            if (!enemyForNext) return;
            fetchQuestion(enemyForNext, nextDifficulty);
          }, 900);
          return {
            ...s,
            enemyHp: newHp,
            streak: newStreak,
            bestStreak: Math.max(s.bestStreak, newStreak),
          };
        }

        const enemyDmg = 10 + s.question.difficulty * 2;
        const newHp = Math.max(0, s.playerHp - enemyDmg);
        pushEvent("enemy-attack", -enemyDmg, 30 + Math.random() * 40, 65);
        const newStreak = 0;

        if (newHp === 0) {
          revealTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, phase: "defeat" }));
          }, 700);
          return {
            ...s,
            playerHp: newHp,
            streak: newStreak,
            phase: "revealing",
          };
        }

        const nextDifficultyWrong = Math.max(1, s.question.difficulty - 1);
        const enemyForWrong = s.enemy;
        revealTimeoutRef.current = setTimeout(() => {
          if (!enemyForWrong) return;
          fetchQuestion(enemyForWrong, nextDifficultyWrong);
        }, 1100);
        return { ...s, playerHp: newHp, streak: newStreak };
      });
    },
    [fetchQuestion, pushEvent]
  );

  useEffect(() => {
    if (state.phase !== "asking") {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(() => {
      setState((s) => {
        if (s.phase !== "asking") return s;
        const next = s.timeLeft - TIMER_TICK_MS / 1000;
        if (next <= 0) {
          if (tickRef.current) clearInterval(tickRef.current);
          setTimeout(() => answer(-1), 0);
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: next };
      });
    }, TIMER_TICK_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, answer]);

  useEffect(() => {
    if (state.phase === "victory" && state.enemy) {
      const t = setTimeout(() => {
        fetchQuestion(state.enemy!, Math.min(10, 1 + Math.floor(state.enemyIndex / 1)));
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.enemy, state.enemyIndex, fetchQuestion]);

  const enemyPercent = useMemo(() => {
    if (!state.enemy) return 0;
    return Math.max(0, Math.min(100, (state.enemyHp / state.enemy.maxHp) * 100));
  }, [state.enemy, state.enemyHp]);

  const playerPercent = useMemo(
    () => Math.max(0, Math.min(100, (state.playerHp / state.playerMaxHp) * 100)),
    [state.playerHp, state.playerMaxHp]
  );

  return {
    state,
    actions: { startGame, answer },
    derived: { enemyPercent, playerPercent },
  };
}

export type GameApi = ReturnType<typeof useGameState>;