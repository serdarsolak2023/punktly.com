"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  BookMinusIcon,
  BookOpen,
  CalendarDays,
  Gift,
  Home,
  ListChecks,
  ShoppingBag,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import Coin from "./coin";

type ParentView =
  | "dashboard"
  | "tasks"
  | "rewards"
  | "chests"
  | "shop"
  | "features"
  | "calendar"
  | "family"
  | "stats"
  | "profile"
  | "settings"
  | "learning"
  | "coinrechner";

export default function ParentTabs({
  view,
  setView,
  taskBadge = 0,
  learningBadge = 0,
  rewardBadge = 0,
  chestBadge = 0,
  shopBadge = 0,
  familyBadge = 0,
}: {
  view: ParentView;
  setView: (v: ParentView) => void;
  taskBadge?: number;
  learningBadge?: number;
  rewardBadge?: number;
  chestBadge?: number;
  shopBadge?: number;
  familyBadge?: number;
}) {
  return (
    <nav className="rounded-[1.8rem] border-2 border-white bg-white/90 p-3 shadow-[0_14px_35px_rgba(37,99,235,.12)] backdrop-blur-xl">
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <Tab active={view === "dashboard"} onClick={() => setView("dashboard")} icon={<Home />} label="Übersicht" />
        <Tab active={view === "tasks"} onClick={() => setView("tasks")} icon={<ListChecks />} label="Aufgaben" badge={taskBadge} />
        <Tab active={view === "learning"} onClick={() => setView("learning")} icon={<BookOpen />} label="Lernen" badge={learningBadge} />
        <Tab active={view === "rewards"} onClick={() => setView("rewards")} icon={<Gift />} label="Belohnung" badge={rewardBadge} />
        <Tab active={view === "chests"} onClick={() => setView("chests")} icon={<Sparkles />} label="Schatzkiste" badge={chestBadge} />
        <Tab active={view === "shop"} onClick={() => setView("shop")} icon={<ShoppingBag />} label="Shop" badge={shopBadge} />
        <Tab active={view === "features"} onClick={() => setView("features")} icon={<BookMinusIcon />} label="Bonus" />
        <Tab active={view === "calendar"} onClick={() => setView("calendar")} icon={<CalendarDays />} label="Kalender" />
        <Tab active={view === "family"} onClick={() => setView("family")} icon={<Users />} label="Familie" badge={familyBadge} />
        <Tab active={view === "stats"} onClick={() => setView("stats")} icon={<BarChart3 />} label="Statistik" />
        <Tab active={view === "profile"} onClick={() => setView("profile")} icon={<User />} label="Profil" />
        <Tab active={view === "settings"} onClick={() => setView("settings")} icon={<User />} label="Kinder" />
        <Tab active={view === "coinrechner"} onClick={() => setView("coinrechner")} icon={<Coin />} label="Coinrechner" />
      </div>
    </nav>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
  badge = 0,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative min-h-[4.4rem] rounded-[1.5rem] p-2 text-center font-black transition active:scale-95 sm:min-h-[4.8rem] sm:p-3 ${
        active
          ? "bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 text-white shadow-[0_10px_25px_rgba(37,99,235,.35)]"
          : "text-sky-700 hover:bg-cyan-50"
      }`}
    >
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white shadow-lg">
          {badge}
        </span>
      )}

      <div className="relative z-10 mx-auto mb-1 h-5 w-5 sm:h-6 sm:w-6">
        {icon}
      </div>

      <div className="text-[10px] leading-tight sm:text-xs">
        {label}
      </div>
    </button>
  );
}