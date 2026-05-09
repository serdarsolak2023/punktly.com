import { ChildProfile } from "@/lib/types";
import { CoinAvatar } from "./CoinAvatar";

export function ChildCard({ child }: { child: ChildProfile }) {
  const nextLevelXp = child.level * 120;
  const progress = Math.min(100, Math.round((child.xp / nextLevelXp) * 100));
  return (
    <article className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <CoinAvatar coinId={child.avatarCoinId} />
        <div>
          <h3 className="text-2xl font-black">{child.name}</h3>
          <p className="font-bold text-slate-500">Level {child.level} · {child.coins} Coins</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm font-bold text-slate-500">
          <span>XP Fortschritt</span><span>{child.xp}/{nextLevelXp}</span>
        </div>
        <div className="h-4 rounded-full bg-slate-100">
          <div className="h-4 rounded-full bg-punktly-blue" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  );
}
