"use client";

import { useState } from "react";
import { fmtNum, syntaxHighlightJSON } from "@/lib/format";

export function ReasoningItem({ summary }: { summary: string }) {
  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-role-reasoning/70">
        Reasoning
      </div>
      <div className="mt-1.5 text-sm text-muted-foreground">
        {summary || "(empty)"}
      </div>
    </div>
  );
}

export function ShellCallItem({
  command,
  status,
}: {
  command: string[];
  status: string;
}) {
  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-role-tool/70">
        Shell {status ? `\u00b7 ${status}` : ""}
      </div>
      <div className="mt-1.5 font-mono text-sm text-foreground/90">
        {Array.isArray(command) ? command.join(" ") : String(command)}
      </div>
    </div>
  );
}

export function WebSearchItem({
  query,
}: {
  query: string;
}) {
  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-role-tool/70">
        Web Search
      </div>
      <div className="mt-1.5 font-mono text-sm text-foreground/90">{query}</div>
    </div>
  );
}

export function SystemEventItem({
  eventType,
  details,
}: {
  eventType: string;
  details: Record<string, unknown>;
}) {
  const hasDetails = Object.keys(details).length > 0;
  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-dim">
        {eventType || "Event"}
      </div>
      {hasDetails && (
        <pre
          className="mt-1.5 text-xs text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: syntaxHighlightJSON(JSON.stringify(details)),
          }}
        />
      )}
    </div>
  );
}

export function CompactionItem({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = message.length > 500;
  const display =
    !expanded && needsTruncation ? message.slice(0, 500) + "..." : message;

  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-dim">
        Compaction
      </div>
      <div className="mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground/90">
        {display || "(empty)"}
      </div>
      {needsTruncation && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1.5 font-mono text-xs text-cyan hover:underline"
        >
          Show full ({fmtNum(message.length)} chars)
        </button>
      )}
    </div>
  );
}
