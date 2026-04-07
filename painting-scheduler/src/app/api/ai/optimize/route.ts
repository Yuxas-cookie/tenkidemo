import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SiteProcess, WeatherDay, Site } from "@/lib/types";
import { getSystemPrompt, getOptimizeUserPrompt } from "@/lib/ai/prompts";
import {
  parseAIResponse,
  generateMockResult,
} from "@/lib/ai/parse-response";

interface OptimizeRequest {
  site: Site;
  processes: SiteProcess[];
  weather: WeatherDay[];
}

export async function POST(request: NextRequest) {
  const body: OptimizeRequest = await request.json();
  const { site, processes, weather } = body;

  // If no API key, return mock result with streaming simulation
  if (!process.env.ANTHROPIC_API_KEY) {
    return streamMockResponse(processes);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "status", data: "天気データを分析中..." }) +
                "\n"
            )
          );

          const response = await client.messages.create({
            model: "claude-sonnet-4-6-20250514",
            max_tokens: 4096,
            system: getSystemPrompt(),
            messages: [
              {
                role: "user",
                content: getOptimizeUserPrompt(site, processes, weather),
              },
            ],
            stream: true,
          });

          let fullText = "";
          let sentReasoning = false;

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullText += event.delta.text;

              // Send reasoning chunks
              if (!sentReasoning && fullText.length > 50) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: "status",
                      data: "工程の依存関係を確認中...",
                    }) + "\n"
                  )
                );
                sentReasoning = true;
              }

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "reasoning_chunk",
                    data: event.delta.text,
                  }) + "\n"
                )
              );
            }
          }

          // Parse and send final result
          const result = parseAIResponse(fullText, processes);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "result", data: result }) + "\n"
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                data: {
                  message:
                    err instanceof Error ? err.message : "AI処理中にエラーが発生しました",
                },
              }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "AI処理中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

function streamMockResponse(processes: SiteProcess[]) {
  const encoder = new TextEncoder();
  const mockResult = generateMockResult(processes, "optimize");

  const stream = new ReadableStream({
    async start(controller) {
      const statusMessages = [
        "天気データを分析中...",
        "工程の依存関係を確認中...",
        "最適スケジュールを計算中...",
        "提案を生成中...",
      ];

      for (const msg of statusMessages) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "status", data: msg }) + "\n"
          )
        );
        await new Promise((r) => setTimeout(r, 800));
      }

      // Stream reasoning in chunks
      const reasoningChunks = mockResult.reasoning.match(/.{1,20}/g) || [];
      for (const chunk of reasoningChunks) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "reasoning_chunk", data: chunk }) + "\n"
          )
        );
        await new Promise((r) => setTimeout(r, 50));
      }

      await new Promise((r) => setTimeout(r, 300));

      controller.enqueue(
        encoder.encode(
          JSON.stringify({ type: "result", data: mockResult }) + "\n"
        )
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
