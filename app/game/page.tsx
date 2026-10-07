import BattleArena from "@/components/BattleArena";

export const metadata = {
  title: "Battle | Trivia Knights",
};

export default function GamePage() {
  return (
    <main className="relative min-h-screen">
      <BattleArena />
    </main>
  );
}