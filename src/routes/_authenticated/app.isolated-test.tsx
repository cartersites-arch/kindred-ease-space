import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/components/pages/use-workspace";
import { getPageEditor, savePageDraft } from "@/lib/pages.functions";

export const Route = createFileRoute("/_authenticated/app/isolated-test")({
  component: IsolationTest,
});

// Fixed disposable targets, confined to the isolated project. This exercises
// the existing authenticated handlers; it adds no server API or auth bypass.
const targets = [
  { workspaceId: "0d787190-6320-49f5-b04e-25bd548cb03b", pageId: "3af9b88c-5c47-4ab0-96e8-c5f81e0209e5" },
  { workspaceId: "d588a61c-a6cc-45f0-89ca-0135ab6bc9ad", pageId: "575fd200-d9c8-4238-830d-9de65ab409e0" },
];

function IsolationTest() {
  const { workspaceId } = useCurrentWorkspace();
  const read = useServerFn(getPageEditor);
  const save = useServerFn(savePageDraft);
  const [results, setResults] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const enabled = import.meta.env.VITE_SUPABASE_URL === "https://jwqldxatoyeobnoibdvl.supabase.co";
  const own = targets.find((t) => t.workspaceId === workspaceId);
  const foreign = targets.find((t) => t.workspaceId !== workspaceId);
  if (!enabled || !own || !foreign) return <p>Isolated test unavailable.</p>;

  async function run() {
    if (!own || !foreign) return;
    setBusy(true);
    const output: string[] = [];
    const check = async (name: string, action: () => Promise<unknown>, shouldDeny: boolean) => {
      try {
        await action();
        output.push(`${name}: ${shouldDeny ? "FAIL — accepted" : "PASS — accepted"}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request rejected";
        output.push(`${name}: ${shouldDeny ? "DENIED" : "FAIL"} — ${message}`);
      }
      setResults([...output]);
    };
    await check("Own page read", () => read({ data: own }), false);
    await check("Foreign workspace read", () => read({ data: foreign }), true);
    await check("Foreign page with own workspace", () => read({ data: { ...own, pageId: foreign.pageId } }), true);
    await check("Foreign workspace edit", () => save({ data: {
      ...foreign, expectedVersion: 2,
      fields: { title: "Isolation probe must be denied", h1: "Isolation probe must be denied", seoTitle: null,
        metaDescription: null, slug: "isolation-probe-denied", bodyMarkdown: "Dummy isolation test edit.", listingLimit: 24, noindex: true },
    } }), true);
    setBusy(false);
  }

  return <main className="p-6 space-y-4">
    <h1>Isolated workspace access test</h1>
    <p>Runs real authenticated page requests against the two fixed test workspaces.</p>
    <button className="border rounded px-4 py-2" disabled={busy} onClick={run}>{busy ? "Testing…" : "Run access checks"}</button>
    <ul aria-live="polite">{results.map((result) => <li key={result}>{result}</li>)}</ul>
  </main>;
}
