import { CheckCircle2, Coins, Star } from "lucide-react";
import { Task } from "@/lib/types";

export function TaskCard({ task }: { task: Task }) {
  return (
    <article className="rounded-[1.75rem] bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-punktly-coral">{task.status}</p>
          <h3 className="mt-1 text-xl font-black">{task.title}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{task.description}</p>
        </div>
        <CheckCircle2 className="text-punktly-mint" />
      </div>
      <div className="mt-4 flex gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-2 text-sm font-black"><Coins size={16} /> {task.rewardCoins}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-2 text-sm font-black"><Star size={16} /> {task.rewardXp} XP</span>
      </div>
    </article>
  );
}
