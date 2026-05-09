import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/70 bg-punktly-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-punktly-ink">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-punktly-coral text-white shadow-soft"><Sparkles size={22} /></span>
          Punktly
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link className="rounded-full bg-white px-4 py-2 shadow-sm" href="/kinder">Kinderbereich</Link>
          <Link className="rounded-full bg-white px-4 py-2 shadow-sm" href="/eltern">Elternbereich</Link>
        </nav>
      </div>
    </header>
  );
}
