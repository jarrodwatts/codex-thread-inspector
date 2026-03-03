"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ViewModel } from "@/lib/models";
import { parseRollout } from "@/lib/parser";
import { buildViewModel } from "@/lib/viewmodel";

interface SessionContextValue {
  uploadedSession: ViewModel | null;
  loadFromText: (text: string) => void;
  clear: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  uploadedSession: null,
  loadFromText: () => {},
  clear: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [uploadedSession, setUploadedSession] = useState<ViewModel | null>(
    null,
  );

  const loadFromText = useCallback((text: string) => {
    const session = parseRollout(text);
    const vm = buildViewModel(session);
    setUploadedSession(vm);
  }, []);

  const clear = useCallback(() => setUploadedSession(null), []);

  return (
    <SessionContext value={{ uploadedSession, loadFromText, clear }}>
      {children}
    </SessionContext>
  );
}

export function useUploadedSession(): SessionContextValue {
  return useContext(SessionContext);
}
