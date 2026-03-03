import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { parseSessionMetaOnly } from "./parser";

export interface SessionListItem {
  id: string;
  timestamp: string;
  cwd: string;
  modelProvider: string | null;
  cliVersion: string;
  branch: string | null;
  agentNickname: string | null;
  filePath: string;
  fileSize: number;
}

const SESSIONS_ROOT =
  process.env.CODEX_SESSIONS_DIR || join(homedir(), ".codex", "sessions");

export async function discoverSessions(): Promise<SessionListItem[]> {
  const items: SessionListItem[] = [];

  try {
    await stat(SESSIONS_ROOT);
  } catch {
    return [];
  }

  const years = await safeReaddir(SESSIONS_ROOT);
  for (const year of years) {
    const yearPath = join(SESSIONS_ROOT, year);
    const months = await safeReaddir(yearPath);
    for (const month of months) {
      const monthPath = join(yearPath, month);
      const days = await safeReaddir(monthPath);
      for (const day of days) {
        const dayPath = join(monthPath, day);
        const files = await safeReaddir(dayPath);
        for (const file of files) {
          if (!file.startsWith("rollout-") || !file.endsWith(".jsonl")) continue;
          const filePath = join(dayPath, file);
          const item = await readSessionHeader(filePath);
          if (item) items.push(item);
        }
      }
    }
  }

  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return items;
}

export async function findSessionFile(id: string): Promise<string | null> {
  try {
    await stat(SESSIONS_ROOT);
  } catch {
    return null;
  }

  const years = await safeReaddir(SESSIONS_ROOT);
  for (const year of years) {
    const yearPath = join(SESSIONS_ROOT, year);
    const months = await safeReaddir(yearPath);
    for (const month of months) {
      const monthPath = join(yearPath, month);
      const days = await safeReaddir(monthPath);
      for (const day of days) {
        const dayPath = join(monthPath, day);
        const files = await safeReaddir(dayPath);
        for (const file of files) {
          if (file.includes(id) && file.endsWith(".jsonl")) {
            return join(dayPath, file);
          }
        }
      }
    }
  }

  return null;
}

async function readSessionHeader(
  filePath: string,
): Promise<SessionListItem | null> {
  try {
    const fd = await readFile(filePath, "utf-8");
    const firstLine = fd.slice(0, fd.indexOf("\n"));
    if (!firstLine) return null;

    const meta = parseSessionMetaOnly(firstLine);
    if (!meta) return null;

    const stats = await stat(filePath);

    return {
      id: meta.id,
      timestamp: meta.timestamp,
      cwd: meta.cwd,
      modelProvider: meta.modelProvider,
      cliVersion: meta.cliVersion,
      branch: meta.git?.branch ?? null,
      agentNickname: meta.agentNickname,
      filePath,
      fileSize: stats.size,
    };
  } catch {
    return null;
  }
}

async function safeReaddir(path: string): Promise<string[]> {
  try {
    return await readdir(path);
  } catch {
    return [];
  }
}
