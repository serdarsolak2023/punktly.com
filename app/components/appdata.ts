import type { Child, Task, Reward, ShopItem, Chest, TaskPreset, LegalPage } from "./apptypes";

export const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const weeklyGoals = [
  "5 Aufgaben erledigen",
  "3 Tage Serie halten",
  "100 Coins sammeln"
];

export const dailyGoals = [
  "1 Aufgabe abschließen",
  "10 Coins verdienen",
  "Den Fuchs glücklich machen"
];

export const rareBadges = [
  "🔥 Serien-Meister",
  "👑 Familien-Champion",
  "💎 Schatzjäger",
  "🌙 Nachteule"
];

export const initialChildren: Child[] = [];
export const initialTasks: Task[] = [];
export const initialRewards: Reward[] = [];
export const initialShop: ShopItem[] = [];
export const initialChests: Chest[] = [];
export const extraShopItems = [
  { id: 9001, title: "Weltraum Theme", price: 600, owned: false },
  { id: 9002, title: "Goldener Rahmen", price: 450, owned: false },
  { id: 9003, title: "Krone", price: 800, owned: false },
];
export const punktlyCoinPositions = [
  { left: "22%", top: "8%", size: 64, badge: 1, delay: "0s" },
  { left: "16%", top: "2%", size: 70, badge: 2, delay: ".4s" },
  { left: "32%", top: "12%", size: 52, badge: 3, delay: ".8s" },
  { left: "58%", top: "8%", size: 72, badge: 4, delay: "1.2s" },
  { left: "76%", top: "14%", size: 66, badge: 5, delay: "1.6s" },
  { left: "95%", top: "6%", size: 86, badge: 6, delay: "2s" },

  { left: "28%", top: "30%", size: 72, badge: 7, delay: ".7s" },
  { left: "22%", top: "43%", size: 54, badge: 8, delay: "1.1s" },
  { left: "36%", top: "29%", size: 50, badge: 9, delay: "1.5s" },
  { left: "67%", top: "33%", size: 70, badge: 10, delay: "1.9s" },
  { left: "77%", top: "37%", size: 58, badge: 11, delay: "2.3s" },

  { left: "2%", top: "63%", size: 72, badge: 12, delay: ".3s" },
  { left: "13%", top: "77%", size: 64, badge: 13, delay: ".9s" },
  { left: "30%", top: "69%", size: 56, badge: 14, delay: "1.4s" },
  { left: "50%", top: "76%", size: 66, badge: 15, delay: "1.8s" },
  { left: "72%", top: "67%", size: 72, badge: 16, delay: "2.2s" },
  { left: "88%", top: "72%", size: 76, badge: 17, delay: "2.6s" },

  { left: "19%", top: "90%", size: 54, badge: 18, delay: "1s" },
  { left: "43%", top: "91%", size: 74, badge: 19, delay: "1.5s" },
  { left: "64%", top: "88%", size: 58, badge: 20, delay: "2.1s" },
  { left: "93%", top: "91%", size: 60, badge: 21, delay: "2.7s" },
];

export const profileBadgeOptions = Array.from({ length: 30 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `badge-${number}`,
    label: `Motiv ${index + 1}`,
    src: `/badges/badge-${number}.png`,
  };
});

export const taskPresets: TaskPreset[] = [
  { title: "Zähne putzen morgens", coins: 5, repeat: "täglich", day: "Mo", category: "Hygiene" },
  { title: "Zähne putzen abends", coins: 5, repeat: "täglich", day: "Mo", category: "Hygiene" },
  { title: "Hausaufgaben machen", coins: 10, repeat: "täglich", day: "Mo", category: "Schule" },
  { title: "Schultasche packen", coins: 8, repeat: "täglich", day: "Mo", category: "Schule" },
  { title: "Lesen üben", coins: 8, repeat: "täglich", day: "Mo", category: "Schule" },
  { title: "Vokabeln lernen", coins: 10, repeat: "täglich", day: "Mo", category: "Schule" },
  { title: "Zimmer aufräumen", coins: 15, repeat: "wöchentlich", day: "Sa", category: "Zuhause" },
  { title: "Bett machen", coins: 5, repeat: "täglich", day: "Mo", category: "Zuhause" },
  { title: "Kleidung wegräumen", coins: 8, repeat: "täglich", day: "Mo", category: "Zuhause" },
  { title: "Tisch decken", coins: 6, repeat: "täglich", day: "Mo", category: "Zuhause" },
  { title: "Tisch abräumen", coins: 6, repeat: "täglich", day: "Mo", category: "Zuhause" },
  { title: "Spülmaschine ausräumen", coins: 10, repeat: "wöchentlich", day: "Sa", category: "Haushalt" },
  { title: "Müll rausbringen", coins: 10, repeat: "wöchentlich", day: "Fr", category: "Haushalt" },
  { title: "Haustier füttern", coins: 8, repeat: "täglich", day: "Mo", category: "Haustier" },
  { title: "Wasserflasche auffüllen", coins: 4, repeat: "täglich", day: "Mo", category: "Gesundheit" },
  { title: "Obst oder Gemüse essen", coins: 5, repeat: "täglich", day: "Mo", category: "Gesundheit" },
  { title: "Sport / Bewegung", coins: 10, repeat: "täglich", day: "Mo", category: "Gesundheit" },
  { title: "Pünktlich schlafen gehen", coins: 8, repeat: "täglich", day: "Mo", category: "Routine" },
  { title: "Freundlich helfen", coins: 10, repeat: "einmalig", day: "Mo", category: "Sozial" },
  { title: "Kein Streit heute", coins: 12, repeat: "täglich", day: "Mo", category: "Sozial" },
];

export type TaskPack = { id: string; title: string; description: string; presets: string[] };

export const taskPacks: TaskPack[] = [
  {
    id: "morgenroutine",
    title: "🌞 Morgenroutine",
    description: "Schnell startklar vor der Kita oder der Schule.",
    presets: ["Zähne putzen morgens", "Bett machen", "Schultasche packen", "Wasserflasche auffüllen"],
      },
  {
    id: "schulheld",
    title: "🎒 Schulheld",
    description: "Lernen, Lesen und Vorbereitung gebündelt.",
    presets: ["Hausaufgaben machen", "Lesen üben", "Vokabeln lernen", "Schultasche packen"],
  },
  {
    id: "kindergartenheld",
    title: "🎒 Kindergartenheld",
    description: "Lernen, Lesen und Vorbereitung gebündelt.",
    presets: ["Kreatives lernen", "Lesen üben", "Wortschatz erweitern", "Kindergartentasche packen"],
  },
  {
    id: "haushaltsprofi",
    title: "🏠 Haushaltsprofi",
    description: "Kleine Hilfen im Familienalltag.",
    presets: ["Tisch decken", "Tisch abräumen", "Kleidung wegräumen", "Zimmer aufräumen"],
  },
  {
    id: "gesundundleicht",
    title: "🍎 Gesund & leicht",
    description: "Motivation für Bewegung, Schlaf und gute Gewohnheiten.",
    presets: ["Obst oder Gemüse essen", "Sport / Bewegung", "Pünktlich schlafen gehen", "Kein Streit heute"],
  },
];

export const legalPages: Record<LegalPage, { title: string; intro: string; content: string[] }> = {
impressum: {
  title: "Impressum",
  intro: "Angaben gemäß § 5 TMG",
  content: [
    "PunktlyCoinly",
    "Inhaber: PunktlyCoinly",
    "Einzelunternehmen (Kleingewerbe)",
    "-",
    "34123 Kassel",
    "Deutschland",
    "",
    "Kontakt:",
    "E-Mail: serdarsolak@punktlycoinly.de",
    "E-Mail: support@punktlycoinly.de",
    "E-Mail: kontakt@punktlycoinly.de",
    "",
    "Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV:",
    "Serdar Solak",
    "-",
    "34123 Kassel"
  ]
},
datenschutz: {
  title: "Datenschutzerklärung",
  intro: "Informationen zum Datenschutz",
  content: [

"1. Verantwortlicher",

"Verantwortlich für die Datenverarbeitung innerhalb der App PunktlyCoinly ist:",

"PunktlyCoinly",
"Inhaber: Serdar Solak",
"-",
"34123 Kassel",
"Deutschland",
"E-Mail: kontakt@punktlycoinly.de",


"2. Erhebung und Verarbeitung personenbezogener Daten",

"Bei der Nutzung der App können personenbezogene Daten verarbeitet werden.",

"Dazu gehören insbesondere:",
"• E-Mail-Adresse bei Anmeldung mit Google",
"• Anzeigename oder Benutzername",
"• Kinderprofile (z. B. Benutzername, Alter, Lieblingsfarbe, Lieblingstier)",
"• Coins, Fortschritte, Aufgaben und Belohnungen",
"• Premiumstatus",
"• Testphasenstatus",
"• freiwillig eingegebene Inhalte",
"• technische Informationen zur Nutzung der App",

"Die Verarbeitung erfolgt ausschließlich zum Betrieb und zur Bereitstellung der Funktionen der App.",


"3. Zweck der Datenverarbeitung",

"Die Verarbeitung personenbezogener Daten erfolgt insbesondere zur:",

"• Anmeldung und Authentifizierung",
"• Speicherung von Aufgaben",
"• Speicherung von Coins, Fortschritten und Belohnungen",
"• Verwaltung von Kinderprofilen",
"• Synchronisierung der Familiendaten",
"• Bereitstellung von Premiumfunktionen",
"• Verbesserung der Stabilität und Sicherheit der App",


"4. Rechtsgrundlage der Verarbeitung",

"Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. b DSGVO zur Bereitstellung der App-Funktionen sowie gemäß Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einem sicheren und stabilen Betrieb der Anwendung.",


"5. Nutzung von Firebase und Google-Diensten",

"Für Anmeldung, Datenbank und technische Infrastruktur nutzt PunktlyCoinly Dienste von Google Firebase.",

"Anbieter:",
"Google Ireland Limited",
"Gordon House, Barrow Street",
"Dublin 4, Irland",

"Weitere Informationen:",
"Firebase Datenschutzhinweise:",
"firebase.google.com/support/privacy",


"6. Google Play, Testphase und Premiumdienste",

"PunktlyCoinly bietet eine kostenlose Testphase von 48 Stunden.",

"Nach Ablauf der Testphase endet der Zugriff automatisch.",

"Es erfolgt keine automatische Verlängerung und keine automatische Abbuchung.",

"Nutzer entscheiden selbst, ob anschließend freiwillig ein Premium-Zugang abgeschlossen wird.",

"Mögliche Premiumzugänge:",

"• Premium Monat – 6,99 €",
"• Premium Jahr – 55,99 €",

"Premium-Abonnements werden ausschließlich über Google Play verarbeitet.",

"PunktlyCoinly verarbeitet selbst keine Zahlungsdaten wie Kreditkarteninformationen.",

"Die Zahlungsabwicklung erfolgt ausschließlich durch Google Play.",

"Abonnements können jederzeit über Google Play verwaltet oder beendet werden.",


"7. Speicherung und Löschung von Daten",

"Personenbezogene Daten werden nur so lange gespeichert, wie dies für die Nutzung der App erforderlich ist.",

"Nutzer können ihr Konto und die zugehörigen Daten direkt innerhalb der App löschen.",
"Nutzer können die Datenlöschung außerdem per E-Mail an kontakt@punktlycoinly.de beantragen.",


"8. Rechte der betroffenen Personen",

"Nutzer haben im Rahmen der DSGVO insbesondere folgende Rechte:",

"• Recht auf Auskunft",
"• Recht auf Berichtigung",
"• Recht auf Löschung",
"• Recht auf Einschränkung der Verarbeitung",
"• Recht auf Datenübertragbarkeit",
"• Recht auf Widerspruch gegen die Verarbeitung",

"Anfragen können per E-Mail gestellt werden.",


"9. Datensicherheit",

"Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um personenbezogene Daten bestmöglich vor Verlust, Missbrauch oder unbefugtem Zugriff zu schützen.",


"10. Änderungen dieser Datenschutzerklärung",

"Diese Datenschutzerklärung kann aktualisiert werden, um rechtliche oder technische Änderungen zu berücksichtigen.",

"Stand: Mai 2026"

],
},
widerruf: {
  title: "Widerrufsbelehrung",
  intro: "Informationen zum Widerrufsrecht",
  content: [

"Widerrufsbelehrung",


"1. Allgemeine Informationen",

"Premium-Abonnements, digitale Inhalte und sonstige Käufe innerhalb der App PunktlyCoinly werden ausschließlich über Google Play bereitgestellt und verarbeitet.",

"Vertragspartner für die Zahlungsabwicklung ist im Rahmen der jeweiligen Zahlungsabwicklung zusätzlich Google Play.",


"2. Digitale Inhalte",

"Bei den angebotenen Leistungen handelt es sich um digitale Inhalte und digitale Premium-Funktionen, die unmittelbar nach erfolgreicher Zahlung innerhalb der App freigeschaltet werden können.",

"Dazu gehören insbesondere:",

"• Premium-Abonnements",
"• Premium-Jahreszugänge",
"• zeitlich begrenzte Premium-Funktionen",
"• zusätzliche digitale Inhalte innerhalb der App",


"3. Zustimmung zur sofortigen Ausführung",

"Mit Abschluss eines Kaufs erklärt sich der Nutzer ausdrücklich damit einverstanden, dass die Bereitstellung der digitalen Inhalte unmittelbar beginnt.",

"Der Nutzer bestätigt gleichzeitig, dass ihm bekannt ist, dass mit Beginn der Vertragsausführung das gesetzliche Widerrufsrecht gemäß den geltenden gesetzlichen Bestimmungen vorzeitig erlöschen kann.",


"4. Rückerstattungen und Kündigungen",

"Rückerstattungen, Kündigungen und die Verwaltung von Abonnements erfolgen ausschließlich über Google Play.",

"Nutzer können ihre aktiven Abonnements jederzeit über ihr Google-Konto verwalten oder kündigen.",

"Die Bearbeitung von Rückerstattungen erfolgt gemäß den Richtlinien von Google Play.",


"5. Google Play Richtlinien",

"Zusätzlich gelten die Nutzungsbedingungen und Richtlinien von Google Play.",

"Weitere Informationen:",

"https://support.google.com/googleplay/answer/2479637",


"6. Kontakt",

"Fragen zu PunktlyCoinly können jederzeit an folgende Adresse gerichtet werden:",

"kontakt@punktlycoinly.de",


"Stand: Mai 2026"

],
},
  agb: {
    title: "AGB",
    intro: "Allgemeine Geschäftsbedingungen",
    content: [
"Allgemeine Geschäftsbedingungen (AGB)",

"1. Geltungsbereich",

"Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der App PunktlyCoinly.",

"Mit der Nutzung der App akzeptieren Nutzer diese Bedingungen.",


"2. Leistungen der App",

"PunktlyCoinly ist eine Familien- und Motivations-App zur Verwaltung von Aufgaben, Coins, Fortschritten, Lernbereichen und Belohnungen.",

"Die App kann zunächst für 48 Stunden kostenlos getestet werden.",

"Nach Ablauf der Testphase endet der Zugriff automatisch.",

"Es erfolgt keine automatische Verlängerung und keine automatische Abbuchung.",


"3. Nutzerkonten",

"Für bestimmte Funktionen kann eine Anmeldung mit Google erforderlich sein.",

"Nutzer sind verpflichtet, ihre Zugangsdaten sicher aufzubewahren.",


"4. Premium-Zugänge und Zahlungen",

"Nach Ablauf der kostenlosen Testphase können Nutzer freiwillig einen Premium-Zugang erwerben.",

"Mögliche Premiumzugänge:",

"• Premium Monat – 6,99 €",
"• Premium Jahr – 55,99 €",

"Ein Premium-Zugang wird nicht automatisch abgeschlossen.",

"Digitale Käufe und Zahlungen werden ausschließlich über Google Play verarbeitet.",

"Es gelten zusätzlich die Nutzungsbedingungen und Zahlungsrichtlinien von Google Play.",

"Abonnements können jederzeit über Google Play verwaltet oder beendet werden.",


"5. Pflichten der Nutzer",

"Die App darf nicht missbräuchlich oder rechtswidrig verwendet werden.",

"Manipulationen, Betrugsversuche oder technische Angriffe sind untersagt.",


"6. Verfügbarkeit",

"Wir bemühen uns um eine möglichst unterbrechungsfreie Verfügbarkeit der App.",

"Es besteht jedoch kein Anspruch auf permanente Erreichbarkeit.",


"7. Haftung",

"Für Schäden haften wir nur bei Vorsatz oder grober Fahrlässigkeit.",

"Für Datenverlust, technische Probleme oder Ausfälle übernehmen wir keine Haftung, soweit gesetzlich zulässig.",


"8. Änderungen der Bedingungen",

"Wir behalten uns vor, diese AGB jederzeit anzupassen oder zu aktualisieren.",


"9. Schlussbestimmungen",

"Es gilt das Recht der Bundesrepublik Deutschland.",

"Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",

"Stand: Mai 2026"
    ],
  },
};

