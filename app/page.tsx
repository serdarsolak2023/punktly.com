"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Panel from "./components/panel";
import EmptyState from "./components/emptystate";
import Coin from "./components/coin";
import FoxCoinImage from "./components/foxcoinimage";
import LiveFox from "./components/livefox";
import GoalProgress from "./components/goalprogress";
import CoinlyLabel from "./components/coinlylabel";
import ParentTabs from "./components/parenttabs";

import { BarChart3, Check, Edit3, Gift, Home, ListChecks, Lock, Palette, Plus, RefreshCcw, ShoppingBag, Sparkles, Trash2, Trophy, User, X, CalendarDays, Users, LogOut, BookMinusIcon, BookOpen } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, getDoc, getDocs, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { readingTexts } from "./readingTexts";
import { mathTasks } from "./mathTasks";

type Area = "start" | "child" | "parent";
type LegalPage = "impressum" | "datenschutz" | "widerruf" | "agb";
type ChildView = "home" | "tasks" | "rewards" | "chests" | "shop" | "profile" | "features" | "learning";
type ParentView = "dashboard" | "tasks" | "rewards" | "chests" | "shop" | "features" | "calendar" | "family" | "stats" | "profile" | "settings" | "learning" | "coinrechner";
type Repeat = "einmalig" | "täglich" | "wöchentlich";
type Status = "offen" | "wartet" | "erledigt" | "verpasst";
type RewardStatus = "frei" | "wartet" | "eingelöst";
type Theme = "🦁 Löwe" | "🐬 Delfin" | "🐸 Frosch" | "🦄 Einhorn" | "🐯 Tiger" | "🐼 Panda" | "🦜 Papagei" | "🐧 Pinguin";
type TaskPreset = { title: string; coins: number; repeat: Repeat; day: string; category: string };

type Child = {
  id: number;
  name: string;
  coins: number;
  xp: number;
  level: number;
  prestige?: number;
  prestigeStars?: number;
  streak: number;
  completedCount: number;
  weeklyPoints: number;
  theme: Theme;
  goal: string;
  goalCoins: number;
  equipped: string[];
  activePet?: string;
  activeBackground?: string;
  activeAvatar?: string;
  activeBooster?: string;
  achievements: string[];
  profileBadges?: string[];
  age?: string;
favoriteColor?: string;
favoriteAnimal?: string;
};

type Task = {
  id: number;
  childId: number | "all";
  title: string;
  coins: number;
  xp: number;
  repeat: Repeat;
  status: Status;
  day: string;
  completedAt?: number;
submittedAt?: number;
missedAt?: number;
deadlineAt?: number;
};
type Reward = {
  id: number;
  title: string;
  coins: number;
  icon: string;
  status: RewardStatus;
  requestedAt?: number;
  redeemedAt?: number;
};

type ShopItem = {
  id: number;
  title: string;
  price: number;
  icon: string;
  ownedBy: number[];
  category?: "Haustier" | "Avatar" | "Hintergrund" | "Booster" | "Spezial" | "Limited";
  rarity?: "Gewöhnlich" | "Selten" | "Episch" | "Legendär";
  description?: string;
  daily?: boolean;
  limited?: boolean;
  boughtAt?: number;
};

type Challenge = { id: number; title: string; goal: number; current: number; reward: number; done: boolean; };

type Chest = {
  id: number;
  title: string;
  price: number;
  tier: "Bronze" | "Silber" | "Gold";
  content: string;
  opened: boolean;
  openedBy?: number;
  openedAt?: number;
};

const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const legalPages: Record<LegalPage, { title: string; intro: string; content: string[] }> = {
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


const taskPresets: TaskPreset[] = [
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

type TaskPack = { id: string; title: string; description: string; presets: string[] };

const taskPacks: TaskPack[] = [
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


const initialChildren: Child[] = [];

const initialTasks: Task[] = [];

const weeklyGoals = [
  "5 Aufgaben erledigen",
  "3 Tage Serie halten",
  "100 Coins sammeln"
];

const dailyGoals = [
  "1 Aufgabe abschließen",
  "10 Coins verdienen",
  "Den Fuchs glücklich machen"
];

const rareBadges = [
  "🔥 Serien-Meister",
  "👑 Familien-Champion",
  "💎 Schatzjäger",
  "🌙 Nachteule"
];

const punktlyCoinPositions = [
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

const profileBadgeOptions = Array.from({ length: 30 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `badge-${number}`,
    label: `Motiv ${index + 1}`,
    src: `/badges/badge-${number}.png`,
  };
});

const initialRewards: Reward[] = [];

const extraShopItems = [
  { id: 9001, title: "Weltraum Theme", price: 600, owned: false },
  { id: 9002, title: "Goldener Rahmen", price: 450, owned: false },
  { id: 9003, title: "Krone", price: 800, owned: false },
];

const initialShop: ShopItem[] = [];

const initialChests: Chest[] = [];



function getFoxMood(child: Child, waitingTasks: number) {
  if (child.streak >= 5) return { mood: "party", text: "Wow! Deine Serie ist richtig stark! 🔥" };
  if (child.level >= 3) return { mood: "proud", text: "Du bist schon richtig weit gekommen!" };
  if (waitingTasks > 0) return { mood: "excited", text: "Ich warte mit dir auf die Bestätigung!" };
  if (child.completedCount === 0) return { mood: "sleepy", text: "Lass uns heute mit einer kleinen Aufgabe starten." };
  return { mood: "happy", text: "Heute schaffen wir wieder tolle Sachen!" };
}
const MAX_LEVEL = 100;

function xpToNext(level: number) {
  const safeLevel = Math.min(Math.max(level, 1), MAX_LEVEL);
  return Math.max(100, safeLevel * 100);
}

function levelRank(level: number) {
  if (level >= 100) return { title: "Legendär", emoji: "🌟", color: "text-purple-800 bg-purple-100" };
  if (level >= 75) return { title: "Diamant", emoji: "💎", color: "text-cyan-800 bg-cyan-100" };
  if (level >= 50) return { title: "Gold", emoji: "🏆", color: "text-amber-800 bg-amber-100" };
  if (level >= 10) return { title: "Silber", emoji: "🥈", color: "text-slate-800 bg-slate-100" };
  return { title: "Bronze", emoji: "🥉", color: "text-orange-800 bg-orange-100" };
}


function isValidAchievement(title: string) {
  const lower = title.toLowerCase();

  // Schatzkisten und eingelöste Belohnungen sind KEINE Abzeichen.
  if (lower.includes("schatzkiste")) return false;
  if (lower.includes("belohnung")) return false;
  if (lower.includes("eingelöst")) return false;
  if (lower.includes("geöffnet")) return false;

  return true;
}

function cleanAchievements(list: string[]) {
  return cleanLevelAchievements((list || []).filter(isValidAchievement));
}

function cleanLevelAchievements(list: string[]) {
  const levelBadges = list
    .filter((item) => /^Level \d+ erreicht$/.test(item))
    .map((item) => Number(item.match(/\d+/)?.[0] || 0))
    .filter((num) => num > 0);

  const highestLevel = levelBadges.length > 0 ? Math.max(...levelBadges) : null;

  const withoutOldLevels = list.filter((item) => !/^Level \d+ erreicht$/.test(item));

  return highestLevel ? [...withoutOldLevels, `Level ${highestLevel} erreicht`] : withoutOldLevels;
}

function addAchievement(list: string[], title: string) {
  let nextList = list || [];

  if (/^Level \d+ erreicht$/.test(title)) {
    nextList = nextList.filter((item) => !/^Level \d+ erreicht$/.test(item));
  }

  if (!nextList.includes(title)) {
    nextList = [...nextList, title];
  }

  return cleanAchievements(nextList);
}

function starsFromAchievements(child: Child) {
  return cleanAchievements(child.achievements || []).length;
}

function countPrestigeStars(child: Child) {
  const storedStars = Number(child.prestigeStars || 0);

  const equippedStars = (child.equipped || []).filter((item) =>
    item.includes("⭐") || item.includes("🌟") || item.includes("💫")
  ).length;

  const achievementStars = (child.achievements || []).filter((item) =>
    item.toLowerCase().includes("prestige") ||
    item.toLowerCase().includes("stern") ||
    item.includes("⭐") ||
    item.includes("🌟") ||
    item.includes("💫")
  ).length;

  return Math.max(storedStars, equippedStars + achievementStars);
}

function prestigeFromStars(child: Child) {
  return Math.max(Number(child.prestige || 0), countPrestigeStars(child));
}

function syncPrestigeStars(child: Child): Child {
  const syncedPrestige = prestigeFromStars(child);

  return {
    ...child,
    prestige: syncedPrestige,
    prestigeStars: Math.max(Number(child.prestigeStars || 0), countPrestigeStars(child)),
    achievements: cleanAchievements(child.achievements || []),
  };
}

export default function PunktlyRoleSplit() {

  const [isPurchased, setIsPurchased] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPaid, setIsCheckingPaid] = useState(false);
  const [area, setArea] = useState<Area>("start");
  const [childView, setChildView] = useState<ChildView>("home");
  const [taskFilter, setTaskFilter] = useState<"alle"|"offen"|"wartet"|"erledigt"|"verpasst">("alle");
  const [childTaskDayFilter, setChildTaskDayFilter] = useState<
  "today" | "tomorrow" | "week"
>("today");
const [learningFilter, setLearningFilter] = useState<"alle"|"offen"|"wartet"|"erledigt"|"verpasst">("alle");
const [parentView, setParentView] = useState<ParentView>("dashboard");
const [dashboardDayFilter, setDashboardDayFilter] = useState<
  "today" | "yesterday" | "beforeYesterday" | "last7"
>("today");
  const [parentTaskFilter, setParentTaskFilter] = useState<"alle"|"wartet"|"offen"|"erledigt"|"verpasst">("alle");
  const [parentTaskChildFilter, setParentTaskChildFilter] = useState<"all" | number>("all");
  const [familyBadgeCount, setFamilyBadgeCount] = useState(0);
  const [parentLearningFilter, setParentLearningFilter] = useState<"alle"|"wartet"|"offen"|"erledigt"|"verpasst">("alle");
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [savedParentPin, setSavedParentPin] = useState("");
  const [showPinKeypad, setShowPinKeypad] = useState(false);
  const [parentDisplayName, setParentDisplayName] = useState("");
  const [newParentPin, setNewParentPin] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const maintenanceMode =
  process.env.NODE_ENV === "production";
const [maintenancePassword, setMaintenancePassword] = useState("");

  const [editingLearningTaskId, setEditingLearningTaskId] = useState<number | null>(null);
  const [newLearningMinutes, setNewLearningMinutes] = useState(3);
  const [activeLearningTask, setActiveLearningTask] = useState<any | null>(null);
  const [learningTimeLeft, setLearningTimeLeft] = useState(0);
  const [learningPinInput, setLearningPinInput] = useState("");
  const [mathStep, setMathStep] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currentDayKey, setCurrentDayKey] = useState(
  new Date().toISOString().slice(0, 10)
);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [numberKeypadOpen, setNumberKeypadOpen] = useState(false);
  
  const [numberKeypadValue, setNumberKeypadValue] = useState("");
  const [numberKeypadIsPin, setNumberKeypadIsPin] = useState(false);
  const [numberKeypadSetter, setNumberKeypadSetter] = useState<((value: string) => void) | null>(null);
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [selectedChildId, setSelectedChildId] = useState(1);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [shop, setShop] = useState<ShopItem[]>(initialShop);
  const [chests, setChests] = useState<Chest[]>(initialChests);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeMathTask, setActiveMathTask] = useState<any>(null);
  const [mathQuestionTask, setMathQuestionTask] = useState<any | null>(null);
  const [mathQuestionData, setMathQuestionData] = useState<any | null>(null);
  const [familyDataLoadedForUid, setFamilyDataLoadedForUid] = useState("");
  const [resetCoinsValue, setResetCoinsValue] = useState(0);
  const [coinsTargetChild, setCoinsTargetChild] = useState("all");
  const [showCoinResetModal, setShowCoinResetModal] = useState(false);

  const [coinsForOneCent, setCoinsForOneCent] = useState(100);

  const [readingQuestionTask, setReadingQuestionTask] = useState<any | null>(null);
  const [readingQuestionText, setReadingQuestionText] = useState<any | null>(null);
  const [textKeyboardOpen, setTextKeyboardOpen] = useState(false);
  const [textKeyboardValue, setTextKeyboardValue] = useState("");
  const [keyboardUppercase, setKeyboardUppercase] = useState(true);
  const [textKeyboardSetter, setTextKeyboardSetter] = useState<((value:string)=>void)|null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildColor, setNewChildColor] = useState("");
  const [newChildAnimal, setNewChildAnimal] = useState("");
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [usePresetTask, setUsePresetTask] = useState(false);
const [useCustomTask, setUseCustomTask] = useState(true);
const [newTaskDeadline, setNewTaskDeadline] = useState<"today" | "tomorrow" | "threeDays" | "sevenDays">("today");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCoins, setNewTaskCoins] = useState(0);
  const [newTaskRepeat, setNewTaskRepeat] = useState<Repeat>("täglich");
  const [newTaskTarget, setNewTaskTarget] = useState<number | "all">("all");
  const [newTaskDay, setNewTaskDay] = useState("Mo");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState<"monthly" | "yearly">("yearly");
  
  const [selectedTaskPack, setSelectedTaskPack] = useState(taskPacks[0]?.id || "");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [learningTasks, setLearningTasks] = useState<any[]>([]);
  const [newLearningTitle, setNewLearningTitle] = useState("");
  const [newLearningCoins, setNewLearningCoins] = useState("0");
  const [newLearningCategory, setNewLearningCategory] = useState("📚 Lesen");
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardCoins, setNewRewardCoins] = useState(0);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [newChestTitle, setNewChestTitle] = useState("");
  const [newChestPrice, setNewChestPrice] = useState(0);
  const [newChestTier, setNewChestTier] = useState<"Bronze" | "Silber" | "Gold">("Bronze");
  const [newChestContent, setNewChestContent] = useState("");
  const [newShopTitle, setNewShopTitle] = useState("");
  const [newShopPrice, setNewShopPrice] = useState(0);
  const [newShopIcon, setNewShopIcon] = useState("🎁");
  const [newShopDescription, setNewShopDescription] = useState("");
  const [editingShopId, setEditingShopId] = useState<number | null>(null);
  const [openedChestMessage, setOpenedChestMessage] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showLoginWelcomePopup, setShowLoginWelcomePopup] = useState(false);
  const [resetConfirmKind, setResetConfirmKind] = useState<"täglich" | "wöchentlich" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [featurePopup, setFeaturePopup] = useState<{
  title: string;
  text: string;
  color: string;
  bg: string;
} | null>(null);
  const [showBadgeChooser, setShowBadgeChooser] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPage | null>(null);
  const [showPinReset, setShowPinReset] = useState(false);
  const [parentSecurityQuestion, setParentSecurityQuestion] = useState("");
  const [parentSecurityAnswer, setParentSecurityAnswer] = useState("");
  const [resetSecurityAnswer, setResetSecurityAnswer] = useState("");
  const [resetNewParentPin, setResetNewParentPin] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState<number | null>(null);
  const [trialIsActive, setTrialIsActive] = useState(false);
  
  const [bonusWheelEnabled, setBonusWheelEnabled] = useState(true);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [bonusCoinsEnabled, setBonusCoinsEnabled] = useState(false);
  const [dailyBonusEnabled, setDailyBonusEnabled] = useState(true);
  const [newLearningLevel, setNewLearningLevel] = useState<"leicht" | "mittel" | "schwer">("leicht");
  const [activeReadingText, setActiveReadingText] = useState<any>(null);
useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date();

    setCurrentDateTime(now);

    const newDayKey = now.toISOString().slice(0, 10);

    if (newDayKey !== currentDayKey) {
      setCurrentDayKey(newDayKey);
    }
  }, 1000);

  return () => clearInterval(timer);
}, [currentDayKey]);
        useEffect(() => {
  const tasksToMiss = tasks.filter(shouldTaskBeMissed);

  if (tasksToMiss.length === 0) return;

  const now = Date.now();

  const updatedTasks = tasks.map(task =>
    shouldTaskBeMissed(task)
      ? {
          ...task,
          status: "verpasst" as Status,
          missedAt: now,
        }
      : task
  );

  setTasks(updatedTasks);

  tasksToMiss.forEach(task => {
    saveTaskNow({
      ...task,
      status: "verpasst" as Status,
      missedAt: now,
    });
  });
}, [tasks]);
  const child = children.find((c) => c.id === selectedChildId) || children[0] || {
    id: 0,
    name: "Kein Kind",
    coins: 0,
    xp: 0,
    level: 1,
    prestige: 0,
    prestigeStars: 0,
    streak: 0,
    completedCount: 0,
    weeklyPoints: 0,
    theme: "🦁 Löwe" as Theme,
    goal: "Erstes Ziel",
    goalCoins: 100,
    equipped: [],
    activePet: "",
    activeBackground: "",
    activeAvatar: "",
    activeBooster: "",
    achievements: [],
    profileBadges: []
  };
const childTasks = tasks.filter((t) => {
  const belongsToChild =
    t.childId === "all" || t.childId === child.id;

  if (!belongsToChild) return false;

  if (childTaskDayFilter === "today") {
    return t.day === getTodayDay();
  }

  if (childTaskDayFilter === "tomorrow") {
    return t.day === getTomorrowDay();
  }

  return true;
});
const waitingTasks = tasks.filter((t) => t.status === "wartet");
const waitingRewards = rewards.filter((r) => r.status === "wartet");

const waitingLearningTasks = learningTasks.filter(
  (t) =>
    t.status === "wartet" &&
    isTimestampInDashboardFilter(t.submittedAt)
);

const waitingTasksForDashboard = tasks.filter(
  (t) =>
    t.status === "wartet" &&
    isTimestampInDashboardFilter(t.submittedAt)
);

const waitingRewardsForDashboard = rewards.filter(
  (r) =>
    r.status === "wartet" &&
    isTimestampInDashboardFilter(r.requestedAt)
);

const openTasksToday = tasks.filter(
  (t) => t.status === "offen"
).length;

const missedTasks = tasks.filter(
  (t) =>
    t.status === "verpasst" &&
    isTimestampInDashboardFilter(t.missedAt)
).length;

const completedTasks = tasks.filter(
  (t) =>
    t.status === "erledigt" &&
    isTimestampInDashboardFilter(t.completedAt)
).length;

const freeRewards = rewards.filter(
  (r) => r.status === "frei"
).length;

const openedChests = chests.filter(
  (c) => c.opened
).length;

const totalShopItemsOwned = shop.reduce(
  (sum, item) => sum + item.ownedBy.length,
  0
);

const childOpenTaskCount = childTasks.filter((t) => t.status === "offen").length;

const childOpenLearningCount = learningTasks.filter(
  (t) => t.childId === child.id && t.status === "offen"
).length;

const dailyBonusKey = `dailyBonus_${child.id}`;
const wheelBonusKey = `punktlyWheelLastSpin_${child.id}`;
const twentyFourHours = 24 * 60 * 60 * 1000;

const dailyBonusAvailable =
  typeof window !== "undefined" &&
  Date.now() - Number(localStorage.getItem(dailyBonusKey) || 0) >= twentyFourHours;

const wheelBonusAvailable =
  typeof window !== "undefined" &&
  Date.now() - Number(localStorage.getItem(wheelBonusKey) || 0) >= twentyFourHours;

const childBonusBadgeCount =
  (dailyBonusEnabled && dailyBonusAvailable ? 1 : 0) +
  (bonusWheelEnabled && wheelBonusAvailable ? 1 : 0);
  const motivationMessages = [
  "Super gemacht! Du kannst stolz auf dich sein.",
  "Toll erledigt! Weiter so.",
  "Du bist richtig fleißig.",
  "Klasse Arbeit! Das war stark.",
  "Du kommst deinem Ziel immer näher.",
  "Jede Aufgabe bringt dich weiter.",
  "Du hast heute richtig gut mitgemacht.",
  "Stark! Deine Mühe zahlt sich aus.",
  "Du sammelst nicht nur Coins, sondern auch Erfahrung.",
  "Weiter so, du bist auf dem richtigen Weg.",
  "Das hast du richtig gut gemacht.",
  "Du wirst jeden Tag besser.",
  "Eine Aufgabe geschafft – ein Schritt näher zur Belohnung.",
  "Du zeigst echte Verantwortung.",
  "Richtig stark, mach weiter so.",
  "Du kannst stolz auf deinen Fortschritt sein.",
  "Heute hast du wieder etwas geschafft.",
  "Deine Coins wachsen, weil du fleißig bist.",
  "Großartig! Du bleibst dran.",
  "Du hast dir deine Belohnung verdient.",
  "Mit jeder Aufgabe wirst du stärker.",
  "Dein Einsatz lohnt sich.",
  "Du machst das richtig klasse.",
  "So sieht Verantwortung aus.",
  "Du bist ein echter Aufgaben-Profi.",
  "Ein weiterer Erfolg für dich.",
  "Du hast gezeigt, dass du es kannst.",
  "Bleib dran, du erreichst dein Ziel.",
  "Du bist heute sehr motiviert.",
  "Tolle Leistung von dir.",
  "Deine Familie kann stolz auf dich sein.",
  "Du sammelst Schritt für Schritt Erfolg.",
  "Das war eine starke Aufgabe.",
  "Du hast wieder Coins verdient.",
  "Sehr gut gemacht.",
  "Du bist ein echter Coin-Sammler.",
  "Dein Fortschritt ist sichtbar.",
  "Du lernst Verantwortung mit Spaß.",
  "Klasse, dass du drangeblieben bist.",
  "Das war ein super Schritt nach vorne.",
  "Du hast heute etwas Wichtiges geschafft.",
  "Deine Mühe bringt dich weiter.",
  "Du bist auf dem Weg zur nächsten Belohnung.",
  "Jede erledigte Aufgabe zählt.",
  "Du machst PunktlyCoinly richtig stark.",
  "Du hast dir ein Lob verdient.",
  "So macht Aufgaben erledigen Spaß.",
  "Deine Motivation ist richtig stark.",
  "Du bist ein echtes Vorbild.",
  "Mega gemacht! Weiter geht’s."
];
  const childRewardGoalTotal = useMemo(
  () =>
    rewards
      .filter((reward) => reward.status === "frei")
      .reduce(
        (sum, reward) => sum + Math.max(0, Number(reward.coins) || 0),
        0
      ),
  [rewards]
);

const childRewardGoalLabel =
  childRewardGoalTotal > 0 ? "Belohnungen" : "Keine Belohnung";

const completedPercent = useMemo(
  () =>
    childTasks.length
      ? Math.round(
          (childTasks.filter((t) => t.status === "erledigt").length /
            childTasks.length) *
            100
        )
      : 0,
  [childTasks]
);
  const themeClass = child.theme === "🦁 Löwe" ? "from-yellow-100 to-orange-200" : child.theme === "🐬 Delfin" ? "from-sky-100 to-cyan-200" : child.theme === "🐸 Frosch" ? "from-lime-100 to-emerald-200" : child.theme === "🦄 Einhorn" ? "from-pink-100 to-purple-200" : child.theme === "🐯 Tiger" ? "from-orange-100 to-red-200" : child.theme === "🐼 Panda" ? "from-slate-100 to-gray-300" : child.theme === "🦜 Papagei" ? "from-green-100 to-yellow-200" : child.theme === "🐧 Pinguin" ? "from-blue-100 to-indigo-200" : "from-yellow-100 to-orange-200";
  const selectedChildMotiv = (child.profileBadges || [])[0] || "/PunktlyLogo.png";
function coinsToEuroText(coins: number) {
  const euro =
    coinsForOneCent > 0
      ? coins / coinsForOneCent / 100
      : 0;

  return `${coins} Coins = ${euro.toFixed(2).replace(".", ",")} €`;
}

async function hashPin(pin: string) {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    !window.crypto.subtle
  ) {
    return pin;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(pin);

  const hashBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
function formatDateTime(timestamp?: number) {
  if (!timestamp) return "";

  return `${new Date(timestamp).toLocaleDateString("de-DE")} um ${new Date(
    timestamp
  ).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })} Uhr`;
}

function getStartOfDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getEndOfDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

function isTimestampInDashboardFilter(timestamp?: number) {
  if (!timestamp) return false;

  if (dashboardDayFilter === "today") {
    return timestamp >= getStartOfDay(0) && timestamp <= getEndOfDay(0);
  }

  if (dashboardDayFilter === "yesterday") {
    return timestamp >= getStartOfDay(1) && timestamp <= getEndOfDay(1);
  }

  if (dashboardDayFilter === "beforeYesterday") {
    return timestamp >= getStartOfDay(2) && timestamp <= getEndOfDay(2);
  }

  return timestamp >= getStartOfDay(6) && timestamp <= getEndOfDay(0);
}
function getTodayDay() {
  const jsDay = new Date().getDay();

  const dayMap: Record<number, string> = {
    0: "So",
    1: "Mo",
    2: "Di",
    3: "Mi",
    4: "Do",
    5: "Fr",
    6: "Sa",
  };

  return dayMap[jsDay];
}
function getTomorrowDay() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const jsDay = tomorrow.getDay();

  const dayMap: Record<number, string> = {
    0: "So",
    1: "Mo",
    2: "Di",
    3: "Mi",
    4: "Do",
    5: "Fr",
    6: "Sa",
  };

  return dayMap[jsDay];
}
function getTaskDeadlineAt() {
  const date = new Date();

  if (newTaskDeadline === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  if (newTaskDeadline === "threeDays") {
    date.setDate(date.getDate() + 3);
  }

  if (newTaskDeadline === "sevenDays") {
    date.setDate(date.getDate() + 7);
  }

  date.setHours(23, 59, 59, 999);

  return date.getTime();
}
function shouldTaskBeMissed(task: Task) {
  if (task.status !== "offen") return false;
  if (task.repeat === "täglich") return false;
  if (task.repeat === "einmalig") return false;

  return task.day !== getTodayDay();
}

function isTaskForToday(task: Task) {
  return task.day === getTodayDay();
}
  function getTrialTimeLeft() {
  if (!trialEndsAt) return "";

  const diff = trialEndsAt - Date.now();

  if (diff <= 0) return "abgelaufen";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;

    return `${days} Tag ${restHours} Std`;
  }

  return `${hours} Std ${minutes} Min`;
}
function getDailyBonusTime() {
  const next = new Date();

  next.setHours(24, 0, 0, 0);

  const diff = next.getTime() - currentDateTime.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  return `${hours} Std ${minutes} Min`;
}
  function playSound(type: "coin" | "success" | "level" | "chest" | "click") {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audio = new AudioContextClass();

      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.connect(gain);
      gain.connect(audio.destination);

      const now = audio.currentTime;

      const soundMap = {
        coin: [880, 1320],
        success: [523, 659],
        level: [660, 880],
        chest: [330, 660],
        click: [420, 520],
      } as const;

      const [startFreq, endFreq] = soundMap[type];

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.type = type === "chest" ? "triangle" : "sine";
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Sound ist optional.
    }
  }
async function sendContactMessage() {
  const user = firebaseUser || auth.currentUser;

  if (!user) {
    celebrate("Bitte zuerst mit Google einloggen.");
    return;
  }

  if (!contactSubject.trim() || !contactMessage.trim()) {
    celebrate("Bitte Betreff und Nachricht ausfüllen.");
    return;
  }

  try {
    setIsSendingContact(true);

    await addDoc(collection(db, "supportMessages"), {
      to: "support@punktlycoinly.de",
      fromEmail: user.email || "",
      fromName: user.displayName || "",
      subject: contactSubject.trim(),
      message: contactMessage.trim(),
      uid: user.uid,
      createdAt: serverTimestamp(),
      status: "neu",
    });

    setContactSubject("");
    setContactMessage("");
    setShowContactPopup(false);
    celebrate("Nachricht wurde gesendet. Danke!");
  } catch (error) {
    console.error(error);
    celebrate("Nachricht konnte nicht gesendet werden.");
  } finally {
    setIsSendingContact(false);
  }
}
function celebrate(message: string) {
    playSound("success");
    setCelebration(message);
    setTimeout(() => setCelebration(null), 5000);
  }

  function goStart() {
    setArea("start");
    setChildView("home");
    setParentView("dashboard");
    setPinInput("");
  }

 async function enterParent() {
    if (!savedParentPin) {
      if (pinInput.trim().length < 4) {
        celebrate("PIN muss mindestens 4 Zeichen haben.");
        return;
      }

      const newPinHash = await hashPin(pinInput.trim());
setSavedParentPin(newPinHash);
      
      const user = firebaseUser || auth.currentUser;
      if (user) {
        setDoc(doc(db, "users", user.uid), {
          parentPinHash: newPinHash,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      setParentUnlocked(true);
      setArea("parent");
      setParentView("dashboard");
      setPinInput("");
      celebrate("Eltern-PIN erstellt!");
      return;
    }

    const enteredPinHash = await hashPin(pinInput.trim());

if (enteredPinHash === savedParentPin || pinInput.trim() === savedParentPin) {
      setParentUnlocked(true);
      setArea("parent");
      setParentView("dashboard");
      setPinInput("");
      celebrate("Elternbereich geöffnet!");
    } else {
      celebrate("PIN falsch.");
    }
  }
function openNumberKeypad(
  currentValue: number,
  setter: (value: number) => void
) {
  setNumberKeypadIsPin(false);

  setNumberKeypadValue(
    currentValue > 0 ? String(currentValue) : ""
  );

  setNumberKeypadSetter(() => (value: string) => {
    setter(Number(value) || 0);
  });

  setNumberKeypadOpen(true);
}
function NumberKeypadField({ label, value, setter, showEuro = false }: {
  label: string;
  value: number;
  setter: (value: number) => void;
  showEuro?: boolean;
}) {
  const euro = (
    Number(value || 0) /
    Number(coinsForOneCent || 100) /
    100
  ).toFixed(2).replace(".", ",");

  return (
    <button
      type="button"
      onClick={() => openNumberKeypad(value, setter)}
      className="w-full rounded-[1.5rem] border-2 border-sky-100 bg-white/90 p-4 text-left font-bold text-slate-700 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span>
          {label}: {Number(value || 0)}
        </span>

        {showEuro && (
          <span className="text-sm font-black text-green-600">
            💶 ≈{euro} €
          </span>
        )}
      </div>
    </button>
  );
}

  async function resetParentPin() {
    try {
      if (!parentSecurityQuestion.trim() || !parentSecurityAnswer.trim()) {
        celebrate("Noch keine Sicherheitsfrage im Elternbereich angelegt.");
        return;
      }

      if (!resetSecurityAnswer.trim()) {
        celebrate("Bitte Sicherheitsantwort eingeben.");
        return;
      }

      if (resetSecurityAnswer.trim().toLowerCase() !== parentSecurityAnswer.trim().toLowerCase()) {
        celebrate("Sicherheitsantwort ist falsch.");
        return;
      }

      if (resetNewParentPin.trim().length < 4) {
        celebrate("Neue PIN muss mindestens 4 Zeichen haben.");
        return;
      }

      const resetPinHash = await hashPin(resetNewParentPin.trim());
setSavedParentPin(resetPinHash);
      

      const user = firebaseUser || auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          parentPinHash: resetPinHash,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      setPinInput("");
      setResetSecurityAnswer("");
      setResetNewParentPin("");
      setShowPinReset(false);

      celebrate("Eltern-PIN wurde zurückgesetzt.");
    } catch (error) {
      console.error(error);
      celebrate("PIN konnte nicht zurückgesetzt werden.");
    }
  }

  function applyTaskPreset(value: string) {
    setSelectedPreset(value);
    const preset = taskPresets.find((p) => p.title === value);
    if (!preset) return;
    setNewTaskTitle(preset.title);
    setNewTaskCoins(preset.coins);
    setNewTaskRepeat(preset.repeat);
    setNewTaskDay(preset.day);
  }

  function submitTask(taskId: number) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const waitingTask: Task = {
  ...task,
  status: "wartet",
  submittedAt: Date.now(),
};
      setTasks(prev => prev.map(t => t.id === taskId ? waitingTask : t));
      saveTaskNow(waitingTask);
    }
    const randomMessage =
  motivationMessages[
    Math.floor(Math.random() * motivationMessages.length)
  ];

celebrate(`${randomMessage} \n\nWarte jetzt auf die Bestätigung deiner Eltern.`);
  } 

  function approveTask(task: Task) {
    const approvedTask: Task = {
  ...task,
  status: "erledigt",
  completedAt: Date.now(),
};

    setTasks(prev => prev.map(t => t.id === task.id ? approvedTask : t));
    saveTaskNow(approvedTask);

    let childToSave: Child | null = null;

    setChildren(prev => {
      const nextChildren = prev.map(c => {
        const receives = task.childId === "all" ? c.id === selectedChildId : c.id === task.childId;
        if (!receives) return c;

        let coins = Number(c.coins || 0) + Number(task.coins || 0);
        let xp = c.xp + task.xp;
        let level = c.level;
        let streak = c.streak + (task.repeat === "täglich" ? 1 : 0);
        let achievements = [...c.achievements];

        if (streak > 0 && streak % 3 === 0) {
          coins += 10;
          achievements = addAchievement(achievements, "3-Tage-Bonus");
        }

        while (xp >= xpToNext(level)) {
          xp -= xpToNext(level);

          if (level >= MAX_LEVEL) {
            level = 1;
            const nextPrestige = (c.prestige || 0) + 1;
            coins += 250;
            achievements = addAchievement(achievements, `Prestige ${nextPrestige} erreicht`);

            const updatedChild: Child = {
              ...c,
              coins,
              xp,
              level,
              prestige: nextPrestige,
              prestigeStars: nextPrestige,
              streak,
              completedCount: c.completedCount + 1,
              weeklyPoints:
  Number(c.weeklyPoints || 0) +
  Number(task.coins || 0),
              achievements
            };

            childToSave = syncPrestigeStars(updatedChild);
            return childToSave;
          }

          level += 1;
          coins += 25;
          setFamilyBadgeCount((prev) => prev + 1);
          achievements = addAchievement(achievements, `Level ${level} erreicht`);

          if (level === 10) achievements = addAchievement(achievements, "Silber-Rang erreicht");
          if (level === 50) achievements = addAchievement(achievements, "Gold-Rang erreicht");
          if (level === 75) achievements = addAchievement(achievements, "Diamant-Rang erreicht");
          if (level === 100) achievements = addAchievement(achievements, "Legendär-Rang erreicht");
        }

        if (coins >= 500) achievements = addAchievement(achievements, "500 Coins gesammelt");

        const updatedChild: Child = {
          ...c,
          coins,
          xp,
          level,
          streak,
          completedCount: c.completedCount + 1,
          weeklyPoints:
  Number(c.weeklyPoints || 0) +
  Number(task.coins || 0),
          achievements
        };

        childToSave = syncPrestigeStars(updatedChild);
        return childToSave;
      });

      if (childToSave) {
        saveChildNow(childToSave);
      }

      return nextChildren;
    });

    setChallenges(prev => prev.map(ch => ({ ...ch, current: Math.min(ch.goal, ch.current + 1) })));
    playSound("coin");
    celebrate("🎉 Bestätigt! Coins + XP gespeichert!");
  }

  function rejectTask(taskId: number) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const openTask: Task = { ...task, status: "offen" };
      setTasks(prev => prev.map(t => t.id === taskId ? openTask : t));
      saveTaskNow(openTask);
    }
    celebrate("Aufgabe abgelehnt.");
  }
async function resetAllChildrenCoins() {


  const newCoins = Number(resetCoinsValue || 0);

const updatedChildren = children.map(child => ({
  ...child,
  coins:
    coinsTargetChild === "all"
      ? newCoins
      : String(child.id) === coinsTargetChild
      ? newCoins
      : child.coins,
}));

  setChildren(updatedChildren);

  const user = auth.currentUser || firebaseUser;

  if (!user) {
    celebrate("Kein Nutzer gefunden.");
    return;
  }

  try {
    const batch = writeBatch(db);

    updatedChildren.forEach(child => {
      batch.set(
        doc(db, "users", user.uid, "children", String(child.id)),
        {
          ...child,
          coins: newCoins,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    celebrate(`Alle Coins wurden auf ${newCoins} gesetzt.`);
  } catch {
    celebrate("Coins konnten nicht geändert werden.");
  }
}

async function resetFamilyContent() {
  const confirmed = window.confirm(
    "Kinderprofile, Aufgaben, Lernen, Belohnungen, Kisten und Shop wirklich zurücksetzen?"
  );

  if (!confirmed) return;

  setChildren([]);
  setTasks([]);
  setLearningTasks([]);
  setRewards([]);
  setChests([]);
  setShop([]);

  try {
    const user = auth.currentUser || firebaseUser;
    if (!user) return;

    const collectionsToReset = [
      "children",
      "tasks",
      "learningTasks",
      "rewards",
      "chests",
      "shop",
    ];

    const batch = writeBatch(db);

    for (const collectionName of collectionsToReset) {
      const snap = await getDocs(
        collection(doc(db, "users", user.uid), collectionName)
      );

      snap.docs.forEach((documentItem) => {
        batch.delete(documentItem.ref);
      });
    }

    await batch.commit();

    celebrate("Kinder & Inhalte zurückgesetzt");
  } catch {
    celebrate("Fehler beim Zurücksetzen");
  }
}
  function saveTask() {
    if (!newTaskTitle.trim()) return;
    if (editingTaskId) {
      const editedTask = tasks.find(t => t.id === editingTaskId);
      if (editedTask) {
        const updatedTask: Task = { ...editedTask, title: newTaskTitle, coins: Math.max(1, newTaskCoins), xp: Math.max(5, newTaskCoins * 2), repeat: newTaskRepeat, childId: newTaskTarget, day: newTaskDay };
        setTasks(prev => prev.map(t => t.id === editingTaskId ? updatedTask : t));
        saveTaskNow(updatedTask);
      }
      setEditingTaskId(null);
      celebrate("Aufgabe bearbeitet!");
    } else {
if (newTaskTarget === "all") {
  const tasksForChildren = children.map((childItem, index) => ({
    id: Date.now() + index,
    childId: childItem.id,
    title: newTaskTitle,
    coins: Math.max(1, newTaskCoins),
    xp: Math.max(5, newTaskCoins * 2),
    repeat: newTaskRepeat,
    status: "offen" as Status,
    day: newTaskDay,
    deadlineAt: newTaskRepeat === "einmalig" ? getTaskDeadlineAt() : undefined,
  }));

  setTasks(prev => [...prev, ...tasksForChildren]);
  tasksForChildren.forEach(taskItem => saveFamilyItem("tasks", taskItem));
  celebrate("Aufgabe für alle Kinder einzeln angelegt!");
} else {
  const newTask = {
    id: Date.now(),
    childId: newTaskTarget,
    title: newTaskTitle,
    coins: Math.max(1, newTaskCoins),
    xp: Math.max(5, newTaskCoins * 2),
    repeat: newTaskRepeat,
    status: "offen" as Status,
    day: newTaskDay,
    deadlineAt: newTaskRepeat === "einmalig" ? getTaskDeadlineAt() : undefined,
  };

  setTasks(prev => [...prev, newTask]);
  saveFamilyItem("tasks", newTask);
  celebrate("Aufgabe angelegt!");
}
    }
    setNewTaskTitle("");
    setSelectedPreset("");
  }

  function addTaskPack() {
    const pack = taskPacks.find((item) => item.id === selectedTaskPack);
    if (!pack) return celebrate("Bitte ein Aufgabenpaket auswählen.");

    const existingTitles = new Set(tasks.map((task) => `${task.title}-${task.childId}`));
const tasksToAdd = pack.presets.flatMap((title, index) => {
  const preset = taskPresets.find((item) => item.title === title);
  if (!preset) return [];

  const targetChildren =
    newTaskTarget === "all"
      ? children
      : children.filter((childItem) => childItem.id === newTaskTarget);

  return targetChildren
    .filter((childItem) => {
      const dedupeKey = `${preset.title}-${childItem.id}`;
      return !existingTitles.has(dedupeKey);
    })
    .map((childItem, childIndex) => ({
      id: Date.now() + index * 100 + childIndex,
      childId: childItem.id,
      title: preset.title,
      coins: preset.coins,
      xp: Math.max(5, preset.coins * 2),
      repeat: preset.repeat,
      status: "offen" as Status,
      day: preset.day,
    }));
});

    if (tasksToAdd.length === 0) {
      celebrate("Dieses Paket ist für die Auswahl schon angelegt.");
      return;
    }

setTasks(prev => [...prev, ...tasksToAdd]);

const user = auth.currentUser || firebaseUser;

if (user) {
  const batch = writeBatch(db);

  tasksToAdd.forEach(task => {
    const taskRef = doc(
      db,
      "users",
      user.uid,
      "tasks",
      String(task.id)
    );

    batch.set(
      taskRef,
      {
        ...task,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  batch.commit();
}

playSound("click");
celebrate(`${tasksToAdd.length} Aufgaben aus ${pack.title} hinzugefügt!`);
  }

  function editTask(task: Task) {
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setNewTaskCoins(task.coins);
    setNewTaskRepeat(task.repeat);
    setNewTaskTarget(task.childId);
    setNewTaskDay(task.day);
    setArea("parent");
    setParentView("tasks");
  }

  function deleteTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id));
    deleteFamilyItem("tasks", id);
    celebrate("Aufgabe gelöscht.");
  }

  function resetRepeating(kind: "täglich" | "wöchentlich") {
    setResetConfirmKind(kind);
  }

async function deleteCompleteAccount() {
  const user = auth.currentUser || firebaseUser;

  if (!user) {
    celebrate("Kein Nutzer gefunden.");
    return;
  }

  const confirmed = window.confirm(
    "Möchtest du dein Konto wirklich vollständig löschen?\n\nDabei werden gelöscht:\n• Kinderprofile\n• Aufgaben\n• Lernaufgaben\n• Belohnungen\n• Schatzkisten\n• Shopdaten\n• Fortschritte\n• Kontodaten\n\nDieser Vorgang kann nicht rückgängig gemacht werden."
  );

  if (!confirmed) return;

  try {
    const collectionsToDelete = [
      "children",
      "tasks",
      "learningTasks",
      "rewards",
      "chests",
      "shop",
    ];

    const batch = writeBatch(db);

    for (const collectionName of collectionsToDelete) {
      const snap = await getDocs(
        collection(doc(db, "users", user.uid), collectionName)
      );

      snap.docs.forEach((documentItem) => {
        batch.delete(documentItem.ref);
      });
    }

    batch.delete(doc(db, "users", user.uid));

    await batch.commit();

    try {
      await deleteUser(user);
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        await deleteUser(user);
      } else {
        throw error;
      }
    }

    setChildren([]);
    setTasks([]);
    setLearningTasks([]);
    setRewards([]);
    setChests([]);
    setShop([]);
    setFirebaseUser(null);
    setIsPurchased(false);
    setHasPaid(false);
    setTrialIsActive(false);
    setParentUnlocked(false);
    setArea("start");

    celebrate("Konto und Daten wurden gelöscht.");
  } catch (error) {
    console.error(error);
    celebrate("Konto konnte nicht gelöscht werden.");
  }
}

async function confirmResetRepeating() {
  if (!resetConfirmKind) return;

  const kind = resetConfirmKind;
  const label = kind === "täglich" ? "Tagesaufgaben" : "Wochenaufgaben";

  const updatedTasks = tasks.map(t =>
    t.repeat === kind
      ? { ...t, status: "offen" as Status, completedDate: "" }
      : t
  );

  setTasks(updatedTasks);

  const user = auth.currentUser || firebaseUser;

  if (user) {
    const batch = writeBatch(db);

    updatedTasks
      .filter(t => t.repeat === kind)
      .forEach(t => {
        batch.set(
          doc(db, "users", user.uid, "tasks", String(t.id)),
          {
            ...t,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });

    await batch.commit();
  }

  setResetConfirmKind(null);
  celebrate(`${label} wurden zurückgesetzt!`);
}

  function saveReward() {
    if (!newRewardTitle.trim()) return;
    if (editingRewardId) {
      const editedReward = rewards.find(r => r.id === editingRewardId);
      if (editedReward) {
        const updatedReward: Reward = { ...editedReward, title: newRewardTitle, coins: Math.max(1, newRewardCoins) };
        setRewards(prev => prev.map(r => r.id === editingRewardId ? updatedReward : r));
        saveFamilyItem("rewards", updatedReward);
      }
      setEditingRewardId(null);
      celebrate("Belohnung bearbeitet!");
    } else {
      const newReward = { id: Date.now(), title: newRewardTitle, coins: Math.max(1, newRewardCoins), icon: "🎁", status: "frei" as RewardStatus };
      setRewards(prev => [...prev, newReward]);
      saveFamilyItem("rewards", newReward);
      celebrate("Belohnung angelegt!");
    }
    setNewRewardTitle("");
  }

  function editReward(r: Reward) {
    setEditingRewardId(r.id);
    setNewRewardTitle(r.title);
    setNewRewardCoins(r.coins);
    setArea("parent");
    setParentView("rewards");
  }

  function deleteReward(id: number) {
    setRewards(prev => prev.filter(r => r.id !== id));
    deleteFamilyItem("rewards", id);
    celebrate("Belohnung gelöscht.");
  }

  function requestReward(reward: Reward) {
    if (child.coins < reward.coins) return celebrate("Noch nicht genug Coins!");
    const waitingReward: Reward = {
  ...reward,
  status: "wartet",
  requestedAt: Date.now(),
};
    setRewards(prev => prev.map(r => r.id === reward.id ? waitingReward : r));
    saveFamilyItem("rewards", waitingReward);
    celebrate("Warten auf die Bestätigung deiner Eltern!");
  }

  function approveReward(reward: Reward) {
    if (child.coins < reward.coins) return celebrate("Nicht genug Coins.");

    const updatedChild: Child = { ...child, coins: child.coins - reward.coins };
   const redeemedReward: Reward = {
  ...reward,
  status: "eingelöst",
  redeemedAt: Date.now(),
};

    setChildren(prev => prev.map(c => c.id === child.id ? updatedChild : c));
    setRewards(prev => prev.map(r => r.id === reward.id ? redeemedReward : r));

    saveFamilyItem("children", syncPrestigeStars(updatedChild));
    saveFamilyItem("rewards", redeemedReward);

    playSound("success");
    celebrate("Belohnung freigegeben und gespeichert!");
  }

  function rejectReward(id: number) {
    const reward = rewards.find(r => r.id === id);
    if (reward) {
      const freeReward: Reward = { ...reward, status: "frei" };
      setRewards(prev => prev.map(r => r.id === id ? freeReward : r));
      saveFamilyItem("rewards", freeReward);
    }
    celebrate("Einlösung abgelehnt.");
  }

  function openChest(chest: Chest) {
    if (child.coins < chest.price) return celebrate("Nicht genug Coins für diese Schatzkiste!");
    setChildren(prev => prev.map(c => c.id === child.id ? {
      ...c,
      coins: c.coins - chest.price,
      achievements: cleanAchievements(c.achievements || [])
    } : c));
    const openedChest: Chest = {
  ...chest,
  opened: true,
  openedBy: child.id,
  openedAt: Date.now(),
};
    setChests(prev => prev.map(ch => ch.id === chest.id ? openedChest : ch));
    saveFamilyItem("chests", openedChest);
    const updatedChild: Child = { ...child, coins: child.coins - chest.price, achievements: cleanAchievements(child.achievements || []) };
    saveFamilyItem("children", updatedChild);
    setOpenedChestMessage(chest.content);
    playSound("chest");
    celebrate(`${chest.title} geöffnet!`);
  }

  function addChest() {
    if (!newChestTitle.trim() || !newChestContent.trim()) return celebrate("Bitte Titel und Inhalt eingeben.");
    const newChest = {
      id: Date.now(),
      title: newChestTitle.trim(),
      price: Math.max(1, newChestPrice),
      tier: newChestTier,
      content: newChestContent.trim(),
      opened: false
    };
    setChests(prev => [...prev, newChest]);
    saveFamilyItem("chests", newChest);
    setNewChestTitle("");
    setNewChestContent("");
    setNewChestPrice(100);
    setNewChestTier("Bronze");
    playSound("click");
    celebrate("Schatzkiste angelegt!");
  }

  function deleteChest(id: number) {
    setChests(prev => prev.filter(ch => ch.id !== id));
    deleteFamilyItem("chests", id);
    celebrate("Schatzkiste gelöscht.");
  }

  function equipShopItem(item: ShopItem) {
    if (!item.ownedBy.includes(child.id)) {
      celebrate("Dieses Item gehört noch nicht dir.");
      return;
    }

    const updatedChild: Child = {
      ...child,
      activePet: item.category === "Haustier" ? item.icon : child.activePet,
      activeBackground: item.category === "Hintergrund" ? item.title : child.activeBackground,
      activeAvatar: item.category === "Avatar" ? item.icon : child.activeAvatar,
      activeBooster: item.category === "Booster" ? item.title : child.activeBooster,
      achievements: addAchievement(child.achievements, "Abenteuerwelt gestaltet")
    };

    const prestigeSyncedChild = syncPrestigeStars(updatedChild);

    setChildren(prev => prev.map(c => c.id === child.id ? prestigeSyncedChild : c));
    saveFamilyItem("children", prestigeSyncedChild);

    celebrate(`${item.title} aktiviert!`);
  }

  function buyItem(item: ShopItem) {
    if (item.ownedBy.includes(child.id)) {
      celebrate("Dieses Shop-Produkt wurde schon eingelöst.");
      return;
    }

    if (child.coins < item.price) {
      celebrate("Nicht genug Coins!");
      return;
    }

    const updatedItem: ShopItem = {
  ...item,
  ownedBy: [...item.ownedBy, child.id],
  boughtAt: Date.now(),
};
    const updatedChild: Child = {
      ...child,
      coins: child.coins - item.price,
      equipped: [...child.equipped, item.icon],
      achievements: addAchievement(child.achievements, "Shop-Fan")
    };

    const syncedChild = syncPrestigeStars(updatedChild);

    setChildren(prev => prev.map(c => c.id === child.id ? syncedChild : c));
    setShop(prev => prev.map(i => i.id === item.id ? updatedItem : i));

    saveFamilyItem("children", syncedChild);
    saveFamilyItem("shop", updatedItem);

    playSound("coin");
    celebrate(`${item.title} wurde eingelöst!`);
  }

  function saveShopItem() {
    if (!newShopTitle.trim()) {
      celebrate("Bitte Shop-Produkt eingeben.");
      return;
    }

    const item: ShopItem = {
      id: editingShopId || Date.now(),
      title: newShopTitle.trim(),
      price: Math.max(1, newShopPrice),
      icon: newShopIcon.trim() || "🎁",
      ownedBy: editingShopId ? (shop.find((entry) => entry.id === editingShopId)?.ownedBy || []) : [],
      category: "Spezial",
      rarity: "Gewöhnlich",
      description: newShopDescription.trim() || "Von Eltern angelegte Shop-Belohnung."
    };

    if (editingShopId) {
      setShop(prev => prev.map(entry => entry.id === editingShopId ? item : entry));
      celebrate("Shop-Produkt gespeichert!");
    } else {
      setShop(prev => [...prev, item]);
      celebrate("Shop-Produkt angelegt!");
    }

    saveFamilyItem("shop", item);

    setEditingShopId(null);
    setNewShopTitle("");
    setNewShopPrice(100);
    setNewShopIcon("🎁");
    setNewShopDescription("");
  }

  function editShopItem(item: ShopItem) {
    setEditingShopId(item.id);
    setNewShopTitle(item.title);
    setNewShopPrice(item.price);
    setNewShopIcon(item.icon);
    setNewShopDescription(item.description || "");
    setParentView("shop");
  }

  function deleteShopItem(id: number) {
    setShop(prev => prev.filter(item => item.id !== id));
    deleteFamilyItem("shop", id);
    celebrate("Shop-Produkt gelöscht.");
  }

function saveChild() {
  if (!newChildName.trim()) return;

  if (editingChildId) {
    const editedChild = children.find(c => c.id === editingChildId);
    if (!editedChild) return;

const updatedChild = {
  ...editedChild,
  name: newChildName.trim(),
  age: newChildAge,
  favoriteColor: newChildColor,
  favoriteAnimal: newChildAnimal,
};

    setChildren(prev => prev.map(c => c.id === editingChildId ? updatedChild : c));
    saveFamilyItem("children", updatedChild);
    setEditingChildId(null);
    setNewChildName("");
    celebrate("Kind bearbeitet!");
    return;
  }

  const id = Date.now();
  const newChild = {
  id,
  name: newChildName.trim(),
  age: newChildAge,
  favoriteColor: newChildColor,
  favoriteAnimal: newChildAnimal,
  coins: 0,
  xp: 0,
  level: 1,
  prestige: 0,
  prestigeStars: 0,
  streak: 0,
  completedCount: 0,
  weeklyPoints: 0,
  theme: "hell" as Theme,
  goal: "Neue Belohnung",
  goalCoins: 500,
  equipped: [],
  activePet: "",
  activeBackground: "",
  activeAvatar: "",
  activeBooster: "",
  achievements: [],
  profileBadges: [],
};

  setChildren(prev => [...prev, newChild]);
  saveFamilyItem("children", newChild);
  setSelectedChildId(id);
  setNewChildName("");
  celebrate("Kind hinzugefügt!");
}

function editChild(child: Child) {
  setEditingChildId(child.id);
  setNewChildName(child.name);
  setNewChildAge(child.age || "");
  setNewChildColor(child.favoriteColor || "");
  setNewChildAnimal(child.favoriteAnimal || "");
}

function deleteChild(id: number) {
  setChildren(prev => prev.filter(c => c.id !== id));
  deleteFamilyItem("children", id);

  if (selectedChildId === id) {
    const nextChild = children.find(c => c.id !== id);
    setSelectedChildId(nextChild ? nextChild.id : 0);
  }

  celebrate("Kind gelöscht.");
}

  function setChildTheme(theme: Theme) {
    const updatedChild = { ...child, theme };
    setChildren(prev => prev.map(c => c.id === child.id ? updatedChild : c));
    saveFamilyItem("children", updatedChild);
  }

function toggleProfileBadge(badgeSrc: string) {
  const updatedChild = syncPrestigeStars({
    ...child,
    profileBadges:
      (child.profileBadges || []).includes(badgeSrc)
        ? []
        : [badgeSrc],
  });

  setChildren(prev =>
    prev.map(c =>
      c.id === child.id ? updatedChild : c
    )
  );

  saveFamilyItem("children", updatedChild);
}



  async function loginWithGoogle() {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setFirebaseUser(result.user);
      await loadParentProfile(result.user);
      await checkUserPaymentStatus(result.user);
      playSound("success");
      celebrate("Google Login erfolgreich!");
    } catch (error) {
      console.error(error);
      celebrate("Google Login fehlgeschlagen.");
    }
  }

  async function finishAuthLogin(user: FirebaseUser, message: string) {
    setFirebaseUser(user);
    await loadParentProfile(user);
    await checkUserPaymentStatus(user);
    playSound("success");
    celebrate(message);
  }

  function loginWithPhoneSoon() {
    celebrate("Telefon Login ist vorbereitet und braucht noch Firebase SMS/reCAPTCHA.");
  }


  async function logoutGoogle() {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setIsPurchased(false);
      setHasPaid(false);
      setShowLoginWelcomePopup(false);
      setParentUnlocked(false);
      setArea("start");
      celebrate("Abgemeldet.");
    } catch (error) {
      console.error(error);
      celebrate("Abmelden fehlgeschlagen.");
    }
  }



  async function loadParentProfile(user: FirebaseUser) {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
if (typeof data.parentPinHash === "string") {
  setSavedParentPin(data.parentPinHash);
} else if (typeof data.parentPin === "string") {
  const migratedPinHash = await hashPin(data.parentPin);

  setSavedParentPin(migratedPinHash);

  await setDoc(userRef, {
    parentPinHash: migratedPinHash,
    parentPin: null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

        if (typeof data.parentDisplayName === "string") {
          setParentDisplayName(data.parentDisplayName);
        } else if (user.displayName) {
          setParentDisplayName(user.displayName);
        }
        if (typeof data.parentSecurityQuestion === "string") {
          setParentSecurityQuestion(data.parentSecurityQuestion);
        }

        if (typeof data.parentSecurityAnswer === "string") {
          setParentSecurityAnswer(data.parentSecurityAnswer);
        }
if (typeof data.coinsForOneCent === "number") {
  setCoinsForOneCent(data.coinsForOneCent);
}
      } else {
        if (user.displayName) setParentDisplayName(user.displayName);

      }
    } catch (error) {
      console.error(error);

    }
  }
async function saveCoinRate() {
  const user = firebaseUser || auth.currentUser;

  if (!user) {
    celebrate("Bitte zuerst einloggen.");
    return;
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      coinsForOneCent: Number(coinsForOneCent || 100),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  celebrate(`Gespeichert: ${coinsForOneCent} Coins = 0,01 €`);
}
  async function saveParentProfile() {
    const user = firebaseUser || auth.currentUser;
    if (!user) {
      celebrate("Bitte zuerst einloggen.");
      return;
    }

    if (newParentPin && newParentPin.trim().length < 4) {
      celebrate("Neue PIN muss mindestens 4 Zeichen haben.");
      return;
    }

const updates: any = {};

if (parentDisplayName.trim()) {
  updates.parentDisplayName = parentDisplayName.trim();
}

if (user.email) {
  updates.email = user.email;
}

updates.uid = user.uid;

if (newParentPin.trim()) {
  const newParentPinHash = await hashPin(newParentPin.trim());

  updates.parentPinHash = newParentPinHash;
  updates.parentPin = null;

  setSavedParentPin(newParentPinHash);
  setNewParentPin("");
}

    if (parentSecurityQuestion.trim() || parentSecurityAnswer.trim()) {
      if (!parentSecurityQuestion.trim() || !parentSecurityAnswer.trim()) {
        celebrate("Bitte Sicherheitsfrage und Antwort ausfüllen.");
        return;
      }

      updates.parentSecurityQuestion = parentSecurityQuestion.trim();
      updates.parentSecurityAnswer = parentSecurityAnswer.trim().toLowerCase();
      setParentSecurityQuestion(parentSecurityQuestion.trim());
      setParentSecurityAnswer(parentSecurityAnswer.trim().toLowerCase());
    }
updates.updatedAt = serverTimestamp();
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
    celebrate("Eltern-Profil gespeichert!");
  }

  async function checkUserPaymentStatus(user: FirebaseUser) {
    try {
      setIsCheckingPaid(true);
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
const data = snap.data();

if (data?.trialActive && data?.trialEndsAt > Date.now()) {
  setHasPaid(false);
  setIsPurchased(true);
  setTrialIsActive(true);
  setTrialEndsAt(data.trialEndsAt); 
  setShowLoginWelcomePopup(true);

  await loadFamilyData(user);

  return true;
}

if (data?.trialActive && data?.trialEndsAt <= Date.now()) {
  await setDoc(
    userRef,
    {
      trialActive: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
setTrialEndsAt(null);
setTrialIsActive(false);
      if (snap.exists() && snap.data().paid === true) {
        setHasPaid(true);
        setIsPurchased(true);
         setTrialIsActive(false);
setShowLoginWelcomePopup(true);

if (familyDataLoadedForUid !== user.uid) {
  await loadFamilyData(user);
  setFamilyDataLoadedForUid(user.uid);
}

return true;
      }

setHasPaid(false);
setIsPurchased(false);

if (!snap.exists()) {
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      paid: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

return false;
    } catch (error) {
      console.error(error);
      celebrate("Zahlungsstatus konnte nicht geprüft werden.");
      return false;
    } finally {
      setIsCheckingPaid(false);
    }
  }

  async function markUserAsPaid(user: FirebaseUser, orderId: string) {
    const userRef = doc(db, "users", user.uid);

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        paid: true,
        paypalOrderId: orderId,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setHasPaid(true);
    setIsPurchased(true);
    await loadFamilyData(user);
setFamilyDataLoadedForUid(user.uid);
  }

  async function loadFamilyData(user: FirebaseUser) {
    try {
      const baseRef = doc(db, "users", user.uid);

      const loadCollection = async <T,>(name: string): Promise<T[]> => {
        const snap = await getDocs(collection(baseRef, name));
        return snap.docs.map((d) => d.data() as T);
      };

const [
  loadedChildrenRaw,
  loadedLearningTasks,
  loadedTasks,
  loadedRewards,
  loadedChests,
  loadedShop
] = await Promise.all([
  loadCollection<Child>("children"),
  loadCollection<any>("learningTasks"),
  loadCollection<Task>("tasks"),
  loadCollection<Reward>("rewards"),
  loadCollection<Chest>("chests"),
  loadCollection<ShopItem>("shop")
]);

const loadedChildren = loadedChildrenRaw.map(
  (loadedChild) =>
    syncPrestigeStars({
      ...loadedChild,
      achievements: cleanAchievements(
        loadedChild.achievements || []
      )
    })
);

const syncedChildren = loadedChildren.map(
  syncPrestigeStars
);

setChildren(syncedChildren);
setLearningTasks(loadedLearningTasks);
setTasks(loadedTasks);


      setRewards(loadedRewards);
      setChests(loadedChests);
      setShop(loadedShop.length > 0 ? loadedShop : initialShop);

      if (syncedChildren.length > 0) {
        setSelectedChildId(syncedChildren[0].id);
      } else {
        setSelectedChildId(0);
      }
    } catch (error) {
      console.error(error);
      celebrate("Familiendaten konnten nicht geladen werden.");
    }
  }

  async function deleteFamilyItem(collectionName: "children" | "tasks" | "rewards" | "chests" | "shop" | "learningTasks", id: number) {
    const user = auth.currentUser || firebaseUser;

    if (!user) {
      console.warn("Punktly Firebase Delete: Kein eingeloggter Nutzer gefunden.", collectionName, id);
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, collectionName, String(id)));
    } catch (error) {
      console.error("Punktly Firebase Delete Fehler:", error);
      celebrate("Firebase konnte den Eintrag nicht löschen.");
    }
  }

  async function saveFamilyItem(collectionName: "children" | "tasks" | "rewards" | "chests" | "shop" | "learningTasks", item: { id: number }) {
    const user = auth.currentUser || firebaseUser;

    if (!user) {
      console.warn("Punktly Firebase Save: Kein eingeloggter Nutzer gefunden.", collectionName, item);
      celebrate("Speichern fehlgeschlagen: Kein Google Nutzer.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid, collectionName, String(item.id)),
        {
          ...item,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

    } catch (error) {
      console.error("Punktly Firebase Save Fehler:", error);
      celebrate("Firebase konnte Daten nicht speichern.");
    }
  }

async function saveChildNow(updatedChild: Child) {
  await saveFamilyItem("children", updatedChild);
}
function startLearningSession(task: any) {
  const category = String(task.category || "");

  setActiveLearningTask(task);
  setLearningTimeLeft(Number(task.minutes || 1) * 60);
  setLearningPinInput("");

  if (category.includes("Lesen")) {
    const text = getReadingText(task.level || "leicht");

    setActiveReadingText(text);
    setActiveMathTask(null);
    return;
  }

if (category.includes("Mathe")) {
  const mathTaskData = getMathTask(task.level || "leicht");

  if (!mathTaskData) {
    celebrate("❌ Keine passende Matheaufgabe gefunden.");
    return;
  }

setActiveMathTask({
  title: mathTaskData.title,
  text: mathTaskData.text,
  questions: mathTaskData.questions,
});

setMathStep(0);

  setActiveReadingText(null);

  return;
}

  setActiveReadingText(null);
  setActiveMathTask(null);
}
function getReadingText(level: "leicht" | "mittel" | "schwer") {
  if (!child) return null;

  const age = Number(child.age || 0);

  const texts = readingTexts[level].filter(
    text =>
      age >= text.minAge &&
      age <= text.maxAge
  );

  if (texts.length === 0) return null;

  return texts[Math.floor(Math.random() * texts.length)];
}

function getMathTask(level: "leicht" | "mittel" | "schwer") {
  const age = Number(child?.age || 0)
  const filteredTasks = mathTasks.filter(
    (task) =>
      task.category === level &&
      age >= task.minAge &&
      age <= task.maxAge
  );
  if (filteredTasks.length === 0) {
    return null;
  }
  
  return filteredTasks[
    Math.floor(Math.random() * filteredTasks.length)
  ];
}
function openTextKeyboard(
  value: string,
  setter: (value: string) => void
) {
  setTextKeyboardValue(value || "");
  setTextKeyboardSetter(() => setter);
  setTextKeyboardOpen(true);
}

function AppInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      onClick={() => openTextKeyboard(value, onChange)}
      className={`w-full cursor-pointer rounded-[1.3rem] border-2 border-sky-100 bg-white/90 p-3 text-sm font-bold shadow-inner sm:p-4 sm:text-base ${className}`}
    >
      {value || placeholder}
    </div>
  );
}
function AppTextarea({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      onClick={() => openTextKeyboard(value, onChange)}
      className={`min-h-[90px] w-full cursor-pointer rounded-[1.3rem] border-2 border-sky-100 bg-white/90 p-3 text-sm font-bold shadow-inner sm:min-h-[110px] sm:p-4 sm:text-base ${className}`}
    >
      {value || placeholder}
    </div>
  );
}
function saveLearningTask() {
  if (!newLearningTitle.trim()) return;

  if (editingLearningTaskId) {
    const editedTask = learningTasks.find(task => task.id === editingLearningTaskId);
    if (!editedTask) return;

    const updatedTask = {
      ...editedTask,
      childId: selectedChildId,
      title: newLearningTitle,
      coins: newLearningCoins,
      category: newLearningCategory,
      level: newLearningLevel,
      minutes: newLearningMinutes,
    };
    setLearningTasks(prev =>
      prev.map(task => task.id === editingLearningTaskId ? updatedTask : task)
    );

    saveFamilyItem("learningTasks", updatedTask);

    setEditingLearningTaskId(null);
    setNewLearningTitle("");
    setNewLearningCoins("0");

    celebrate("📚 Lernaufgabe bearbeitet!");
    return;
  }

const task = {
  id: Date.now(),
  childId: selectedChildId,
  title: newLearningTitle,
  coins: newLearningCoins,
  category: newLearningCategory,
  level: newLearningLevel,
  minutes: newLearningMinutes,
  status: "offen",
};

  setLearningTasks(prev => [...prev, task]);
  saveFamilyItem("learningTasks", task);

  setNewLearningTitle("");
  setNewLearningCoins("0");

  celebrate("📚 Lernaufgabe hinzugefügt!");
}

function editLearningTask(task: any) {
  setEditingLearningTaskId(task.id);
  setSelectedChildId(task.childId);
  setNewLearningTitle(task.title);
  setNewLearningCoins(task.coins);
  setNewLearningCategory(task.category);
}

function deleteLearningTask(id: number) {
  setLearningTasks(prev => prev.filter(task => task.id !== id));
  deleteFamilyItem("learningTasks", id);
  celebrate("Lernaufgabe gelöscht.");
}
function approveLearningTask(task: any) {
  const targetChild = children.find(c => c.id === task.childId);
  if (!targetChild) return;

  const updatedChild = {
    ...targetChild,
    coins:
  Number(targetChild.coins || 0) +
  Number(task.coins || 0),
  };

  const updatedTask = {
    ...task,
    status: "erledigt",
  };

  setChildren(prev =>
    prev.map(c => c.id === targetChild.id ? updatedChild : c)
  );

  setLearningTasks(prev =>
    prev.map(t => t.id === task.id ? updatedTask : t)
  );

  saveFamilyItem("children", updatedChild);
  saveFamilyItem("learningTasks", updatedTask);

  celebrate(`✅ Lernaufgabe bestätigt! ${targetChild.name} erhält ${task.coins} Coins.`);
}

function rejectLearningTask(task: any) {
  const updatedTask = {
    ...task,
    status: "offen",
  };

  setLearningTasks(prev =>
    prev.map(t => t.id === task.id ? updatedTask : t)
  );

  saveFamilyItem("learningTasks", updatedTask);

  celebrate("❌ Lernaufgabe wurde abgelehnt.");
}
function claimDailyLoginBonus() {
  if (!child) return;

  const bonusKey = `dailyBonus_${child.id}`;
  const lastClaim = Number(localStorage.getItem(bonusKey) || 0);

  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (now - lastClaim < twentyFourHours) {
  celebrate("🎁 Der tägliche Bonus wurde heute bereits abgeholt.");
  return;
}

  const updatedChild = {
    ...child,
    coins: child.coins + 10,
  };

  setChildren(prev =>
    prev.map(c => (c.id === child.id ? updatedChild : c))
  );

  saveChildNow(updatedChild);

  localStorage.setItem(bonusKey, String(now));

  celebrate("🎁 Täglicher Login-Bonus!\n\nDu hast 10 Coins erhalten.");
}

function spinBonusWheel() {
  const lastSpinKey = `punktlyWheelLastSpin_${child.id}`;
  const lastSpin = Number(localStorage.getItem(lastSpinKey) || 0);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (now - lastSpin < twentyFourHours) {
    celebrate("Das Glücksrad kann nur alle 24 Stunden gedreht werden.");
    return;
  }

  const prizes = [5, 5, 5, 5, 5, 10, 10, 10, 15, 15, 25];
  const prize = prizes[Math.floor(Math.random() * prizes.length)];

  setWheelSpinning(true);

  setTimeout(() => {
    const updatedChild = {
      ...child,
      coins: child.coins + prize,
    };

    setChildren(prev =>
      prev.map(c => (c.id === child.id ? updatedChild : c))
    );

    saveChildNow(updatedChild);

    localStorage.setItem(lastSpinKey, String(now));
    setWheelResult(prize);
    setWheelSpinning(false);

    celebrate(`Glückwunsch! Du hast ${prize} Coins gewonnen.`);
  }, 1800);
}
  
  async function saveTaskNow(updatedTask: Task) {
    await saveFamilyItem("tasks", updatedTask);
  }

async function startTrial() {
  const user = firebaseUser || auth.currentUser;

  if (!user) {
    celebrate("Bitte zuerst einloggen.");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (data?.trialUsed) {
      celebrate("Testphase wurde bereits genutzt.");
      return;
    }

    const trialEnds = Date.now() + 48 * 60 * 60 * 1000;

    await setDoc(
      userRef,
      {
        trialUsed: true,
        trialActive: true,
        trialStartedAt: serverTimestamp(),
        trialEndsAt: trialEnds,
        trialEndsText: new Date(trialEnds).toLocaleString("de-DE"),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setHasPaid(true);
    setTrialEndsAt(trialEnds);
setTrialIsActive(true);
    setIsPurchased(true);
    await loadFamilyData(user);

    celebrate("🎉 48 Stunden Testphase gestartet!");
  } catch {
    celebrate("Testphase konnte nicht gestartet werden.");
  }
}
  async function startGooglePlayBillingCheckout(
  plan: "monthly" | "yearly"
) {
    try {
      setIsPaying(true);
      setPaymentStatus("Google Play Billing wird vorbereitet...");
let productId = "";

if (plan === "monthly") {
  productId = "premium_monthly";
}

if (plan === "yearly") {
  productId = "premium_yearly";
}



console.log("Ausgewähltes Paket:", productId);
      let currentUser = firebaseUser || auth.currentUser;

      if (!currentUser) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        setFirebaseUser(result.user);
        await checkUserPaymentStatus(result.user);
      }

      if (!currentUser) {
        throw new Error("Login konnte nicht gestartet werden.");
      }

      celebrate("Google Play Billing wird später in der Android-App gestartet.");
    } catch (error) {
      console.error(error);
      celebrate("Google Play Zahlung konnte nicht gestartet werden.");
    } finally {
      setPaymentStatus("");
      setIsPaying(false);
    }
  }
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentDateTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        await loadParentProfile(user);
        await checkUserPaymentStatus(user);
      } else {
        setFirebaseUser(null);
        setHasPaid(false);
        setIsPurchased(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);
  
useEffect(() => {
  if (!activeLearningTask) return;

  if (learningTimeLeft <= 0) {
    const finishedTask = activeLearningTask;
if (
  String(finishedTask?.category || "").includes("Mathe")
) {

  celebrate(
    `⏰ Zeit vorbei!\n\n${mathStep}/10 Aufgaben geschafft.\nKeine Coins erhalten.`
  );

  setActiveLearningTask(null);
  setActiveMathTask(null);
  setMathStep(0);
  setLearningPinInput("");

  return;
}
    if (
      finishedTask?.category === "📚 Lesen" &&
      activeReadingText?.question
    ) {
      setReadingQuestionTask(finishedTask);
      setReadingQuestionText(activeReadingText);

      setActiveLearningTask(null);
      setActiveReadingText(null);
      setLearningPinInput("");

      return;
    }

const updatedTask = {
  ...finishedTask,
  status: "wartet",
  submittedAt: Date.now(),
};

    setLearningTasks(prev =>
      prev.map(task =>
        task.id === finishedTask.id ? updatedTask : task
      )
    );

    saveFamilyItem("learningTasks", updatedTask);

    setActiveLearningTask(null);
    setActiveReadingText(null);
    setLearningPinInput("");

    setTimeout(() => {
      celebrate("🎉 Lernaufgabe beendet!\n\nWartet auf Elternbestätigung.");
    }, 100);

    return;
  }

  const timer = setTimeout(() => {
    setLearningTimeLeft(prev => Math.max(prev - 1, 0));
  }, 1000);

  return () => clearTimeout(timer);
}, [activeLearningTask, learningTimeLeft, activeReadingText, activeMathTask]);

if (maintenanceMode) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-white to-yellow-100 p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white/90 p-6 text-center shadow-2xl">
        <FoxCoinImage className="mx-auto h-24 w-24" />

        <h1 className="mt-4 text-3xl font-black text-sky-900">
          www.punktlycoinly.de
        </h1>

        <div className="mt-5 rounded-[1.5rem] bg-yellow-50 p-4">
          <div className="text-5xl">🚧</div>

          <h2 className="mt-2 text-xl font-black text-orange-700">
            Aktuell befinden sich Wartungsarbeiten. Die PunktlyCoinly App wird demnächst auf Google Play verfügbar sein.
          </h2>

          <p className="mt-3 font-bold text-slate-700">
            Die App wird gerade verbessert, daher bitte ich um Geduld.
          </p>

          <p className="mt-2 text-1xl font-extrabold text-red-300 tracking-wide">
            Suche eine Person für den Support, bei Interesse bitte gerne melden!
            <br />
            support@punktlycoinly.de
          </p>

          {/* Audio/Music */}
          <div className="mt-6">
            <audio controls className="w-full">
              <source src="/music/mein-song.mp3" type="audio/mpeg" />
              Dein Browser unterstützt kein Audio.
            </audio>
          </div>
        </div>
      </div>
    </div>
  );
}
if (!isPurchased) {
    return (
    <main className="relative min-h-[120vh] sm:min-h-screen bg-gradient-to-br from-[#eef7ff] via-[#f7fbff] to-white px-4 py-6 md:px-6">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-35 sm:opacity-45 lg:opacity-55">
          {punktlyCoinPositions.map((coin, i) => (
            <img
              key={`global-coin-${i}`}
              src={`/badges/badge-${String(coin.badge).padStart(2, "0")}.png`}
              alt=""
              aria-hidden="true"
              className={`punktly-global-coin absolute object-contain ${i % 2 === 0 ? "punktly-global-coin-float" : "punktly-global-coin-drift"}`}
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                left: coin.left,
                top: coin.top,
                animationDelay: coin.delay,
              }}
            />
          ))}
        </div>

        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-35 sm:opacity-45 lg:opacity-55">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={`star-${i}`}
              aria-hidden="true"
              className="punktly-bg-star absolute text-yellow-300"
              style={{
                left: `${(i * 13 + 7) % 100}%`,
                top: `${(i * 19 + 5) % 100}%`,
                fontSize: `${16 + (i % 3) * 6}px`,
                animationDelay: `${i * 0.28}s`,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

<div className="relative z-10 mx-auto flex w-full max-w-[92rem] flex-col gap-4 sm:gap-5">
  <nav className="mt-4 flex flex-wrap items-center justify-center gap-2">
  {(["impressum", "datenschutz", "widerruf", "agb"] as LegalPage[]).map((page) => (
    <button
      key={page}
      onClick={() => setActiveLegalPage(page)}
      className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-white"
    >
      {legalPages[page].title}
    </button>
  ))}
</nav>{activeLegalPage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
      
      <button
        onClick={() => setActiveLegalPage(null)}
        className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600"
      >
        ✕
      </button>

      <h2 className="mb-4 text-center text-2xl font-black text-sky-950">
        {legalPages[activeLegalPage].title}
      </h2>

      <div className="space-y-3 text-sm font-bold leading-relaxed text-sky-900">
        {legalPages[activeLegalPage].content.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>

    </div>
  </div>
)}
    <section className="w-full rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] bg-white/42 px-6 py-8 text-center shadow-[0_28px_80px_rgba(14,165,233,.14)] backdrop-blur-xl ring-1 ring-white/80 backdrop-blur-2xl md:px-10 md:py-10">
      <img
        src="/PunktlyLogo.png"
        alt="Punktly Logo"
        className="mx-auto h-12 w-12 sm:h-16 sm:w-16 object-contain drop-shadow-xl md:h-28 md:w-28"
      />
<h1 className="text-3xl font-black md:text-4xl">
  <span className="text-yellow-400">P</span>
  <span className="text-green-500">u</span>
  <span className="text-blue-500">n</span>
  <span className="text-red-500">k</span>
  <span className="text-purple-500">t</span>
  <span className="text-orange-400">l</span>
  <span className="text-pink-500">y</span>
  <span className="text-cyan-500">C</span>
  <span className="text-lime-500">o</span>
  <span className="text-indigo-500">i</span>
  <span className="text-rose-500">n</span>
  <span className="text-amber-500">l</span>
  <span className="text-sky-500">y</span>
</h1>
<p className="mt-2 text-lg font-extrabold sm:text-xl">
  <span className="text-yellow-400">Premium</span>{" "}
  <span className="text-green-500">freischalten</span>{" "}
  <span className="text-blue-500">und</span>{" "}
  <span className="text-red-500">alle</span>{" "}
  <span className="text-orange-400">Funktionen</span>{" "}
  <span className="text-purple-500">für</span>{" "}
  <span className="text-pink-500">die</span>{" "}
  <span className="text-cyan-500">ganze</span>{" "}
  <span className="text-lime-500">Familie</span>{" "}
  <span className="text-amber-500">genießen!</span>
</p>
<div className="relative mx-auto mt-4 w-fit rounded-[1.4rem] bg-red-100/95 px-4 py-3 shadow-lg ring-2 ring-red-200">

  <p className="text-xl font-black text-pink-600">
    ✨ PREMIUM
  </p>

      <div className="mt-1 flex items-center gap-2">
    <span className="text-xl font-black text-pink-600">
      6,99 €
    </span>

    <span className="text-sm font-black text-pink-600">
      pro Monat
    </span>
  </div>

  <button
    onClick={() => {
      document
        .getElementById("payment-section")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }}
    className="mt-2 w-full rounded-[1rem] bg-gradient-to-r from-pink-500 to-fuchsia-500 px-3 py-2 text-[11px] font-black text-white shadow-md"
  >
    💎 Premium Pakete ansehen
  </button>

</div>
<button
  onClick={() => setShowAppInfo(!showAppInfo)}
  className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-black text-sky-700 shadow-lg transition hover:scale-105"
>
  ℹ️ Details zur PunktlyCoinly App ℹ️
</button>

{showAppInfo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="relative w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,.25)]">
      <button
        type="button"
        onClick={() => setShowAppInfo(false)}
        className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600 transition hover:scale-105"
      >
        ✕
      </button>

      <h2 className="mb-4 text-center text-2xl font-black text-sky-950">
        ℹ️ Informationen zur App
      </h2>

      <p className="text-sm font-bold leading-relaxed text-sky-950 md:text-base">
        Die Familien-App für Aufgaben, Motivation, Belohnungen und Elternkontrolle.
        Gemeinsam Ziele erreichen und Spaß haben!
      </p>

      <p className="mt-4 text-sm font-bold leading-relaxed text-sky-950 md:text-base">
        Mit der PunktlyCoinly App lernen Kinder spielerisch den Umgang mit Geld und Verantwortung.
        Durch erledigte Aufgaben sammeln sie Punkte und Coins, verfolgen ihren Fortschritt durch
        Level und können ihre Coins gegen von den Eltern festgelegte Belohnungen eintauschen –
        ein motivierender und moderner Ersatz für Taschengeld.
      </p>
    </div>
  </div>
)}

<div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2">

  <button
    onClick={() =>
      setFeaturePopup({
    title: "✅ Aufgaben und Motivation ✅",
text: `Mit PunktlyCoinly werden tägliche und wöchentliche Aufgaben zu einem motivierenden Abenteuer.
Kinder lernen spielerisch Verantwortung zu übernehmen und wichtige Alltagsaufgaben selbstständig zu erledigen.
Durch tägliche Aufgaben entwickeln Kinder Routinen und lernen Verantwortung im Alltag zu übernehmen.
Wöchentliche Aufgaben sorgen zusätzlich für langfristige Ziele, Motivation und regelmäßige Fortschritte.
Für jede erledigte Aufgabe erhalten Kinder Punkte und Coins als Belohnung.
Dadurch sammeln sie Erfolge, steigen im Level auf und bleiben dauerhaft motiviert.
Eltern können Aufgaben individuell anpassen und die Entwicklung ihrer Kinder jederzeit begleiten.`,
color: "text-yellow-400",
bg: "bg-yellow-50",
      })
    }
    className="rounded-[1.2rem] bg-red-50/78 px-3 py-2 text-left shadow-sm transition hover:scale-[1.01] sm:px-4 sm:py-3"
  >
    <p className="text-base font-black text-yellow-400 md:text-lg">
      ✅ Aufgaben und Motivation
    </p>
  </button>

  <button
    onClick={() =>
      setFeaturePopup({
 title: "🎁 Shop, Schatzkisten und Belohnungen 🎁",
text: `Mit PunktlyCoinly werden Belohnungen zu einem spannenden Erlebnis.
Kinder können durch erledigte Aufgaben Coins sammeln und diese später für Schatzkisten und individuelle Belohnungen einlösen.
Die Schatzkiste kann individuell von den Eltern als kleine Überraschung gestaltet werden.
Dadurch entsteht zusätzliche Spannung und Motivation im Alltag.
Belohnungen können gemeinsam mit den Kindern erstellt werden, sodass sie eigene Ziele und Wünsche festlegen können.
Kinder arbeiten sich Schritt für Schritt auf ihre Wunschbelohnungen hinaus und bleiben langfristig motiviert.
Im Dashboard sehen Kinder eine optische Darstellung ihres Fortschritts.
So können sie jederzeit verfolgen, wie viele Coins noch bis zur gewünschten Belohnung fehlen.
Die Kombination aus Motivation, Fortschritt und Belohnungen sorgt für mehr Spaß und Verantwortung im Familienalltag.`,
color: "text-green-400",
bg: "bg-green-50",
      })
    }
    className="rounded-[1.7rem] bg-red-50/78 px-5 py-4 text-left shadow-md transition hover:scale-[1.02]"
  >
    <p className="text-base font-black text-green-400 md:text-lg">
      🎁 Shop, Schatzkisten und Belohnungen
    </p>
  </button>

  <button
    onClick={() =>
      setFeaturePopup({
title: "🏆 Level & Erfolge 🏆",
text: `Mit PunktlyCoinly werden Fortschritte und Erfolge sichtbar und motivierend dargestellt.
Kinder sammeln durch erledigte Aufgaben Punkte und steigen dadurch in verschiedene Level auf.
Mit jedem neuen Level erhalten Kinder ein Gefühl von Erfolg und Motivation, weiter aktiv zu bleiben.
Erfolge und Meilensteine werden optisch dargestellt, sodass Kinder ihren Fortschritt jederzeit verfolgen können.
Durch regelmäßige Aufgaben, gesammelte Coins und erreichte Ziele entwickeln Kinder langfristige Motivation und Verantwortungsbewusstsein.
Das Levelsystem sorgt zusätzlich für Spaß, Spannung und ein spielerisches Lernerlebnis im Alltag.
Kinder sehen direkt, wie weit sie bereits gekommen sind und welche Ziele sie als Nächstes erreichen können.`,
color: "text-blue-400",
bg: "bg-blue-50",
      })
    }
    className="rounded-[1.7rem] bg-red-50/78 px-5 py-4 text-left shadow-md transition hover:scale-[1.02]"
  >
    <p className="text-base font-black text-blue-400 md:text-lg">
      🏆 Level & Erfolge
    </p>
  </button>

  <button
    onClick={() =>
      setFeaturePopup({
title: "🪙 Punkte und Coins sammeln 🪙",
text: `Mit PunktlyCoinly werden Punkte und Coins durch erledigte Aufgaben gesammelt.
Kinder erhalten für tägliche und wöchentliche Aufgaben Belohnungen in Form von Punkten und Coins.
Punkte helfen dabei, im Level aufzusteigen und neue Erfolge einzusehen.
Coins können im Shop für individuelle Wunschprodukte eingelöst werden, die gemeinsam mit den Eltern angelegt werden.
Dadurch arbeiten Kinder langfristig auf ihre persönlichen Ziele und Wünsche hinaus.
Schatzkisten dienen als kleine Überraschungskisten und können ebenfalls mit Coins eingelöst werden.
Diese sorgen zusätzlich für Spannung, Motivation und kleine Überraschungen im Alltag.
Auch Belohnungen werden individuell von den Eltern erstellt und motivieren Kinder dabei, Aufgaben regelmäßig zu erledigen.
Im Dashboard sehen Kinder jederzeit ihren aktuellen Fortschritt sowie die Anzahl ihrer gesammelten Punkte und Coins.
Zusätzlich können Kinder verfolgen, wie viele Coins ihnen noch bis zu ihrem gewünschten Produkt oder ihrer Belohnung fehlen.
Dadurch entsteht ein modernes und motivierendes System, das Lernen, Verantwortung, Ziele und Spaß miteinander verbindet.`,
color: "text-red-400",
bg: "bg-red-50",
      })
    }
    className="rounded-[1.7rem] bg-red-50/78 px-5 py-4 text-left shadow-md transition hover:scale-[1.02]"
  >
    <p className="text-base font-black text-red-400 md:text-lg">
      🪙 Punkte und Coins sammeln
    </p>
  </button>

  <button
    onClick={() =>
      setFeaturePopup({
title: "👦 Kinderbereich 👦",
text: `Der Kinderbereich wurde speziell für Kinder entwickelt und sorgt für eine einfache, sichere und motivierende Nutzung der App.
Kinder können ihre täglichen und wöchentlichen Aufgaben übersichtlich ansehen und selbstständig erledigen.
Durch das Sammeln von Punkten und Coins bleiben Kinder langfristig motiviert und sehen ihre Fortschritte direkt im Dashboard.
Level, Erfolge, Belohnungen und Schatzkisten werden kindgerecht und spielerisch dargestellt.
Dadurch entsteht ein modernes und motivierendes Erlebnis für den Alltag.
Der Kinderbereich bietet eine übersichtliche Oberfläche, damit Kinder ihre Ziele einfacher verfolgen können.
Zusätzlich können Kinder jederzeit sehen, wie viele Coins sie bereits gesammelt haben.
Auch der Fortschritt zu zukünftigen Belohnungen und Schatzkisten wird optisch dargestellt.
So lernen Kinder spielerisch Verantwortung, Motivation und den Umgang mit kleinen Belohnungssystemen.`,
color: "text-orange-400",
bg: "bg-orange-50",
      })
    }
    className="rounded-[1.7rem] bg-red-50/78 px-5 py-4 text-left shadow-md transition hover:scale-[1.02]"
  >
    <p className="text-base font-black text-orange-400 md:text-lg">
      👦 Kinderbereich
    </p>
  </button>

  <button
    onClick={() =>
      setFeaturePopup({
title: "👨‍👩‍👧 Elternbereich 👨‍👩‍👧",
text: `Der Elternbereich bietet Eltern die volle Kontrolle und Übersicht über alle wichtigen Funktionen der App.
Der Zugriff auf den Elternbereich ist zusätzlich mit einer eigenen PIN geschützt, sodass nur Eltern wichtige Bereiche und Einstellungen verwalten können.
Eltern können tägliche und wöchentliche Aufgaben individuell erstellen, bearbeiten und an die Bedürfnisse ihrer Kinder anpassen.
Zusätzlich können Belohnungen, Schatzkisten, Shop-Produkte und Coin-Werte flexibel festgelegt werden. Kinder können erledigte Aufgaben markieren, diese müssen jedoch zuerst von den Eltern bestätigt und genehmigt werden.
Dadurch behalten Eltern jederzeit die Kontrolle über Aufgaben, Coins und Fortschritte. Im Kalender können Eltern alle geplanten Aufgaben, Ziele und Aktivitäten übersichtlich einsehen.
Zusätzlich bietet der Elternbereich verschiedene Statistiken und Übersichten über erledigte Aufgaben, Fortschritte, Level und gesammelte Coins.
Auch individuelle Shop-Produkte können erstellt werden, damit Kinder ihre gesammelten Coins gegen persönliche Wünsche und Belohnungen eintauschen können. Belohnungen und Ziele können gemeinsam mit den Kindern geplant werden, um langfristige Motivation und klare Ziele zu schaffen.
Durch die optische Darstellung der Fortschritte behalten Eltern jederzeit den Überblick über die Entwicklung ihrer Kinder.
Die Kombination aus Motivation, Struktur, Kontrolle und Belohnungen sorgt für mehr Zusammenarbeit im Familienalltag und unterstützt Kinder dabei, Verantwortung zu übernehmen und langfristig eigene Ziele zu verfolgen.`,
color: "text-purple-400",
bg: "bg-purple-50",
      })
    }
    className="rounded-[1.7rem] bg-red-50/78 px-5 py-4 text-left shadow-md transition hover:scale-[1.02]"
  >
    <p className="text-base font-black text-purple-400 md:text-lg">
      👨‍👩‍👧 Elternbereich
    </p>
  </button>

</div>

{featurePopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    
    <div className={`relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-[1.3rem] p-4 shadow-xl sm:p-5 ${featurePopup.bg}`}>
      
      <button
        onClick={() => setFeaturePopup(null)}
        className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-sm font-black text-red-600"
      >
        ✕
      </button>

      <h2 className={`mb-4 text-center text-2xl font-black ${featurePopup.color}`}>
        {featurePopup.title}
      </h2>

<div className="overflow-y-auto pr-2">
  <p className={`whitespace-pre-line text-center text-sm font-bold leading-7 md:text-base ${featurePopup.color}`}>
    {featurePopup.text}
  </p>
</div>

    </div>

  </div>
)}
    </section>

    <div className="grid w-full gap-4 sm:gap-5 md:grid-cols-2">
      <section className="w-full rounded-[1.8rem] sm:rounded-[2.4rem] bg-white/48 p-5 shadow-[0_24px_70px_rgba(15,23,42,.11)] backdrop-blur-xl ring-1 ring-white/80 backdrop-blur-2xl md:p-6">
        <p className="mb-5 text-center text-3xl font-black text-sky-700">
          🔐 Login
          
        </p>

        {firebaseUser ? (
          <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-emerald-50 p-5 text-center">
            <p className="text-xl font-black text-emerald-800">✅ Eingeloggt</p>
            <p className="mt-2 break-all font-bold text-emerald-700">{firebaseUser.email}</p>
            {isCheckingPaid && <p className="mt-3 font-black text-amber-700">Zahlungsstatus wird geprüft...</p>}
            {hasPaid && <p className="mt-3 font-black text-emerald-700">✅ Bereits freigeschaltet</p>}
            <button
              onClick={logoutGoogle}
              className="mt-4 rounded-[1.4rem] bg-white px-5 py-3 font-black text-sky-700 shadow-md"
            >
              Abmelden
            </button>
          </div>
        ) : (
          <div className="space-y-4">
<button
  onClick={loginWithGoogle}
  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white px-5 py-4 text-base font-black text-sky-700 shadow-xl transition hover:scale-[1.01] md:text-lg"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-7 w-7"
  >
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.5 5.5-6.7 7.2l6.2 5.2C39.9 36.7 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>

  Mit Google einloggen
</button>

          </div>
        )}
      </section>

      <section className="w-full rounded-[1.8rem] sm:rounded-[2.4rem] bg-white/48 p-5 shadow-[0_24px_70px_rgba(15,23,42,.11)] backdrop-blur-xl ring-1 ring-white/80 backdrop-blur-2xl md:p-6">
        <p className="mb-5 text-center text-3xl font-black text-sky-700">
          💳 Zahlungsmethoden
        </p>

        {!firebaseUser && (
          <p className="mb-4 rounded-[1.4rem] bg-amber-50 p-4 text-center font-black text-amber-800">
            🔒 Bitte zuerst einloggen, dann bezahlen.
          </p>
        )}

        {paymentStatus && (
          <p className="mb-4 rounded-[1.4rem] bg-yellow-50 p-3 text-center font-black text-amber-800">
            {paymentStatus}
          </p>
        )}

        <div className="grid gap-4">
          <button
            onClick={() => startGooglePlayBillingCheckout(selectedPremiumPlan)}
            disabled={isPaying || !firebaseUser}
            className="w-full rounded-[1.7rem] bg-white py-5 text-xl font-black text-slate-900 shadow-xl transition hover:scale-[1.01] disabled:text-slate-400 disabled:opacity-70"
          >
            💳 Über Google Play kaufen
          </button>
        </div>
        <br/>
<div id="payment-section" className="mb-6 grid gap-4">

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

  <button
    onClick={startTrial}
    
    disabled={!firebaseUser}
    className="rounded-[1.5rem] border-2 border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm transition hover:scale-[1.02] disabled:opacity-50"
  >
    <p className="text-xs font-black text-emerald-700">
      🧪 TESTPHASE
    </p>

    <p className="mt-2 text-2xl font-black text-emerald-600">
      48h
    </p>

    <p className="text-xs font-black text-emerald-700">
      kostenlos testen
    </p>

    <p className="mt-1 text-[11px] font-black text-green-600">
      🎉 Voller Premium Zugriff
    </p>
  </button>


  <div
    onClick={() => setSelectedPremiumPlan("monthly")}
    className={`cursor-pointer rounded-[1.5rem] border-2 p-4 ${
      selectedPremiumPlan === "monthly"
        ? "border-pink-500 bg-pink-100 ring-4 ring-pink-200"
        : "border-pink-100 bg-pink-50"
    }`}
  >
    <p className="text-xs font-black text-pink-700">
      🔥 Premium Monat
    </p>

    <p className="mt-1 text-sm font-black text-gray-400 line-through">
     -
    </p>

    <p className="text-2xl font-black text-pink-600">
      6,99 €
    </p>

    <p className="text-xs font-black text-pink-700">
      pro Monat
    </p>
  </div>


  <div
    onClick={() => setSelectedPremiumPlan("yearly")}
    className={`cursor-pointer rounded-[1.5rem] border-2 p-4 ${
      selectedPremiumPlan === "yearly"
        ? "border-yellow-500 bg-yellow-100 ring-4 ring-yellow-200"
        : "border-yellow-300 bg-yellow-50"
    }`}
  >
    <p className="text-xs font-black text-yellow-700">
      ⭐ BELIEBT
    </p>

<p className="mt-1 text-sm font-black text-amber-700">
  Nutze 1 Jahr das komplette Premium Paket
</p>

    <p className="text-2xl font-black text-yellow-600">
      55,99 €
    </p>

    <p className="text-xs font-black text-yellow-700">
      pro Jahr
    </p>

    <p className="mt-1 text-[11px] font-black text-green-600">
      🎉 Spare gegenüber Monatsabo
    </p>
  </div>

<div
  className="rounded-[1.5rem] border-2 border-purple-300 bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 p-4 opacity-90"
>
  <p className="text-xs font-black text-purple-700">
    👑 BALD VERFÜGBAR
  </p>

  <p className="mt-1 text-lg font-black text-purple-800">
    Lifetime Familie
  </p>

  <p className="mt-1 text-sm font-black text-gray-500">
    Einmalzahlung für die ganze Familie
  </p>

  <p className="mt-2 text-2xl font-black text-purple-600">
    ?
  </p>

  <p className="text-xs font-black text-purple-700">
    Weitere Infos folgen
  </p>
</div>
</div>

</div>
        <p className="mt-5 text-center text-sm font-bold leading-relaxed text-blue-600">
          Nach dem Klick öffnet sich Google Play zur sicheren Zahlung.
          <br />
          Dein Login-Konto wird danach automatisch freigeschaltet.
        </p>
      </section>
    </div>
  </div>
</main>

    );
  }

  return (
    <main className="relative z-10 min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-sky-100 via-white to-amber-100 p-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-6 md:pb-32 lg:p-8">
      
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-35 sm:opacity-45 lg:opacity-55">
          {punktlyCoinPositions.map((coin, i) => (
            <img
              key={`global-coin-${i}`}
              src={`/badges/badge-${String(coin.badge).padStart(2, "0")}.png`}
              alt=""
              aria-hidden="true"
              className={`punktly-global-coin absolute object-contain ${i % 2 === 0 ? "punktly-global-coin-float" : "punktly-global-coin-drift"}`}
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                left: coin.left,
                top: coin.top,
                animationDelay: coin.delay,
              }}
            />
          ))}
        </div>

{numberKeypadOpen && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 px-4">

    <div className="w-full max-w-xs rounded-[2rem] bg-white p-5 shadow-2xl">

      <div className="mb-4 rounded-[1rem] bg-slate-100 p-4 text-center text-3xl font-black text-sky-900">
{numberKeypadIsPin
  ? numberKeypadValue
    ? "●".repeat(numberKeypadValue.length)
    : "🔐 PIN"
  : numberKeypadValue}
      </div>

      <div className="grid grid-cols-3 gap-3">

        {["1","2","3","4","5","6","7","8","9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() =>
              setNumberKeypadValue(prev => (prev + num).slice(0,6))
            }
            className="rounded-xl bg-sky-50 py-4 text-2xl font-black text-sky-900 shadow"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setNumberKeypadValue("")}
          className="rounded-xl bg-red-100 py-4 text-xl font-black text-red-700 shadow"
        >
          C
        </button>

        <button
          type="button"
          onClick={() =>
            setNumberKeypadValue(prev => (prev + "0").slice(0,6))
          }
          className="rounded-xl bg-sky-50 py-4 text-2xl font-black text-sky-900 shadow"
        >
          0
        </button>

        <button
          type="button"
          onClick={() =>
            setNumberKeypadValue(prev => prev.slice(0,-1))
          }
          className="rounded-xl bg-yellow-100 py-4 text-xl font-black text-yellow-800 shadow"
        >
          ⌫
        </button>

      </div>

      <button
        type="button"
        onClick={() => {
          if (numberKeypadSetter) {
                 numberKeypadSetter(numberKeypadValue);
  }

  setNumberKeypadOpen(false);
}}
        className="mt-4 w-full rounded-xl bg-green-100 py-3 font-black text-green-800 shadow"
      >
        ✅ Übernehmen
      </button>

    </div>

  </div>
)}

{textKeyboardOpen && (
  <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/30 p-4">

    <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">

      <div className="mb-5 rounded-[1.5rem] bg-slate-100 p-5 text-center text-2xl font-black text-sky-900">

        {textKeyboardValue || "Text eingeben"}

      </div>

      <div className="grid grid-cols-10 gap-3">

        {(
keyboardUppercase
? "QWERTZUIOPASDFGHJKLÖÄYXCVBNM"
: "qwertzuiopasdfghjklöäyxcvbnm"
).split("").map(
          (letter) => (

          <button
            key={letter}
            type="button"
            onClick={() =>
              setTextKeyboardValue(
                prev => prev + letter
              )
            }
            className="rounded-[1rem] bg-sky-50 p-4 text-2xl font-black shadow"
          >
            {letter}
          </button>

        ))}

      </div>

<div className="mt-4 grid grid-cols-4 gap-3">

<button
type="button"
onClick={() =>
setKeyboardUppercase(prev=>!prev)
}
className="rounded-[1rem] bg-purple-100 p-4 text-xl font-black"
>
⇧ Shift
</button>

<button
type="button"
onClick={() =>
setTextKeyboardValue(
prev=>prev+" "
)
}
className="rounded-[1rem] bg-sky-100 p-4 text-xl font-black"
>
␣ Space
</button>

<button
type="button"
onClick={() =>
setTextKeyboardValue(
prev=>prev.slice(0,-1)
)
}
className="rounded-[1rem] bg-yellow-100 p-4 text-xl font-black"
>
⌫ Zurück
</button>

<button
type="button"
onClick={() =>
setTextKeyboardValue("")
}
className="rounded-[1rem] bg-red-100 p-4 text-xl font-black"
>
✖ Löschen
</button>

</div>

      <button
        type="button"
        onClick={() => {

          textKeyboardSetter?.(
            textKeyboardValue
          );

          setTextKeyboardOpen(false);

        }}
        className="mt-4 w-full rounded-[1rem] bg-green-200 p-5 text-2xl font-black"
      >
        ✅ Übernehmen
      </button>

    </div>

  </div>
)}
{readingQuestionTask && readingQuestionText && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
      <h2 className="text-center text-3xl font-black text-sky-900">
        📖 Frage zum Text
      </h2>

      <p className="mt-4 text-center text-xl font-bold text-sky-700">
        {readingQuestionText.question}
      </p>

      <div className="mt-6 grid gap-3">
        {readingQuestionText.answers.map((answer: string) => (
          <button
            key={answer}
            type="button"
            onClick={() => {
              if (answer === readingQuestionText.correctAnswer) {
                const updatedTask = {
  ...readingQuestionTask,
  status: "wartet",
  submittedAt: Date.now(),
};

                setLearningTasks(prev =>
                  prev.map(task =>
                    task.id === readingQuestionTask.id ? updatedTask : task
                  )
                );

                saveFamilyItem("learningTasks", updatedTask);

                setReadingQuestionTask(null);
                setReadingQuestionText(null);

                celebrate("✅ Richtig beantwortet!\n\nWartet auf Elternbestätigung.");
              } else {
                setReadingQuestionTask(null);
                setReadingQuestionText(null);

                celebrate("❌ Leider falsch.\n\nBitte nochmal lesen.");
              }
            }}
            className="rounded-[1.5rem] bg-sky-100 px-5 py-4 text-lg font-black text-sky-900"
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
{mathQuestionTask && mathQuestionData && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
      <h2 className="text-center text-3xl font-black text-sky-900">
        ➕ Mathe
      </h2>

      <p className="mt-4 text-center text-3xl font-black text-sky-700">
        {mathQuestionData.question}
      </p>

      <div className="mt-6 grid gap-3">
        {mathQuestionData.answers.map((answer: string) => (
          <button
            key={answer}
            type="button"
            onClick={() => {
              if (answer === mathQuestionData.correctAnswer) {
                const updatedTask = {
  ...mathQuestionTask,
  status: "wartet",
  submittedAt: Date.now(),
};

                setLearningTasks(prev =>
                  prev.map(task =>
                    task.id === mathQuestionTask.id ? updatedTask : task
                  )
                );

                saveFamilyItem("learningTasks", updatedTask);

                setMathQuestionTask(null);
                setMathQuestionData(null);

                celebrate("✅ Richtig gerechnet!\n\nWartet auf Elternbestätigung.");
              } else {
                setMathQuestionTask(null);
                setMathQuestionData(null);

                celebrate("❌ Leider falsch.\n\nBitte nochmal üben.");
              }
            }}
            className="rounded-[1.5rem] bg-sky-100 px-5 py-4 text-lg font-black text-sky-900"
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
{showContactPopup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4">
    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-sky-800">
          ✉️ Kontakt aufnehmen
        </h2>

        <button
          type="button"
          onClick={() => setShowContactPopup(false)}
          className="rounded-full bg-slate-100 px-3 py-2 font-black text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 rounded-2xl bg-sky-50 p-3 text-sm font-bold text-sky-800">
        Von: {firebaseUser?.email || auth.currentUser?.email || "Nicht eingeloggt"}
      </div>

<div className="mb-3">
  <AppInput
    value={contactSubject}
    onChange={setContactSubject}
    placeholder="Betreff"
    className="w-full"
  />
</div>

<div className="mb-4">
  <AppTextarea
    value={contactMessage}
    onChange={setContactMessage}
    placeholder="Deine Nachricht an den Support"
    className="w-full"
  />
</div>

      <button
        type="button"
        onClick={sendContactMessage}
        disabled={isSendingContact}
        className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 font-black text-white shadow-lg disabled:opacity-60"
      >
        {isSendingContact ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </div>
  </div>
)}
      {celebration && (
        <div className="fixed inset-x-4 top-5 z-50 mx-auto max-w-md animate-pop rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-4 border-yellow-300 bg-white p-4 text-center text-xl font-black text-sky-950 shadow-[0_20px_55px_rgba(14,165,233,.15)]">
          {celebration}
          <div className="absolute left-8 top-12 animate-coin"><Coin className="h-10 w-10" /></div>
          <div className="absolute right-10 top-14 animate-coin"><Coin className="h-10 w-10 object-cover" /></div>
        </div>
      )}

      {showLoginWelcomePopup && isPurchased && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md">
          <div className="my-4 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.5rem] border-2 border-yellow-300 bg-white p-4 text-center shadow-[0_30px_90px_rgba(15,23,42,.25)] sm:p-5">
            <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-yellow-50 shadow-[0_12px_40px_rgba(251,191,36,.25)]">
              <FoxCoinImage className="h-12 w-12 sm:h-16 sm:w-16" />
            </div>

<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-center leading-tight sm:text-3xl animate-pulse">
  <span className="text-yellow-400">⭐ Herzlich</span>{" "}
  <span className="text-green-500">Willkommen</span>{" "}
  <span className="text-blue-500">bei ⭐</span>{" "}
  <br />

  <span className="text-yellow-400">✨P</span>
  <span className="text-green-500">u</span>
  <span className="text-blue-500">n</span>
  <span className="text-red-500">k</span>
  <span className="text-orange-400">t</span>
  <span className="text-purple-500">l</span>
  <span className="text-pink-500">y</span>

  <span className="mx-1 text-yellow-300"></span>

  <span className="text-cyan-500">C</span>
  <span className="text-lime-500">o</span>
  <span className="text-amber-500">i</span>
  <span className="text-emerald-500">n</span>
  <span className="text-rose-500">l</span>
  <span className="text-fuchsia-500">y✨</span>

  <span className="ml-2 text-yellow-300"></span>
</h1>

<p className="mt-3 text-base font-bold leading-relaxed text-sky-700">
PunktlyCoinly verbindet Motivation, Lernen und Familienalltag in einer App. Kinder sammeln durch Aufgaben, 
Lernzeiten und gute Gewohnheiten Punkte und Coins, schalten Belohnungen frei und erleben Fortschritte spielerisch – 
während Eltern alles einfach und sicher verwalten können.
</p>

            <div className="mt-6 grid gap-3 text-left">
<div className="rounded-[1.8rem] bg-sky-50 p-4 font-bold text-sky-900">
  🎯 Kinder meistern Aufgaben, entwickeln gute Gewohnheiten und sammeln dabei wertvolle Erfolgserlebnisse.
</div>

<div className="rounded-[1.8rem] bg-yellow-50 p-4 font-bold text-amber-900">
  ⭐ Level, Auszeichnungen und spannende Herausforderungen sorgen jeden Tag für neue Motivation.
</div>

<div className="rounded-[1.8rem] bg-emerald-50 p-4 font-bold text-emerald-900">
  🪙 Für ihre Erfolge sammeln Kinder Coins, die sie gegen Belohnungen, Wunschprämien oder Schatzkisten eintauschen können.
</div>

<div className="rounded-[1.8rem] bg-purple-50 p-4 font-bold text-purple-900">
  👨‍👩‍👧 Eltern begleiten den Fortschritt ihrer Kinder, verwalten Aufgaben und schaffen gemeinsam positive Familienroutinen.
</div>
            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Wenn Sie ablehnen, werden Sie automatisch wieder ausgeloggt.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={async () => {
                  setShowLoginWelcomePopup(false);
                  await logoutGoogle();
                }}
                className="rounded-[1.8rem] bg-slate-100 px-5 py-4 text-lg font-black text-slate-700"
              >
                Ablehnen
              </button>

              <button
                onClick={() => {
                  setShowLoginWelcomePopup(false);
                  celebrate("Willkommen bei PunktlyCoinly!");
                }}
                className="rounded-[1.8rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-5 py-4 text-lg font-black text-white shadow-md"
              >
                Verstanden & akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}
   
      {showPinReset && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-blue-950/45 p-4 backdrop-blur-md">
          <div className="w-full max-w-md animate-pop rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,.25)]">
            <div className="relative z-10 mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-100 text-4xl shadow-md">
              🔁
            </div>

            <h2 className="mt-4 text-3xl font-black text-sky-950">
              PIN vergessen?
            </h2>

            {parentSecurityQuestion.trim() ? (
              <>
                <p className="mt-3 font-bold text-slate-600">
                  Beantworte die Sicherheitsfrage und lege direkt eine neue Eltern-PIN fest.
                </p>

                <div className="mt-5 rounded-[1.5rem] bg-sky-50 p-4 text-left">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Sicherheitsfrage</p>
                  <p className="mt-2 text-lg font-black text-sky-950">{parentSecurityQuestion}</p>
                </div>

<AppInput
  value={resetSecurityAnswer}
  onChange={setResetSecurityAnswer}
  placeholder="Antwort eingeben"
  className="mt-4 text-center"
/>

<NumberKeypadField
  label="🔒 Neue Eltern-PIN"
  value={Number(resetNewParentPin) || 0}
  setter={(value) => setResetNewParentPin(String(value))}
/>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      setShowPinReset(false);
                      setResetSecurityAnswer("");
                      setResetNewParentPin("");
                    }}
                    className="rounded-[1.35rem] bg-slate-100 px-4 py-4 font-black text-slate-700"
                  >
                    Abbrechen
                  </button>

                  <button
                    onClick={resetParentPin}
                    className="rounded-[1.35rem] bg-gradient-to-br from-amber-300 via-orange-300 to-pink-300 px-4 py-4 font-black text-amber-950 shadow-[0_12px_30px_rgba(245,158,11,.30)]"
                  >
                    PIN zurücksetzen
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 rounded-[1.5rem] bg-amber-50 p-4 font-black text-amber-800">
                  Noch keine Sicherheitsfrage angelegt. Öffne den Elternbereich und lege dort zuerst eine Sicherheitsfrage fest.
                </p>

                <button
                  onClick={() => setShowPinReset(false)}
                  className="mt-6 w-full rounded-[1.35rem] bg-slate-100 px-4 py-4 font-black text-slate-700"
                >
                  Schließen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {resetConfirmKind && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-blue-950/45 p-4 backdrop-blur-md">
          <div className="w-full max-w-md animate-pop rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] border-4 border-yellow-300 bg-white p-6 text-center shadow-[0_24px_80px_rgba(37,99,235,.25)]">
            <div className="relative z-10 mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-100 text-4xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-3xl font-black text-sky-950">
              Aufgaben zurücksetzen?
            </h2>

            <p className="mt-3 font-bold text-sky-700">
              Bist du sicher, dass du alle{" "}
              <span className="font-black text-amber-700">
                {resetConfirmKind === "täglich" ? "Tagesaufgaben" : "Wochenaufgaben"}
              </span>{" "}
              zurücksetzen möchtest?
            </p>

            <p className="mt-2 text-sm font-bold text-blue-500">
              Die Aufgaben werden wieder auf „offen“ gesetzt.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => setResetConfirmKind(null)}
                className="rounded-[1.35rem] bg-slate-100 px-4 py-4 font-black text-slate-700"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmResetRepeating}
                className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-4 py-4 font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.22)]"
              >
                Ja, zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}


      
<style jsx global>{`
  @keyframes punktlyWelcomeWipe {
    0%, 100% {
      transform: translateY(0);
      clip-path: inset(0 0 0 0);
      opacity: 1;
    }
    45% {
      transform: translateY(-7px);
      clip-path: inset(0 0 18% 0);
      opacity: .92;
    }
    75% {
      transform: translateY(6px);
      clip-path: inset(14% 0 0 0);
      opacity: 1;
    }
  }

  @keyframes punktlyRainbowText {
    0% { background-position: 0% 50%; transform: translateY(0) scale(1); }
    35% { transform: translateY(-4px) scale(1.015); }
    70% { transform: translateY(3px) scale(1); }
    100% { background-position: 100% 50%; transform: translateY(0) scale(1); }
  }

  @keyframes punktlySparklePulse {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: .85; }
    50% { transform: scale(1.25) rotate(8deg); opacity: 1; }
  }

  .punktly-welcome-wipe {
    animation: punktlyWelcomeWipe 3.2s ease-in-out infinite;
  }

  .punktly-rainbow-text {
    background: linear-gradient(90deg, #f472b6, #a78bfa, #38bdf8, #34d399, #facc15, #fb7185, #60a5fa);
    background-size: 350% 350%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: punktlyRainbowText 4s ease-in-out infinite alternate;
  }

  .punktly-sparkle {
    display: inline-block;
    animation: punktlySparklePulse 1.8s ease-in-out infinite;
  }

  @keyframes punktlyGlobalFloat {
    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    50% { transform: translateY(-10px) translateX(8px) rotate(7deg); }
    100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  }

  @keyframes punktlyGlobalDrift {
    0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
    50% { transform: translateX(14px) translateY(7px) rotate(-8deg); }
    100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  }

  .punktly-global-coin {
    mix-blend-mode: multiply;
    background: transparent !important;
    border-radius: 9999px;
    opacity: .55;
    filter: drop-shadow(0 12px 22px rgba(251, 191, 36, .16)) saturate(1.04);
    will-change: transform;
    transform-origin: center;
    mask-image: radial-gradient(circle at center, black 0 68%, rgba(0,0,0,.62) 80%, transparent 100%);
    -webkit-mask-image: radial-gradient(circle at center, black 0 68%, rgba(0,0,0,.62) 80%, transparent 100%);
  }

  .punktly-global-coin-float {
    animation: punktlyGlobalFloat 7s ease-in-out infinite;
  }

  .punktly-global-coin-drift {
    animation: punktlyGlobalDrift 10s ease-in-out infinite;
  }

  @keyframes punktlyStarTwinkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: .55; }
    50% { transform: scale(1.28) rotate(10deg); opacity: 1; }
  }

  .punktly-bg-star {
    animation: punktlyStarTwinkle 4.5s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(251, 191, 36, .30));
  }
`}</style>


<style jsx global>{`
  @keyframes punktlyWelcomeWipe {
    0%, 100% { transform: translateY(0); clip-path: inset(0 0 0 0); opacity: 1; }
    45% { transform: translateY(-6px); clip-path: inset(0 0 14% 0); opacity: .95; }
    75% { transform: translateY(5px); clip-path: inset(12% 0 0 0); opacity: 1; }
  }

@keyframes punktlyRainbowText {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

@keyframes punktlySparklePulse {
  0%, 100% { transform: scale(1); opacity: .85; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes punktlyCoinFloat {
  0% { transform: translateY(0) rotate(-4deg); opacity: .75; }
  50% { transform: translateY(-6px) rotate(4deg); opacity: .95; }
  100% { transform: translateY(0) rotate(-4deg); opacity: .75; }
}

@keyframes punktlyCoinDrift {
  0% { transform: translateX(-3px) translateY(0); }
  50% { transform: translateX(4px) translateY(-3px); }
  100% { transform: translateX(-3px) translateY(0); }
}

.punktly-welcome-wipe { animation: punktlyWelcomeWipe 5s ease-in-out infinite; }
.punktly-rainbow-text {
  background: linear-gradient(90deg, #38bdf8, #34d399, #facc15, #fb7185, #a78bfa, #38bdf8);
  background-size: 250% 250%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: punktlyRainbowText 8s ease-in-out infinite alternate;
}
.punktly-sparkle { display: inline-block; animation: punktlySparklePulse 3s ease-in-out infinite; }
.punktly-coin-float { animation: punktlyCoinFloat 7s ease-in-out infinite; }
.punktly-coin-drift { animation: punktlyCoinDrift 8s ease-in-out infinite; }
`}</style>

<div className="relative z-10 mx-auto max-w-[92rem] origin-top scale-[0.90] sm:scale-[0.88] md:scale-[0.88] lg:scale-100">
        {(area === "child" || area === "parent") && (
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black text-white shadow-lg ${
            area === "child" ? "bg-gradient-to-r from-sky-500 to-blue-600" : "bg-gradient-to-r from-violet-600 to-purple-500"
          }`}>
            {area === "child" ? "KINDERBEREICH" : "ELTERNBEREICH "}
            <span>{area === "child" ? "👦" : "👥"}</span>
            <div className="justify-self-center rounded-full bg-white/80 px-4 py-2 text-sm font-black text-sky-800 shadow-sm">
  {currentDateTime.getHours() >= 6 && currentDateTime.getHours() < 18
    ? "☀️"
    : "🌙"}{" "}

  {currentDateTime.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}

  <span className="ml-3 text-pink-600">
    🕒 {currentDateTime.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>
</div>
{area === "parent" && (
  <button
    type="button"
    onClick={() => setShowContactPopup(true)}
    className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-pink-600 shadow-sm transition hover:scale-105"
  >
    ✉️ Kontakt aufnehmen
  </button>
)}


{trialIsActive && trialEndsAt && (
  <div className="flex h-[40px] items-center rounded-full bg-emerald-50 px-4 text-sm font-black text-emerald-700 shadow-sm ring-1 ring-emerald-200">

    <span>🧪 Testphase aktiv:</span>

    <span className="ml-2">
      {getTrialTimeLeft()}
    </span>

    {trialEndsAt - Date.now() <= 6 * 60 * 60 * 1000 && (
      <span className="ml-2 text-red-600">
        ⚠️ Endet bald!
      </span>
    )}

  </div>
)}
{area === "parent" && (
  <button
    type="button"
    onClick={() =>
window.open(
  "https://www.paypal.com/paypalme/serdarsolak0203",
  "_blank"
)
    }
    className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-yellow-600 shadow-sm transition hover:scale-105"
  >
    💛 Spenden und Unterstüzung
  </button>
)}

          </div>
        )}

        <header
          className={`relative mb-5 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-[3px] border-white p-5 shadow-[0_24px_70px_rgba(37,99,235,.18)] backdrop-blur-xl ${
            area === "parent"
              ? "bg-gradient-to-br from-violet-100 via-fuchsia-100 to-purple-200"
              : area === "child"
              ? "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100"
              : "bg-gradient-to-br from-yellow-100 via-orange-50 to-sky-100"
          }`}
        >
          {area !== "child" && area !== "parent" && (
            <>
              <div className="pointer-events-none absolute inset-0 opacity-90">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,.85),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(125,211,252,.35),transparent_38%)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/55 via-orange-50/40 to-sky-100/55" />
              </div>

              <img src="/badges/badge-01.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -top-4 left-[22%] h-14 w-14 rotate-[12deg] rounded-full object-contain opacity-80"
                style={{ animationDelay: ".2s" }} />

              <img src="/badges/badge-02.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute top-4 left-[34%] h-11 w-11 rotate-[-10deg] rounded-full object-contain opacity-70"
                style={{ animationDelay: ".8s" }} />

              <img src="/badges/badge-03.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -top-3 left-[48%] h-12 w-12 rotate-[16deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "1.2s" }} />

              <img src="/badges/badge-04.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute top-7 left-[61%] h-10 w-10 rotate-[-14deg] rounded-full object-contain opacity-65"
                style={{ animationDelay: "1.7s" }} />

              <img src="/badges/badge-05.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -top-5 right-[19%] h-16 w-16 rotate-[9deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "2.1s" }} />

              <img src="/badges/badge-06.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute top-6 right-[10%] h-12 w-12 rotate-[-7deg] rounded-full object-contain opacity-70"
                style={{ animationDelay: "2.5s" }} />

              <img src="/badges/badge-07.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute bottom-2 left-[41%] h-10 w-10 rotate-[18deg] rounded-full object-contain opacity-65"
                style={{ animationDelay: "1s" }} />

              <img src="/badges/badge-08.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-3 left-[43%] h-12 w-12 rotate-[-18deg] rounded-full object-contain opacity-70"
                style={{ animationDelay: "1.9s" }} />

              <img src="/badges/badge-09.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute bottom-1 right-[30%] h-11 w-11 rotate-[10deg] rounded-full object-contain opacity-65"
                style={{ animationDelay: "2.8s" }} />

              <img src="/badges/badge-10.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute -bottom-4 right-[5%] h-16 w-16 rotate-[20deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "3.2s" }} />
            </>
          )}

          {(area === "child" || area === "parent") && (
            <>
              <div className="pointer-events-none absolute inset-0 opacity-80">
                <div className={`absolute inset-0 ${
                  area === "parent"
                    ? "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,.95),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(216,180,254,.70),transparent_36%)]"
                    : "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,.95),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(125,211,252,.55),transparent_36%)]"
                }`} />
                <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-transparent to-white/35" />
              </div>

              <img src="/badges/badge-01.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -bottom-8 left-3 h-12 w-12 sm:h-16 sm:w-16 rotate-[-18deg] rounded-full object-contain opacity-90" />

              <img src="/badges/badge-02.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute top-8 left-[38%] h-12 w-12 sm:h-16 sm:w-16 rotate-[14deg] rounded-full object-contain opacity-90"
                style={{ animationDelay: ".4s" }} />

              <img src="/badges/badge-03.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -bottom-2 left-[25%] h-16 w-16 rotate-[8deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "1s" }} />

              <img src="/badges/badge-04.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-3 right-[30%] h-20 w-20 rotate-[-10deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: ".7s" }} />

              <img src="/badges/badge-05.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute -right-5 bottom-4 h-12 w-12 sm:h-16 sm:w-16 rotate-[18deg] rounded-full object-contain opacity-80"
                style={{ animationDelay: "1.4s" }} />

              <img src="/badges/badge-06.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute right-[8%] -top-5 h-16 w-16 rotate-[12deg] rounded-full object-contain opacity-65"
                style={{ animationDelay: "2s" }} />

              <img src="/badges/badge-07.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute top-4 left-[12%] h-14 w-14 rotate-[9deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "2.3s" }} />

              <img src="/badges/badge-08.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-10 left-[55%] h-16 w-16 rotate-[-15deg] rounded-full object-contain opacity-80"
                style={{ animationDelay: "1.7s" }} />

              <img src="/badges/badge-09.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute top-2 right-[18%] h-16 w-16 rotate-[15deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: ".9s" }} />

              <img src="/badges/badge-10.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-4 right-[10%] h-20 w-20 rotate-[11deg] rounded-full object-contain opacity-80"
                style={{ animationDelay: "2.7s" }} />

              <img src="/badges/badge-11.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute top-[30%] right-[42%] h-14 w-14 rotate-[-8deg] rounded-full object-contain opacity-70"
                style={{ animationDelay: "3s" }} />

              <img src="/badges/badge-12.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-8 left-[70%] h-16 w-16 rotate-[18deg] rounded-full object-contain opacity-75"
                style={{ animationDelay: "1.2s" }} />

              <img src="/badges/badge-13.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute top-[18%] left-[32%] h-12 w-12 rotate-[-12deg] rounded-full object-contain opacity-65"
                style={{ animationDelay: "2.1s" }} />

              <img src="/badges/badge-14.png" alt="" aria-hidden="true"
                className="punktly-coin-drift pointer-events-none absolute bottom-[14%] right-[22%] h-14 w-14 rotate-[10deg] rounded-full object-contain opacity-70"
                style={{ animationDelay: "2.8s" }} />

              <img src="/badges/badge-15.png" alt="" aria-hidden="true"
                className="punktly-coin-float pointer-events-none absolute top-[8%] right-[34%] h-12 w-12 rotate-[16deg] rounded-full object-contain opacity-60"
                style={{ animationDelay: "3.3s" }} />
            </>
          )}

          {area === "child" || area === "parent" ? (
            <div className="relative z-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <img
                  src="/PunktlyLogo.png"
                  alt="Punktly Logo"
                  className="h-16 w-16 flex-none rounded-full object-contain drop-shadow-xl md:h-20 md:w-20 lg:h-28 lg:w-28"
                />

                <div>
<h1 className="text-xl font-black sm:text-2xl lg:text-4xl">
  <span className="text-yellow-400">P</span>
  <span className="text-green-500">u</span>
  <span className="text-blue-500">n</span>
  <span className="text-red-500">k</span>
  <span className="text-purple-500">t</span>
  <span className="text-orange-400">l</span>
  <span className="text-pink-500">y</span>
  <span className="text-cyan-500">C</span>
  <span className="text-lime-500">o</span>
  <span className="text-indigo-500">i</span>
  <span className="text-rose-500">n</span>
  <span className="text-amber-500">l</span>
  <span className="text-sky-500">y</span>
</h1>

<p className="animate-[rainbowMove_3s_linear_infinite] bg-gradient-to-r from-yellow-400 via-green-400 via-blue-500 via-purple-500 via-pink-500 to-orange-400 bg-[length:200%_100%] bg-clip-text font-bold text-transparent">
  wünscht viel Spaß beim Punkte und Coins sammeln.
</p>
                </div>
              </div>

              <div className="grid gap-2 md:justify-items-end">
                <nav className="flex flex-nowrap justify-start gap-1.5 lg:justify-end">
                  {(["impressum", "datenschutz", "widerruf", "agb"] as LegalPage[]).map((page) => (
                    <button
                      key={page}
                      onClick={() => setActiveLegalPage(page)}
                      className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-white whitespace-nowrap"
                    >
                      {legalPages[page].title}
                    </button>
                  ))}
                </nav>

                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                  {firebaseUser && (
                  <div className="rounded-[1.2rem] bg-gradient-to-r from-emerald-500 to-green-400 px-3 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(16,185,129,.30)] ring-2 ring-white/80 lg:px-5 lg:py-3 lg:text-sm">
                      👤 Login: {firebaseUser.email}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      playSound("click");
                    }}
                    className={`rounded-[1.2rem] px-3 py-2 text-xs font-black shadow-sm ring-2 ring-white/80 lg:px-5 lg:py-3 lg:text-sm ${
                      soundEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    🔊 Sounds: {soundEnabled ? "An" : "Aus"}
                  </button>

                  <button
                    onClick={goStart}
                    className={`rounded-[1.2rem] bg-white/95 px-3 py-2 text-xs font-black shadow-[0_10px_24px_rgba(37,99,235,.18)] ring-2 transition hover:scale-[1.02] lg:px-5 lg:py-3 lg:text-base ${
                      area === "parent"
                        ? "text-purple-700 ring-purple-200"
                        : "text-sky-700 ring-sky-200"
                    }`}
                  >
                    <LogOut className="mr-2 inline h-5 w-5" /> Bereich wechseln
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/PunktlyLogo.png"
                  alt="Punktly Logo"
                  className="h-16 w-16 object-contain drop-shadow-xl md:h-20 md:w-20"
                />
                <div>
<h1 className="text-3xl font-black md:text-4xl">
  <span className="text-yellow-400">P</span>
  <span className="text-green-500">u</span>
  <span className="text-blue-500">n</span>
  <span className="text-red-500">k</span>
  <span className="text-purple-500">t</span>
  <span className="text-orange-400">l</span>
  <span className="text-pink-500">y</span>
  <span className="text-cyan-500">C</span>
  <span className="text-lime-500">o</span>
  <span className="text-indigo-500">i</span>
  <span className="text-rose-500">n</span>
  <span className="text-amber-500">l</span>
  <span className="text-sky-500">y</span>
</h1>
<p className="animate-[rainbowMove_3s_linear_infinite] bg-gradient-to-r from-yellow-400 via-green-400 via-blue-500 via-purple-500 via-pink-500 to-orange-400 bg-[length:200%_100%] bg-clip-text font-bold text-transparent">
  Bitte wählen Sie einen Bereich aus um forzufahren.
</p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2">
                {(["impressum", "datenschutz", "widerruf", "agb"] as LegalPage[]).map((page) => (
                  <button
                    key={page}
                    onClick={() => setActiveLegalPage(page)}
                    className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700 shadow-sm transition hover:bg-sky-100 whitespace-nowrap"
                  >
                    {legalPages[page].title}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        {area === "parent" && (
<section className="mb-5 rounded-[2.5rem] border-[3px] border-white bg-white/95 p-5 shadow-[0_20px_60px_rgba(37,99,235,.12)]">

  <div
    onClick={() => setSummaryOpen(prev => !prev)}
    className="flex cursor-pointer items-center justify-between"
  >

    <div className="flex items-center gap-3">

      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500 text-white shadow-md">
        ⭐
      </div>

      <h2 className="text-2xl font-black text-sky-950">
        Zusammenfassung
      </h2>

    </div>

    <div className="text-3xl font-black text-sky-700">
      {summaryOpen ? "▲" : "▼"}
    </div>

  </div>

  {summaryOpen && (

    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">🎨</p>
        <p className="mt-2 font-black text-sky-950">
          Kinderfreundliches Design
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Kinder- und Elternbereich haben moderne Design und Layout.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">🛡️</p>
        <p className="mt-2 font-black text-sky-950">
          Vertrauen & Sicherheit
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Vertrauenswürdige und sichere Plattform für Kinder und Eltern.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">🪙</p>
        <p className="mt-2 font-black text-sky-950">
          Motivierende Coins
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Kinder können durch Coins motiviert werden.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">🔊</p>
        <p className="mt-2 font-black text-sky-950">
          Sounds An/Aus
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Sound-Funktion jederzeit aktivierbar.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">📚</p>
        <p className="mt-2 font-black text-sky-950">
          Lernen
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Interaktive Lerninhalte für Kinder.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">📝</p>
        <p className="mt-2 font-black text-sky-950">
          Aufgaben
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Aufgaben erledigen und Coins sicher einlösen.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-4 shadow-md ring-1 ring-sky-50">
        <p className="text-3xl">🔁</p>
        <p className="mt-2 font-black text-sky-950">
          Bereich wechseln
        </p>
        <p className="mt-1 text-sm font-bold text-slate-500">
          Schneller Wechsel zwischen Kinder- und Elternbereich.
        </p>
      </div>

    </div>

  )}

</section>
        )}

        {activeLegalPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border-4 border-white bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,.35)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">Rechtliches</p>
                  <h2 className="text-3xl font-black text-sky-950">{legalPages[activeLegalPage].title}</h2>
                  <p className="mt-1 font-bold text-sky-700">{legalPages[activeLegalPage].intro}</p>
                </div>
                <button
                  onClick={() => setActiveLegalPage(null)}
                  className="rounded-full bg-slate-100 p-3 text-slate-700 shadow-sm transition hover:bg-slate-200"
                  aria-label="Fenster schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 rounded-[1.5rem] bg-sky-50 p-5 text-left font-bold text-sky-900">
                {legalPages[activeLegalPage].content.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <div className="mt-5 text-right">
                <button
                  onClick={() => setActiveLegalPage(null)}
                  className="rounded-[1.25rem] bg-gradient-to-br from-sky-500 to-cyan-400 px-5 py-3 font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.25)]"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {area === "start" && (
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white bg-gradient-to-br from-yellow-100 via-orange-50 to-white p-6 text-center shadow-[0_24px_70px_rgba(245,158,11,.18)]">
              <div className="flex justify-center">
  <img
    src="/Kinderbild.png"
    alt="Kinderbild"
    width={220}
  height={220}
    className="h-36 w-auto object-contain"
  />
</div>
              <h2 className="mt-4 text-2xl font-black text-blue-950 sm:text-3xl md:text-4xl">Kinderbereich</h2>
              <p className="mt-2 font-bold text-sky-800">Aufgaben erledigen, Coins sammeln, Shop und Belohnungen ansehen.</p>

{children.length === 0 && (
  <div className="mt-5">
    <EmptyState
      icon="👶"
      title="Noch kein Kind angelegt"
      text="Lege zuerst im Elternbereich ein Kinderprofil an. Danach kann dein Kind Aufgaben erledigen, Lernen, Punkte und Coins sammeln."
    />
  </div>
)}

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {children.map(c => (
                  <button key={c.id} onClick={() => setSelectedChildId(c.id)} className={`rounded-full px-4 py-2 font-black ${selectedChildId === c.id ? "bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 text-white" : "bg-white text-sky-800"}`}>{c.name}</button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (children.length === 0) {
                    celebrate("Bitte zuerst im Elternbereich ein Kind anlegen.");
                    return;
                  }
                  setArea("child");
                  setChildView("home");
                }}
                className="mt-6 w-full rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-6 py-4 text-xl font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.35)] hover:scale-[1.02] active:scale-[.98] transition"
              >
                👶 Kinderbereich öffnen
              </button>
            </div>

            <div className="rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white bg-gradient-to-br from-yellow-100 via-orange-50 to-white p-6 text-center shadow-[0_24px_70px_rgba(245,158,11,.18)]">
              <div className="flex justify-center">
                 <img
    src="/Elternbild.png"
    alt="Elternbild"
    width={220}
  height={220}
    className="h-36 w-auto object-contain"
    />
              </div>
              <h2 className="mt-4 text-center text-4xl font-black text-green-950">Elternbereich</h2>
              <p className="mt-2 text-center font-bold text-sky-800">Aufgaben, Shop, Belohnungen, Kinder, Statistik und Bestätigungen verwalten.</p>
              <div className="mt-6 grid gap-3">
<div
  onClick={() => setShowPinKeypad(true)}
  className="cursor-pointer rounded-[1.5rem] border-2 border-white bg-white/90 p-4 text-center text-2xl font-black shadow-inner"
>
  {pinInput.length > 0
    ? "●".repeat(pinInput.length)
    : "🔐 Eltern PIN"}
</div>

{showPinKeypad && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-xs rounded-[2rem] bg-white p-5 shadow-2xl">
      
      <div className="mb-4 text-center text-3xl font-black tracking-[0.4rem] text-sky-900">
        {pinInput.length > 0 ? "●".repeat(pinInput.length) : "PIN"}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["1","2","3","4","5","6","7","8","9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setPinInput(prev => (prev + num).slice(0, 6))}
            className="rounded-xl bg-sky-50 py-4 text-2xl font-black text-sky-900 shadow"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPinInput("")}
          className="rounded-xl bg-red-100 py-4 text-xl font-black text-red-700 shadow"
        >
          C
        </button>

        <button
          type="button"
          onClick={() => setPinInput(prev => (prev + "0").slice(0, 6))}
          className="rounded-xl bg-sky-50 py-4 text-2xl font-black text-sky-900 shadow"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => setPinInput(prev => prev.slice(0, -1))}
          className="rounded-xl bg-yellow-100 py-4 text-xl font-black text-yellow-800 shadow"
        >
          ⌫
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowPinKeypad(false)}
        className="mt-4 w-full rounded-xl bg-green-100 py-3 font-black text-green-800 shadow"
      >
        Fertig
      </button>
    </div>
  </div>
)}

                <button
                  onClick={() => setShowPinReset(true)}
                  className="w-full rounded-[1.35rem] bg-amber-100 px-6 py-3 font-black text-amber-800"
                >
                  🔁 PIN vergessen ?
                </button>
                {!savedParentPin ? (
                  <button
                    onClick={enterParent}
                    className="w-full rounded-[1.35rem] bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-300 px-6 py-4 text-xl font-black text-amber-950 shadow-[0_12px_30px_rgba(245,158,11,.35)] hover:scale-[1.02] active:scale-[.98] transition shadow-[0_12px_30px_rgba(37,99,235,.22)]"
                  >
                    🔑 PIN erstellen
                  </button>
                ) : (
                  <button
                    onClick={enterParent}
                    className="w-full rounded-[1.35rem] bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 px-6 py-4 text-xl font-black text-white shadow-[0_12px_30px_rgba(16,185,129,.35)] hover:scale-[1.02] active:scale-[.98] transition"
                  >
                    🔐 Elternbereich öffnen
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {area === "child" && (
          <>
            <div className="mb-6">
  <ChildTabs
  view={childView}
  setView={setChildView}
  taskBadge={childOpenTaskCount}
  learningBadge={childOpenLearningCount}
  bonusBadge={childBonusBadgeCount}
/>
</div>
<div className={`rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${themeClass} p-4 shadow-[0_24px_70px_rgba(245,158,11,.20)] border-[3px] border-white`}>
  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_430px] lg:grid-cols-[minmax(0,1fr)_560px]">

    <div className="flex items-center gap-3 md:gap-4">
      <div className="flex items-center justify-center">
        {(child.profileBadges || [])[0] ? (
          <img
            src={(child.profileBadges || [])[0]}
            alt="Gewähltes Profil-Motiv"
            className="h-16 w-16 sm:h-20 sm:w-20 animate-floaty rounded-full object-cover shadow-sm overflow-hidden"
          />
        ) : (
          <FoxCoinImage className="h-16 w-16 sm:h-20 sm:w-20 animate-floaty" />
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-black leading-tight text-sky-950 md:text-3xl">
          Hallo {child.name} 👋
        </h2>

        <p className="mt-1 text-sm font-black leading-tight text-sky-900 md:text-base">
          Heute sammeln wir Punkte und Coins! · {levelRank(child.level).emoji} {levelRank(child.level).title} · Sterne {starsFromAchievements(child)}
        </p>

        {!(child.profileBadges || [])[0] && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/60 px-3 py-1 font-black text-sky-800">
              Such dir dein Profil-Motiv aus ✨
            </span>
          </div>
        )}
      </div>
    </div>

    <div className="relative rounded-[1.5rem] bg-white/45 p-2 lg:p-3">
      {children.length > 1 && (
        <select
          value={selectedChildId}
          onChange={(e) => {
            setSelectedChildId(Number(e.target.value));
            setShowBadgeChooser(false);
          }}
          className="absolute right-6 top-[2.9rem] rounded-full border-2 border-white bg-gradient-to-r from-pink-300 via-yellow-300 via-green-300 to-sky-300 px-5 py-2 text-sm font-black text-purple-900 shadow-[0_10px_30px_rgba(168,85,247,0.18)]"
        >
          {children.map((kid) => (
            <option key={kid.id} value={kid.id}>
              {kid.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-3 gap-2 max-w-[420px]">
        <span className="rounded-full bg-pink-100 px-4 py-2 text-[11px] md:text-xs font-black text-pink-700">
          🎂 {child.age || "-"} Jahre
        </span>

        <span className="rounded-full bg-green-100 px-4 py-2 text-[11px] md:text-xs font-black text-green-700">
          🎨 {child.favoriteColor || "-"}
        </span>

        <span className="rounded-full bg-cyan-100 px-4 py-2 text-[11px] md:text-xs font-black text-cyan-700">
          🐾 {child.favoriteAnimal || "-"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/80 px-4 py-3 text-xs font-black text-sky-800">
          {(child.profileBadges || [])[0] ? "Motiv gewählt ✨" : "Noch kein Motiv gewählt ✨"}
        </span>

        <button
          type="button"
          onClick={() => setShowBadgeChooser(!showBadgeChooser)}
          className="rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 px-5 py-2 text-xs font-black text-white shadow-sm transition hover:scale-105"
        >
          🎨 Motiv auswählen
        </button>
      </div>
    </div>

  </div>

  {showBadgeChooser && (
    <div className="mt-4 rounded-[1.8rem] bg-white/80 p-3 shadow-inner">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-sky-900">
          Wähle ein Motiv für dein Profil.
        </p>

        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
          {(child.profileBadges || []).length}/1
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {profileBadgeOptions.map(badge => {
          const active = (child.profileBadges || []).includes(badge.src);

          return (
            <button
              key={badge.id}
              onClick={() => toggleProfileBadge(badge.src)}
              className={`rounded-2xl border-2 p-2 shadow-sm transition hover:scale-105 active:scale-95 ${
                active ? "border-sky-500 bg-sky-100" : "border-white bg-white/90"
              }`}
              title={badge.label}
            >
              <img
                src={badge.src}
                alt={badge.label}
                className="mx-auto h-9 w-9 object-contain"
                onError={(event) => {
                  event.currentTarget.style.opacity = "0.2";
                }}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs font-bold text-sky-700">
        PNG-Dateien bitte als badge-01.png bis badge-30.png in public/badges ablegen. Es kann immer nur ein Motiv aktiv sein.
      </p>
    </div>
  )}
</div>

{childView === "features" && bonusWheelEnabled && (
  <section className="rounded-[2rem] bg-white/90 p-6 text-center shadow-xl">
    <h2 className="text-3xl font-black text-sky-950">
      🎡 Glücksrad
    </h2>

    <p className="mt-2 font-bold text-sky-700">
      Drehe einmal alle 24 Stunden und gewinne Bonus-Coins!
    </p>

    <div
      className={`mx-auto mt-6 grid h-56 w-56 place-items-center rounded-full border-[10px] border-yellow-300 bg-gradient-to-br from-yellow-200 via-pink-200 to-sky-200 text-5xl shadow-2xl ${
        wheelSpinning ? "animate-spin" : ""
      }`}
    >
      🎡
    </div>

<button
  onClick={spinBonusWheel}
  disabled={wheelSpinning}
  className="mt-4 w-full rounded-[1.8rem] bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 px-6 py-5 text-xl font-black text-white shadow-[0_12px_30px_rgba(251,146,60,.35)] transition hover:scale-[1.03] disabled:opacity-60"
>
  {wheelSpinning ? "🎡 Dreht sich..." : "🎡 Glücksrad drehen"}

  <div className="mt-2 text-sm font-bold bg-white/20 rounded-xl p-2">
    ⏰ Nächster Dreh in: {getDailyBonusTime()}
  </div>
</button>
  
    <br />
<button
  onClick={claimDailyLoginBonus}
  className="mt-4 w-full rounded-[1.8rem] bg-gradient-to-br from-pink-500 via-purple-400 to-cyan-400 px-6 py-5 text-xl font-black text-white shadow-[0_12px_30px_rgba(168,85,247,.35)] transition hover:scale-[1.03]"
>
  🎁 Täglichen Bonus abholen

  <div className="mt-2 text-sm font-bold bg-white/20 rounded-xl p-2">
    ⏰ Nächster Bonus in: {getDailyBonusTime()}
  </div>
</button>

    {wheelResult !== null && (
      <p className="mt-5 text-xl font-black text-green-600">
        🎉 Du hast {wheelResult} Coins gewonnen!
      </p>
    )}

    <div className="mt-6 rounded-[1.5rem] bg-yellow-50 p-4 text-sm font-bold text-yellow-700">
      Gewinne: 5 Coins, 10 Coins, 15 Coins oder 25 Coins
    </div>
  </section>
)}
            <div className="mt-5">
              {childView === "home" && (
                <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
                  <div className="space-y-5">
                    

                    <Panel title="🏠 Dein Dashboard">
                      <div className="grid gap-4 md:grid-cols-5">
<StatCard icon={<Coin />} label="Coins" value={child.coins.toString()} />
<StatCard icon="🎮" label="Level" value={child.level.toString()} />
<StatCard icon="⭐" label="Sterne" value={`${starsFromAchievements(child)}`} />
<StatCard icon="🔥" label="Serie" value={`${child.streak} Tage`} />
<StatCard icon="📋" label="Erledigt" value={`${completedPercent}%`} />
                      </div>
                      <div className={`mt-4 inline-flex rounded-full px-4 py-2 font-black ${levelRank(child.level).color}`}>
                        {levelRank(child.level).emoji} Rang: {levelRank(child.level).title}
                      </div>
                      <div className="mt-4 rounded-[1.5rem] bg-yellow-50 p-4 space-y-3">

  <div className="mt-4 grid gap-3">

  <GoalProgress
    icon="🎁"
    title="Ziel für Shop"
    name={shop.length > 0 ? shop[0].title : "Kein Ziel"}
    current={child.coins}
    target={shop.length > 0 ? shop[0].price : 0}
    motivSrc={selectedChildMotiv}
  />

  <GoalProgress
    icon="🏆"
    title="Ziel für Belohnung"
    name={childRewardGoalLabel || "Kein Ziel"}
    current={child.coins}
    target={childRewardGoalTotal}
    motivSrc={selectedChildMotiv}
  />

  <GoalProgress
    icon="💎"
    title="Ziel für Schatzkiste"
    name={chests.length > 0 ? chests[0].title : "Kein Ziel"}
    current={child.coins}
    target={chests.length > 0 ? chests[0].price : 0}
    motivSrc={selectedChildMotiv}
  />

</div>

</div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[1.8rem] bg-sky-50 p-4"><div className="mb-2 flex justify-between gap-3 font-black text-sky-950">
                          <span>
  {child.level >= MAX_LEVEL ? "XP bis Prestige" : `XP bis Level ${child.level + 1}`}
</span>

<span className="flex items-center gap-1">
  {child.xp}/{xpToNext(child.level)} <span>🎯</span>
</span>
                          </div><Progress value={child.xp} max={xpToNext(child.level)} /></div>
                        
                        
                                         </div>
                    </Panel>

                  </div>
                  <div className="space-y-5">
                    <Panel title="🏆 Deine Abzeichen">
                      <div className="flex flex-wrap gap-2">{cleanAchievements(child.achievements || []).map(a => <span key={a} className="rounded-full bg-yellow-100 px-3 py-2 font-black text-yellow-900">⭐ {a}</span>)}</div>
                    </Panel>
                  </div>
                </section>
              )}
{childView === "learning" && (
<section className="grid gap-5">

<Panel title="🧠 Meine Lernaufgaben">

<div className="mb-5 flex flex-wrap gap-2">

{["alle","offen","wartet","erledigt","verpasst"].map(status=>(

<button
key={status}
onClick={()=>setLearningFilter(status as any)}
className={`rounded-full px-4 py-2 font-black ${
learningFilter===status
? "bg-sky-500 text-white"
: "bg-slate-100 text-slate-700"
}`}
>

{status==="alle" && "📋 Alle"}
{status==="offen" && "🟠 Offen"}
{status==="wartet" && "🟡 Wartet"}
{status==="erledigt" && "🟢 Erledigt"}
{status==="verpasst" && "🔴 Verpasst"}

</button>

))}

</div>

{[
{title:"🟠 Offene Lernaufgaben",status:"offen"},
{title:"🟡 Wartet",status:"wartet"},
{title:"🟢 Erledigt",status:"erledigt"}
]
.filter(
group =>
learningFilter==="alle" ||
group.status===learningFilter
)
.map(group=>{

const groupTasks=
learningTasks.filter(
task =>
task.childId===child.id &&
task.status===group.status
);

if(groupTasks.length===0) return null;

return (

<div key={group.status} className="mb-8">

<h3 className="mb-4 text-xl font-black text-sky-950">
{group.title}
</h3>

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

{groupTasks.map(task=>(

<div
key={task.id}
className={`rounded-[1.5rem] border-2 p-3 shadow-md

${
task.status==="offen"
? "bg-orange-50 border-orange-100"

: task.status==="wartet"
? "bg-yellow-50 border-yellow-100"

: "bg-green-50 border-green-100"
}
`}
>

<p className="text-xs font-black text-sky-600">
{task.category}
</p>

<h3 className="line-clamp-2 text-sm font-black text-sky-950">
{task.title}
</h3>

<p className="mt-2 text-xs font-black text-amber-600">
🪙 {task.coins}
</p>

{task.status==="offen" && (

<button
onClick={()=>startLearningSession(task)}
className="mt-3 w-full rounded-[1rem] bg-orange-300 py-2 text-xs font-black text-orange-900"
>
📚 Offen
</button>

)}

{task.status==="wartet" && (

<p className="mt-3 rounded-[1rem] bg-yellow-200 py-2 text-center text-xs font-black text-yellow-900">
⏳ Wartet
</p>

)}

{task.status==="erledigt" && (

<p className="mt-3 rounded-[1rem] bg-green-200 py-2 text-center text-xs font-black text-green-900">
✅ Erledigt
</p>

)}

</div>

))}

</div>

</div>

)

})}

</Panel>

</section>
)}
{childView === "tasks" && (
<Panel
  title={
    <div className="flex items-center gap-3">
      <span>📋 Deine Aufgaben</span>

      <select
        value={childTaskDayFilter}
        onChange={(e) =>
          setChildTaskDayFilter(
            e.target.value as "today" | "tomorrow" | "week"
          )
        }
        className="rounded-[1.2rem] border-2 border-white bg-gradient-to-br from-yellow-200 via-sky-200 to-cyan-300 px-4 py-2 text-base font-black text-sky-950 shadow-[0_8px_20px_rgba(14,165,233,.22)] transition hover:scale-[1.03] active:scale-[.98]"
      >
        <option value="today">🌞 Heute</option>
        <option value="tomorrow">🌙 Morgen</option>
        <option value="week">📅 Woche</option>
      </select>
    </div>
  }
>

{["alle","offen","wartet","erledigt"].map(status=>(
<button
key={status}
onClick={()=>setTaskFilter(status as any)}
className={`rounded-full px-4 py-2 font-black ${
taskFilter===status
? "bg-sky-500 text-white"
: "bg-slate-100 text-slate-700"
}`}
>
{status==="alle" && "📋 Alle"}
{status==="offen" && "🟠 Offen"}
{status==="wartet" && "⏳ Wartet"}
{status==="erledigt" && "✅ Erledigt"}
</button>
))}


{[
{
title:"🟠 Offene Aufgaben",
status:"offen"
},
{
title:"⏳ Wartet",
status:"wartet"
},
{
title:"✅ Erledigt",
status:"erledigt"
}
]
.filter(group=>taskFilter==="alle"||group.status===taskFilter)
.map(group=>{

const groupTasks=
childTasks.filter(
t=>t.status===group.status
);

if(groupTasks.length===0)
return null;

return(

<div key={group.status} className="mb-8">

<h3 className="mb-4 text-xl font-black text-sky-950">
{group.title}
</h3>

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

{groupTasks.map(task=>(

<div
key={task.id}
className={`rounded-[1.5rem] border-2 p-3 shadow-md
${
task.status==="offen"
? "bg-orange-50 border-orange-100"

: task.status==="wartet"
? "bg-yellow-50 border-yellow-100"

: "bg-green-50 border-green-100"
}
`}
>

<h3 className="line-clamp-2 text-sm font-black text-sky-950">
{task.title}
</h3>

<p className="mt-1 text-xs font-bold text-sky-700">
🪙 {task.coins}
</p>

<p className="text-xs text-slate-500">
{task.day}
</p>

{task.status==="offen" && (
<button
onClick={() => submitTask(task.id)}
className="mt-3 w-full rounded-[1rem] bg-orange-300 py-2 text-xs font-black text-orange-900">
🔔 Offen
</button>
)}

{task.status==="wartet" && (
<p className="mt-3 rounded-[1rem] bg-yellow-200 py-2 text-center text-xs font-black text-yellow-900">
⏳ Wartet
</p>
)}

{task.status==="erledigt" && (
<p className="mt-3 rounded-[1rem] bg-green-200 py-2 text-center text-xs font-black text-green-900">
✅ Erledigt
</p>
)}

</div>

))}

</div>

</div>

);

})}

</Panel>
)}
              {childView === "chests" && (
                <Panel title="💎 Schatzkisten">
                  <p className="mb-4 font-bold text-sky-700">
                    Eltern legen fest, was in den Schatzkisten steckt. Du kaufst eine Kiste mit Coins und öffnest sie.
                  </p>

                  {openedChestMessage && (
                    <div className="mb-5 rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-4 border-yellow-300 bg-white p-6 text-center shadow-[0_20px_55px_rgba(14,165,233,.15)]">
                      <div className="text-6xl">🎉</div>
                      <h3 className="mt-2 text-3xl font-black text-sky-950">In deiner Schatzkiste war:</h3>
                      <p className="mt-3 text-xl font-black text-amber-700">{openedChestMessage}</p>
                      <button onClick={() => setOpenedChestMessage(null)} className="mt-4 rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-5 py-3 font-black text-white">
                        Schließen
                      </button>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    {chests.map((chest) => {
                      const alreadyOpened = chest.opened && chest.openedBy === child.id;
                      return (
                        <div key={chest.id} className="rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-[3px] border-white bg-white/90 p-5 text-center shadow-[0_14px_40px_rgba(37,99,235,.10)]">
                          <div className="text-6xl">{chest.tier === "Gold" ? "🏆" : chest.tier === "Silber" ? "🥈" : "🥉"}</div>
                          <h3 className="mt-2 text-xl font-black text-sky-950">{chest.title}</h3>
                          <p className="mt-1 font-bold text-sky-700">{chest.tier}-Schatzkiste</p>
                          <p className="mt-2 flex items-center justify-center gap-2 font-black text-amber-700"><Coin /> {chest.price}</p>
                          <button
                            onClick={() => openChest(chest)}
                            disabled={alreadyOpened}
                            className={`mt-3 w-full rounded-[1.35rem] p-3 font-black ${alreadyOpened ? "bg-emerald-100 text-emerald-800" : "bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-300 text-amber-950"}`}
                          >
                            {alreadyOpened ? "Schon geöffnet" : "Kaufen & öffnen"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              )}

{childView === "rewards" && (
                <Panel title="🎁 Belohnungen ansehen">
                  <p className="mb-4 font-bold text-sky-700">Belohnungen werden von den Eltern angelegt. Du kannst sie nur anfragen.</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {rewards.map(r => (
                      <div key={r.id} className="rounded-[1.8rem] border-[3px] border-white bg-white/90 p-4 shadow-[0_25px_70px_rgba(14,165,233,.18)]">
                        <div className="text-5xl">{r.icon}</div>
                        <h3 className="mt-2 text-xl font-black text-sky-950">{r.title}</h3>
                        <p className="mt-1 flex items-center gap-2 font-black text-amber-700"><Coin /> {r.coins}</p>
                        <StatusBadgeReward status={r.status} />
                        {r.status === "frei" && <button onClick={() => requestReward(r)} className="mt-3 w-full rounded-[1.35rem] bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-300 p-3 font-black text-amber-950">Einlösen anfragen</button>}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {childView === "shop" && (
                <Panel title="🛍️ Familien-Shop">
                  <p className="mb-4 font-bold text-sky-700">
                    Hier erscheinen nur Produkte, die Eltern im Elternbereich-Shop angelegt haben.
                  </p>

                  {shop.length === 0 ? (
<EmptyState
  icon="🛍️"
  title="Der Shop ist noch leer"
  text="Eltern können im Elternbereich eigene Belohnungen oder Wunschprodukte anlegen. Danach erscheinen sie hier und können mit Coins eingelöst werden."
/>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {shop.map(item => {
                        const owned = item.ownedBy.includes(child.id);
                        const canBuy = child.coins >= item.price && !owned;

                        return (
                          <div key={item.id} className="rounded-[1.5rem] sm:rounded-[2rem] border-2 border-white bg-white/90 p-5 shadow-[0_16px_45px_rgba(14,165,233,.12)]">
                            <div className="text-5xl">{item.icon}</div>
                            <h3 className="mt-3 text-xl font-black text-sky-950">{item.title}</h3>
                            {item.description && <p className="mt-1 text-sm font-bold text-sky-700">{item.description}</p>}
                            <p className="mt-3 rounded-full bg-yellow-100 px-4 py-2 text-center font-black text-amber-800">
                              🪙 {item.price} Coins
                            </p>

                            {owned ? (
                              <div className="mt-4 rounded-[1.2rem] bg-emerald-100 p-3 text-center font-black text-emerald-800">
                                ✅ Bereits eingelöst
                              </div>
                            ) : (
                              <button
                                onClick={() => buyItem(item)}
                                disabled={!canBuy}
                                className={`mt-4 w-full rounded-[1.35rem] p-3 font-black shadow-md transition ${
                                  canBuy
                                    ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:scale-[1.02]"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {canBuy ? "Einlösen" : "Nicht genug Coins"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              )}

              {childView === "profile" && (
                <Panel title="👤 Dein Profil">
                  <div className="grid gap-5 md:grid-cols-2">
                    <LiveFox child={child} waitingCount={childTasks.filter((t) => t.status === "wartet").length} />
                    <div className="rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-[3px] border-white bg-white/90 p-5 shadow-[0_14px_40px_rgba(37,99,235,.10)]">
                      <h3 className="text-2xl font-black text-sky-950">Deine Abzeichen</h3>
                      <div className="mt-3 flex flex-wrap gap-2">{cleanAchievements(child.achievements || []).map(a => <span key={a} className="rounded-full bg-yellow-100 px-3 py-2 font-black text-yellow-900">⭐ {a}</span>)}</div>
                    </div>
                  </div>
                </Panel>
              )}
            </div>
          </>
        )}

        {area === "parent" && (
          <>
<ParentTabs
  view={parentView}
  setView={(view) => {
  setParentView(view);

  if (view === "family") {
    setFamilyBadgeCount(0);
  }
}}
  taskBadge={tasks.filter((task) => task.status === "wartet").length}
  learningBadge={learningTasks.filter((task) => task.status === "wartet").length}
  rewardBadge={rewards.filter((reward) => reward.status === "wartet").length}
  chestBadge={chests.filter((chest) => chest.opened).length}
  shopBadge={shop.filter((item) => item.ownedBy.length > 0).length}
  familyBadge={familyBadgeCount}
/>
<div className="mt-5">
{parentView === "dashboard" && (
  <Panel title="🏠 Eltern-Übersicht">
    <div className="space-y-5">
      <div className="rounded-[1.5rem] bg-white/90 p-4 shadow-sm">
  <p className="mb-2 text-sm font-black text-sky-700">
    📅 Zeitraum auswählen
  </p>

  <select
    value={dashboardDayFilter}
    onChange={(e) =>
      setDashboardDayFilter(
        e.target.value as
          | "today"
          | "yesterday"
          | "beforeYesterday"
          | "last7"
      )
    }
    className="w-full rounded-[1rem] border-2 border-sky-100 bg-white p-3 font-black text-sky-900"
  >
    <option value="today">Heute</option>
    <option value="yesterday">Gestern</option>
    <option value="beforeYesterday">Vorgestern</option>
    <option value="last7">Letzte 7 Tage</option>
  </select>
</div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] bg-gradient-to-br from-yellow-100 to-orange-200 p-5 shadow-lg">
          <p className="text-sm font-black text-orange-700">
            ⏳ Zu bestätigen
          </p>

          <div className="mt-3 space-y-2 text-lg font-black text-slate-900">
            <p>✅ Aufgaben: {waitingTasksForDashboard.length}</p>
<p>📚 Lernen: {waitingLearningTasks.length}</p>
<p>🎁 Belohnungen: {waitingRewardsForDashboard.length}</p>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-gradient-to-br from-sky-100 to-cyan-200 p-5 shadow-lg">
          <p className="text-sm font-black text-sky-700">
            📌 Heute
          </p>

          <div className="mt-3 space-y-2 text-lg font-black text-slate-900">
            <p>📋 Offen: {openTasksToday}</p>
            <p>✅ Erledigt: {completedTasks}</p>
            <p>🔴 Verpasst: {missedTasks}</p>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-gradient-to-br from-emerald-100 to-lime-200 p-5 shadow-lg">
          <p className="text-sm font-black text-emerald-700">
            🎁 Familie
          </p>

          <div className="mt-3 space-y-2 text-lg font-black text-slate-900">
            <p>👧 Kinder: {children.length}</p>
            <p>🎁 Freie Belohnungen: {freeRewards}</p>
            <p>🛍️ Shop-Einlösungen: {totalShopItemsOwned}</p>
            <p>📦 Geöffnete Kisten: {openedChests}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {children.map((kid) => {
          const kidOpenTasks = tasks.filter(
            (t) => t.childId === kid.id && t.status === "offen"
          ).length;

const kidWaitingTasks = tasks.filter(
  (t) =>
    t.childId === kid.id &&
    t.status === "wartet" &&
    isTimestampInDashboardFilter(t.submittedAt)
).length;

const kidMissedTasks = tasks.filter(
  (t) =>
    t.childId === kid.id &&
    t.status === "verpasst" &&
    isTimestampInDashboardFilter(t.missedAt)
).length;

const kidLearningWaiting = learningTasks.filter(
  (t) =>
    t.childId === kid.id &&
    t.status === "wartet" &&
    isTimestampInDashboardFilter(t.submittedAt)
).length;

          return (
            <div
              key={kid.id}
              className="rounded-[1.8rem] bg-white/90 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    👧 {kid.name}
                  </p>

                  <p className="mt-1 font-bold text-sky-700">
                    Level {kid.level} · {kid.coins} Coins
                  </p>
                </div>

                <div className="text-right text-sm font-black text-slate-700">
                  <p>📋 Offen: {kidOpenTasks}</p>
                  <p>⏳ Wartet: {kidWaitingTasks}</p>
                  <p>📚 Lernen: {kidLearningWaiting}</p>
                  <p>🔴 Verpasst: {kidMissedTasks}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[1.8rem] bg-red-50 p-5 shadow-lg">
        <p className="text-xl font-black text-red-700">
          ⚠️ Hinweise
        </p>

        <div className="mt-3 space-y-2 font-bold text-red-900">
          {children.length === 0 && (
            <p>⚠️ Noch keine Kinder angelegt.</p>
          )}

          {tasks.length === 0 && (
            <p>⚠️ Noch keine Aufgaben angelegt.</p>
          )}

          {learningTasks.length === 0 && (
            <p>⚠️ Noch keine Lernaufgaben angelegt.</p>
          )}

          {rewards.length === 0 && (
            <p>⚠️ Noch keine Belohnungen angelegt.</p>
          )}

          {!savedParentPin && (
            <p>⚠️ Eltern-PIN noch nicht gesetzt.</p>
          )}

          {children.length > 0 &&
            tasks.length > 0 &&
            rewards.length > 0 &&
            savedParentPin && (
              <p className="text-emerald-700">
                ✅ Alles sieht gut aus.
              </p>
            )}
        </div>
      </div>

    </div>
  </Panel>
)}

{parentView === "learning" && (
  <Panel title="🧠 Lernmodus">
    <div className="rounded-[2rem] bg-gradient-to-br from-sky-100 via-cyan-50 to-indigo-100 p-6 shadow-xl">
      <h2 className="text-3xl font-black text-sky-950">
        📚 Lernaufgaben
      </h2>

      <p className="mt-2 font-bold text-sky-700">
        Erstelle spezielle Lernaufgaben für deine Kinder.
      </p>

      <div className="mt-6 grid gap-4">
        <AppInput
          value={newLearningTitle}
          onChange={setNewLearningTitle}
          placeholder="📖 Lernaufgabe eintragen"
        />

        <NumberKeypadField
          label="🪙 Coins"
          value={Number(newLearningCoins) || 0}
          setter={(value) => setNewLearningCoins(String(value))}
          showEuro
        />

        <NumberKeypadField
          label="⏱️ Dauer in Minuten"
          value={newLearningMinutes}
          setter={(value) => setNewLearningMinutes(Number(value) || 0)}
        />

        <select
          value={newLearningCategory}
          onChange={(e) => setNewLearningCategory(e.target.value)}
          className="w-full rounded-[1.5rem] border-2 border-white bg-white/90 p-4 font-bold"
        >
          <option value="📚 Lesen">📚 Lesen</option>
          <option value="➕ Mathe">➕ Mathe</option>
          <option value="🇬🇧  Englisch">🇬🇧 Englisch</option>
        </select>

        <select
          value={newLearningLevel}
          onChange={(e) => setNewLearningLevel(e.target.value as "leicht" | "mittel" | "schwer")}
          className="w-full rounded-[1.5rem] border-2 border-white bg-white/90 p-4 font-bold"
        >
          <option value="leicht">🌱 Leicht</option>
          <option value="mittel">🌼 Mittel</option>
          <option value="schwer">🔥 Schwer</option>
        </select>

        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(Number(e.target.value))}
          className="w-full rounded-[1.5rem] border-2 border-white bg-white/90 p-4 font-bold"
        >
          {children.map((kid) => (
            <option key={kid.id} value={kid.id}>
              👶 Für {kid.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setNewLearningTitle("");
            setNewLearningCoins("");
            setNewLearningMinutes(0);
            setNewLearningCategory("📚 Lesen");
            setNewLearningLevel("leicht");
          }}
          className="rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
        >
          🗑️ Leeren
        </button>

        <button
          onClick={saveLearningTask}
          className="rounded-[1.5rem] bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 px-6 py-4 text-xl font-black text-white shadow-xl"
        >
          {editingLearningTaskId ? "✏️ Lernaufgabe ändern" : "➕ Lernaufgabe hinzufügen"}
        </button>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap gap-2">
      {["alle", "wartet", "offen", "erledigt"].map(status => (
        <button
          key={status}
          onClick={() => setParentLearningFilter(status as any)}
          className={`rounded-full px-4 py-2 font-black ${
            parentLearningFilter === status
              ? "bg-sky-500 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {status === "alle" && "📋 Alle"}
          {status === "wartet" && "🔔 Zu bestätigen"}
          {status === "offen" && "📝 Offen"}
          {status === "erledigt" && "✅ Erledigt"}
        </button>
      ))}
    </div>

    {[
      { title: "🔔 Zu bestätigen", status: "wartet" },
      { title: "📝 Offene Lernaufgaben", status: "offen" },
      { title: "✅ Erledigt", status: "erledigt" },
    ]
      .filter(group => parentLearningFilter === "alle" || group.status === parentLearningFilter)
      .map(group => {
        const filteredLearning = learningTasks.filter(t => t.status === group.status);

        if (!filteredLearning.length) return null;

        return (
          <div key={group.status} className="mt-6">
            <h3 className="mb-4 text-xl font-black text-sky-950">
              {group.title}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              {filteredLearning.map(task => {
                const kid = children.find(c => c.id === task.childId);

                return (
                  <div
                    key={task.id}
                    className={`rounded-[1.5rem] border-2 p-4 shadow-md ${
                      task.status === "wartet"
                        ? "bg-yellow-50 border-yellow-200"
                        : task.status === "offen"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <p className="text-sm font-black text-sky-700">
                      {task.category}
                    </p>

                    <h3 className="line-clamp-2 text-lg font-black text-sky-950">
                      {task.title}
                    </h3>

                    <p className="mt-2 font-bold text-amber-600">
                      🪙 {task.coins} Coins
                    </p>

                    <p className="mt-1 font-bold text-sky-700">
                      👶 {kid?.name || "Kind"}
                    </p>
                    {task.status === "wartet" && task.submittedAt && (
  <p className="mt-2 rounded-xl bg-yellow-100 px-3 py-2 text-sm font-black text-yellow-800">
    ⏰ Erledigt am {formatDateTime(task.submittedAt)}
  </p>
)}

                    {task.status === "wartet" && (
                      <button
                        type="button"
                        onClick={() => approveLearningTask(task)}
                        className="mt-4 w-full rounded-[1rem] bg-green-300 py-2 font-black text-green-900"
                      >
                        ✅ Eltern bestätigen
                      </button>
                    )}

                    {task.status === "offen" && (
                      <div className="mt-4 rounded-[1rem] bg-orange-200 py-2 text-center font-black text-orange-900">
                        📝 Offen
                      </div>
                    )}

                    {task.status === "erledigt" && (
                      <div className="mt-4 rounded-[1rem] bg-green-200 py-2 text-center font-black text-green-900">
                        ✅ Erledigt
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => editLearningTask(task)}
                        className="rounded-[1rem] bg-yellow-200 px-4 py-2 font-black text-yellow-900"
                      >
                        ✏️ Bearbeiten
                      </button>

                      <button
                        onClick={() => deleteLearningTask(task.id)}
                        className="rounded-[1rem] bg-red-300 px-4 py-2 font-black text-red-900"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
  </Panel>
)}
{parentView === "coinrechner" && (
  <Panel title="🪙 Coinrechner">
    <div className="grid gap-5">
      <div className="rounded-[1.8rem] bg-yellow-50 p-5 shadow-sm ring-1 ring-yellow-200">
        <p className="text-xl font-black text-yellow-800">
          ⚙️ Umrechnung einstellen
        </p>

        <p className="mt-2 text-sm font-bold text-yellow-700">
          Lege fest, wie viele Coins einem Cent entsprechen.
        </p>

        <div className="mt-4">
          <NumberKeypadField
            label="🪙 Coins für 1 Cent"
            value={coinsForOneCent}
            setter={setCoinsForOneCent}
          />
        </div>

        <p className="mt-3 rounded-[1.2rem] bg-white p-3 text-center font-black text-yellow-800">
          {coinsForOneCent} Coins = 0,01 €
        </p>
        <button
  type="button"
  onClick={saveCoinRate}
  className="mt-3 w-full rounded-[1.4rem] bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3 font-black text-yellow-950 shadow-md"
>
  💾 Umrechnung speichern
</button>
   <div className="rounded-[1.4rem] bg-slate-50 p-3 text-xs font-bold text-slate-500">
  ℹ️ Die Euro-Anzeige dient ausschließlich als persönliche Orientierung für Eltern und stellt kein echtes Guthaben oder Zahlungsmittel dar.
</div>
      </div>

      <div className="rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-sky-100">
        <p className="mb-4 text-xl font-black text-sky-950">
          👨‍👩‍👧 Übersicht pro Kind
        </p>

        <div className="grid gap-3">
          {children.map(c => {
            const coins = Number(c.coins || 0);
            const euro =
              coinsForOneCent > 0
                ? (coins / coinsForOneCent / 100).toFixed(2)
                : "0.00";

            return (
              <div key={c.id} className="rounded-[1.5rem] bg-sky-50 p-4 shadow-sm">
                <p className="font-black text-sky-950">
                  🧒 {c.name}
                </p>

                <p className="mt-1 text-sm font-bold text-sky-700">
                  {coins} Coins
                </p>

                <p className="mt-2 text-2xl font-black text-green-600">
                  {euro.replace(".", ",")} €
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[1.8rem] bg-green-50 p-5 text-center shadow-sm ring-1 ring-green-200">
        <p className="text-sm font-black text-green-700">
          Gesamtwert aller Kinder
        </p>

        <p className="mt-2 text-3xl font-black text-green-700">
          {(
            children.reduce((sum, c) => sum + Number(c.coins || 0), 0) /
            coinsForOneCent /
            100
          ).toFixed(2).replace(".", ",")} €
        </p>
      </div>
    </div>
 
  </Panel>
)}

              {parentView === "tasks" && (
                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel title={editingTaskId ? "✏️ Aufgabe bearbeiten" : "➕ Aufgabe anlegen"}>
                    <p className="mb-4 font-bold text-sky-700">
  Lege fest, ob du eine Alltagsaufgabe verwenden oder eine eigene Aufgabe erstellen möchtest.
</p>

<div className="grid gap-4">
  <div className="rounded-[1.4rem] bg-sky-50 p-4">
    <p className="mb-3 text-sm font-black text-sky-700">
      📋 Alltagsaufgabe verwenden?
    </p>

    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => {
  setUsePresetTask(true);
  setUseCustomTask(false);
}}
        className={`rounded-[1rem] py-3 font-black ${
          usePresetTask ? "bg-sky-500 text-white" : "bg-white text-sky-700"
        }`}
      >
        ✅ Ja
      </button>

      <button
        type="button"
        onClick={() => setUsePresetTask(false)}
        className={`rounded-[1rem] py-3 font-black ${
          !usePresetTask ? "bg-sky-500 text-white" : "bg-white text-sky-700"
        }`}
      >
        ❌ Nein
      </button>
    </div>


{usePresetTask && (
  <div className="mt-3 grid gap-3">

    <select
      value={selectedPreset}
      onChange={(e) => applyTaskPreset(e.target.value)}
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      <option value="">Alltagsaufgabe auswählen</option>

      {taskPresets.map((preset) => (
        <option key={preset.title} value={preset.title}>
          {preset.category}: {preset.title} · {preset.coins} Coins
        </option>
      ))}
    </select>

    <NumberKeypadField
      label="🪙 Coins"
      value={Number(newTaskCoins) || 0}
      setter={setNewTaskCoins}
      showEuro
    />

    <select
      value={newTaskRepeat}
      onChange={(e) => setNewTaskRepeat(e.target.value as Repeat)}
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      <option value="täglich">Täglich</option>
      <option value="einmalig">Einmalig</option>
      <option value="wöchentlich">Wöchentlich</option>
    </select>

    {newTaskRepeat === "einmalig" && (
      <select
        value={newTaskDeadline}
        onChange={(e) =>
          setNewTaskDeadline(
            e.target.value as
              | "today"
              | "tomorrow"
              | "threeDays"
              | "sevenDays"
          )
        }
        className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
      >
        <option value="today">Frist: Heute</option>
        <option value="tomorrow">Frist: Morgen</option>
        <option value="threeDays">Frist: In 3 Tagen</option>
        <option value="sevenDays">Frist: In 7 Tagen</option>
      </select>
    )}

    <select
      value={newTaskDay}
      onChange={(e) => setNewTaskDay(e.target.value)}
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      {days.map((d) => (
        <option key={d}>{d}</option>
      ))}
    </select>

    <select
      value={String(newTaskTarget)}
      onChange={(e) =>
        setNewTaskTarget(
          e.target.value === "all"
            ? "all"
            : Number(e.target.value)
        )
      }
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      <option value="all">Für alle Kinder</option>

      {children.map((c) => (
        <option key={c.id} value={c.id}>
          Nur für {c.name}
        </option>
      ))}
    </select>
  </div>
)}
  </div>

  <div className="rounded-[1.4rem] bg-emerald-50 p-4">
    <p className="mb-3 text-sm font-black text-emerald-700">
      ✍️ Eigene Aufgabe anlegen?
    </p>

    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => {
  setUseCustomTask(true);
  setUsePresetTask(false);
}}
        className={`rounded-[1rem] py-3 font-black ${
          useCustomTask ? "bg-emerald-500 text-white" : "bg-white text-emerald-700"
        }`}
      >
        ✅ Ja
      </button>

      <button
        type="button"
        onClick={() => setUseCustomTask(false)}
        className={`rounded-[1rem] py-3 font-black ${
          !useCustomTask ? "bg-emerald-500 text-white" : "bg-white text-emerald-700"
        }`}
      >
        ❌ Nein
      </button>
    </div>


{useCustomTask && (
  <div className="mt-3 grid gap-3">

    <AppInput
      value={newTaskTitle}
      onChange={setNewTaskTitle}
      placeholder="Name der Aufgabe"
      className="w-full"
    />

    <NumberKeypadField
      label="🪙 Coins"
      value={Number(newTaskCoins) || 0}
      setter={setNewTaskCoins}
      showEuro
    />

    <select
      value={newTaskRepeat}
      onChange={(e) => setNewTaskRepeat(e.target.value as Repeat)}
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      <option value="täglich">Täglich</option>
      <option value="einmalig">Einmalig</option>
      <option value="wöchentlich">Wöchentlich</option>
    </select>

    {newTaskRepeat === "einmalig" && (
      <select
        value={newTaskDeadline}
        onChange={(e) =>
          setNewTaskDeadline(
            e.target.value as
              | "today"
              | "tomorrow"
              | "threeDays"
              | "sevenDays"
          )
        }
        className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
      >
        <option value="today">Frist: Heute</option>
        <option value="tomorrow">Frist: Morgen</option>
        <option value="threeDays">Frist: In 3 Tagen</option>
        <option value="sevenDays">Frist: In 7 Tagen</option>
      </select>
    )}

    <select
      value={newTaskDay}
      onChange={(e) => setNewTaskDay(e.target.value)}
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      {days.map((d) => (
        <option key={d}>{d}</option>
      ))}
    </select>

    <select
      value={String(newTaskTarget)}
      onChange={(e) =>
        setNewTaskTarget(
          e.target.value === "all"
            ? "all"
            : Number(e.target.value)
        )
      }
      className="w-full rounded-[1.35rem] border bg-white p-3 font-bold"
    >
      <option value="all">Für alle Kinder</option>

      {children.map((c) => (
        <option key={c.id} value={c.id}>
          Nur für {c.name}
        </option>
      ))}
    </select>
  </div>
)}
  </div>

  <button
    type="button"
    onClick={() => {
      setNewTaskTitle("");
      setNewTaskCoins(0);
      setNewTaskRepeat("täglich");
      setNewTaskTarget("all");
      setNewTaskDay("Mo");
      setSelectedPreset("");
      setUsePresetTask(false);
      setUseCustomTask(true);
      setNewTaskDeadline("today");
    }}
    className="rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
  >
    🗑️ Leeren
  </button>

  <button
    onClick={saveTask}
    className="rounded-[1.35rem] bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 px-4 py-3 font-black text-white shadow-[0_10px_25px_rgba(16,185,129,.25)] hover:scale-[1.02] active:scale-[.98] transition"
  >
    {editingTaskId ? "Änderung speichern" : "Aufgabe hinzufügen"}
  </button>
</div>

                    <div className="mt-5 rounded-[1.8rem] border-[3px] border-sky-100 bg-sky-50/80 p-4">
                      <h3 className="text-xl font-black text-sky-950">⚡ Aufgabenpakete</h3>
                      <p className="mt-1 font-bold text-sky-700">Füge mehrere passende Aufgaben auf einmal hinzu. Das aktuell gewählte Zielkind oben wird übernommen.</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select value={selectedTaskPack} onChange={e => setSelectedTaskPack(e.target.value)} className="w-full rounded-[1.35rem] border bg-white p-3 font-bold">
                          {taskPacks.map((pack) => (
                            <option key={pack.id} value={pack.id}>{pack.title} · {pack.description}</option>
                          ))}
                        </select>
                        <button onClick={addTaskPack} className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-4 py-3 font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.22)]">Paket hinzufügen</button>
                      </div>
                    </div>
                  </Panel>

<Panel title="📝 Aufgabenverwaltung">

<div className="mb-5 flex flex-wrap gap-2">

{["alle","wartet","offen","erledigt","verpasst"].map(status=>(

<button
key={status}
onClick={()=>setParentTaskFilter(status as any)}
className={`rounded-full px-4 py-2 font-black ${
parentTaskFilter===status
? "bg-sky-500 text-white"
: "bg-slate-100 text-slate-700"
}`}
>

{status==="alle" && "📋 Alle"}
{status==="wartet" && "🔔 Zu bestätigen"}
{status==="offen" && "📝 Offen"}
{status==="erledigt" && "✅ Erledigt"}
{status==="verpasst" && "🔴 Verpasst"}

</button>

))}
<div className="mt-4 rounded-[1.8rem] bg-gradient-to-br from-yellow-100 via-sky-100 to-emerald-100 p-4 shadow-lg">
  <p className="mb-3 text-sm font-black text-sky-800">
    👧 Aufgaben nach Kind filtern
  </p>

  <select
    value={String(parentTaskChildFilter)}
    onChange={(e) =>
      setParentTaskChildFilter(
        e.target.value === "all" ? "all" : Number(e.target.value)
      )
    }
    className="w-full rounded-[1.4rem] border-2 border-white bg-white/90 p-4 text-lg font-black text-sky-900 shadow-inner"
  >
    <option value="all">🌈 Alle Kinder anzeigen</option>
    {children.map((childItem) => (
      <option key={childItem.id} value={childItem.id}>
        👧 Nur {childItem.name}
      </option>
    ))}
  </select>
</div>
</div>
{[
{
title:"🔔 Zu bestätigen",
status:"wartet"
},
{
title:"📝 Offene Aufgaben",
status:"offen"
},
{
title:"✅ Erledigt",
status:"erledigt"
},
{
title:"🔴 Verpasst",
status:"verpasst"
}
]
.filter(
group=>
parentTaskFilter==="alle" ||
group.status===parentTaskFilter
)
.map(group=>{

const filteredTasks = tasks.filter(t => {
  if (parentTaskChildFilter !== "all" && t.childId !== parentTaskChildFilter) {
    return false;
  }

  if (t.status !== group.status) return false;

  if (t.status === "offen") {
    return isTaskForToday(t);
  }

  if (t.status === "erledigt") {
    if (!t.completedAt) return true;

    return (
      Date.now() - t.completedAt <=
      48 * 60 * 60 * 1000
    );
  }

  return true;
});

if(!filteredTasks.length)
return null;

return(

<div
key={group.status}
className="mb-8"
>

<h3 className="mb-4 text-xl font-black">

{group.title}

</h3>


<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{filteredTasks.map(task=>(

<div
key={task.id}
className={`rounded-[1.5rem] border-2 p-4 shadow-md

${
task.status==="wartet"
? "bg-yellow-50 border-yellow-200"

: task.status==="offen"
? "bg-orange-50 border-orange-200"

: task.status==="verpasst"
? "bg-red-50 border-red-200"
: "bg-green-50 border-green-200"
}
`}
>

<h3 className="text-lg font-black text-sky-950">
{task.title}
</h3>

<p className="mt-1 text-sm font-bold text-sky-700">

🪙 {task.coins}
· {task.day}
· {task.repeat}

</p>
<p className="mt-2 font-black text-blue-700">
  👶 {
    children.find(c => c.id === task.childId)?.name || "Kind"
  }
</p>
{task.status === "wartet" && task.submittedAt && (
  <p className="mt-2 rounded-xl bg-yellow-100 px-3 py-2 text-sm font-black text-yellow-800">
    ⏰ Erledigt am{" "}
    {new Date(task.submittedAt).toLocaleDateString("de-DE")} um{" "}
    {new Date(task.submittedAt).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })}{" "}
    Uhr
  </p>
)}

{task.status==="wartet" && (

<div className="mt-4 flex gap-2">

<button
onClick={()=> approveTask(task)}
className="flex-1 rounded-[1rem] bg-green-300 py-2 font-black text-green-900"
>
✅ Bestätigen
</button>

<button
onClick={()=>rejectTask(task.id)}
className="flex-1 rounded-[1rem] bg-red-300 py-2 font-black text-red-900"
>
❌ Ablehnen
</button>

</div>

)}

{task.status==="offen" && (

<div className="mt-4 rounded-[1rem] bg-orange-200 py-2 text-center font-black text-orange-900">

📝 Offen

</div>

)}
{task.status==="verpasst" && (
  <div className="mt-4 rounded-[1rem] bg-red-200 py-2 text-center font-black text-red-900">
    🔴 Aufgabe nicht erfüllt
  </div>
)}
{task.status==="erledigt" && (

<div className="mt-4 rounded-[1rem] bg-green-200 py-2 text-center font-black text-green-900">

✅ Erledigt

</div>

)}

</div>

))}

</div>

</div>

)

})}

</Panel>
                </section>
              )}

              {parentView === "rewards" && (
                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel title={editingRewardId ? "✏️ Belohnung bearbeiten" : "🎁 Belohnung anlegen"}>
                    <p className="mb-4 font-bold text-sky-700">Belohnungen können nur Eltern anlegen, bearbeiten und löschen.</p>
                    <div className="grid gap-3">
                      <AppInput
  value={newRewardTitle}
  onChange={setNewRewardTitle}
  placeholder="Belohnung, z. B. Eis essen gehen, ins Kino gehen, etc."
  className="w-full"
/>
<NumberKeypadField
  label="🪙 Coins"
  value={Number(newRewardCoins) || 0}
  setter={setNewRewardCoins}
  showEuro
/>

   <button
  type="button"
  onClick={() => {
    setNewRewardTitle("");
    setNewRewardCoins(0);
  }}
  className="rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
>
  🗑️ Leeren
</button>                 
                    
                    <button onClick={saveReward} className="rounded-[1.35rem] bg-purple-500 px-4 py-3 font-black text-white">{editingRewardId ? "Änderung speichern" : "Belohnung hinzufügen"}</button></div>
                  </Panel>

                  <Panel title="🔐 Einlösungen & Belohnungsliste">
                    <div className="mb-5">
                      <h3 className="mb-3 text-xl font-black text-sky-950">Einlöse-Anfragen</h3>
                      {waitingRewards.length === 0 && <p className="font-bold text-sky-700">Keine offenen Einlösungen.</p>}
                      {waitingRewards.map(r => (
  <div key={r.id} className="mb-3 rounded-[1.8rem] bg-yellow-50 p-4">
    <p className="font-black text-sky-950">
      {r.icon} {r.title}
    </p>

    <p className="font-bold text-sky-700">
      {r.coins} Coins
    </p>

    {r.requestedAt && (
      <p className="mt-2 rounded-xl bg-yellow-100 px-3 py-2 text-sm font-black text-yellow-800">
        ⏰ Angefragt am {formatDateTime(r.requestedAt)}
      </p>
    )}

    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        onClick={() => approveReward(r)}
        className="rounded-[1.35rem] bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 p-3 font-black text-white"
      >
        Freigeben
      </button>

      <button
        onClick={() => rejectReward(r.id)}
        className="rounded-[1.35rem] bg-red-400 p-3 font-black text-white"
      >
        Ablehnen
      </button>
    </div>
  </div>
))}
                    </div>

                    <div className="grid gap-2">
                      {rewards.map(r => (
                        <div key={r.id} className="rounded-[1.35rem] bg-white p-3 border flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div><p className="font-black text-sky-950">{r.icon} {r.title}</p><p className="text-sm font-bold text-sky-700">{r.coins} Coins · {r.status}</p></div>
                          <div className="flex gap-2"><button onClick={() => editReward(r)} className="rounded-xl bg-blue-100 p-2 text-sky-700"><Edit3 className="h-4 w-4"/></button><button onClick={() => deleteReward(r.id)} className="rounded-xl bg-red-100 p-2 text-red-700"><Trash2 className="h-4 w-4"/></button></div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </section>
              )}

              
              {parentView === "shop" && (
                <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                  <Panel title={editingShopId ? "✏️ Shop-Produkt bearbeiten" : "🛒 Shop-Produkt anlegen"}>
                    <p className="mb-4 font-bold text-sky-700">
                      Eltern legen hier den kompletten Shop an. Der Kinderbereich zeigt nur diese Produkte.
                    </p>

                    <div className="grid gap-3">
<AppInput
  value={newShopTitle}
  onChange={setNewShopTitle}
  placeholder="Produkt, z. B. Nintendo Spiel – Mario Kart"
  className="w-full"
/>
<NumberKeypadField
  label="🪙 Coins"
  value={Number(newShopPrice) || 0}
  setter={setNewShopPrice}
  showEuro
/>

<div className="w-full rounded-[1.8rem] border-[3px] border-sky-100 bg-white/90 p-4 pl-6 text-left text-2xl font-black shadow-inner">
  🛒
</div>

<AppTextarea
  value={newShopDescription}
  onChange={setNewShopDescription}
  placeholder="Beschreibung, z. B. Mario Kart"
  className="w-full"
/>
<button
  type="button"
  onClick={() => {
    setNewShopTitle("");
    setNewShopPrice(0);
    setNewShopIcon("🎁");
    setNewShopDescription("");
  }}
  className="rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
>
  🗑️ Leeren
</button>
                      <button
                        onClick={saveShopItem}
                        className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-4 py-4 text-xl font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.22)]"
                      >
                        {editingShopId ? "Shop-Produkt speichern" : "+ Shop-Produkt hinzufügen"}
                      </button>

                      {editingShopId && (
                        <button
                          onClick={() => {
                            setEditingShopId(null);
                            setNewShopTitle("");
                            setNewShopPrice(100);
                            setNewShopIcon("🎁");
                            setNewShopDescription("");
                          }}
                          className="rounded-[1.35rem] bg-slate-100 px-4 py-3 font-black text-slate-700"
                        >
                          Bearbeitung abbrechen
                        </button>
                      )}
                    </div>
                  </Panel>

                  <Panel title="🛍️ Aktueller Familien-Shop">
                    {shop.length === 0 ? (
                      <p className="font-bold text-sky-700">Noch keine Shop-Produkte angelegt.</p>
                    ) : (
                      <div className="grid gap-3">
                        {shop.map(item => (
                          <div key={item.id} className="rounded-[1.8rem] bg-white p-4 shadow-sm border">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-xl font-black text-sky-950">{item.icon} {item.title}</p>
                                <p className="font-bold text-sky-700">🪙 {item.price} Coins</p>
                                {item.description && <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p>}
                                <p className="mt-1 text-xs font-black text-emerald-700">
                                  Eingelöst von: {item.ownedBy.length} Kind(er)
                                </p>
                                {item.boughtAt && (
  <p className="mt-2 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
    ⏰ Zuletzt eingelöst am {formatDateTime(item.boughtAt)}
  </p>
)}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => editShopItem(item)}
                                  className="rounded-xl bg-blue-100 p-3 text-sky-700"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteShopItem(item.id)}
                                  className="rounded-xl bg-red-100 p-3 text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                </section>
              )}

              {parentView === "chests" && (
                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel title="💎 Schatzkiste anlegen">
                    <p className="mb-4 font-bold text-sky-700">
                      Eltern bestimmen hier genau, was in der Schatzkiste enthalten ist.
                    </p>
                    <div className="grid gap-3">
<AppInput
  value={newChestTitle}
  onChange={setNewChestTitle}
  placeholder="Name der Schatzkiste, z. B. Überraschung"
  className="w-full"
/>
<NumberKeypadField
  label="🪙 Coins"
  value={Number(newChestPrice) || 0}
  setter={setNewChestPrice}
  showEuro
/>

<select
  value={newChestTier}
  onChange={e => setNewChestTier(e.target.value as "Bronze" | "Silber" | "Gold")}
  className="w-full rounded-[1.8rem] border-[3px] border-sky-100 bg-white/90 p-4 shadow-inner text-base font-black outline-none"
>
  <option className="text-sm" value="Bronze">
    Bronze
  </option>

  <option className="text-sm" value="Silber">
    Silber
  </option>

  <option className="text-sm" value="Gold">
    Gold
  </option>
</select>
<AppTextarea
  value={newChestContent}
  onChange={setNewChestContent}
  placeholder="Was ist drin? z. B. Du darfst heute ein Eis aussuchen."
  className="w-full"
/>
                      <button
  type="button"
  onClick={() => {
    setNewChestTitle("");
    setNewChestPrice(0);
    setNewChestContent("");
    setNewChestTier("Bronze");
  }}
  className="rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
>
  🗑️ Leeren
</button>
                      <button onClick={addChest} className="rounded-[1.35rem] bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-300 px-4 py-3 font-black text-amber-950 shadow-[0_10px_25px_rgba(245,158,11,.25)] hover:scale-[1.02] active:scale-[.98] transition">
                        Schatzkiste speichern
                      </button>
                    </div>
                  </Panel>

                  <Panel title="💎
                 Schatzkisten verwalten">
                    <div className="grid gap-3">
                      {chests.map((chest) => (
                        <div key={chest.id} className="rounded-[1.8rem] border-[3px] border-white bg-white/90 p-4 shadow-[0_25px_70px_rgba(14,165,233,.18)]">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="text-xl font-black text-sky-950">{chest.title}</h3>
                              <p className="font-bold text-sky-700">{chest.tier} · {chest.price} Coins</p>
                              <p className="mt-2 rounded-[1.35rem] bg-yellow-50 p-3 font-bold text-amber-800">{chest.content}</p>
                              {chest.openedAt && (
  <p className="mt-2 rounded-xl bg-yellow-100 px-3 py-2 text-xs font-black text-yellow-800">
    ⏰ Geöffnet am {formatDateTime(chest.openedAt)}
  </p>
)}
                            </div>
                            <button onClick={() => deleteChest(chest.id)} className="rounded-xl bg-red-100 p-3 text-red-700">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </section>
              )}
{parentView === "calendar" && (
  <Panel title="📅 Wochenplan">
    <div className="grid gap-5">

      <div className="rounded-[2rem] bg-gradient-to-br from-sky-100 via-cyan-50 to-white p-5 shadow-sm ring-1 ring-sky-100">
        <p className="text-2xl font-black text-sky-950">
          📅 Wochenübersicht
        </p>

        <p className="mt-2 font-bold text-sky-700">
          Hier sehen Eltern alle geplanten Aufgaben der Woche auf einen Blick.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7">
        {days.map(day => {
          const dayTasks = tasks.filter(
            t =>
              t.day === day ||
              (t.repeat === "täglich" &&
                ["Mo", "Di", "Mi", "Do", "Fr"].includes(day))
          );
const todayShort = currentDateTime.toLocaleDateString("de-DE", {
  weekday: "short",
}).replace(".", "");

const isToday = day === todayShort;
          const doneCount = dayTasks.filter(
            t => t.status === "erledigt"
          ).length;

          return (
            <div
              key={day}
              className={`min-h-[150px] rounded-[1.3rem] border-2 p-3 shadow-md ${
  isToday
    ? "border-green-300 bg-green-100"
    : "border-white bg-white/95"
}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 text-xs font-black text-white shadow-sm">
                  {day}
                </div>

                <div className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-700">
                  {doneCount}/{dayTasks.length}
                </div>
              </div>

              {dayTasks.length === 0 ? (
                <div className="rounded-[1.3rem] bg-slate-50 p-3 text-sm font-bold text-slate-400">
                  Keine Aufgaben
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dayTasks.slice(0, 5).map(t => (
                    <div
                      key={`${day}-${t.id}`}
                      className={`rounded-[0.9rem] p-2 text-[11px] font-black shadow-sm ${
                        t.status === "erledigt"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "wartet"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-sky-50 text-sky-800"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span>
                          {t.status === "erledigt"
                            ? "✅"
                            : t.status === "wartet"
                            ? "⏳"
                            : "📝"}
                        </span>

                        <span className="leading-snug">
                          {t.title}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[10px] font-black opacity-70">
                        🪙 {t.coins} Coins
                      </p>
                    </div>
                  ))}

                  {dayTasks.length > 5 && (
                    <div className="rounded-[1.2rem] bg-purple-50 p-2 text-center text-xs font-black text-purple-700">
                      +{dayTasks.length - 5} weitere Aufgaben
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  </Panel>
)}
{parentView === "family" && (
  <section className="grid gap-5 lg:grid-cols-2">
    <Panel title="👨‍👩‍👧 Familie">
      <p className="mb-4 font-bold text-sky-700">
        Hier siehst du alle Kinderprofile deiner Familie.
      </p>

      <div className="grid gap-3">
        {children.length === 0 ? (
          <EmptyState
            icon="👧"
            title="Noch keine Kinder angelegt"
            text="Lege zuerst ein Kind im Bereich Kinder an."
          />
        ) : (
          children.map((childItem) => (
            <div
              key={childItem.id}
              className="rounded-[1.5rem] bg-gradient-to-br from-yellow-100 via-sky-100 to-emerald-100 p-4 shadow-md"
            >
              <h3 className="text-xl font-black text-sky-950">
                👧 {childItem.name}
              </h3>

              <p className="mt-2 font-bold text-sky-700">
                Alter: {childItem.age || "nicht angegeben"}
              </p>

              <p className="font-bold text-sky-700">
                Lieblingsfarbe: {childItem.favoriteColor || "nicht angegeben"}
              </p>

              <p className="font-bold text-sky-700">
                Lieblingstier: {childItem.favoriteAnimal || "nicht angegeben"}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-[1rem] bg-white/80 p-3 text-center font-black text-amber-700">
                  🪙 {childItem.coins}
                </div>

                <div className="rounded-[1rem] bg-white/80 p-3 text-center font-black text-sky-700">
                  ⭐ Level {childItem.level}
                </div>

                <div className="rounded-[1rem] bg-white/80 p-3 text-center font-black text-orange-700">
                  🔥 {childItem.streak}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  </section>
)}
              {parentView === "profile" && (
                <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                  <Panel title="👤 Eltern-Profil">
                    <div className="rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border-[3px] border-white bg-white/90 p-5 shadow-[0_14px_40px_rgba(37,99,235,.10)]">
                      <div className="flex items-center gap-4">
                        <div className="animate-floaty punktly-float grid h-16 w-16 place-items-center rounded-[1.8rem] bg-blue-100 text-3xl">👨‍👩‍👧</div>
                        <div>
                          <h3 className="text-2xl font-black text-sky-950">
                            {parentDisplayName || firebaseUser?.displayName || "Elternkonto"}
                          </h3>
                          <p className="font-bold text-sky-700">{firebaseUser?.email || "Nicht eingeloggt"}</p>
                          <p className="mt-1 font-black text-emerald-700">
                            {hasPaid ? "✅ PunktlyCoinly Premium freigeschaltet" : "🔒 Noch nicht freigeschaltet"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={logoutGoogle}
                        className="mt-5 w-full rounded-[1.35rem] bg-red-100 px-4 py-3 font-black text-red-700"
                      >
                        Google Logout
                      </button>
<br />
<br />
<div className="rounded-[1.5rem] bg-yellow-50 p-4 shadow-sm ring-1 ring-yellow-200">
  <p className="mb-3 font-black text-yellow-800">
    🪙 Coins verwalten
  </p>

  <p className="mb-4 text-sm font-bold text-yellow-700">
    Eltern können hier alle Kinder-Coins auf einen gewünschten Wert setzen.
  </p>

<select
  value={coinsTargetChild}
  onChange={(e) =>
    setCoinsTargetChild(e.target.value)
  }
  className="mb-3 w-full rounded-[1.5rem] border-[3px] border-yellow-200 bg-white p-4 font-black"
>

  <option value="all">
    👨‍👩‍👧 Alle Kinder
  </option>

  {children.map(c => (
    <option
      key={c.id}
      value={c.id}
    >
      🧒 {c.name}
    </option>
  ))}

</select>

  <NumberKeypadField
    label="🪙 Coins setzen"
    value={resetCoinsValue}
    setter={setResetCoinsValue}
  />

  <button
    type="button"
    onClick={() => setShowCoinResetModal(true)}
    className="mt-3 w-full rounded-[1.5rem] bg-yellow-400 px-4 py-4 font-black text-yellow-950 shadow-md"
  >
    🧹 Coins auf {resetCoinsValue} setzen
  </button>
</div>

<br />
<br />

<button
  type="button"
  onClick={resetFamilyContent}
  className="w-full rounded-[1.5rem] bg-red-500 px-4 py-4 font-black text-white"
>
  🗑️ Kinder & Inhalte zurücksetzen
</button>
                    </div>
                    <button
  type="button"
  onClick={deleteCompleteAccount}
  className="w-full rounded-[1.5rem] border-2 border-red-200 bg-red-50 p-4 text-left font-black text-red-700 shadow-sm transition hover:scale-[1.01]"
>
  🗑️ Konto & alle Daten endgültig löschen
  <p className="mt-1 text-xs font-bold text-red-500">
    Löscht das Benutzerkonto, Kinderprofile, Aufgaben, Fortschritte und Familiendaten dauerhaft.
  </p>
</button>
                  </Panel>

                  <Panel title="🔐 Eltern-PIN & Profil bearbeiten">
                    <p className="mb-4 font-bold text-sky-700">
                      Die Eltern-PIN bleibt gespeichert. Auch wenn du die Seite schließt und wieder öffnest.
                      Wenn Browserdaten gelöscht wurden, wird die PIN aus Firebase wieder geladen.
                    </p>

                    <div className="grid gap-3">
<AppInput
  value={parentDisplayName}
  onChange={setParentDisplayName}
  placeholder="Benutzername, z. B. Mama & Papa"
  className="w-full"
/>

<div
  onClick={() => {
    setNumberKeypadValue(newParentPin || "");
    setNumberKeypadIsPin(true);

setNumberKeypadSetter(() =>
  (value: string) =>
    setNewParentPin(value)
);

    setNumberKeypadOpen(true);
  }}
  className="w-full cursor-pointer rounded-[1.8rem] border-[3px] border-sky-100 bg-white/90 p-4 text-center font-bold shadow-inner"
>
  {newParentPin
    ? "●".repeat(newParentPin.length)
    : (savedParentPin
      ? "Neue Eltern-PIN setzen (optional)"
      : "Eltern-PIN erstellen")}
</div>

                      <div className="rounded-[1.8rem] bg-amber-50 p-4">
                        <p className="mb-3 font-black text-amber-900">🔐 Sicherheitsabfrage für PIN-Reset</p>

<AppInput
  value={parentSecurityQuestion}
  onChange={setParentSecurityQuestion}
  placeholder="Sicherheitsfrage, z. B. Wie heißt dein erstes Kind?"
  className="mb-3 w-full"
/>

<AppInput
  value={parentSecurityAnswer}
  onChange={setParentSecurityAnswer}
  placeholder="Antwort für PIN-Reset"
  className="w-full"
/>

                        <p className="mt-3 text-sm font-bold text-amber-700">
                          Diese Sicherheitsabfrage kann nur hier im geöffneten Elternbereich geändert werden.
                        </p>
                      </div>{editingChildId ? "✏️ Kind ändern" : "+ Kind hinzufügen"}
                      <div className="rounded-[1.35rem] bg-sky-50 p-4 font-bold text-sky-800">
                        Aktueller PIN-Status: {savedParentPin ? "✅ PIN gespeichert" : "❌ Noch keine PIN gespeichert"}
                        <br />
                        Sicherheitsfrage: {parentSecurityQuestion ? "✅ angelegt" : "❌ noch nicht angelegt"}
                      </div>

                      <button
                        onClick={saveParentProfile}
                        className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 px-4 py-4 text-xl font-black text-white shadow-[0_12px_30px_rgba(37,99,235,.22)]"
                      >
                        Eltern-Profil speichern
                      </button>
                    </div>
                  </Panel>
                </section>
              )}

{parentView === "settings" && (
                <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                  <Panel title={editingChildId ? "✏️ Kind bearbeiten" : "👶 Kind anlegen"}>
                    <p className="mb-4 font-bold text-sky-700">
                      Lege hier die Kinder deiner Familie an. Jedes Kind bekommt eigene Coins, XP, Level und Serien.
                    </p>

                    <div className="grid gap-3">
<AppInput
  value={newChildName}
  onChange={setNewChildName}
  placeholder="👶 Nick- oder Fantasienamen für Kinder, z. B. Leofuchs, LunaNi, EmaStar, etc."
  className="w-full text-lg"
/>
<input
  value={newChildAge}
  readOnly
  onClick={() =>
    openNumberKeypad(
      Number(newChildAge || 0),
      (value) => setNewChildAge(String(value))
    )
  }
  placeholder="🎂 Alter"
  className="w-full cursor-pointer rounded-[1.8rem] border-[3px] border-sky-100 bg-white/90 p-4 shadow-inner text-lg font-black text-sky-950 opacity-100"
/>

<AppInput
  value={newChildColor}
  onChange={setNewChildColor}
  placeholder="🎨 Lieblingsfarbe"
  className="w-full text-lg"
/>

<AppInput
  value={newChildAnimal}
  onChange={setNewChildAnimal}
  placeholder="🐾 Lieblingstier"
  className="w-full text-lg"
/>

<button
  onClick={saveChild}
  className="rounded-[1.35rem] bg-gradient-to-br from-emerald-400 via-lime-300 to-green-400 px-4 py-3 font-black text-white"
>
  {editingChildId ? "Änderung speichern" : "+ Kind hinzufügen"}
</button>
                    </div>

                    {children.length === 0 && (
                      <div className="mt-5 rounded-[1.8rem] bg-yellow-50 p-4 font-black text-amber-800">
                        Noch kein Kind angelegt. Lege zuerst ein Kind an, damit der Kinderbereich genutzt werden kann.
                      </div>
                    )}
                  </Panel>

                  <Panel title="👨‍👩‍👧 Kinder verwalten">
                    {children.length === 0 ? (
                      <p className="font-bold text-sky-700">
                        Noch keine Kinder vorhanden.
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {children.map((c) => (
                          <div
                            key={c.id}
                            className={`rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.8rem] border bg-gradient-to-br ${
c.theme === "🦁 Löwe" ? "from-yellow-100 to-orange-200"
: c.theme === "🐬 Delfin" ? "from-sky-100 to-cyan-200"
: c.theme === "🐸 Frosch" ? "from-lime-100 to-emerald-200"
: c.theme === "🦄 Einhorn" ? "from-pink-100 to-purple-200"
: c.theme === "🐯 Tiger" ? "from-orange-100 to-red-200"
: c.theme === "🐼 Panda" ? "from-slate-100 to-gray-300"
: c.theme === "🦜 Papagei" ? "from-green-100 to-yellow-200"
: c.theme === "🐧 Pinguin" ? "from-blue-100 to-indigo-200"
: "from-pink-100 to-purple-200"
                            } p-5 shadow-sm`}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-4">
                                <Coin className="h-16 w-16" />
                                <div>
                                  <h3 className="text-2xl font-black text-sky-950">{c.name}</h3>
                                  <p className="font-bold text-sky-700">
                                    Level {c.level} · Sterne {starsFromAchievements(c)} · {levelRank(c.level).emoji} {levelRank(c.level).title} · {c.coins} Coins · 🔥 {c.streak} Tage
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedChildId(c.id)}
                                className={`rounded-[1.35rem] px-4 py-3 font-black ${
                                  selectedChildId === c.id
                                    ? "bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 text-white"
                                    : "bg-white text-sky-700"
                                }`}
                              >
                                {selectedChildId === c.id ? "Ausgewählt" : "Auswählen"}
                              </button>
                              <button
  onClick={() => editChild(c)}
  className="rounded-[1.35rem] bg-yellow-300 px-4 py-3 font-black text-yellow-900"
>
  ✏️ Bearbeiten
</button>

<button
  onClick={() => deleteChild(c.id)}
  className="rounded-[1.35rem] bg-red-400 px-4 py-3 font-black text-white"
>
  🗑️ Löschen
</button>
                            </div>

                            <div className="mt-4">
                              <h4 className="mb-2 font-black text-sky-950">Kinder-Farbe</h4>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {(["🦁 Löwe","🐬 Delfin","🐸 Frosch","🦄 Einhorn","🐯 Tiger","🐼 Panda","🦜 Papagei","🐧 Pinguin"] as Theme[]).map(t => (
                                  <button
                                    key={t}
                                    onClick={() => {
                                      const updatedChild = {
  ...c,
  theme: t,
};


setSelectedChildId(c.id);

setChildren(prev =>
  prev.map(childItem =>
    childItem.id === c.id ? updatedChild : childItem
  )
);

saveFamilyItem("children", updatedChild);
                                    }}
                                    className={`rounded-[1.35rem] p-3 font-black ${
                                      c.theme === t ? "bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 text-white" : "bg-white/80 text-sky-800"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                </section>
              )}
            </div>
          </>
        )}
      </div>
      {activeLearningTask && (
  <div className="fixed inset-0 z-[9000] flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-indigo-100 p-8 text-center">

    <div className="rounded-[3rem] bg-white/90 p-10 shadow-[0_30px_100px_rgba(14,165,233,.25)]">

      <h1 className="text-5xl font-black text-sky-950">
        📚 Lernzeit
      </h1>

      <p className="mt-4 text-2xl font-black text-sky-700">
        {activeLearningTask.title}
      </p>
{activeLearningTask.category === "📚 Lesen" ? (() => {

const readingText = activeReadingText;

return (
<div className="mt-6 rounded-[2rem] bg-yellow-50 p-6 text-left shadow-inner">

<h2 className="mb-4 text-2xl font-black text-orange-600">
📖 {readingText?.title || "Lesetext"}
</h2>

<p className="text-lg font-bold leading-9 text-slate-700">
{readingText?.text || "Kein passender Text gefunden"}
</p>

</div>
);

})()

: String(activeLearningTask.category || "").includes("Mathe")
&& activeMathTask
? (() => {

const currentQuestion =
activeMathTask.questions?.[mathStep];

return (

<div className="mt-6 rounded-[2rem] bg-blue-50 p-6 text-left shadow-inner">

<h2 className="mb-4 text-2xl font-black text-blue-600">
➕ {activeMathTask.title}
</h2>

<p className="text-lg font-bold leading-9 text-slate-700">
{activeMathTask.text}
</p>

<div className="mt-6 rounded-[1.5rem] bg-white p-5 text-center">

<p className="text-sm font-black text-blue-400">
Aufgabe {mathStep + 1} / 10
</p>

<p className="mt-3 text-4xl font-black text-blue-800">
{currentQuestion?.question}
</p>

</div>

<div className="mt-5 grid gap-3">

{currentQuestion?.answers.map((answer:string)=>(

<button
key={answer}
onClick={()=>{

if(answer===currentQuestion.correctAnswer){

if (mathStep >= 9) {

const updatedTask = {
  ...activeLearningTask,
  status: "wartet",
  submittedAt: Date.now(),
};

  setLearningTasks(prev =>
    prev.map(task =>
      task.id === activeLearningTask.id
        ? updatedTask
        : task
    )
  );

  saveFamilyItem("learningTasks", updatedTask);

  setActiveLearningTask(null);
  setActiveMathTask(null);
  setMathStep(0);

  celebrate(
    "🎉 Alle 10 Aufgaben geschafft!\n\nWartet auf Elternbestätigung."
  );

  return;
}

setMathStep(prev=>prev+1);

celebrate("✅ Richtig");

}else{

const newMath =
getMathTask(activeLearningTask.level);

if(newMath){

setActiveMathTask(newMath);

setMathStep(0);

}

celebrate("❌ Falsch → neue Aufgaben");
}

}}
className="rounded-[1.5rem] bg-blue-100 p-4 text-xl font-black"
>
{answer}
</button>

))}

</div>

</div>

);

})()

: (

<p className="mt-6 text-lg font-bold text-sky-700">
Bitte konzentriert lernen 😄
</p>

)}
      <div className="mt-8 text-7xl font-black text-indigo-600">
        {Math.floor(learningTimeLeft / 60)}:
        {(learningTimeLeft % 60).toString().padStart(2, "0")}
      </div>

      <div className="mt-8 grid gap-4">
<div
  onClick={() => {
setNumberKeypadValue(learningPinInput || "");
setNumberKeypadIsPin(true);
setNumberKeypadSetter(() =>
  (value: string) =>
    setLearningPinInput(value)
);
    setNumberKeypadOpen(true);
  }}
  className="mx-auto w-40 cursor-pointer rounded-[1.5rem] border-2 border-sky-100 bg-white p-4 text-center text-3xl font-black tracking-[0.5rem] shadow-inner"
>
  {learningPinInput
    ? "●".repeat(learningPinInput.length)
    : "🔐 PIN"}
</div>
<button
onClick={async () => {
  const learningPinHash = await hashPin(learningPinInput.trim());

  if (learningPinHash === savedParentPin || learningPinInput.trim() === savedParentPin) {
    setActiveLearningTask(null);
    setActiveReadingText(null);
    setLearningPinInput("");
    celebrate("🔓 Lernzeit wurde von den Eltern beendet.");
  } else {
    celebrate("❌ Falscher PIN");
  }
}}
  className="rounded-[1.5rem] bg-gradient-to-r from-pink-400 to-red-400 px-6 py-4 text-xl font-black text-white shadow-xl"
>
  🔓 Lernzeit beenden
</button>

      </div>

    </div>

  </div>
)}
{showCoinResetModal && (

<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">

<div className="w-[92%] max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">

<h2 className="text-2xl font-black text-sky-950">
🪙 Coins ändern
</h2>

<p className="mt-4 text-lg font-bold text-slate-700">

{coinsTargetChild==="all"
? `Alle Kinder wirklich auf ${resetCoinsValue} Coins setzen?`
: `Dieses Kind wirklich auf ${resetCoinsValue} Coins setzen?`
}

</p>

<div className="mt-6 grid grid-cols-1 gap-3 grid-cols-1 sm:grid-cols-2">

<button
onClick={() => setShowCoinResetModal(false)}
className="rounded-[1.4rem] bg-slate-100 py-3 font-black"
>
❌ Abbrechen
</button>

<button
onClick={async()=>{

await resetAllChildrenCoins();

setShowCoinResetModal(false);

}}
className="rounded-[1.4rem] bg-gradient-to-r from-yellow-400 via-orange-300 to-amber-400 py-3 font-black text-white"
>
✅ Bestätigen
</button>

</div>

</div>

</div>

)}
    </main>
    
      );
}

function ChildTabs({
  view,
  setView,
  taskBadge = 0,
  learningBadge = 0,
  bonusBadge = 0,
}: {
  view: ChildView;
  setView: (v: ChildView) => void;
  taskBadge?: number;
  learningBadge?: number;
  bonusBadge?: number;
}) {
  return (
    <nav className="rounded-[1.2rem] border-2 border-white bg-white/90 p-1.5 shadow-md backdrop-blur-xl">
      <div className="flex gap-1 overflow-x-auto punktly-scrollbar-none">
        <Tab active={view === "home"} onClick={() => setView("home")} icon={<Home />} label="Start" />
        <Tab active={view === "tasks"} onClick={() => setView("tasks")} icon={<ListChecks />} label="Aufgaben" badge={taskBadge} />
        <Tab active={view === "learning"} onClick={() => setView("learning")} icon={<BookOpen />} label="Lernen" badge={learningBadge} />
        <Tab active={view === "rewards"} onClick={() => setView("rewards")} icon={<Gift />} label="Belohnung" />
        <Tab active={view === "chests"} onClick={() => setView("chests")} icon={<Trophy />} label="Kisten" />
        <Tab active={view === "shop"} onClick={() => setView("shop")} icon={<ShoppingBag />} label="Shop" />
        <Tab active={view === "profile"} onClick={() => setView("profile")} icon={<User />} label="Profil" />
        <Tab active={view === "features"} onClick={() => setView("features")} icon={<BookMinusIcon />} label="Bonus" badge={bonusBadge} />
      </div>
    </nav>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
  badge = 0,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative min-w-[76px] shrink-0 rounded-[1.4rem] px-2 py-2 text-center font-black transition active:scale-95 sm:min-w-[86px] sm:px-3 sm:py-2.5 ${
        active
          ? "bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 text-white shadow-md"
          : "text-sky-700 hover:bg-cyan-50"
      }`}
    >
      {badge > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-400 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
          {badge}
        </span>
      )}

      <div className="mx-auto mb-1 flex h-5 w-5 items-center justify-center sm:h-6 sm:w-6">
        {icon}
      </div>

      <div className="truncate text-[10px] leading-tight sm:text-[11px]">
        {label}
      </div>
    </button>
  );
}
function BigNumber({ value, label }: { value: number; label: string }) {
  return <div className="text-center"><div className="text-6xl font-black text-sky-950">{value}</div><div className="mt-2 font-bold text-sky-700">{label}</div></div>;
}

function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return <div><div className="h-4 w-full overflow-hidden rounded-full border border-sky-100 bg-white/90"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 transition-all" style={{ width: `${pct}%` }} /></div><div className="mt-1 text-xs font-black text-sky-700">{pct}% geschafft</div></div>;
}

function StatCard({
  label,
  value,
  icon,
  showCoinly = false,
  motivSrc = "/PunktlyLogo.png",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  showCoinly?: boolean;
  motivSrc?: string;
}) {
  return (
    <div className="rounded-[1.8rem] border-[3px] border-white bg-gradient-to-br from-white to-blue-50/70 p-4 shadow-[0_12px_30px_rgba(37,99,235,.10)]">
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="flex flex-wrap items-end gap-2">
        <p className="text-2xl font-black text-sky-950">{value}</p>
        {showCoinly && <CoinlyLabel motivSrc={motivSrc} />}
      </div>
      <p className="text-sm font-bold text-blue-600">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map = { offen: ["Offen","bg-blue-100 text-sky-800"], wartet: ["Wartet","bg-yellow-100 text-yellow-800"], erledigt: ["Erledigt","bg-emerald-100 text-emerald-800"] } as const;
  return <span className={`rounded-full px-4 py-2 text-sm font-black ${map[status][1]}`}>{map[status][0]}</span>;
}

function StatusBadgeReward({ status }: { status: RewardStatus }) {
  const map = { frei: ["Verfügbar","bg-blue-100 text-sky-800"], wartet: ["Wartet auf Eltern","bg-yellow-100 text-yellow-800"], eingelöst: ["Eingelöst","bg-emerald-100 text-emerald-800"] } as const;
  return <span className={`mt-3 inline-block rounded-full px-4 py-2 text-sm font-black ${map[status][1]}`}>{map[status][0]}</span>;
}
