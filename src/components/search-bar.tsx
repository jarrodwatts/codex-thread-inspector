"use client";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  matchCount: number;
  totalCount: number;
}

export function SearchBar({
  query,
  onQueryChange,
  matchCount,
  totalCount,
}: SearchBarProps) {
  return (
    <div className="relative mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search..."
        className="w-full border-b border-border bg-transparent py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-dim focus:border-foreground/30"
      />
      {query.trim() && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-xs text-dim">
          {matchCount}/{totalCount}
        </span>
      )}
    </div>
  );
}
