"use client";

import Image from "next/image";

type Child = {
  level: number;
  streak: number;
  coins: number;
  profileBadges?: string[];
};

export default function LiveFox({
  child,
  waitingCount,
}: {
  child: Child;
  waitingCount: number;
}) {
  const activeMotiv = (child.profileBadges || [])[0];

  const message =
    child.streak >= 5
      ? "Deine Serie ist richtig stark! 🔥"
      : waitingCount > 0
      ? "Ich warte mit dir auf die Bestätigung."
      : "Heute kannst du wieder Punkte sammeln!";

  return (
    <div className="relative overflow-hidden rounded-[1.3rem] border border-white bg-gradient-to-br from-yellow-100 via-white to-orange-100 p-3 text-center shadow-[0_14px_35px_rgba(14,165,233,.12)] sm:p-4">
      <div className="absolute left-6 top-6 text-2xl animate-floaty">
        ✨
      </div>

      <div className="absolute right-8 top-8 text-2xl animate-floaty">
        ⭐
      </div>

      <div className="relative z-10 mx-auto mb-4 max-w-sm rounded-[1.8rem] bg-gradient-to-br from-white via-sky-50 to-yellow-50 p-4 shadow-sm">
        <p className="text-lg font-black text-sky-950">
          „{message}“
        </p>

        <p className="mt-1 text-sm font-bold text-blue-600">
          Dein eigenes Zimmer
        </p>
      </div>

      {activeMotiv ? (
        <div className="relative mx-auto h-40 w-40 sm:h-56 sm:w-56 md:h-64 md:w-64 animate-floaty rounded-full bg-white/80 p-4 drop-shadow-xl">
          <Image
            src={activeMotiv}
            alt="Gewähltes Motiv"
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, 256px"
            className="object-contain p-4"
          />
        </div>
      ) : (
        <div className="relative mx-auto h-40 w-40 sm:h-56 sm:w-56 md:h-64 md:w-64 animate-floaty drop-shadow-xl">
          <Image
            src="/PunktlyLogo.png"
            alt="Punktly Motiv"
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, 256px"
            className="object-contain"
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[1.35rem] bg-white/85 p-3 text-center font-black text-sky-800">
          Level {child.level}
        </div>

        <div className="rounded-[1.35rem] bg-white/85 p-3 text-center font-black text-orange-700">
          🔥 {child.streak}
        </div>

        <div className="rounded-[1.35rem] bg-white/85 p-3 text-center font-black text-amber-700">
          {child.coins} Coins
        </div>
      </div>
    </div>
  );
}