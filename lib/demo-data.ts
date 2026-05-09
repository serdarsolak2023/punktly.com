import { ChildProfile, Coin, Reward, Task } from "./types";

export const coins: Coin[] = [
  { id: 1, name: "Sonnen-Coin", emoji: "☀️", color: "bg-yellow-200" },
  { id: 2, name: "Stern-Coin", emoji: "⭐", color: "bg-amber-200" },
  { id: 3, name: "Mond-Coin", emoji: "🌙", color: "bg-indigo-200" },
  { id: 4, name: "Raketen-Coin", emoji: "🚀", color: "bg-sky-200" },
  { id: 5, name: "Herz-Coin", emoji: "💖", color: "bg-pink-200" },
  { id: 6, name: "Blitz-Coin", emoji: "⚡", color: "bg-lime-200" },
  { id: 7, name: "Regenbogen-Coin", emoji: "🌈", color: "bg-purple-200" },
  { id: 8, name: "Fuchs-Coin", emoji: "🦊", color: "bg-orange-200" },
  { id: 9, name: "Panda-Coin", emoji: "🐼", color: "bg-zinc-200" },
  { id: 10, name: "Löwen-Coin", emoji: "🦁", color: "bg-yellow-300" },
  { id: 11, name: "Einhorn-Coin", emoji: "🦄", color: "bg-fuchsia-200" },
  { id: 12, name: "Dino-Coin", emoji: "🦕", color: "bg-emerald-200" },
  { id: 13, name: "Krone-Coin", emoji: "👑", color: "bg-yellow-100" },
  { id: 14, name: "Diamant-Coin", emoji: "💎", color: "bg-cyan-200" },
  { id: 15, name: "Apfel-Coin", emoji: "🍎", color: "bg-red-200" },
  { id: 16, name: "Buch-Coin", emoji: "📚", color: "bg-blue-200" },
  { id: 17, name: "Pinsel-Coin", emoji: "🎨", color: "bg-rose-200" },
  { id: 18, name: "Musik-Coin", emoji: "🎵", color: "bg-violet-200" },
  { id: 19, name: "Ball-Coin", emoji: "⚽", color: "bg-green-200" },
  { id: 20, name: "Baum-Coin", emoji: "🌳", color: "bg-teal-200" },
  { id: 21, name: "Wasser-Coin", emoji: "💧", color: "bg-blue-100" },
  { id: 22, name: "Feuer-Coin", emoji: "🔥", color: "bg-red-300" },
  { id: 23, name: "Zauber-Coin", emoji: "✨", color: "bg-purple-100" }
];

export const children: ChildProfile[] = [
  { id: "child-1", name: "Mila", level: 4, xp: 380, coins: 82, avatarCoinId: 11 },
  { id: "child-2", name: "Noah", level: 2, xp: 145, coins: 34, avatarCoinId: 4 }
];

export const tasks: Task[] = [
  { id: "task-1", title: "Zimmer aufräumen", description: "Bett machen und Spielzeug in die Kisten legen.", rewardCoins: 10, rewardXp: 25, status: "offen", childId: "child-1" },
  { id: "task-2", title: "Zähne putzen", description: "Morgens und abends erledigen.", rewardCoins: 5, rewardXp: 10, status: "prüfung", childId: "child-1" },
  { id: "task-3", title: "Tisch decken", description: "Teller, Besteck und Becher vorbereiten.", rewardCoins: 8, rewardXp: 18, status: "offen", childId: "child-2" }
];

export const rewards: Reward[] = [
  { id: "reward-1", title: "Extra Vorlesezeit", cost: 30, description: "15 Minuten zusätzliche Geschichte." },
  { id: "reward-2", title: "Filmabend", cost: 80, description: "Einen Familienfilm aussuchen." },
  { id: "reward-3", title: "Spielplatz-Wunsch", cost: 50, description: "Kind darf den Spielplatz auswählen." }
];
