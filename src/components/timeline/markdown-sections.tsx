"use client";

import { useState } from "react";
import { renderInlineMarkdown } from "@/lib/format";

interface SectionNode {
  level: number;
  title: string;
  body: string;
  children: SectionNode[];
  trailing: string;
}

const CLOSING_XML_TAG = /^\s*<\/([\w][\w\s_-]*)>\s*$/;
const OPENING_XML_TAG = /^\s*<([\w][\w\s_-]*)>\s*$/;

export interface ParsedSections {
  sections: SectionNode[];
  postamble: string;
}

export function parseMarkdownSections(text: string): ParsedSections {
  if (!text) return { sections: [], postamble: "" };
  const normalized = text.replace(/(>)(#{1,3}\s)/g, "$1\n$2");
  const lines = normalized.split("\n");

  const root: SectionNode = { level: 0, title: "", body: "", children: [], trailing: "" };
  const stack: SectionNode[] = [root];
  const openTags = new Map<string, "preamble" | "section">();
  const trailingLines: string[] = [];
  let trailing = false;
  let trailingOrigin: "preamble" | "section" = "section";

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      trailing = false;
      const level = headingMatch[1].length;
      const node: SectionNode = {
        level,
        title: headingMatch[2],
        body: "",
        children: [],
        trailing: "",
      };
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      const closingMatch = line.match(CLOSING_XML_TAG);
      if (closingMatch && openTags.has(closingMatch[1]) && stack.length > 1) {
        trailingOrigin = openTags.get(closingMatch[1])!;
        while (stack.length > 1) stack.pop();
        trailing = true;
        trailingLines.push(line);
      } else if (trailing) {
        trailingLines.push(line);
      } else {
        const openMatch = line.match(OPENING_XML_TAG);
        if (openMatch && !closingMatch && stack.length <= 2) {
          openTags.set(openMatch[1], stack.length === 1 ? "preamble" : "section");
        }
        const current = stack[stack.length - 1];
        current.body += (current.body ? "\n" : "") + line;
      }
    }
  }

  const postambleText = trailingLines.join("\n").trim();
  let postamble = "";

  if (postambleText) {
    if (trailingOrigin === "section" && root.children.length > 0) {
      root.children[root.children.length - 1].trailing = postambleText;
    } else {
      postamble = postambleText;
    }
  }

  return { sections: root.children, postamble };
}

export function MarkdownSections({
  sections,
  depth = 0,
}: {
  sections: SectionNode[];
  depth?: number;
}) {
  return (
    <>
      {sections.map((node, i) => (
        <SectionItem key={i} node={node} depth={depth} />
      ))}
    </>
  );
}

function SectionItem({ node, depth }: { node: SectionNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const hasContent = node.body.trim() || node.children.length > 0 || node.trailing.trim();

  const hClass =
    node.level === 1
      ? "text-sm font-semibold text-foreground"
      : node.level === 2
        ? "text-[13px] font-medium text-foreground/80"
        : "text-xs font-medium text-muted-foreground";

  return (
    <div className={node.level === 1 ? "mt-2.5 first:mt-0" : "mt-0.5"}>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-elevated/50"
        onClick={() => setOpen(!open)}
      >
        {hasContent && (
          <span
            className={`text-[9px] text-dim transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            &#9656;
          </span>
        )}
        <span className={hClass}>{node.title}</span>
      </div>
      {open && (
        <div className="ml-[11px] border-l border-border/25 pl-4">
          {node.body.trim() && (
            <div
              className="whitespace-pre-wrap break-words py-1.5 font-mono text-xs leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: renderInlineMarkdown(node.body.trim()),
              }}
            />
          )}
          {node.children.length > 0 && (
            <MarkdownSections sections={node.children} depth={depth + 1} />
          )}
          {node.trailing.trim() && (
            <div
              className="whitespace-pre-wrap break-words py-1.5 font-mono text-xs leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: renderInlineMarkdown(node.trailing.trim()),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
