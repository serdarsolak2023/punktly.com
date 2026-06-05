"use client";

type ParentView =
  | "dashboard"
  | "tasks"
  | "rewards"
  | "chests"
  | "shop"
  | "features"
  | "calendar"
  | "family"
  | "stats"
  | "profile"
  | "settings"
  | "learning"
  | "coinrechner";

export default function ParentNavigation({
  parentView,
  setParentView,
}: {
  parentView: ParentView;
  setParentView: (view: ParentView) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {[
        ["dashboard", "📊 Übersicht"],
        ["tasks", "📝 Aufgaben"],
        ["learning", "📚 Lernen"],
        ["rewards", "🎁 Belohnungen"],
        ["shop", "🛍️ Shop"],
        ["chests", "📦 Schatzkisten"],
        ["family", "👨‍👩‍👧 Familie"],
        ["stats", "🏆 Statistik"],
        ["settings", "⚙️ Einstellungen"],
      ].map(([key, label]) => (
        <button
          key={key}
          onClick={() => setParentView(key as ParentView)}
          className={`rounded-full px-4 py-2 font-black transition ${
            parentView === key
              ? "bg-sky-500 text-white shadow-lg"
              : "bg-white/80 text-sky-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}