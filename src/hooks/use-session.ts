"use client";

import { useEffect, useReducer } from "react";
import type { ViewModel } from "@/lib/models";

interface UseSessionResult {
  data: ViewModel | null;
  loading: boolean;
  error: string | null;
}

type State = UseSessionResult;
type Action =
  | { type: "loading" }
  | { type: "success"; data: ViewModel }
  | { type: "error"; message: string };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { data: null, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { data: null, loading: false, error: action.message };
  }
}

const cache = new Map<string, ViewModel>();

export function useSession(id: string | null): UseSessionResult {
  const cached = id ? cache.get(id) ?? null : null;
  const [state, dispatch] = useReducer(reducer, {
    data: cached,
    loading: !cached && !!id,
    error: null,
  });

  useEffect(() => {
    if (!id || cache.has(id)) return;

    let cancelled = false;
    dispatch({ type: "loading" });

    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Session not found (${res.status})`);
        return res.json();
      })
      .then((vm: ViewModel) => {
        if (cancelled) return;
        cache.set(id, vm);
        dispatch({ type: "success", data: vm });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        dispatch({ type: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
