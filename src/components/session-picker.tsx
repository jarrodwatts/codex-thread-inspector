"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionListItem } from "@/lib/sessions";
import { cwdShort, fmtNum } from "@/lib/format";

export function SessionPicker() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data: SessionListItem[]) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No sessions found in ~/.codex/sessions/
        </p>
        <p className="mt-2 text-sm text-dim">
          Drop a .jsonl file below to inspect it
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {sessions.map((s, i) => (
        <Link key={s.id} href={`/session/${s.id}`}>
          <Card
            className="group animate-fade-in cursor-pointer border-border bg-surface px-6 py-5 transition-all hover:border-cyan/30 hover:bg-elevated"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-semibold text-cyan">
                {s.id.slice(0, 8)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(s.timestamp)}
              </span>
              <div className="ml-auto flex gap-2">
                {s.modelProvider && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {s.modelProvider}
                  </Badge>
                )}
                {s.branch && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {s.branch}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-5">
              <span className="font-mono text-xs text-muted-foreground">
                {cwdShort(s.cwd)}
              </span>
              {s.agentNickname && (
                <span className="text-xs text-muted-foreground">
                  {s.agentNickname}
                </span>
              )}
              <span className="ml-auto font-mono text-xs text-dim">
                {fmtNum(s.fileSize)} bytes
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}
