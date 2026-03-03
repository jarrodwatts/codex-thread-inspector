"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ViewModelTurn } from "@/lib/models";

interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  filteredTurns: ViewModelTurn[];
  matchCount: number;
  totalCount: number;
}

export function useSearch(turns: ViewModelTurn[]): UseSearchResult {
  const [query, setQueryRaw] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(q), 200);
  }, []);

  const searchIndex = useMemo(
    () => turns.map((turn) => JSON.stringify(turn).toLowerCase()),
    [turns],
  );

  const filteredTurns = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return turns;
    return turns.filter((_, i) => searchIndex[i].includes(q));
  }, [turns, searchIndex, debouncedQuery]);

  return {
    query,
    setQuery,
    filteredTurns,
    matchCount: filteredTurns.length,
    totalCount: turns.length,
  };
}
