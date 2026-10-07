export type Category =
  | "Mathematics"
  | "History"
  | "Science"
  | "Geography"
  | "Literature"
  | "Programming"
  | "Music"
  | "Movies"
  | "Sports"
  | "Mythology";

export interface Enemy {
  id: string;
  name: string;
  title: string;
  category: Category;
  emoji: string;
  maxHp: number;
  flavor: string;
}

export interface Question {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  topic: string;
  category: Category | string;
  difficulty: number;
  damage: number;
}

export type BattlePhase =
  | "loading"
  | "asking"
  | "revealing"
  | "victory"
  | "defeat"
  | "error";

export interface DamageEvent {
  id: number;
  value: number;
  kind: "player-attack" | "enemy-attack" | "heal" | "miss";
  x: number;
  y: number;
}