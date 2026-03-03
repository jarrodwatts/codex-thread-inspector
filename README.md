# Codex Thread Inspector

Visualize [Codex](https://github.com/openai/codex) agent session internals — timeline, token usage, tool calls, and context layers.

Built for a deeper look at what happens inside Codex agent sessions. Parses the JSONL rollout files that Codex writes to `~/.codex/sessions/` and renders them as an interactive web UI.

## Quick Start

```bash
npx codex-thread-inspector
```

Opens a local web server at `http://localhost:3000` with your Codex sessions auto-discovered.

No Codex installed? You can also drag-and-drop any `.jsonl` rollout file directly into the upload zone.

## Features

- **Session timeline** — Every turn, tool call, and context event in chronological order
- **Token panel** — Cache rates, per-turn token breakdown, cumulative usage chart
- **Context layers** — See system prompts, developer instructions, and turn context as the model sees them
- **Search** — Filter turns and tool calls by keyword
- **Upload mode** — Inspect any rollout file without Codex installed

## Options

```
npx codex-thread-inspector [options]

  -p, --port <number>       Port to listen on (default: 3000)
  --sessions-dir <path>     Custom sessions directory (default: ~/.codex/sessions)
  -h, --help                Show help
```

## Requirements

- **Node.js 18+**
- **Codex CLI** (for auto-discovery of sessions) — or use upload mode without it

## How It Works

Codex writes a JSONL rollout file for each session to `~/.codex/sessions/YYYY/MM/DD/rollout-{id}.jsonl`. Thread Inspector parses these files and builds a view model with:

- Session metadata (model, branch, working directory)
- Turn-by-turn timeline with tool calls and responses
- Token statistics with input/output/cache breakdowns
- Context events (compactions, developer instructions, system prompts)

## Development

```bash
git clone https://github.com/jarrodwatts/codex-thread-inspector.git
cd codex-thread-inspector
pnpm install
pnpm dev
```

## License

[MIT](LICENSE)
