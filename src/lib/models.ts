export interface TokenUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  totalTokens: number;
}

export interface TokenSnapshot {
  timestamp: string;
  total: TokenUsage;
  last: TokenUsage;
  modelContextWindow: number | null;
}

export interface GitInfo {
  commitHash: string | null;
  branch: string | null;
  repositoryUrl: string | null;
}

export interface SessionMeta {
  id: string;
  timestamp: string;
  cwd: string;
  originator: string;
  cliVersion: string;
  source: string;
  modelProvider: string | null;
  baseInstructions: string | null;
  git: GitInfo | null;
  agentNickname: string | null;
  agentRole: string | null;
}

export interface TurnContext {
  turnId: string | null;
  cwd: string;
  model: string;
  approvalPolicy: string;
  sandboxPolicy: string;
  effort: string | null;
  summary: string | null;
  userInstructions: string | null;
  developerInstructions: string | null;
}

export type TimelineItem =
  | UserMessage
  | AssistantMessage
  | DeveloperMessage
  | ToolCall
  | ToolOutput
  | Reasoning
  | ShellCall
  | WebSearch
  | SystemEvent
  | Compaction;

export interface UserMessage {
  kind: "user_message";
  text: string;
}

export interface AssistantMessage {
  kind: "assistant_message";
  text: string;
  phase: string | null;
}

export interface DeveloperMessage {
  kind: "developer_message";
  text: string;
}

export interface ToolCall {
  kind: "tool_call";
  toolType: string;
  name: string;
  arguments: string;
  callId: string;
}

export interface ToolOutput {
  kind: "tool_output";
  callId: string;
  output: string;
}

export interface Reasoning {
  kind: "reasoning";
  summary: string;
}

export interface ShellCall {
  kind: "shell_call";
  command: string[];
  status: string;
  callId: string | null;
}

export interface WebSearch {
  kind: "web_search";
  query: string;
  status: string | null;
}

export interface SystemEvent {
  kind: "system_event";
  eventType: string;
  details: Record<string, unknown>;
}

export interface Compaction {
  kind: "compaction";
  message: string;
}

export interface Turn {
  index: number;
  timestamp: string;
  context: TurnContext | null;
  items: TimelineItem[];
}

export interface RolloutSession {
  meta: SessionMeta;
  turns: Turn[];
  tokenSnapshots: TokenSnapshot[];
}

// --- View model output types ---

export interface ViewModelSessionStats {
  turns: number;
  toolCalls: number;
  shellCalls: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  cacheRate: number;
  contextWindow: number | null;
}

export interface ViewModelSession {
  id: string;
  timestamp: string;
  cwd: string;
  cliVersion: string;
  source: string;
  modelProvider: string | null;
  agentNickname: string | null;
  agentRole: string | null;
  git: { branch: string | null; commit: string | null; url: string | null } | null;
  stats: ViewModelSessionStats;
}

export interface ViewModelTurnConfig {
  turn: number;
  model: string;
  approval: string;
  sandbox: string;
  effort: string | null;
}

export interface ViewModelContext {
  baseInstructions: string | null;
  developerMessages: string[];
  userInstructions: string[];
  developerInstructions: string[];
  turnConfigs: ViewModelTurnConfig[];
}

export interface ViewModelTimelineItem {
  type: string;
  [key: string]: unknown;
}

export interface ViewModelTurn {
  type: "turn";
  index: number;
  timestamp: string;
  model: string | null;
  items: ViewModelTimelineItem[];
}

export interface ViewModelTokenSnapshot {
  timestamp: string;
  total: { input: number; output: number; cached: number; reasoning: number; total: number };
  last: { input: number; output: number; cached: number; reasoning: number; total: number };
  contextWindow: number | null;
}

export interface ViewModelPerTurn {
  turn: number;
  model: string | null;
  input: number;
  output: number;
  cached: number;
  reasoning: number;
}

export interface ViewModelTokens {
  snapshots: ViewModelTokenSnapshot[];
  perTurn: ViewModelPerTurn[];
}

export interface ViewModel {
  session: ViewModelSession;
  context: ViewModelContext;
  timeline: ViewModelTurn[];
  tokens: ViewModelTokens;
}
