import { coins } from "@/lib/demo-data";

export function CoinAvatar({ coinId, size = "lg" }: { coinId: number; size?: "sm" | "lg" }) {
  const coin = coins.find((item) => item.id === coinId) ?? coins[0];
  const classes = size === "lg" ? "h-20 w-20 text-4xl" : "h-12 w-12 text-2xl";
  return (
    <div className={`${classes} ${coin.color} grid place-items-center rounded-full border-4 border-white shadow-soft`} title={coin.name}>
      {coin.emoji}
    </div>
  );
}
