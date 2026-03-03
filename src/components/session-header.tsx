"use client";

import type { ViewModelSession } from "@/lib/models";
import { fmtNum } from "@/lib/format";

export function SessionHeader({ session }: { session: ViewModelSession }) {
  const s = session.stats;

  const meta = [
    session.id.slice(0, 8),
    session.modelProvider,
    session.cliVersion ? `v${session.cliVersion}` : null,
    session.git?.branch ? session.git.branch : null,
  ].filter(Boolean) as string[];

  const stats: [string, string][] = [
    ["turns", String(s.turns)],
    ["tools", String(s.toolCalls)],
    ["tokens", fmtNum(s.totalTokens)],
    ["cache", `${s.cacheRate}%`],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-[rgba(9,9,11,0.92)] px-8 py-5 backdrop-blur-xl lg:px-12">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="font-heading text-base font-semibold tracking-widest text-foreground/90">
            THREAD INSPECTOR
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-dim">
            {meta.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-end gap-8">
          {stats.map(([label, value]) => (
            <div key={label} className="text-right">
              <div className="font-mono text-lg font-semibold leading-none text-foreground">
                {value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-dim">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
