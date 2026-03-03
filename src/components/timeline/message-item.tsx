"use client";

import { useState } from "react";
import { fmtNum } from "@/lib/format";

const TRUNCATION_LIMIT = 4000;

export function MessageItem({
  text,
  phase,
}: {
  text: string;
  phase: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > TRUNCATION_LIMIT;
  const display = !expanded && needsTruncation ? text.slice(0, TRUNCATION_LIMIT) + "..." : text;

  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-role-assistant/70">
        Assistant{phase ? ` \u00b7 ${phase}` : ""}
      </div>
      <div className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
        {display}
      </div>
      {needsTruncation && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1.5 font-mono text-xs text-cyan hover:underline"
        >
          Show full ({fmtNum(text.length)} chars)
        </button>
      )}
    </div>
  );
}

export function ToolOutputItem({
  output,
}: {
  output: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 2000;
  const needsTruncation = output.length > limit;
  const display = !expanded && needsTruncation ? output.slice(0, limit) + "..." : output;

  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-role-tool/70">
        Output
      </div>
      <div className="mt-1.5 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
        {display || <span className="text-dim">(empty)</span>}
      </div>
      {needsTruncation && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1.5 font-mono text-xs text-cyan hover:underline"
        >
          Show full ({fmtNum(output.length)} chars)
        </button>
      )}
    </div>
  );
}
