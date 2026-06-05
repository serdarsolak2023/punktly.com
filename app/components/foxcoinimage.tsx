"use client";

import Image from "next/image";

export default function FoxCoinImage({
  className = "h-16 w-16",
}: {
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src="/PunktlyLogo.png"
        alt="Punktly Logo"
        fill
        sizes="64px"
        className="object-contain drop-shadow-xl"
        priority
      />
    </span>
  );
}