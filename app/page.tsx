"use client";

import { useEffect, useState } from "react";
import { Trophy, Globe, ArrowLeft, Zap, Clock, CheckCircle, XCircle } from "lucide-react";

type Champion = {
  id: string;
  name: string;
  title: string;
  image: { full: string };
  spells: {
    id: string;
    name: string;
    description: string;
    image: { full: string };
  }[];
};

type Item = {
  id: string;
  name: string;
  description: string;
  image: { full: string };
  gold: { total: number };
};

type Question = {
  image: string;
  answer: string;
  options: string[];
  category: string;
};

export default function Home() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [champions, setChampions] = useState<Champion[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [gameVersion, setGameVersion] = useState("15.1.1");
  const [mode, setMode] = useState("");
  const [difficulty, setDifficulty] = useState("Karışık");
  const [style, setStyle] = useState("Klasik");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState("");
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(15);
  const [loading, setLoading] = useState(true);

  const tr = language === "tr";

  useEffect(() => {
    fetch("/api/game-data")
      .then(r => r.json())
      .then(data => {
        setGameVersion(data.version);
        setChampions(data.champions || []);
        setItems(data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const makeQuestions = (selectedMode: string) => {
    const pool: Question[] = [];

    if (selectedMode === "champion" || selectedMode === "silhouette") {
      const shuffled = [...champions].sort(() => Math.random() - 0.5);
      shuffled.slice(0, 10).forEach(champ => {
        const others = champions
          .filter(c => c.id !== champ.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.name);

        pool.push({
          image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`,
          answer: champ.name,
          options: [...others, champ.name].sort(() => Math.random() - 0.5),
          category: selectedMode
        });
      });
    } else if (selectedMode === "item") {
      const poolItems = items.filter(i => i.gold?.total > 0 && i.name);
      const shuffled = [...poolItems].sort(() => Math.random() - 0.5);

      shuffled.slice(0, 10).forEach(item => {
        const others = poolItems
          .filter(i => i.id !== item.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(i => i.name);

        pool.push({
          image: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/item/${item.image.full}`,
          answer: item.name,
          options: [...others, item.name].sort(() => Math.random() - 0.5),
          category: "item"
        });
      });
     } else if (selectedMode === "ability") {
       const shuffled = [...champions].sort(() => Math.random() - 0.5);

      shuffled.slice(0, 10).forEach(champ => {
      const spell = champ.spells[
      Math.floor(Math.random() * champ.spells.length)
    ];

    if (!spell) return;

    const others = champions
      .filter(c => c.id !== champ.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.name);

    pool.push({
      image: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/spell/${spell.image.full}`,
      answer: champ.name,
      options: [...others, champ.name].sort(() => Math.random() - 0.5),
      category: "ability"
    });
  });
  }
    return pool;
  };

  const startGame = () => {
    const generated = makeQuestions(mode);
    if (generated.length === 0) return;
    setQuestions(generated);
    setIndex(0);
    setScore(0);
    setCorrect(0);
    setSelected("");
    setFinished(false);
    setTime(15);
  };

  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(v => v + 1);
      setSelected("");
      setTime(15);
    }
  };

  const answerQuestion = (answer: string) => {
    if (selected || finished) return;
    setSelected(answer);

    if (answer === questions[index].answer) {
      const points = difficulty === "Kolay" ? 100 : difficulty === "Orta" ? 150 : difficulty === "Zor" ? 200 : 150;
      setScore(v => v + points);
      setCorrect(v => v + 1);
    } else if (style === "Hayatta Kalma") {
      setTimeout(() => setFinished(true), 1000);
      return;
    }

    setTimeout(nextQuestion, 1100);
  };

  useEffect(() => {
    if (!mode || style !== "Zamana Karşı" || finished || questions.length === 0 || selected) return;

    const timer = setInterval(() => {
      setTime(v => {
        if (v <= 1) {
          clearInterval(timer);
          setTimeout(nextQuestion, 0);
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, style, finished, questions.length, index, selected]);

  const reset = () => {
    setMode("");
    setQuestions([]);
    setFinished(false);
  };

  return (
    <main className="min-h-screen bg-[#080812] text-white">
      <header className="border-b border-white/10 bg-[#0d0c19]">
        <div className="container flex items-center justify-between py-5">
          <button onClick={reset} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 font-black text-xl">LQ</div>
            <span className="text-xl font-black">LoL <span className="text-purple-400">Quiz</span></span>
          </button>
          <button onClick={() => setLanguage(tr ? "en" : "tr")} className="rounded-lg border border-white/10 px-4 py-2 text-sm">
            <Globe size={15} className="mr-2 inline" />{tr ? "TR" : "EN"}
          </button>
        </div>
      </header>

      <section className="container py-12">
        {!mode && (
          <>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs font-bold tracking-widest text-purple-400">THE ULTIMATE LEAGUE QUIZ</p>
              <h1 className="text-4xl font-black sm:text-6xl">{tr ? <>Ne kadar <span className="text-purple-400">LoL</span> biliyorsun?</> : <>How well do you know <span className="text-purple-400">LoL</span>?</>}</h1>
              <p className="mt-5 text-gray-400">{tr ? "Bilgini test et ve en iyiler arasına gir!" : "Test your knowledge and climb the ranks!"}</p>
            </div>

            {loading ? (
              <p className="py-12 text-center text-purple-300">Oyun verileri yükleniyor...</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["champion", "⚔️", "Şampiyonu Bul", "Guess the Champion"],
                  ["item", "🛡️", "Eşyayı Bul", "Guess the Item"],
                  ["ability", "✨", "Yeteneği Bul", "Guess the Ability"],
                  ["silhouette", "👁️", "Silüetten Şampiyon", "Champion Silhouette"]
                ].map(([id, icon, titleTR, titleEN]) => (
                  <button key={id} onClick={() => setMode(id)} className="quiz-card p-7 text-left">
                    <div className="mb-5 text-4xl">{icon}</div>
                    <h2 className="text-xl font-black">{tr ? titleTR : titleEN}</h2>
                    <p className="mt-3 text-sm text-purple-400">{tr ? "MODU SEÇ →" : "SELECT MODE →"}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {mode && !questions.length && !finished && (
          <div className="mx-auto max-w-xl rounded-2xl border border-purple-500/30 bg-[#151225] p-7">
            <button onClick={() => setMode("")} className="mb-6 text-sm text-gray-400"><ArrowLeft size={16} className="mr-2 inline" />{tr ? "Geri" : "Back"}</button>
            <h2 className="mb-6 text-2xl font-black">{tr ? "Oyun Ayarları" : "Game Settings"}</h2>

            <p className="mb-3 font-bold">{tr ? "Zorluk" : "Difficulty"}</p>
            <div className="mb-7 flex flex-wrap gap-2">
              {["Kolay", "Orta", "Zor", "Karışık"].map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={`rounded-lg border px-4 py-2 ${difficulty === d ? "border-purple-400 bg-purple-600" : "border-white/10"}`}>
                  {tr ? d : ({ Kolay: "Easy", Orta: "Medium", Zor: "Hard", Karışık: "Mixed" } as any)[d]}
                </button>
              ))}
            </div>

            <p className="mb-3 font-bold">{tr ? "Oyun Tarzı" : "Game Style"}</p>
            <div className="mb-7 flex flex-wrap gap-2">
              {["Klasik", "Zamana Karşı", "Hayatta Kalma"].map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`rounded-lg border px-3 py-2 ${style === s ? "border-purple-400 bg-purple-600" : "border-white/10"}`}>
                  {tr ? s : ({ Klasik: "Classic", "Zamana Karşı": "Timed", "Hayatta Kalma": "Survival" } as any)[s]}
                </button>
              ))}
            </div>

            <button onClick={startGame} disabled={loading || (mode === "item" ? items.length === 0 : champions.length === 0)} className="w-full rounded-xl bg-purple-600 py-4 font-black hover:bg-purple-500 disabled:opacity-50">
              {tr ? "OYUNA BAŞLA" : "START GAME"}
            </button>
          </div>
        )}

        {mode && questions.length > 0 && !finished && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-wrap justify-between gap-3 text-sm">
              <span className="text-purple-300">{tr ? `Soru ${index + 1} / ${questions.length}` : `Question ${index + 1} / ${questions.length}`}</span>
              <span><Trophy size={16} className="mr-2 inline text-yellow-400" />{score} {tr ? "Puan" : "Points"}</span>
              {style === "Zamana Karşı" && <span><Clock size={16} className="mr-2 inline" />{time}s</span>}
            </div>

            <div className="quiz-card p-6 sm:p-9">
              <h2 className="mb-6 text-center text-2xl font-black">{tr ? "Bu hangisi?" : "What is this?"}</h2>
              <div className="mb-8 flex justify-center">
                  
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {questions[index].options.map(option => {
                  const isCorrect = selected && option === questions[index].answer;
                  const isWrong = selected === option && option !== questions[index].answer;
                  return (
                    <button key={option} disabled={!!selected} onClick={() => answerQuestion(option)} className={`rounded-xl border p-4 text-left font-bold transition ${isCorrect ? "border-green-500 bg-green-500/20" : isWrong ? "border-red-500 bg-red-500/20" : "border-white/10 bg-white/5 hover:border-purple-400"}`}>
                      {isCorrect && <CheckCircle size={17} className="mr-2 inline text-green-400" />}
                      {isWrong && <XCircle size={17} className="mr-2 inline text-red-400" />}
                      {option}
                    </button>
                  );
                })}
              </div>
              {selected && <p className="mt-5 text-center text-sm text-gray-300">{selected === questions[index].answer ? (tr ? "Doğru cevap!" : "Correct!") : (tr ? `Doğru cevap: ${questions[index].answer}` : `Correct answer: ${questions[index].answer}`)}</p>}
            </div>
          </div>
        )}

        {finished && (
          <div className="mx-auto max-w-xl rounded-2xl border border-purple-500/30 bg-[#151225] p-9 text-center">
            <Trophy size={48} className="mx-auto mb-5 text-yellow-400" />
            <h2 className="text-3xl font-black">{tr ? "Oyun Bitti!" : "Game Over!"}</h2>
            <p className="mt-5 text-5xl font-black text-purple-400">{score}</p>
            <p className="mt-2 text-gray-400">{tr ? "Toplam puan" : "Total points"}</p>
            <p className="mt-5">{tr ? `Doğru cevap: ${correct} / ${questions.length}` : `Correct answers: ${correct} / ${questions.length}`}</p>
            <button onClick={startGame} className="mt-8 w-full rounded-xl bg-purple-600 py-4 font-black">{tr ? "TEKRAR OYNA" : "PLAY AGAIN"}</button>
            <button onClick={reset} className="mt-3 w-full rounded-xl border border-white/10 py-4 font-bold">{tr ? "ANA SAYFA" : "HOME"}</button>
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 py-7 text-center text-xs text-gray-600">
        LoL Quiz · {tr ? "Riot Games ile bağlantılı değildir." : "Not affiliated with Riot Games."}
      </footer>
    </main>
  );
}
