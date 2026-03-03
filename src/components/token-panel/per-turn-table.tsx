"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ViewModelPerTurn } from "@/lib/models";
import { fmtNum } from "@/lib/format";

export function PerTurnTable({ perTurn }: { perTurn: ViewModelPerTurn[] }) {
  if (perTurn.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
        Per-Turn Breakdown
      </h3>
      <ScrollArea className="max-h-[300px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["#", "Fresh", "Out", "Cached"].map((h) => (
                <th
                  key={h}
                  className={`border-b border-border px-1.5 py-1 font-mono text-[11px] uppercase tracking-wider text-dim ${
                    h === "#" ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perTurn.map((t) => (
              <tr key={t.turn} className="hover:text-foreground">
                <td className="px-1.5 py-1 font-mono text-xs text-dim">
                  {t.turn}
                </td>
                <td className="px-1.5 py-1 text-right font-mono text-xs text-muted-foreground">
                  {fmtNum(t.input - t.cached)}
                </td>
                <td className="px-1.5 py-1 text-right font-mono text-xs text-muted-foreground">
                  {fmtNum(t.output)}
                </td>
                <td className="px-1.5 py-1 text-right font-mono text-xs text-dim">
                  {fmtNum(t.cached)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
