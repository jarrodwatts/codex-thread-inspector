"use client";

import { useRouter } from "next/navigation";
import { useUploadedSession } from "@/providers/session-provider";
import { SessionHeader } from "@/components/session-header";
import { SearchBar } from "@/components/search-bar";
import { Timeline } from "@/components/timeline/timeline";
import { TokenPanel } from "@/components/token-panel/token-panel";
import { useSearch } from "@/hooks/use-search";
import { useEffect, useState } from "react";

export default function UploadedSessionPage() {
  const router = useRouter();
  const { uploadedSession } = useUploadedSession();

  useEffect(() => {
    if (!uploadedSession) {
      router.push("/");
    }
  }, [uploadedSession, router]);

  if (!uploadedSession) return null;

  return <UploadedSessionView viewModel={uploadedSession} />;
}

function UploadedSessionView({
  viewModel,
}: {
  viewModel: NonNullable<ReturnType<typeof useUploadedSession>["uploadedSession"]>;
}) {
  const { query, setQuery, filteredTurns, matchCount, totalCount } = useSearch(
    viewModel.timeline,
  );
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div>
      <SessionHeader session={viewModel.session} />
      <div
        className={`grid min-h-[calc(100vh-72px)] grid-cols-1 ${
          panelOpen
            ? "min-[900px]:grid-cols-[1fr_320px]"
            : "min-[900px]:grid-cols-[1fr_auto]"
        }`}
      >
        <main className="max-h-[calc(100vh-72px)] overflow-y-auto px-8 py-6 lg:px-12">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            matchCount={matchCount}
            totalCount={totalCount}
          />
          <Timeline turns={filteredTurns} />
        </main>
        <TokenPanel
          viewModel={viewModel}
          open={panelOpen}
          onToggle={() => setPanelOpen((v) => !v)}
        />
      </div>
    </div>
  );
}
