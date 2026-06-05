
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#eef9ff',

appleWebApp: {
  capable: true,
  title: "PunktlyCoinly",
  statusBarStyle: "black-translucent",
},
};

export const metadata: Metadata = {
  title: "PunktlyCoinly",
description: "Kinder sammeln durch Aufgaben Punkte und Coins, schalten Belohnungen frei und lernen spielerisch Verantwortung – gemeinsam mit ihren Eltern.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
