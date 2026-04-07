"use client";

import { useState, useCallback, useRef } from "react";
import { ScheduleProposal, SimulationState, SimulationMode, Site, WeatherDay } from "@/lib/types";

export function useAISimulation() {
  const [state, setState] = useState<SimulationState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [proposals, setProposals] = useState<ScheduleProposal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState("idle"); setStatusMessage(""); setReasoning(""); setProposals(null); setError(null);
  }, []);

  const run = useCallback((site: Site, weather: WeatherDay[], mode: SimulationMode) => {
    setState("thinking"); setStatusMessage("AIエンジンを起動中..."); setReasoning(""); setProposals(null); setError(null);
    const controller = new AbortController(); abortRef.current = controller;
    const endpoint = mode === "optimize" ? "/api/ai/optimize" : "/api/ai/reschedule";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, processes: site.processes, weather }),
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");
      const decoder = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const ev = JSON.parse(line);
            if (ev.type === "status") setStatusMessage(ev.data);
            else if (ev.type === "reasoning_chunk") { setState("streaming"); setReasoning((p) => p + ev.data); }
            else if (ev.type === "proposals") { setState("complete"); setProposals(ev.data); }
            else if (ev.type === "result") {
              // Backward compat: single result → wrap in proposals
              setState("complete");
              setProposals(ev.data.proposals || null);
            }
            else if (ev.type === "error") { setState("error"); setError(ev.data.message); }
          } catch { /* skip */ }
        }
      }
    }).catch((err) => {
      if (err instanceof Error && err.name === "AbortError") return;
      setState("error"); setError(err instanceof Error ? err.message : "エラーが発生しました");
    });
  }, []);

  return { state, statusMessage, reasoning, proposals, error, run, reset };
}
