"use client";

export default function CoinlyLabel({
  motivSrc,
  text = "Coinly",
}: {
  motivSrc: string;
  text?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 align-middle text-sm font-black text-slate-500">
      <img
        src={motivSrc}
        alt={text}
        className="h-5 w-5 rounded-full object-cover shadow-sm"
        onError={(event) => {
          event.currentTarget.src = "/PunktlyLogo.png";
        }}
      />

      <span>{text}</span>
    </span>
  );
}