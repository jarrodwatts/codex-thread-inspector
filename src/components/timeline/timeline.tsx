"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewModelTurn } from "@/lib/models";
import { TurnBlock } from "./turn-block";

const BATCH_SIZE = 50;

interface TimelineProps {
  turns: ViewModelTurn[];
}

export function Timeline({ turns }: TimelineProps) {
  const [rendered, setRendered] = useState(Math.min(BATCH_SIZE, turns.length));
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRendered((prev) => Math.min(prev + BATCH_SIZE, turns.length));
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [turns.length]);

  useEffect(() => {
    setRendered(Math.min(BATCH_SIZE, turns.length));
  }, [turns]);

  return (
    <div>
      {turns.slice(0, rendered).map((turn, i) => (
        <TurnBlock
          key={turn.index}
          turn={turn}
          defaultOpen={turn.index === 0}
          animationDelay={(i % BATCH_SIZE) * 30}
        />
      ))}
      {rendered < turns.length && (
        <div ref={sentinelRef} className="h-px" />
      )}
    </div>
  );
}
