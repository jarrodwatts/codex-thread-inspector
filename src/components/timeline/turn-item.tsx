"use client";

import type { ViewModelTimelineItem } from "@/lib/models";
import { InstructionItem } from "./instruction-item";
import { MessageItem, ToolOutputItem } from "./message-item";
import { ToolCallItem } from "./tool-call-item";
import {
  ReasoningItem,
  ShellCallItem,
  WebSearchItem,
  SystemEventItem,
  CompactionItem,
} from "./event-items";

export function TurnItem({ item }: { item: ViewModelTimelineItem }) {
  switch (item.type) {
    case "base_instructions":
      return (
        <InstructionItem
          label="Base Instructions"
          badge="SYSTEM"
          text={item.text as string}
          roleClass="system"
        />
      );
    case "developer_message":
      return (
        <InstructionItem
          label="Developer Instructions"
          badge="DEVELOPER"
          text={item.text as string}
          roleClass="developer"
        />
      );
    case "user_message":
      return (
        <InstructionItem
          label="User Message"
          badge="USER"
          text={item.text as string}
          roleClass="user"
        />
      );
    case "assistant_message":
      return (
        <MessageItem
          text={item.text as string}
          phase={(item.phase as string) ?? null}
        />
      );
    case "tool_call":
      return (
        <ToolCallItem
          name={item.name as string}
          toolType={item.toolType as string}
          arguments={item.arguments as string}
          callId={item.callId as string}
        />
      );
    case "tool_output":
      return <ToolOutputItem output={item.output as string} />;
    case "reasoning":
      return <ReasoningItem summary={item.summary as string} />;
    case "shell_call":
      return (
        <ShellCallItem
          command={item.command as string[]}
          status={item.status as string}
        />
      );
    case "web_search":
      return <WebSearchItem query={item.query as string} />;
    case "system_event":
      return (
        <SystemEventItem
          eventType={item.eventType as string}
          details={item.details as Record<string, unknown>}
        />
      );
    case "compaction":
      return <CompactionItem message={item.message as string} />;
    default:
      return (
        <div className="px-3.5 py-2 font-mono text-xs text-muted-foreground">
          Unknown: {item.type}
        </div>
      );
  }
}
