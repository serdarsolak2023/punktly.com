
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punktly",
  description: "Kinderfreundliche Aufgaben-App mit getrenntem Kinder- und Elternbereich.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body>{children}</body></html>;
}
