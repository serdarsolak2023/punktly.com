export type Coin = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  avatarCoinId: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  status: "offen" | "prüfung" | "erledigt";
  childId: string;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  description: string;
};
