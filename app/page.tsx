import Link from "next/link";
import { Header } from "@/components/Header";
import { children, coins, rewards, tasks } from "@/lib/demo-data";
import { ArrowRight, Coins, Gift, ShieldCheck, Star } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">Deutsch · Familien · Aufgaben · Coins</p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">Motivation für Kinder, Übersicht für Eltern.</h1>
          <p className="mt-5 max-w-xl text-lg font-semibold text-slate-600">Punktly ist eine Familien-App, in der Kinder Aufgaben erledigen, Coins und XP sammeln, Level aufsteigen und Belohnungen einlösen.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/kinder" className="inline-flex items-center gap-2 rounded-full bg-punktly-coral px-6 py-4 font-black text-white shadow-soft">Kinderbereich <ArrowRight size={18} /></Link>
            <Link href="/eltern" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 font-black shadow-soft">Elternbereich</Link>
          </div>
        </div>
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft">
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Coins />} label="Coins" value={`${coins.length} Avatare`} />
            <Stat icon={<Star />} label="XP" value="Level-System" />
            <Stat icon={<Gift />} label="Belohnungen" value={`${rewards.length} Demo`} />
            <Stat icon={<ShieldCheck />} label="Familie" value={`${children.length} Kinder`} />
          </div>
          <div className="mt-5 rounded-[2rem] bg-punktly-cream p-5">
            <h2 className="text-xl font-black">Heute offen</h2>
            <p className="mt-2 font-semibold text-slate-600">{tasks.length} Beispiel-Aufgaben sind bereits vorbereitet.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-punktly-cream p-4"><div className="text-punktly-coral">{icon}</div><p className="mt-3 text-sm font-black text-slate-500">{label}</p><p className="text-lg font-black">{value}</p></div>;
}
