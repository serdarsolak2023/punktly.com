export default function DatenloeschungPage() {
  return (
    <main className="min-h-screen bg-sky-50 px-6 py-10 text-slate-800">
      <section className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-sky-900">
          Datenlöschung bei PunktlyCoinly
        </h1>

        <p className="mt-4 font-bold">
          Nutzer von PunktlyCoinly können jederzeit die Löschung ihres Kontos
          und aller zugehörigen Daten beantragen.
        </p>

        <div className="mt-6 rounded-[1.5rem] bg-red-50 p-5">
          <h2 className="text-xl font-black text-red-700">
            Welche Daten werden gelöscht?
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-6 font-bold text-red-700">
            <li>Benutzerkonto</li>
            <li>Kinderprofile</li>
            <li>Aufgaben</li>
            <li>Lernaufgaben</li>
            <li>Coins und Fortschritte</li>
            <li>Belohnungen</li>
            <li>Schatzkisten</li>
            <li>Shop- und Familiendaten</li>
          </ul>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-sky-50 p-5">
          <h2 className="text-xl font-black text-sky-900">
            So beantragst du die Löschung
          </h2>

          <p className="mt-3 font-bold">
            Sende eine E-Mail an:
          </p>

          <p className="mt-2 text-lg font-black text-sky-700">
            kontakt@punktlycoinly.de
          </p>

          <p className="mt-4 font-bold">
            Bitte verwende den Betreff:
          </p>

          <p className="mt-2 rounded-xl bg-white p-3 font-black text-slate-700">
            Datenlöschung PunktlyCoinly
          </p>

          <p className="mt-4 text-sm font-bold text-slate-600">
            Alternativ kann die Löschung direkt innerhalb der App über den
            Elternbereich beantragt oder durchgeführt werden.
          </p>
        </div>

        <p className="mt-6 text-sm font-bold text-slate-500">
          Stand: Mai 2026
        </p>
      </section>
    </main>
  );
}