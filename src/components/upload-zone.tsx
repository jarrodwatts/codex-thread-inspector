"use client";

import { useCallback, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useUploadedSession } from "@/providers/session-provider";

export function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const { loadFromText } = useUploadedSession();
  const router = useRouter();

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        loadFromText(reader.result as string);
        router.push("/session/upload");
      };
      reader.readAsText(file);
    },
    [loadFromText, router],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative mt-8 flex min-h-[140px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all ${
        dragging
          ? "border-cyan bg-cyan/5"
          : "border-border hover:border-muted-foreground/30"
      }`}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".jsonl";
        input.onchange = () => {
          if (input.files?.[0]) handleFile(input.files[0]);
        };
        input.click();
      }}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {dragging ? "Drop .jsonl file" : "Drop a .jsonl rollout file here"}
        </p>
        <p className="mt-1.5 text-sm text-dim">
          or click to browse
        </p>
      </div>
    </div>
  );
}
