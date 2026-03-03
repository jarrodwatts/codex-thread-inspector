import type {
  RolloutSession,
  ViewModel,
  ViewModelContext,
  ViewModelPerTurn,
  ViewModelSession,
  ViewModelTimelineItem,
  ViewModelTokens,
  ViewModelTurn,
  ViewModelTurnConfig,
} from "./models";

export function buildViewModel(session: RolloutSession): ViewModel {
  return {
    session: buildSessionSection(session),
    context: buildContextSection(session),
    timeline: buildTimelineSection(session),
    tokens: buildTokensSection(session),
  };
}

function buildSessionSection(session: RolloutSession): ViewModelSession {
  const meta = session.meta;
  let totalToolCalls = 0;
  let totalShellCalls = 0;

  for (const turn of session.turns) {
    for (const item of turn.items) {
      if (item.kind === "tool_call") totalToolCalls++;
      else if (item.kind === "shell_call") totalShellCalls++;
    }
  }

  const lastSnap =
    session.tokenSnapshots.length > 0
      ? session.tokenSnapshots[session.tokenSnapshots.length - 1]
      : null;

  const totalInput = lastSnap?.total.inputTokens ?? 0;
  const totalOutput = lastSnap?.total.outputTokens ?? 0;
  const totalCached = lastSnap?.total.cachedInputTokens ?? 0;
  const totalReasoning = lastSnap?.total.reasoningOutputTokens ?? 0;
  const totalTokens = lastSnap?.total.totalTokens ?? 0;
  const contextWindow = lastSnap?.modelContextWindow ?? null;
  const cacheRate = totalInput > 0 ? Math.round((totalCached / totalInput) * 1000) / 10 : 0;

  return {
    id: meta.id,
    timestamp: meta.timestamp,
    cwd: meta.cwd,
    cliVersion: meta.cliVersion,
    source: meta.source,
    modelProvider: meta.modelProvider,
    agentNickname: meta.agentNickname,
    agentRole: meta.agentRole,
    git: meta.git
      ? {
          branch: meta.git.branch,
          commit: meta.git.commitHash,
          url: meta.git.repositoryUrl,
        }
      : null,
    stats: {
      turns: session.turns.length,
      toolCalls: totalToolCalls,
      shellCalls: totalShellCalls,
      totalTokens,
      inputTokens: totalInput,
      outputTokens: totalOutput,
      cachedTokens: totalCached,
      reasoningTokens: totalReasoning,
      cacheRate,
      contextWindow,
    },
  };
}

function buildContextSection(session: RolloutSession): ViewModelContext {
  const developerMessages: string[] = [];
  const userInstructions: string[] = [];
  const devInstructions: string[] = [];
  const turnConfigs: ViewModelTurnConfig[] = [];

  const seenDev = new Set<string>();
  const seenUserInstr = new Set<string>();
  const seenDevInstr = new Set<string>();

  for (const turn of session.turns) {
    if (turn.context) {
      const ctx = turn.context;
      turnConfigs.push({
        turn: turn.index,
        model: ctx.model,
        approval: ctx.approvalPolicy,
        sandbox: ctx.sandboxPolicy,
        effort: ctx.effort,
      });

      if (ctx.userInstructions && !seenUserInstr.has(ctx.userInstructions)) {
        seenUserInstr.add(ctx.userInstructions);
        userInstructions.push(ctx.userInstructions);
      }
      if (ctx.developerInstructions && !seenDevInstr.has(ctx.developerInstructions)) {
        seenDevInstr.add(ctx.developerInstructions);
        devInstructions.push(ctx.developerInstructions);
      }
    }

    for (const item of turn.items) {
      if (item.kind === "developer_message" && !seenDev.has(item.text)) {
        seenDev.add(item.text);
        developerMessages.push(item.text);
      }
    }
  }

  return {
    baseInstructions: session.meta.baseInstructions,
    developerMessages,
    userInstructions,
    developerInstructions: devInstructions,
    turnConfigs,
  };
}

function buildTimelineSection(session: RolloutSession): ViewModelTurn[] {
  const timeline: ViewModelTurn[] = [];

  for (const turn of session.turns) {
    const items: ViewModelTimelineItem[] = [];

    if (turn.index === 0 && session.meta.baseInstructions) {
      items.push({
        type: "base_instructions",
        text: session.meta.baseInstructions,
      });
    }

    for (const item of turn.items) {
      items.push(serializeTimelineItem(item));
    }

    timeline.push({
      type: "turn",
      index: turn.index,
      timestamp: turn.timestamp,
      model: turn.context?.model ?? null,
      items,
    });
  }

  return timeline;
}

function serializeTimelineItem(
  item: RolloutSession["turns"][number]["items"][number],
): ViewModelTimelineItem {
  switch (item.kind) {
    case "user_message":
      return { type: "user_message", text: item.text };
    case "assistant_message":
      return { type: "assistant_message", text: item.text, phase: item.phase };
    case "developer_message":
      return { type: "developer_message", text: item.text };
    case "tool_call":
      return {
        type: "tool_call",
        toolType: item.toolType,
        name: item.name,
        arguments: item.arguments,
        callId: item.callId,
      };
    case "tool_output":
      return { type: "tool_output", callId: item.callId, output: item.output };
    case "reasoning":
      return { type: "reasoning", summary: item.summary };
    case "shell_call":
      return {
        type: "shell_call",
        command: item.command,
        status: item.status,
        callId: item.callId,
      };
    case "web_search":
      return { type: "web_search", query: item.query, status: item.status };
    case "system_event":
      return {
        type: "system_event",
        eventType: item.eventType,
        details: item.details,
      };
    case "compaction":
      return { type: "compaction", message: item.message };
    default:
      return { type: "unknown" };
  }
}

function buildTokensSection(session: RolloutSession): ViewModelTokens {
  const snapshots = session.tokenSnapshots.map((snap) => ({
    timestamp: snap.timestamp,
    total: {
      input: snap.total.inputTokens,
      output: snap.total.outputTokens,
      cached: snap.total.cachedInputTokens,
      reasoning: snap.total.reasoningOutputTokens,
      total: snap.total.totalTokens,
    },
    last: {
      input: snap.last.inputTokens,
      output: snap.last.outputTokens,
      cached: snap.last.cachedInputTokens,
      reasoning: snap.last.reasoningOutputTokens,
      total: snap.last.totalTokens,
    },
    contextWindow: snap.modelContextWindow,
  }));

  return {
    snapshots,
    perTurn: computePerTurnTokens(session),
  };
}

function computePerTurnTokens(session: RolloutSession): ViewModelPerTurn[] {
  if (session.tokenSnapshots.length === 0) return [];

  const perTurn: ViewModelPerTurn[] = [];
  let prevInput = 0;
  let prevOutput = 0;
  let prevCached = 0;
  let prevReasoning = 0;
  let snapIdx = 0;

  for (const turn of session.turns) {
    let bestSnap = null;

    while (snapIdx < session.tokenSnapshots.length) {
      const snap = session.tokenSnapshots[snapIdx];
      if (
        snapIdx + 1 < session.tokenSnapshots.length &&
        turn.index < session.turns.length - 1
      ) {
        const nextTurnTs = session.turns[turn.index + 1].timestamp;
        if (snap.timestamp <= nextTurnTs) {
          bestSnap = snap;
          snapIdx++;
        } else {
          break;
        }
      } else {
        bestSnap = snap;
        snapIdx++;
      }
    }

    if (bestSnap) {
      const deltaInput = bestSnap.total.inputTokens - prevInput;
      const deltaOutput = bestSnap.total.outputTokens - prevOutput;
      const deltaCached = bestSnap.total.cachedInputTokens - prevCached;
      const deltaReasoning = bestSnap.total.reasoningOutputTokens - prevReasoning;

      perTurn.push({
        turn: turn.index,
        model: turn.context?.model ?? null,
        input: deltaInput,
        output: deltaOutput,
        cached: deltaCached,
        reasoning: deltaReasoning,
      });

      prevInput = bestSnap.total.inputTokens;
      prevOutput = bestSnap.total.outputTokens;
      prevCached = bestSnap.total.cachedInputTokens;
      prevReasoning = bestSnap.total.reasoningOutputTokens;
    }
  }

  return perTurn;
}
