import { BottomNav } from "@/components/BottomNav";
import { ChildCard } from "@/components/ChildCard";
import { CoinAvatar } from "@/components/CoinAvatar";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { children, coins, rewards, tasks } from "@/lib/demo-data";

export default function KinderPage() {
  const activeChild = children[0];
  const childTasks = tasks.filter((task) => task.childId === activeChild.id);
  return (
    <main className="pb-28">
      <Header />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-[2.5rem] bg-punktly-mint p-6 shadow-soft md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-slate-600">Kinderbereich · Start</p>
          <h1 className="mt-2 text-4xl font-black">Hallo {activeChild.name}!</h1>
          <p className="mt-2 font-bold text-slate-600">Wähle dein Profil, erledige Aufgaben und sammle Coins.</p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2" id="profil">
          {children.map((child) => <ChildCard key={child.id} child={child} />)}
        </section>

        <section className="mt-10" id="aufgaben">
          <h2 className="text-3xl font-black">Deine Aufgaben</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {childTasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black">Coin-Avatare</h2>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {coins.map((coin) => <div key={coin.id} className="grid place-items-center rounded-[1.5rem] bg-white p-3 shadow-sm"><CoinAvatar coinId={coin.id} size="sm" /><span className="mt-2 text-center text-[11px] font-black text-slate-500">{coin.name}</span></div>)}
          </div>
        </section>

        <section className="mt-10" id="belohnungen">
          <h2 className="text-3xl font-black">Belohnungen</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {rewards.map((reward) => <article key={reward.id} className="rounded-[1.75rem] bg-white p-5 shadow-soft"><h3 className="text-xl font-black">{reward.title}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{reward.description}</p><p className="mt-4 rounded-full bg-yellow-100 px-4 py-2 text-center font-black">{reward.cost} Coins</p></article>)}
          </div>
        </section>
      </section>
      <BottomNav />
    </main>
  );
}
