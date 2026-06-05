"use client";

import type { ReactNode } from "react";

export default function Panel({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.4rem] border-2 border-white bg-white/90 p-3 shadow-[0_14px_40px_rgba(37,99,235,.10)] backdrop-blur-xl sm:p-4 lg:p-5">
      <h2 className="mb-3 text-xl font-black tracking-tight text-sky-950 sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}