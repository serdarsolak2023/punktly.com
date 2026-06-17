const widerrufText = `
Widerrufsbelehrung

1. Allgemeine Informationen

Premium-Abonnements, digitale Inhalte und sonstige Käufe innerhalb der App PunktlyCoinly werden ausschließlich über Google Play bereitgestellt und verarbeitet.

Vertragspartner für die Zahlungsabwicklung ist im Rahmen der jeweiligen Zahlungsabwicklung zusätzlich Google Play.

2. Digitale Inhalte

Bei den angebotenen Leistungen handelt es sich um digitale Inhalte und digitale Premium-Funktionen, die unmittelbar nach erfolgreicher Zahlung innerhalb der App freigeschaltet werden können.

Dazu gehören insbesondere:

• Premium-Abonnements
• Premium-Jahreszugänge
• zeitlich begrenzte Premium-Funktionen
• zusätzliche digitale Inhalte innerhalb der App

3. Zustimmung zur sofortigen Ausführung

Mit Abschluss eines Kaufs erklärt sich der Nutzer ausdrücklich damit einverstanden, dass die Bereitstellung der digitalen Inhalte unmittelbar beginnt.

Der Nutzer bestätigt gleichzeitig, dass ihm bekannt ist, dass mit Beginn der Vertragsausführung das gesetzliche Widerrufsrecht gemäß den geltenden gesetzlichen Bestimmungen vorzeitig erlöschen kann.

4. Rückerstattungen und Kündigungen

Rückerstattungen, Kündigungen und die Verwaltung von Abonnements erfolgen ausschließlich über Google Play.

Nutzer können ihre aktiven Abonnements jederzeit über ihr Google-Konto verwalten oder kündigen.

Die Bearbeitung von Rückerstattungen erfolgt gemäß den Richtlinien von Google Play.

5. Google Play Richtlinien

Zusätzlich gelten die Nutzungsbedingungen und Richtlinien von Google Play.

Weitere Informationen:

https://support.google.com/googleplay/answer/2479637

6. Kontakt

Fragen zu PunktlyCoinly können jederzeit an folgende Adresse gerichtet werden:

kontakt@punktlycoinly.de

Stand: Mai 2026
`;

export default function WiderrufPage() {
  return (
    <main className="min-h-screen bg-white p-6 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">
          Widerrufsbelehrung
        </h1>

        <div className="whitespace-pre-wrap leading-7">
          {widerrufText}
        </div>
      </div>
    </main>
  );
}