import type {
  GitInfo,
  RolloutSession,
  SessionMeta,
  TimelineItem,
  TokenUsage,
  Turn,
  TurnContext,
  UserMessage,
} from "./models";

export function parseRollout(text: string): RolloutSession {
  const session: RolloutSession = {
    meta: emptyMeta(),
    turns: [],
    tokenSnapshots: [],
  };
  let currentTurn: Turn | null = null;
  let turnIndex = 0;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }

    const timestamp = (raw.timestamp as string) ?? "";
    const itemType = (raw.type as string) ?? "";
    const payload = (raw.payload as Record<string, unknown>) ?? {};

    if (itemType === "session_meta") {
      session.meta = parseSessionMeta(payload, timestamp);
    } else if (itemType === "turn_context") {
      const ctx = parseTurnContext(payload);
      currentTurn = { index: turnIndex, timestamp, context: ctx, items: [] };
      session.turns.push(currentTurn);
      turnIndex++;
    } else if (itemType === "response_item") {
      const items = parseResponseItem(payload);
      if (items.length > 0) {
        const target: Turn = currentTurn ?? ensureTurn(session, turnIndex);
        if (target !== currentTurn) {
          currentTurn = target;
          turnIndex++;
        }
        currentTurn!.items.push(...items);
      }
    } else if (itemType === "event_msg") {
      handleEventMsg(payload, timestamp, session, currentTurn);
    } else if (itemType === "compacted") {
      const message = (payload.message as string) ?? "";
      if (currentTurn) {
        currentTurn.items.push({ kind: "compaction", message });
      }
    }
  }

  return session;
}

export function parseSessionMetaOnly(firstLine: string): SessionMeta | null {
  try {
    const raw = JSON.parse(firstLine.trim());
    if (raw.type !== "session_meta") return null;
    return parseSessionMeta(raw.payload ?? {}, raw.timestamp ?? "");
  } catch {
    return null;
  }
}

function emptyMeta(): SessionMeta {
  return {
    id: "",
    timestamp: "",
    cwd: "",
    originator: "",
    cliVersion: "",
    source: "",
    modelProvider: null,
    baseInstructions: null,
    git: null,
    agentNickname: null,
    agentRole: null,
  };
}

function ensureTurn(session: RolloutSession, turnIndex: number): Turn {
  if (session.turns.length > 0) return session.turns[session.turns.length - 1];
  const turn: Turn = { index: turnIndex, timestamp: "", context: null, items: [] };
  session.turns.push(turn);
  return turn;
}

function parseSessionMeta(
  meta: Record<string, unknown>,
  timestamp: string,
): SessionMeta {
  const gitRaw = meta.git as Record<string, unknown> | undefined;
  let git: GitInfo | null = null;
  if (gitRaw) {
    git = {
      commitHash: (gitRaw.commit_hash as string) ?? null,
      branch: (gitRaw.branch as string) ?? null,
      repositoryUrl: (gitRaw.repository_url as string) ?? null,
    };
  }

  const baseInstr = meta.base_instructions;
  let baseText: string | null = null;
  if (typeof baseInstr === "object" && baseInstr !== null) {
    baseText = (baseInstr as Record<string, unknown>).text as string ?? null;
  } else if (typeof baseInstr === "string") {
    baseText = baseInstr;
  }

  return {
    id: (meta.id as string) ?? "",
    timestamp: (meta.timestamp as string) ?? timestamp,
    cwd: (meta.cwd as string) ?? "",
    originator: (meta.originator as string) ?? "",
    cliVersion: (meta.cli_version as string) ?? "",
    source: stringifyField(meta.source),
    modelProvider: (meta.model_provider as string) ?? null,
    baseInstructions: baseText,
    git,
    agentNickname: (meta.agent_nickname as string) ?? null,
    agentRole: (meta.agent_role as string) ?? null,
  };
}

function parseTurnContext(payload: Record<string, unknown>): TurnContext {
  const effort = payload.effort;
  let effortStr: string | null = null;
  if (typeof effort === "object" && effort !== null) {
    const e = effort as Record<string, unknown>;
    effortStr = (e.value as string) ?? (e.mode as string) ?? null;
  } else if (typeof effort === "string") {
    effortStr = effort;
  }

  const summary = payload.summary;
  let summaryStr: string | null = null;
  if (typeof summary === "object" && summary !== null) {
    const s = summary as Record<string, unknown>;
    summaryStr = (s.value as string) ?? (s.mode as string) ?? null;
  } else if (typeof summary === "string") {
    summaryStr = summary;
  }

  let sandbox = payload.sandbox_policy ?? "";
  if (typeof sandbox === "object" && sandbox !== null) {
    sandbox = (sandbox as Record<string, unknown>).mode ?? String(sandbox);
  }

  let approval = payload.approval_policy ?? "";
  if (typeof approval === "object" && approval !== null) {
    approval = (approval as Record<string, unknown>).mode ?? String(approval);
  }

  return {
    turnId: (payload.turn_id as string) ?? null,
    cwd: (payload.cwd as string) ?? "",
    model: (payload.model as string) ?? "",
    approvalPolicy: String(approval),
    sandboxPolicy: String(sandbox),
    effort: effortStr,
    summary: summaryStr,
    userInstructions: (payload.user_instructions as string) ?? null,
    developerInstructions: (payload.developer_instructions as string) ?? null,
  };
}

function parseResponseItem(payload: Record<string, unknown>): TimelineItem[] {
  const innerType = (payload.type as string) ?? "";

  if (innerType === "message") return parseMessage(payload);

  if (innerType === "function_call") {
    return [
      {
        kind: "tool_call",
        toolType: "function",
        name: (payload.name as string) ?? "",
        arguments: (payload.arguments as string) ?? "",
        callId: (payload.call_id as string) ?? "",
      },
    ];
  }

  if (innerType === "function_call_output") {
    return [
      {
        kind: "tool_output",
        callId: (payload.call_id as string) ?? "",
        output: extractOutput(payload.output),
      },
    ];
  }

  if (innerType === "local_shell_call") {
    const action = (payload.action as Record<string, unknown>) ?? {};
    const command = action.command;
    return [
      {
        kind: "shell_call",
        command: Array.isArray(command)
          ? (command as string[])
          : [String(command ?? "")],
        status: (payload.status as string) ?? "",
        callId: (payload.call_id as string) ?? null,
      },
    ];
  }

  if (innerType === "custom_tool_call") {
    return [
      {
        kind: "tool_call",
        toolType: "custom",
        name: (payload.name as string) ?? "",
        arguments: (payload.input as string) ?? "",
        callId: (payload.call_id as string) ?? "",
      },
    ];
  }

  if (innerType === "custom_tool_call_output") {
    return [
      {
        kind: "tool_output",
        callId: (payload.call_id as string) ?? "",
        output: extractOutput(payload.output),
      },
    ];
  }

  if (innerType === "web_search_call") {
    const action = payload.action as Record<string, unknown> | undefined;
    let query = "";
    if (action && typeof action === "object") {
      query = (action.query as string) ?? "";
      if (!query) {
        const queries = action.queries as string[] | undefined;
        if (queries?.length) query = queries.join("; ");
      }
    }
    return [{ kind: "web_search", query, status: (payload.status as string) ?? null }];
  }

  if (innerType === "reasoning") {
    const summaries = (payload.summary as unknown[]) ?? [];
    const parts: string[] = [];
    for (const s of summaries) {
      if (typeof s === "object" && s !== null) {
        parts.push((s as Record<string, unknown>).text as string ?? "");
      } else if (typeof s === "string") {
        parts.push(s);
      }
    }
    return [{ kind: "reasoning", summary: parts.join("\n") }];
  }

  if (innerType === "ghost_snapshot") {
    return [
      {
        kind: "system_event",
        eventType: "ghost_snapshot",
        details: (payload.ghost_commit as Record<string, unknown>) ?? {},
      },
    ];
  }

  if (innerType === "compaction") {
    return [
      {
        kind: "system_event",
        eventType: "compaction",
        details: { encrypted: true },
      },
    ];
  }

  return [];
}

function parseMessage(payload: Record<string, unknown>): TimelineItem[] {
  const role = (payload.role as string) ?? "";
  const content = payload.content;
  const text = extractContentText(content);

  if (role === "user") return [{ kind: "user_message", text }];
  if (role === "assistant") {
    return [
      {
        kind: "assistant_message",
        text,
        phase: (payload.phase as string) ?? null,
      },
    ];
  }
  if (role === "developer") return [{ kind: "developer_message", text }];
  return [{ kind: "user_message", text } as UserMessage];
}

function extractContentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const item of content) {
    if (typeof item === "object" && item !== null) {
      const text = (item as Record<string, unknown>).text as string;
      if (text) parts.push(text);
    } else if (typeof item === "string") {
      parts.push(item);
    }
  }
  return parts.join("\n");
}

function extractOutput(output: unknown): string {
  if (typeof output === "string") return output;
  if (typeof output === "object" && output !== null) {
    const obj = output as Record<string, unknown>;
    const body = obj.body ?? obj;
    if (typeof body === "string") return body;
    if (Array.isArray(body)) {
      const parts: string[] = [];
      for (const item of body) {
        if (typeof item === "object" && item !== null) {
          parts.push((item as Record<string, unknown>).text as string ?? "");
        }
      }
      return parts.join("\n");
    }
    return JSON.stringify(body);
  }
  return String(output);
}

function handleEventMsg(
  payload: Record<string, unknown>,
  timestamp: string,
  session: RolloutSession,
  currentTurn: Turn | null,
): void {
  const eventType = (payload.type as string) ?? "";

  if (eventType === "token_count") {
    const info = payload.info as Record<string, unknown> | undefined;
    if (info) {
      const totalRaw = (info.total_token_usage as Record<string, unknown>) ?? {};
      const lastRaw = (info.last_token_usage as Record<string, unknown>) ?? {};
      session.tokenSnapshots.push({
        timestamp,
        total: parseTokenUsage(totalRaw),
        last: parseTokenUsage(lastRaw),
        modelContextWindow: (info.model_context_window as number) ?? null,
      });
    }
    return;
  }

  if (
    eventType === "task_started" ||
    eventType === "turn_started" ||
    eventType === "task_complete" ||
    eventType === "turn_complete"
  ) {
    return;
  }

  if (eventType === "context_compacted") {
    if (currentTurn) {
      currentTurn.items.push({
        kind: "system_event",
        eventType: "context_compacted",
        details: payload as Record<string, unknown>,
      });
    }
    return;
  }

  if (eventType === "thread_rolled_back") {
    if (currentTurn) {
      currentTurn.items.push({
        kind: "system_event",
        eventType: "thread_rolled_back",
        details: payload as Record<string, unknown>,
      });
    }
  }
}

function stringifyField(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    const first = Object.values(obj)[0];
    if (typeof first === "string") return first;
    return JSON.stringify(value);
  }
  return String(value ?? "");
}

function parseTokenUsage(raw: Record<string, unknown>): TokenUsage {
  return {
    inputTokens: (raw.input_tokens as number) ?? 0,
    cachedInputTokens: (raw.cached_input_tokens as number) ?? 0,
    outputTokens: (raw.output_tokens as number) ?? 0,
    reasoningOutputTokens: (raw.reasoning_output_tokens as number) ?? 0,
    totalTokens: (raw.total_tokens as number) ?? 0,
  };
}
