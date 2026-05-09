import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punktly",
  description: "Familien-App für Aufgaben, Coins, XP und Belohnungen"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
