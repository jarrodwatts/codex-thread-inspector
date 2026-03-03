"use client";

import { useState } from "react";
import { syntaxHighlightJSON, truncateId } from "@/lib/format";

interface ToolCallItemProps {
  name: string;
  toolType: string;
  arguments: string;
  callId: string;
}

export function ToolCallItem({
  name,
  toolType,
  arguments: args,
  callId,
}: ToolCallItemProps) {
  const [open, setOpen] = useState(false);
  const prefix = toolType === "custom" ? "mcp/" : "";

  return (
    <div className="px-3 py-2">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        <span
          className={`text-[10px] text-dim transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          &#9656;
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-role-tool/70">
          Tool
        </span>
        <span className="font-mono text-sm text-foreground">
          {prefix}{name || "unknown"}
        </span>
        <span className="ml-auto font-mono text-[10px] text-dim">
          {truncateId(callId)}
        </span>
      </div>
      {open && (
        <div className="ml-5 mt-2 max-h-[50vh] overflow-y-auto rounded-lg bg-surface/80 p-3">
          <pre
            className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: syntaxHighlightJSON(args),
            }}
          />
        </div>
      )}
    </div>
  );
}
