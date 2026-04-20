"use client";

import { useEffect, useRef, useState } from "react";

type TrainedCounterProps = {
  totalActions: number | null | undefined;
};

export function TrainedCounter({ totalActions }: TrainedCounterProps) {
  const n = totalActions ?? 0;
  const prev = useRef(n);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (n > prev.current) {
      setPulse(true);
      const t = window.setTimeout(() => setPulse(false), 600);
      prev.current = n;
      return () => window.clearTimeout(t);
    }
    prev.current = n;
  }, [n]);

  return (
    <div
      className={`text-[9px] uppercase tracking-[0.25em] tabular-nums transition-colors duration-300 ${
        pulse ? "text-signal-orange" : "text-muted-foreground"
      }`}
    >
      {n} outfits trained
    </div>
  );
}
