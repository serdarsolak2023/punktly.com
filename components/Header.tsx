"use client";

import Link from "next/link";
import {
  Bell,
  Coins,
  Menu,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <button className="rounded-2xl bg-slate-100 p-3 md:hidden">
            <Menu size={22} />
          </button>

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
              <Sparkles size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Punktly
              </h1>
              <p className="text-sm font-bold text-slate-500">
                Family Learning App
              </p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/"
            className="rounded-2xl px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100"
          >
            Dashboard
          </Link>

          <Link
            href="/kinder"
            className="rounded-2xl px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100"
          >
            Kinder
          </Link>

          <Link
            href="/eltern"
            className="rounded-2xl px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100"
          >
            Eltern
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl bg-yellow-50 px-4 py-3 md:flex">
            <Coins className="text-yellow-500" size={20} />
            <span className="font-black text-slate-800">
              120 Coins
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 md:flex">
            <Trophy className="text-indigo-600" size={20} />
            <span className="font-black text-slate-800">
              Level 4
            </span>
          </div>

          <button className="rounded-2xl bg-slate-100 p-3">
            <Bell size={22} />
          </button>

          <button className="rounded-2xl bg-slate-100 p-3">
            <UserRound size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}