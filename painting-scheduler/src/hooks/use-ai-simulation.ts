"use client";

import { useState, useCallback, useRef } from "react";
import {
  AIOptimizationResult,
  SimulationState,
  SimulationMode,
  Site,
  WeatherDay,
} from "@/lib/types";

interface UseAISimulationReturn {
  state: SimulationState;
  statusMessage: string;
  reasoning: string;
  result: AIOptimizationResult | null;
  error: string | null;
  run: (site: Site, weather: WeatherDay[], mode: SimulationMode) => void;
  reset: () => void;
}

export function useAISimulation(): UseAISimulationReturn {
  const [state, setState] = useState<SimulationState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [result, setResult] = useState<AIOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState("idle");
    setStatusMessage("");
    setReasoning("");
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(
    (site: Site, weather: WeatherDay[], mode: SimulationMode) => {
      // Reset previous state
      setState("thinking");
      setStatusMessage("AIエンジンを起動中...");
      setReasoning("");
      setResult(null);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const endpoint =
        mode === "optimize" ? "/api/ai/optimize" : "/api/ai/reschedule";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site,
          processes: site.processes,
          weather,
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const event = JSON.parse(line);
                switch (event.type) {
                  case "status":
                    setStatusMessage(event.data);
                    break;
                  case "reasoning_chunk":
                    setState("streaming");
                    setReasoning((prev) => prev + event.data);
                    break;
                  case "result":
                    setState("complete");
                    setResult(event.data);
                    break;
                  case "error":
                    setState("error");
                    setError(event.data.message);
                    break;
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        })
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setState("error");
          setError(
            err instanceof Error ? err.message : "予期せぬエラーが発生しました"
          );
        });
    },
    []
  );

  return { state, statusMessage, reasoning, result, error, run, reset };
}
