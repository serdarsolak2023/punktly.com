"use client";

import type { ReactNode } from "react";

export default function EmptyState({
  icon = "✨",
  title,
  text,
  action,
}: {
  icon?: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border-2 border-dashed border-sky-200 bg-white/80 p-4 text-center shadow-sm sm:p-5">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-2xl">
        {icon}
      </div>

      <h3 className="text-lg font-black text-sky-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-relaxed text-sky-700">
        {text}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}