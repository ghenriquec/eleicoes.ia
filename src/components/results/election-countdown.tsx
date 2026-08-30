"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    minutes: Math.floor((clamped / 60000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export function ElectionCountdown({ target, label }: { target: string; label: string }) {
  const [d, setD] = useState(() => diff(new Date(target)));

  useEffect(() => {
    const id = setInterval(() => setD(diff(new Date(target))), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-taupe-ink">{label}</p>
      <div className="mt-3 flex justify-center gap-3 font-mono text-3xl font-bold tabular-nums text-accent-ink sm:text-4xl">
        <Unit value={d.days} label="dias" />
        <span className="text-border-strong">:</span>
        <Unit value={d.hours} label="h" />
        <span className="text-border-strong">:</span>
        <Unit value={d.minutes} label="min" />
        <span className="text-border-strong">:</span>
        <Unit value={d.seconds} label="s" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center">
      {String(value).padStart(2, "0")}
      <span className="mt-1 font-sans text-[10px] font-normal normal-case text-taupe-ink">{label}</span>
    </span>
  );
}
