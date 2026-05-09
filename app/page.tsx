"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import {
  CheckCircle,
  Clock,
  Coins,
  Gift,
  Heart,
  Home,
  Plus,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";

type Area = "Haushalt" | "Schule" | "Gesundheit" | "Verhalten" | "Extra";

type TaskStatus = "open" | "waiting" | "approved" | "rejected";

type Child = {
  id: number;
  name: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
};

type Task = {
  id: number;
  childId: number;
  title: string;
  area: Area;
  coins: number;
  xp: number;
  status: TaskStatus;
};

type Reward = {
  id: number;
  title: string;
  price: number;
};

const areas: { name: Area; icon: React.ReactNode; color: string }[] = [
  { name: "Haushalt", icon: <Home />, color: "bg-orange-100 text-orange-700" },
  { name: "Schule", icon: <School />, color: "bg-blue-100 text-blue-700" },
  { name: "Gesundheit", icon: <Heart />, color: "bg-rose-100 text-rose-700" },
  { name: "Verhalten", icon: <Star />, color: "bg-purple-100 text-purple-700" },
  { name: "Extra", icon: <Sparkles />, color: "bg-yellow-100 text-yellow-700" },
];

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<"kids" | "parents">("kids");
  const [selectedChildId, setSelectedChildId] = useState(1);
  const [selectedArea, setSelectedArea] = useState<Area | "Alle">("Alle");

  const [children, setChildren] = useState<Child[]>([
    { id: 1, name: "Mila", avatar: "🦄", coins: 12, xp: 40, level: 2 },
    { id: 2, name: "Emir", avatar: "🦁", coins: 7, xp: 20, level: 1 },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      childId: 1,
      title: "Zimmer aufräumen",
      area: "Haushalt",
      coins: 8,
      xp: 15,
      status: "open",
    },
    {
      id: 2,
      childId: 1,
      title: "Hausaufgaben fertig machen",
      area: "Schule",
      coins: 10,
      xp: 20,
      status: "open",
    },
    {
      id: 3,
      childId: 1,
      title: "Zähne putzen ohne Erinnerung",
      area: "Gesundheit",
      coins: 4,
      xp: 8,
      status: "open",
    },
    {
      id: 4,
      childId: 2,
      title: "Tasche für morgen packen",
      area: "Schule",
      coins: 6,
      xp: 12,
      status: "open",
    },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    { id: 1, title: "30 Minuten Bildschirmzeit", price: 20 },
    { id: 2, title: "Lieblingssnack", price: 15 },
    { id: 3, title: "Gemeinsamer Ausflug", price: 60 },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCoins, setNewTaskCoins] = useState(5);
  const [newTaskArea, setNewTaskArea] = useState<Area>("Haushalt");

  const child = children.find((c) => c.id === selectedChildId) ?? children[0];

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const childMatch = task.childId === selectedChildId;
      const areaMatch = selectedArea === "Alle" || task.area === selectedArea;
      return childMatch && areaMatch;
    });
  }, [tasks, selectedChildId, selectedArea]);

  const waitingTasks = tasks.filter((task) => task.status === "waiting");
  const approvedTasks = tasks.filter((task) => task.status === "approved");

  function markTaskDone(taskId: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: "waiting" } : task
      )
    );
  }

  function approveTask(taskId: number) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status !== "waiting") return;

    setTasks((current) =>
      current.map((item) =>
        item.id === taskId ? { ...item, status: "approved" } : item
      )
    );

    setChildren((current) =>
      current.map((item) => {
        if (item.id !== task.childId) return item;

        const nextXp = item.xp + task.xp;

        return {
          ...item,
          coins: item.coins + task.coins,
          xp: nextXp,
          level: Math.floor(nextXp / 100) + 1,
        };
      })
    );
  }

  function rejectTask(taskId: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: "rejected" } : task
      )
    );
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;

    setTasks((current) => [
      {
        id: Date.now(),
        childId: selectedChildId,
        title: newTaskTitle,
        area: newTaskArea,
        coins: newTaskCoins,
        xp: newTaskCoins * 2,
        status: "open",
      },
      ...current,
    ]);

    setNewTaskTitle("");
    setNewTaskCoins(5);
  }

  function buyReward(reward: Reward) {
    if (child.coins < reward.price) {
      alert("Du hast noch nicht genug Coins.");
      return;
    }

    setChildren((current) =>
      current.map((item) =>
        item.id === child.id
          ? { ...item, coins: item.coins - reward.price }
          : item
      )
    );

    alert(`Belohnung angefragt: ${reward.title}`);
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-[#fff8ec] px-5 py-8">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <div className="grid w-full gap-8 rounded-[3rem] bg-white p-6 shadow-2xl md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-yellow-100 via-orange-50 to-blue-100 p-8 text-center">
              <img
                src="/logo.png"
                alt="Punktly"
                className="h-40 w-40 rounded-full shadow-xl"
              />

              <h1 className="mt-7 text-5xl font-black text-slate-800 md:text-6xl">
                Punktly
              </h1>

              <p className="mt-4 max-w-md text-lg font-bold leading-relaxed text-slate-600">
                Kinder erledigen Aufgaben, Eltern bestätigen und danach gibt es
                Coins für echte Belohnungen.
              </p>

              <div className="mt-7 rounded-[2rem] bg-white/80 px-10 py-6 shadow-inner">
                <p className="text-2xl font-black text-red-500 line-through">
                  49,99 €
                </p>
                <p className="mt-1 text-6xl font-black text-emerald-600">
                  29,99 €
                </p>
                <p className="mt-2 text-sm font-black uppercase tracking-wide text-slate-500">
                  Einmalzahlung • Familienzugang
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-7">
                <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                  Familien-App für Verantwortung & Motivation
                </p>
                <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                  Aufgaben machen.
                  <br />
                  Bestätigung bekommen.
                  <br />
                  Coins verdienen.
                </h2>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => {
                    setView("kids");
                    setStarted(true);
                  }}
                  className="rounded-[2rem] bg-indigo-600 px-6 py-6 text-left text-xl font-black text-white shadow-xl transition hover:scale-[1.02]"
                >
                  👧 Kinderbereich öffnen
                  <span className="mt-1 block text-sm font-bold text-indigo-100">
                    Aufgaben ansehen und als erledigt markieren
                  </span>
                </button>

                <button
                  onClick={() => {
                    setView("parents");
                    setStarted(true);
                  }}
                  className="rounded-[2rem] bg-pink-500 px-6 py-6 text-left text-xl font-black text-white shadow-xl transition hover:scale-[1.02]"
                >
                  👨‍👩‍👧 Elternbereich öffnen
                  <span className="mt-1 block text-sm font-bold text-pink-100">
                    Aufgaben prüfen, bestätigen und Coins vergeben
                  </span>
                </button>

                <button
                  onClick={() => setStarted(true)}
                  className="rounded-[2rem] bg-yellow-400 px-6 py-6 text-left text-xl font-black text-slate-900 shadow-xl transition hover:scale-[1.02]"
                >
                  ✨ Demo starten
                  <span className="mt-1 block text-sm font-bold text-yellow-800">
                    Kompletten Ablauf ausprobieren
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8ec] text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-500 shadow-sm">
              Punktly Familien-Dashboard
            </p>
            <h1 className="text-4xl font-black md:text-6xl">
              {view === "kids" ? "Kinderbereich" : "Elternbereich"}
            </h1>
          </div>

          <div className="flex rounded-full bg-white p-2 shadow-lg">
            <button
              onClick={() => setView("kids")}
              className={`rounded-full px-5 py-3 font-black ${
                view === "kids" ? "bg-indigo-600 text-white" : "text-slate-700"
              }`}
            >
              Kinder
            </button>
            <button
              onClick={() => setView("parents")}
              className={`rounded-full px-5 py-3 font-black ${
                view === "parents" ? "bg-indigo-600 text-white" : "text-slate-700"
              }`}
            >
              Eltern
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr_0.9fr]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-black">Kinder</h2>
              <div className="grid gap-3">
                {children.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedChildId(item.id)}
                    className={`flex items-center gap-3 rounded-3xl p-4 text-left transition ${
                      selectedChildId === item.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 text-slate-900"
                    }`}
                  >
                    <span className="text-4xl">{item.avatar}</span>
                    <span>
                      <span className="block text-lg font-black">
                        {item.name}
                      </span>
                      <span className="block text-sm font-bold opacity-80">
                        Level {item.level} • {item.coins} Coins
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-black">Aufgabenbereiche</h2>
              <div className="grid gap-3">
                <AreaButton
                  active={selectedArea === "Alle"}
                  label="Alle"
                  onClick={() => setSelectedArea("Alle")}
                />
                {areas.map((area) => (
                  <AreaButton
                    key={area.name}
                    active={selectedArea === area.name}
                    label={area.name}
                    icon={area.icon}
                    onClick={() => setSelectedArea(area.name)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-indigo-100 text-5xl">
                    {child.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-500">
                      Ausgewähltes Kind
                    </p>
                    <h2 className="text-3xl font-black">{child.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Stat icon={<Coins />} label="Coins" value={child.coins} />
                  <Stat icon={<Star />} label="XP" value={child.xp} />
                  <Stat icon={<Trophy />} label="Level" value={child.level} />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-black text-slate-500">
                  <span>Fortschritt bis nächstes Level</span>
                  <span>{child.xp % 100}/100 XP</span>
                </div>
                <div className="h-4 rounded-full bg-slate-200">
                  <div
                    className="h-4 rounded-full bg-indigo-600"
                    style={{ width: `${child.xp % 100}%` }}
                  />
                </div>
              </div>
            </div>

            {view === "kids" ? (
              <KidsPanel
                tasks={visibleTasks}
                rewards={rewards}
                onDone={markTaskDone}
                onBuyReward={buyReward}
              />
            ) : (
              <ParentsPanel
                selectedChildName={child.name}
                waitingTasks={waitingTasks}
                allTasks={visibleTasks}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskCoins={newTaskCoins}
                setNewTaskCoins={setNewTaskCoins}
                newTaskArea={newTaskArea}
                setNewTaskArea={setNewTaskArea}
                onAddTask={addTask}
                onApprove={approveTask}
                onReject={rejectTask}
              />
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-black">Ablauf</h2>
              <div className="space-y-3">
                <FlowStep number="1" text="Kind erledigt Aufgabe" />
                <FlowStep number="2" text="Kind markiert sie als fertig" />
                <FlowStep number="3" text="Eltern prüfen die Aufgabe" />
                <FlowStep number="4" text="Coins werden gutgeschrieben" />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-black">Status</h2>
              <div className="grid gap-3">
                <StatusCard label="Wartet auf Eltern" value={waitingTasks.length} />
                <StatusCard label="Bestätigt" value={approvedTasks.length} />
                <StatusCard label="Belohnungen" value={rewards.length} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function KidsPanel({
  tasks,
  rewards,
  onDone,
  onBuyReward,
}: {
  tasks: Task[];
  rewards: Reward[];
  onDone: (taskId: number) => void;
  onBuyReward: (reward: Reward) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-3xl font-black">Meine Aufgaben</h2>

        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDone={onDone} />
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-3xl font-black">Belohnungsshop</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {rewards.map((reward) => (
            <button
              key={reward.id}
              onClick={() => onBuyReward(reward)}
              className="rounded-[1.5rem] bg-yellow-50 p-5 text-left shadow-sm transition hover:scale-[1.02]"
            >
              <Gift className="mb-3 text-yellow-600" />
              <h3 className="font-black">{reward.title}</h3>
              <p className="font-bold text-slate-500">{reward.price} Coins</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ParentsPanel({
  selectedChildName,
  waitingTasks,
  allTasks,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCoins,
  setNewTaskCoins,
  newTaskArea,
  setNewTaskArea,
  onAddTask,
  onApprove,
  onReject,
}: {
  selectedChildName: string;
  waitingTasks: Task[];
  allTasks: Task[];
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskCoins: number;
  setNewTaskCoins: (value: number) => void;
  newTaskArea: Area;
  setNewTaskArea: (value: Area) => void;
  onAddTask: () => void;
  onApprove: (taskId: number) => void;
  onReject: (taskId: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-3xl font-black">Eltern-Bestätigung</h2>
        <p className="mb-5 font-semibold text-slate-500">
          Erst wenn Eltern bestätigen, bekommt das Kind Coins.
        </p>

        <div className="space-y-4">
          {waitingTasks.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-center font-black text-slate-500">
              Keine Aufgaben warten auf Bestätigung.
            </div>
          ) : (
            waitingTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-[1.5rem] bg-orange-50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-orange-600">
                      Wartet auf Prüfung
                    </p>
                    <h3 className="text-xl font-black">{task.title}</h3>
                    <p className="font-bold text-slate-500">
                      {task.area} • +{task.coins} Coins
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => onReject(task.id)}
                      className="rounded-2xl bg-white px-4 py-3 font-black text-red-600"
                    >
                      Ablehnen
                    </button>
                    <button
                      onClick={() => onApprove(task.id)}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white"
                    >
                      Bestätigen
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-3xl font-black">Neue Aufgabe für {selectedChildName}</h2>

        <div className="grid gap-3 md:grid-cols-[1fr_160px_180px_auto]">
          <input
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Aufgabe eingeben..."
            className="rounded-2xl border border-slate-200 px-5 py-4 font-semibold outline-none"
          />

          <input
            value={newTaskCoins}
            onChange={(event) => setNewTaskCoins(Number(event.target.value))}
            type="number"
            min={1}
            className="rounded-2xl border border-slate-200 px-5 py-4 font-semibold outline-none"
          />

          <select
            value={newTaskArea}
            onChange={(event) => setNewTaskArea(event.target.value as Area)}
            className="rounded-2xl border border-slate-200 px-5 py-4 font-semibold outline-none"
          >
            {areas.map((area) => (
              <option key={area.name} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>

          <button
            onClick={onAddTask}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-black text-white"
          >
            <Plus size={18} />
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-3xl font-black">Aufgabenübersicht</h2>
        <div className="space-y-3">
          {allTasks.map((task) => (
            <TaskStatusRow key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onDone }: { task: Task; onDone: (taskId: number) => void }) {
  const isOpen = task.status === "open";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 p-5">
      <div>
        <p className="mb-1 text-sm font-black text-indigo-600">{task.area}</p>
        <h3 className="text-xl font-black">{task.title}</h3>
        <p className="font-semibold text-slate-500">
          +{task.coins} Coins · +{task.xp} XP
        </p>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={task.status} />

        {isOpen && (
          <button
            onClick={() => onDone(task.id)}
            className="rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white"
          >
            Erledigt
          </button>
        )}
      </div>
    </div>
  );
}

function TaskStatusRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <div>
        <h3 className="font-black">{task.title}</h3>
        <p className="text-sm font-bold text-slate-500">
          {task.area} • {task.coins} Coins
        </p>
      </div>
      <StatusBadge status={task.status} />
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-2 text-sm font-black text-slate-700">
        Offen
      </span>
    );
  }

  if (status === "waiting") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-sm font-black text-orange-700">
        <Clock size={16} />
        Wartet
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
        <CheckCircle size={16} />
        Bestätigt
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-sm font-black text-red-700">
      <XCircle size={16} />
      Abgelehnt
    </span>
  );
}

function AreaButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-black transition ${
        active ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-700"
      }`}
    >
      {icon ?? <ShieldCheck size={20} />}
      {label}
    </button>
  );
}

function FlowStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-black text-white">
        {number}
      </div>
      <p className="font-bold text-slate-600">{text}</p>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="font-black text-slate-600">{label}</span>
      <span className="text-2xl font-black text-indigo-600">{value}</span>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-24 rounded-2xl bg-slate-50 p-4">
      <div className="text-indigo-600">{icon}</div>
      <p className="mt-2 text-xs font-black text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
