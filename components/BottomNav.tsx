import Link from "next/link";
import { Gift, Home, ListChecks, UserRound } from "lucide-react";

export function BottomNav() {
  const items = [
    { href: "/kinder", label: "Start", icon: Home },
    { href: "/kinder#aufgaben", label: "Aufgaben", icon: ListChecks },
    { href: "/kinder#belohnungen", label: "Belohnungen", icon: Gift },
    { href: "/kinder#profil", label: "Profil", icon: UserRound }
  ];
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 grid w-[min(92vw,520px)] -translate-x-1/2 grid-cols-4 rounded-[2rem] bg-white p-2 shadow-soft">
      {items.map((item) => <Link key={item.href} href={item.href} className="grid place-items-center gap-1 rounded-2xl px-2 py-2 text-xs font-black text-slate-600"><item.icon size={20} />{item.label}</Link>)}
    </nav>
  );
}
