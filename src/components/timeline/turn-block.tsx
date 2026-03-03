"use client";

import { useState } from "react";
import type { ViewModelTurn } from "@/lib/models";
import { TurnItem } from "./turn-item";

interface TurnBlockProps {
  turn: ViewModelTurn;
  defaultOpen?: boolean;
  animationDelay?: number;
}

export function TurnBlock({
  turn,
  defaultOpen = false,
  animationDelay = 0,
}: TurnBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const itemCount = turn.items.filter((i) => i.type !== "system_event").length;

  return (
    <section
      className="animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className="group flex cursor-pointer items-center gap-4 py-5"
        onClick={() => setOpen(!open)}
      >
        <span className="font-mono text-sm font-semibold text-foreground">
          Turn {turn.index}
        </span>
        <span className="font-mono text-xs text-dim">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        {turn.model && (
          <span className="font-mono text-[11px] text-dim">
            {turn.model}
          </span>
        )}
        <div className="h-px flex-1 bg-border/50" />
        <span
          className={`text-[10px] text-dim transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          &#9656;
        </span>
      </div>
      {open && (
        <div className="divide-y divide-border/20 pb-4">
          {turn.items.map((item, i) => (
            <TurnItem key={i} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
