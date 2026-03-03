"use client";

import { fmtNum } from "@/lib/format";

export function ContextBar({
  inputTokens,
  contextWindow,
}: {
  inputTokens: number;
  contextWindow: number;
}) {
  const pct = Math.min(100, (inputTokens / contextWindow) * 100);

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
        Context Window
      </h3>
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, var(--color-cyan), ${pct > 80 ? "var(--color-rose)" : "var(--color-cyan)"})`,
            }}
          />
        </div>
        <div className="mt-1.5 font-mono text-xs text-muted-foreground">
          {fmtNum(inputTokens)} / {fmtNum(contextWindow)} ({pct.toFixed(0)}%)
        </div>
      </div>
    </div>
  );
}
