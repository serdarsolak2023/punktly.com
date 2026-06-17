const agbText = `
Allgemeine Geschäftsbedingungen (AGB)

1. Geltungsbereich

Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der App PunktlyCoinly.

Mit der Nutzung der App akzeptieren Nutzer diese Bedingungen.

2. Leistungen der App

PunktlyCoinly ist eine Familien- und Motivations-App zur Verwaltung von Aufgaben, Coins, Fortschritten, Lernbereichen, Wochenplänen und Belohnungen.

Die App bietet Funktionen zur spielerischen Motivation und Organisation innerhalb von Familien.

Die App kann zunächst für 48 Stunden kostenlos getestet werden.

Nach Ablauf der Testphase endet der Zugriff automatisch.

Es erfolgt keine automatische Verlängerung und keine automatische Abbuchung.

3. Nutzerkonten

Für bestimmte Funktionen ist eine Anmeldung mit Google oder E-Mail erforderlich.

Nutzer sind verpflichtet, ihre Zugangsdaten sicher aufzubewahren und nicht an Dritte weiterzugeben.

4. Premium-Zugänge und Zahlungen

Nach Ablauf der kostenlosen Testphase können Nutzer freiwillig einen Premium-Zugang erwerben.

Mögliche Premiumzugänge:

• Premium Monat – 6,99 €
• Premium Jahr – 55,99 €

Ein Premium-Zugang wird nicht automatisch abgeschlossen.

Digitale Käufe und Zahlungen werden ausschließlich über Google Play verarbeitet.

Es gelten zusätzlich die Nutzungsbedingungen und Zahlungsrichtlinien von Google Play.

Abonnements können jederzeit über Google Play verwaltet oder beendet werden.

5. Kinder- und Familienschutz

PunktlyCoinly richtet sich an Familien.

Kinderprofile werden ausschließlich durch Eltern oder Erziehungsberechtigte verwaltet.

Die App enthält keine öffentlichen Chats oder sozialen Netzwerke für Kinder.

6. Pflichten der Nutzer

Die App darf nicht missbräuchlich, rechtswidrig oder manipulativ verwendet werden.

Technische Angriffe, Betrugsversuche oder Manipulationen der App sind untersagt.

7. Verfügbarkeit

Wir bemühen uns um eine möglichst stabile und unterbrechungsfreie Verfügbarkeit der App.

Es besteht jedoch kein Anspruch auf permanente Erreichbarkeit.

8. Haftung

Für Schäden haften wir nur bei Vorsatz oder grober Fahrlässigkeit.

Für technische Probleme, Datenverlust oder zeitweise Ausfälle übernehmen wir keine Haftung, soweit gesetzlich zulässig.

9. Änderungen der Bedingungen

Wir behalten uns vor, diese AGB jederzeit anzupassen oder zu aktualisieren.

10. Schlussbestimmungen

Es gilt das Recht der Bundesrepublik Deutschland.

Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

Stand: Juni 2026
`;

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-white p-6 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">
          Allgemeine Geschäftsbedingungen
        </h1>

        <div className="whitespace-pre-wrap leading-7">
          {agbText}
        </div>
      </div>
    </main>
  );
}