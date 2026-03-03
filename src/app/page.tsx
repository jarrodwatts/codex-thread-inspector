import { SessionPicker } from "@/components/session-picker";
import { UploadZone } from "@/components/upload-zone";
import { HalftoneBar } from "@/components/halftone-bar";

export default function Home() {
  return (
    <div>
      <HalftoneBar height={56} className="w-full" />
      <div className="mx-auto max-w-4xl px-8 py-16">
        <header className="mb-12">
          <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground">
            Thread Inspector
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Visualize Codex agent session internals
          </p>
        </header>

        <section>
          <h2 className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-dim">
            Sessions
          </h2>
          <SessionPicker />
        </section>

        <UploadZone />
      </div>
    </div>
  );
}
