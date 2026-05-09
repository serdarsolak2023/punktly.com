"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Coins, Trophy } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-yellow-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Punktly"
            width={72}
            height={72}
            className="rounded-full"
          />

          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Punktly
            </h1>

            <p className="font-bold text-slate-500">
              Familien Lern-App
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl bg-yellow-100 px-4 py-3 md:flex md:items-center md:gap-2">
            <Coins className="text-yellow-600" />
            <span className="font-black">120 Coins</span>
          </div>

          <div className="hidden rounded-2xl bg-indigo-100 px-4 py-3 md:flex md:items-center md:gap-2">
            <Trophy className="text-indigo-600" />
            <span className="font-black">Level 4</span>
          </div>

          <button className="rounded-2xl bg-slate-100 p-3">
            <Bell />
          </button>
        </div>
      </div>
    </header>
  );
}