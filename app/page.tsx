"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import {
  CheckCircle,
  Coins,
  Gift,
  Plus,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";

type Child = {
  id: number;
  name: string;
  coins: number;
  xp: number;
  level: number;
};

type Task = {
  id: number;
  title: string;
  coins: number;
  xp: number;
  done: boolean;
};

type Reward = {
  id: number;
  title: string;
  price: number;
};

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<"kids" | "parents">("kids");

  const [child, setChild] = useState<Child>({
    id: 1,
    name: "Mila",
    coins: 12,
    xp: 40,
    level: 2,
  });

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Mathe 10 Minuten üben", coins: 5, xp: 15, done: false },
    { id: 2, title: "Zimmer aufräumen", coins: 8, xp: 20, done: false },
    { id: 3, title: "Lesen 15 Minuten", coins: 6, xp: 18, done: false },
  ]);

  const [rewards] = useState<Reward[]>([
    { id: 1, title: "30 Min. Bildschirmzeit", price: 20 },
    { id: 2, title: "Lieblingssnack", price: 15 },
    { id: 3, title: "Kleines Geschenk", price: 50 },
  ]);

  const [newTask, setNewTask] = useState("");

  function completeTask(taskId: number) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.done) return;

    const newXp = child.xp + task.xp;
    const newLevel = Math.floor(newXp / 100) + 1;

    setChild({
      ...child,
      coins: child.coins + task.coins,
      xp: newXp,
      level: newLevel,
    });

    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: true } : t)));
  }

  function buyReward(reward: Reward) {
    if (child.coins < reward.price) {
      alert("Du hast noch nicht genug Coins.");
      return;
    }

    setChild({
      ...child,
      coins: child.coins - reward.price,
    });

    alert(`Belohnung eingelöst: ${reward.title}`);
  }

  function addTask() {
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask,
        coins: 5,
        xp: 10,
        done: false,
      },
    ]);

    setNewTask("");
  }

  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10 bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="w-full max-w-xl rounded-[3rem] bg-white p-10 shadow-2xl border border-white">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Punktly"
              className="h-36 w-36 rounded-full shadow-xl"
            />

            <h1 className="mt-8 text-5xl font-black text-slate-800">
              Willkommen bei Punktly
            </h1>

            <p className="mt-5 text-lg font-semibold leading-relaxed text-slate-500">
              Die moderne Familien-App für Aufgaben, Lernen,
              Motivation, Coins, XP und Belohnungen.
            </p>

            <div className="mt-8 rounded-3xl bg-gradient-to-r from-red-50 to-emerald-50 px-10 py-6 shadow-inner">
              <p className="text-2xl font-black text-red-500 line-through">
                49,99 €
              </p>

              <p className="mt-2 text-6xl font-black text-emerald-600">
                29,99 €
              </p>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Einmalzahlung • Familienzugang • Alle Funktionen
              </p>
            </div>

            <div className="mt-10 flex w-full flex-col gap-4">
              <button
                onClick={() => {
                  setView("kids");
                  setStarted(true);
                }}
                className="rounded-3xl bg-indigo-600 px-6 py-5 text-xl font-black text-white shadow-lg transition hover:scale-[1.02]"
              >
                Kinderbereich
              </button>

              <button
                onClick={() => {
                  setView("parents");
                  setStarted(true);
                }}
                className="rounded-3xl bg-pink-500 px-6 py-5 text-xl font-black text-white shadow-lg transition hover:scale-[1.02]"
              >
                Elternbereich
              </button>

              <button
                onClick={() => setStarted(true)}
                className="rounded-3xl bg-yellow-400 px-6 py-5 text-xl font-black text-slate-900 shadow-lg transition hover:scale-[1.02]"
              >
                Demo starten
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <main />;
}
