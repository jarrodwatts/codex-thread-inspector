"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ViewModelPerTurn } from "@/lib/models";
import { fmtNum } from "@/lib/format";

export function TokenChart({ perTurn }: { perTurn: ViewModelPerTurn[] }) {
  const data = useMemo(() => {
    if (perTurn.length < 2) return null;
    let cumFresh = 0;
    let cumOutput = 0;
    return perTurn.map((t) => {
      cumFresh += t.input - t.cached;
      cumOutput += t.output;
      return {
        turn: t.turn,
        fresh: cumFresh,
        output: cumOutput,
      };
    });
  }, [perTurn]);

  if (!data) return null;

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
        Context Growth
      </h3>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="turn"
              tick={{ fontSize: 10, fill: "#52525b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => fmtNum(v)}
              tick={{ fontSize: 10, fill: "#52525b" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "#111113",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(value, name) => [
                fmtNum(value as number),
                name === "fresh" ? "Fresh Input" : "Output",
              ]}
            />
            <Area
              type="monotone"
              dataKey="fresh"
              stackId="context"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="output"
              stackId="context"
              stroke="#6ee7b7"
              fill="#6ee7b7"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
