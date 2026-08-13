"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetIso: string): TimeLeft | null {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export function LaunchCountdown({
  launchAt,
  label = "Drops In"
}: {
  launchAt: string;
  label?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(launchAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(launchAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [launchAt]);

  if (!timeLeft) {
    return <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Available Now</p>;
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds }
  ];

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.45em] text-crimson">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-xl border border-white/10 bg-black/30 px-2 py-3 text-center sm:px-3"
          >
            <p className="font-display text-2xl text-white">{String(unit.value).padStart(2, "0")}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-neutral-400">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
