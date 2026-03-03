"use client";

import { use, useState } from "react";
import Link from "next/link";
import { SessionHeader } from "@/components/session-header";
import { SearchBar } from "@/components/search-bar";
import { Timeline } from "@/components/timeline/timeline";
import { TokenPanel } from "@/components/token-panel/token-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { useSearch } from "@/hooks/use-search";

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error } = useSession(id);

  if (loading) return <SessionSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!data) return <ErrorDisplay message="No data" />;

  return <SessionView viewModel={data} />;
}

function SessionView({
  viewModel,
}: {
  viewModel: NonNullable<ReturnType<typeof useSession>["data"]>;
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

function SessionSkeleton() {
  return (
    <div>
      <div className="border-b border-border px-8 py-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_320px]">
        <div className="space-y-4 px-8 py-6">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4 border-l border-border p-5">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-sm text-rose">{message}</p>
        <Link
          href="/"
          className="mt-4 inline-block font-mono text-sm text-cyan hover:underline"
        >
          &larr; Back to sessions
        </Link>
      </div>
    </div>
  );
}
