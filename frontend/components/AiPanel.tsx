"use client";

import { useState } from "react";

type AiAction = "explain" | "refactor" | "detect-bugs" | "generate-tests" | "compare" | "summarize-diff";

const ACTIONS: { key: AiAction; label: string }[] = [
  { key: "explain", label: "Explain Code" },
  { key: "refactor", label: "Refactor Code" },
  { key: "detect-bugs", label: "Detect Bugs" },
  { key: "generate-tests", label: "Generate Unit Tests" },
  { key: "compare", label: "Compare Two Snippets" },
  { key: "summarize-diff", label: "Summarize Changes" }
];

export function AiPanel({ selectedCode }: { selectedCode: string }) {
  const [result, setResult] = useState("Select code and run an AI action.");
  const [compareCode, setCompareCode] = useState("");
  const [loading, setLoading] = useState<AiAction | null>(null);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);

  const needsComparisonInput = activeAction === "compare" || activeAction === "summarize-diff";

  const runAction = async (action: AiAction) => {
    if (!selectedCode.trim()) {
      setResult("Please select code in the editor first.");
      return;
    }

    setActiveAction(action);
    setLoading(action);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          selectedCode,
          comparisonCode: action === "compare" || action === "summarize-diff" ? compareCode : undefined
        })
      });

      const data = await res.json();
      setResult(data.result || data.error || "No response.");
    } catch (error) {
      setResult(`AI request failed: ${(error as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <aside className="flex h-full flex-col border-l border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">AI Assistant</h2>
      <p className="mb-4 text-xs text-slate-400">Selected chars: {selectedCode.length}</p>

      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            onClick={() => runAction(action.key)}
            className="rounded bg-indigo-600 px-2 py-2 text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50"
            disabled={Boolean(loading)}
          >
            {loading === action.key ? "Running..." : action.label}
          </button>
        ))}
      </div>

      {needsComparisonInput && (
        <textarea
          className="mt-4 min-h-28 rounded border border-slate-700 bg-slate-950 p-2 text-xs"
          placeholder="Paste snippet B here for compare/diff actions..."
          value={compareCode}
          onChange={(e) => setCompareCode(e.target.value)}
        />
      )}

      <pre className="mt-4 flex-1 overflow-auto whitespace-pre-wrap rounded border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed">
        {result}
      </pre>
    </aside>
  );
}
