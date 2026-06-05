"use client";

import CoinlyLabel from "./coinlylabel";

export default function GoalProgress({
  icon,
  title,
  name,
  current,
  target,
  motivSrc,
}: {
  icon: string;
  title: string;
  name: string;
  current: number;
  target: number;
  motivSrc: string;
}) {
  const percent =
    target > 0
      ? Math.min(100, Math.round((current / target) * 100))
      : 0;

  return (
    <div className="rounded-[1.3rem] bg-white/80 p-3 shadow-sm">
      <div className="flex justify-between">
        <span className="font-black">
          {icon} {title}: {name}
        </span>

        <span className="font-black">
          {percent}%
        </span>
      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <div className="mt-2 text-right text-sm font-black">
        {current}/{target}{" "}
        <CoinlyLabel
          motivSrc={motivSrc}
          text="Coinly"
        />
      </div>
    </div>
  );
}