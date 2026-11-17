export type Difficulty = "Kolay" | "Orta" | "Zor";

export type Question = {
  question: string;
  image?: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
  category: string;
};
