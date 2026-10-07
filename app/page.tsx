import StartScreen from "@/components/StartScreen";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <StartScreen
        onStartHref="/game"
        githubHref="https://github.com/Ajxrhaider/trivia-knights"
        websiteHref="https://hizakilabs.com"
      />
    </main>
  );
}