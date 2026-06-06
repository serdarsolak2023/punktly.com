export type Area = "start" | "child" | "parent";

export type LegalPage = "impressum" | "datenschutz" | "widerruf" | "agb";

export type ChildView =
  | "home"
  | "tasks"
  | "rewards"
  | "chests"
  | "shop"
  | "profile"
  | "features"
  | "learning";

export type ParentView =
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

export type Repeat = "einmalig" | "täglich" | "wöchentlich";

export type Status = "offen" | "wartet" | "erledigt" | "verpasst";

export type RewardStatus = "frei" | "wartet" | "eingelöst";

export type Theme =
  | "🦁 Löwe"
  | "🐬 Delfin"
  | "🐸 Frosch"
  | "🦄 Einhorn"
  | "🐯 Tiger"
  | "🐼 Panda"
  | "🦜 Papagei"
  | "🐧 Pinguin";

export type TaskPreset = {
  title: string;
  coins: number;
  repeat: Repeat;
  day: string;
  category: string;
};

export type Child = {
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

export type Task = {
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

export type Reward = {
  id: number;
  title: string;
  coins: number;
  icon: string;
  status: RewardStatus;
  requestedAt?: number;
  redeemedAt?: number;
};

export type ShopItem = {
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

export type Challenge = {
  id: number;
  title: string;
  goal: number;
  current: number;
  reward: number;
  done: boolean;
};

export type Chest = {
  id: number;
  title: string;
  price: number;
  tier: "Bronze" | "Silber" | "Gold";
  content: string;
  opened: boolean;
  openedBy?: number;
  openedAt?: number;
};