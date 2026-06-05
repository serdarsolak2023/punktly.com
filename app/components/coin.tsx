"use client";

import Image from "next/image";

export default function Coin({
  className = "w-7 h-7",
}: {
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src="/PunktlyLogo.png"
        alt="Punktly Logo"
        fill
        sizes="28px"
        className="object-contain drop-shadow-[0_12px_30px_rgba(37,99,235,.22)]"
      />
    </span>
  );
}