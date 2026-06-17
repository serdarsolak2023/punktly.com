import type { Child } from "./apptypes";
export function getFoxMood(child: Child, waitingTasks: number) {
  if (child.streak >= 5) return { mood: "party", text: "Wow! Deine Serie ist richtig stark! 🔥" };
  if (child.level >= 3) return { mood: "proud", text: "Du bist schon richtig weit gekommen!" };
  if (waitingTasks > 0) return { mood: "excited", text: "Ich warte mit dir auf die Bestätigung!" };
  if (child.completedCount === 0) return { mood: "sleepy", text: "Lass uns heute mit einer kleinen Aufgabe starten." };
  return { mood: "happy", text: "Heute schaffen wir wieder tolle Sachen!" };
}

export const MAX_LEVEL = 100;

export function xpToNext(level: number) {
  const safeLevel = Math.min(Math.max(level, 1), MAX_LEVEL);
  return Math.max(100, safeLevel * 100);
}

export 
function levelRank(level: number) {
  if (level >= 100) return { title: "Legendär", emoji: "🌟", color: "text-purple-800 bg-purple-100" };
  if (level >= 75) return { title: "Diamant", emoji: "💎", color: "text-cyan-800 bg-cyan-100" };
  if (level >= 50) return { title: "Gold", emoji: "🏆", color: "text-amber-800 bg-amber-100" };
  if (level >= 10) return { title: "Silber", emoji: "🥈", color: "text-slate-800 bg-slate-100" };
  return { title: "Bronze", emoji: "🥉", color: "text-orange-800 bg-orange-100" };
}
export
function isValidAchievement(title: string) {
  const lower = title.toLowerCase();

  // Schatzkisten und eingelöste Belohnungen sind KEINE Abzeichen.
  if (lower.includes("schatzkiste")) return false;
  if (lower.includes("belohnung")) return false;
  if (lower.includes("eingelöst")) return false;
  if (lower.includes("geöffnet")) return false;

  return true;
}
export
function cleanAchievements(list: string[]) {
  return cleanLevelAchievements((list || []).filter(isValidAchievement));
}
export
function cleanLevelAchievements(list: string[]) {
  const levelBadges = list
    .filter((item) => /^Level \d+ erreicht$/.test(item))
    .map((item) => Number(item.match(/\d+/)?.[0] || 0))
    .filter((num) => num > 0);

  const highestLevel = levelBadges.length > 0 ? Math.max(...levelBadges) : null;

  const withoutOldLevels = list.filter((item) => !/^Level \d+ erreicht$/.test(item));

  return highestLevel ? [...withoutOldLevels, `Level ${highestLevel} erreicht`] : withoutOldLevels;
}
export
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
export
function starsFromAchievements(child: Child) {
  return cleanAchievements(child.achievements || []).length;
}
export
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
export
function prestigeFromStars(child: Child) {
  return Math.max(Number(child.prestige || 0), countPrestigeStars(child));
}
export
function syncPrestigeStars(child: Child): Child {
  const syncedPrestige = prestigeFromStars(child);

  return {
    ...child,
    prestige: syncedPrestige,
    prestigeStars: Math.max(Number(child.prestigeStars || 0), countPrestigeStars(child)),
    achievements: cleanAchievements(child.achievements || []),
  };
}