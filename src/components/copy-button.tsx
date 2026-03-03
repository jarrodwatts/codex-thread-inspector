"use client";

import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="copy-btn rounded-md border border-border p-1.5 text-dim transition-colors hover:border-foreground/30 hover:text-foreground/70"
        >
          <div className="relative h-3.5 w-3.5">
            <Copy
              size={14}
              className={`copy-icon absolute inset-0 ${copied ? "copy-icon-out" : "copy-icon-in"}`}
            />
            <Check
              size={14}
              className={`copy-icon absolute inset-0 ${copied ? "copy-icon-in" : "copy-icon-out"}`}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={6}>
        {copied ? "Copied" : "Copy"}
      </TooltipContent>
    </Tooltip>
  );
}
