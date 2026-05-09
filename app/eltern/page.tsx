import { Header } from "@/components/Header";
import { ChildCard } from "@/components/ChildCard";
import { TaskCard } from "@/components/TaskCard";
import { children, rewards, tasks } from "@/lib/demo-data";
import { PlusCircle } from "lucide-react";

export default function ElternPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-punktly-coral">Elternbereich</p>
          <h1 className="mt-2 text-4xl font-black">Familie verwalten</h1>
          <p className="mt-2 font-bold text-slate-600">Lege Kinder, Aufgaben, Coins und Belohnungen an. Diese Demo ist vorbereitet für Firebase Auth und Firestore.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-punktly-coral px-5 py-3 font-black text-white"><PlusCircle size={18} /> Kind anlegen</button>
            <button className="inline-flex items-center gap-2 rounded-full bg-punktly-blue px-5 py-3 font-black text-white"><PlusCircle size={18} /> Aufgabe erstellen</button>
            <button className="inline-flex items-center gap-2 rounded-full bg-punktly-mint px-5 py-3 font-black"><PlusCircle size={18} /> Belohnung erstellen</button>
          </div>
        </div>

        <h2 className="mt-10 text-3xl font-black">Kinder</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {children.map((child) => <ChildCard key={child.id} child={child} />)}
        </div>

        <h2 className="mt-10 text-3xl font-black">Aufgabenübersicht</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>

        <h2 className="mt-10 text-3xl font-black">Belohnungen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {rewards.map((reward) => <article key={reward.id} className="rounded-[1.75rem] bg-white p-5 shadow-soft"><h3 className="text-xl font-black">{reward.title}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{reward.description}</p><p className="mt-4 rounded-full bg-yellow-100 px-4 py-2 text-center font-black">{reward.cost} Coins</p></article>)}
        </div>
      </section>
    </main>
  );
}
