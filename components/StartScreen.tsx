"use client";

import Link from "next/link";

interface StartScreenProps {
  onStartHref: string;
  githubHref: string;
  websiteHref: string;
}

export default function StartScreen({
  onStartHref,
  githubHref,
  websiteHref,
}: StartScreenProps) {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
      {/* Top bar */}
      <nav className="absolute right-6 top-6 flex items-center gap-3 text-sm text-secondary/80">
        <a
          href={websiteHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-secondary/20 bg-ink-800/60 px-3 py-1.5 transition-all hover:scale-105 hover:border-primary/60"
        >
          Hizaki Labs ↗
        </a>
        <a
          href={githubHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-secondary/20 bg-ink-800/60 px-3 py-1.5 transition-all hover:scale-105 hover:border-primary/60"
        >
          GitHub ↗
        </a>
      </nav>

      {/* Crest */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-primary-200">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        Powered by Gemini 2.5 Flash
      </div>

      <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-7xl">
        <span className="bg-gradient-to-r from-white via-primary-200 to-primary bg-clip-text text-transparent">
          Trivia
        </span>{" "}
        <span className="text-primary">Knights</span>{" "}
        <span className="inline-block animate-pulse">⚔️</span>
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-secondary/80 sm:text-xl">
        A turn-based RPG where knowledge is your blade. Answer the questions
        the monsters ask, and watch them fall.
      </p>

      {/* Feature grid */}
      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: "🧠",
            title: "Infinite Questions",
            desc: "Generated live by Gemini — no repeats, ever.",
          },
          {
            icon: "👹",
            title: "Themed Bosses",
            desc: "Math Goblins. History Knights. Code Wraiths.",
          },
          {
            icon: "📈",
            title: "Scaling Difficulty",
            desc: "Each cleared encounter raises the stakes.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="card group text-left transition-all duration-200 hover:scale-105 hover:border-primary/40"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-display text-lg font-semibold text-white">
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-secondary/70">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
        <Link href={onStartHref} className="btn-primary animate-pulse-glow text-lg">
          ⚔️ Start Adventure
        </Link>
        <a
          href={githubHref}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost"
        >
          View Source
        </a>
      </div>

      <p className="mt-8 text-xs text-secondary/50">
        © {new Date().getFullYear()} Hizaki Labs · Crafted by Ajxrhaider
      </p>
    </div>
  );
}
