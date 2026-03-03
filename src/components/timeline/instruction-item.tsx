"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  MarkdownSections,
  parseMarkdownSections,
} from "./markdown-sections";
import { renderInlineMarkdown } from "@/lib/format";

interface InstructionItemProps {
  label: string;
  badge: string;
  text: string;
  roleClass: string;
}

const ROLE_LABEL_COLOR: Record<string, string> = {
  system: "text-role-system/70",
  developer: "text-role-developer/70",
  user: "text-role-user/70",
};

export function InstructionItem({
  label,
  badge,
  text,
  roleClass,
}: InstructionItemProps) {
  const [open, setOpen] = useState(false);
  const { sections, postamble } = parseMarkdownSections(text);
  const labelColor = ROLE_LABEL_COLOR[roleClass] ?? "text-dim";

  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 transition-colors hover:bg-elevated/50"
        onClick={() => setOpen(!open)}
      >
        <span
          className={`text-[10px] text-dim transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          &#9656;
        </span>
        <span className="text-sm text-foreground/90">
          {label}
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-widest ${labelColor}`}>
          {badge}
        </span>
      </div>
      {open && (
        <div className="relative mx-3 mb-2 mt-1 rounded-lg bg-surface/80 p-4">
          <div className="absolute right-3 top-3">
            <CopyButton text={text} />
          </div>
          {sections.length > 0 ? (
            <>
              {renderPreamble(text)}
              <MarkdownSections sections={sections} />
              {postamble && (
                <div
                  className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: renderInlineMarkdown(postamble),
                  }}
                />
              )}
            </>
          ) : (
            <div
              className="whitespace-pre-wrap break-words pr-10 font-mono text-xs leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: renderInlineMarkdown(text),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function renderPreamble(text: string) {
  const firstHeaderIdx = text.indexOf("#");
  if (firstHeaderIdx <= 0) return null;
  const preamble = text.slice(0, firstHeaderIdx).trim();
  if (!preamble) return null;
  return (
    <div
      className="mb-2 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground"
      dangerouslySetInnerHTML={{
        __html: renderInlineMarkdown(preamble),
      }}
    />
  );
}
