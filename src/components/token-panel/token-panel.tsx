"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ViewModel } from "@/lib/models";
import { TokenStats } from "./token-stats";
import { ContextBar } from "./context-bar";
import { PerTurnTable } from "./per-turn-table";
import { TokenChart } from "./token-chart";
import { cwdShort } from "@/lib/format";

export function TokenPanel({
  viewModel,
  open,
  onToggle,
}: {
  viewModel: ViewModel;
  open: boolean;
  onToggle: () => void;
}) {
  const { session, tokens } = viewModel;
  const s = session.stats;

  if (!open) {
    return (
      <aside className="sticky top-[72px] flex max-h-[calc(100vh-72px)] items-start border-l border-border p-2 max-[900px]:hidden">
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-dim transition-colors hover:bg-elevated hover:text-foreground"
          title="Open panel"
        >
          <PanelRightOpen size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sticky top-[72px] max-h-[calc(100vh-72px)] space-y-6 overflow-y-auto border-l border-border p-5 max-[900px]:max-h-none max-[900px]:border-l-0 max-[900px]:border-t">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-dim">
          Tokens
        </h2>
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-dim transition-colors hover:bg-elevated hover:text-foreground max-[900px]:hidden"
          title="Close panel"
        >
          <PanelRightClose size={16} />
        </button>
      </div>
      <TokenStats stats={s} />
      {s.contextWindow && (
        <ContextBar
          inputTokens={s.inputTokens - s.cachedTokens}
          contextWindow={s.contextWindow}
        />
      )}
      <TokenChart perTurn={tokens.perTurn} />
      <PerTurnTable perTurn={tokens.perTurn} />
      <SessionInfo session={session} />
    </aside>
  );
}

function SessionInfo({ session }: { session: ViewModel["session"] }) {
  const rows: [string, string][] = [
    ["ID", session.id.slice(0, 13) + "..."],
    ["Provider", session.modelProvider ?? "\u2014"],
    ["CLI", session.cliVersion ?? "\u2014"],
    ["Source", session.source ?? "\u2014"],
    ["CWD", session.cwd ? cwdShort(session.cwd) : "\u2014"],
  ];

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-dim">
        Session Info
      </h3>
      <div className="space-y-1">
        {rows.map(([label, value]) => (
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
  );
}
