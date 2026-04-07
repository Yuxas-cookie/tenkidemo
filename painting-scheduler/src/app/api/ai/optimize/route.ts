import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SiteProcess, WeatherDay, Site } from "@/lib/types";
import { getSystemPrompt, getOptimizeUserPrompt } from "@/lib/ai/prompts";
import { parseAIResponse, generateMockResult } from "@/lib/ai/parse-response";

export async function POST(request: NextRequest) {
  const { site, processes, weather }: { site: Site; processes: SiteProcess[]; weather: WeatherDay[] } = await request.json();
  if (!process.env.ANTHROPIC_API_KEY) return streamMock(processes);

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        try {
          ctrl.enqueue(enc.encode(JSON.stringify({ type: "status", data: "天気データを分析中..." }) + "\n"));
          const res = await client.messages.create({
            model: "claude-sonnet-4-6-20250514", max_tokens: 4096, system: getSystemPrompt(),
            messages: [{ role: "user", content: getOptimizeUserPrompt(site, processes, weather) }], stream: true,
          });
          let full = ""; let sentStatus = false;
          for await (const ev of res) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              full += ev.delta.text;
              if (!sentStatus && full.length > 50) { ctrl.enqueue(enc.encode(JSON.stringify({ type: "status", data: "最適スケジュールを計算中..." }) + "\n")); sentStatus = true; }
              ctrl.enqueue(enc.encode(JSON.stringify({ type: "reasoning_chunk", data: ev.delta.text }) + "\n"));
            }
          }
          ctrl.enqueue(enc.encode(JSON.stringify({ type: "result", data: parseAIResponse(full, processes) }) + "\n"));
        } catch (e) {
          ctrl.enqueue(enc.encode(JSON.stringify({ type: "error", data: { message: e instanceof Error ? e.message : "エラー" } }) + "\n"));
        } finally { ctrl.close(); }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "エラー" }, { status: 500 });
  }
}

function streamMock(processes: SiteProcess[]) {
  const enc = new TextEncoder(); const mock = generateMockResult(processes, "optimize");
  const stream = new ReadableStream({
    async start(ctrl) {
      for (const msg of ["天気データを分析中...", "工程の依存関係を確認中...", "最適スケジュールを計算中...", "提案を生成中..."]) {
        ctrl.enqueue(enc.encode(JSON.stringify({ type: "status", data: msg }) + "\n")); await new Promise((r) => setTimeout(r, 800));
      }
      for (const chunk of (mock.reasoning.match(/.{1,20}/g) || [])) {
        ctrl.enqueue(enc.encode(JSON.stringify({ type: "reasoning_chunk", data: chunk }) + "\n")); await new Promise((r) => setTimeout(r, 50));
      }
      await new Promise((r) => setTimeout(r, 300));
      ctrl.enqueue(enc.encode(JSON.stringify({ type: "result", data: mock }) + "\n"));
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" } });
}
