"use client";

import type { ViewModelSessionStats } from "@/lib/models";
import { fmtNum } from "@/lib/format";

export function TokenStats({ stats }: { stats: ViewModelSessionStats }) {
  const fresh = stats.inputTokens - stats.cachedTokens;

  const usageRows: [string, string][] = [
    ["Fresh Input", fmtNum(fresh)],
    ["Output", fmtNum(stats.outputTokens)],
    ["Reasoning", fmtNum(stats.reasoningTokens)],
    ["Total", fmtNum(stats.totalTokens)],
  ];

  const cacheRows: [string, string][] = [
    ["Cached", fmtNum(stats.cachedTokens)],
    ["Cache Rate", `${stats.cacheRate}%`],
  ];

  return (
    <>
      <div>
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
          Token Usage
        </h3>
        <div className="space-y-1">
          {usageRows.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between font-mono text-xs"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
          Cache
        </h3>
        <div className="space-y-1">
          {cacheRows.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between font-mono text-xs"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
