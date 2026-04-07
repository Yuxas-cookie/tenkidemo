import { AIOptimizationResult, SiteProcess } from "@/lib/types";

export function extractJSON(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  const j = text.match(/\{[\s\S]*\}/);
  return j ? j[0] : text;
}

export function parseAIResponse(text: string, original: SiteProcess[]): AIOptimizationResult {
  const raw = JSON.parse(extractJSON(text));
  const optimized = original.map((proc) => {
    const ai = raw.optimizedSchedule?.find((i: { id: number }) => i.id === proc.id);
    if (ai?.aiModified) return { ...proc, scheduledStart: ai.scheduledStart, scheduledEnd: ai.scheduledEnd, aiModified: true, aiReason: ai.aiReason || "" };
    return { ...proc, aiModified: false };
  });
  return { originalSchedule: original, optimizedSchedule: optimized, summary: raw.summary || "", reasoning: raw.reasoning || "", impactDays: raw.impactDays || 0, impactCost: raw.impactCost || 0, riskLevel: raw.riskLevel || "medium", suggestions: raw.suggestions || [] };
}

export function generateMockResult(original: SiteProcess[], mode: "optimize" | "reschedule"): AIOptimizationResult {
  const optimized = original.map((p) => {
    if (p.id >= 7 && p.id <= 9) {
      const s = new Date(p.scheduledStart); const e = new Date(p.scheduledEnd);
      s.setDate(s.getDate() + 3); e.setDate(e.getDate() + 3);
      return { ...p, scheduledStart: s.toISOString().split("T")[0], scheduledEnd: e.toISOString().split("T")[0], aiModified: true, aiReason: p.id === 7 ? "雨予報回避のため3日後にずらしました" : "前工程の遅延に伴い調整" };
    }
    if (p.id >= 10) {
      const s = new Date(p.scheduledStart); const e = new Date(p.scheduledEnd);
      s.setDate(s.getDate() + 3); e.setDate(e.getDate() + 3);
      return { ...p, scheduledStart: s.toISOString().split("T")[0], scheduledEnd: e.toISOString().split("T")[0], aiModified: true, aiReason: "前工程の遅延に伴い調整" };
    }
    return { ...p, aiModified: false };
  });
  return {
    originalSchedule: original, optimizedSchedule: optimized,
    summary: mode === "reschedule" ? "天気予報急変に対応し、下塗り以降を3日後にずらしました。" : "5日目からの雨予報を回避し、下塗り以降を3日後にずらす最適スケジュールです。",
    reasoning: "天気予報を分析した結果、工事開始5日目から3日間の降雨が予想されます。下塗り以降の工程を雨天明けに移動することで、塗膜品質を確保しつつ工期延長を最小限に抑えます。\n\n工期は3日間延長となりますが、天候リスクを完全に回避でき、手直し工事のリスクも低減できます。",
    impactDays: 3, impactCost: mode === "reschedule" ? 8 : 5, riskLevel: "medium",
    suggestions: [
      { processId: 7, type: "move", description: "下塗りを3日後に移動", reason: "雨予報回避のため" },
      { processId: 8, type: "move", description: "中塗りを3日後に移動", reason: "下塗り乾燥待ち+雨天回避" },
      { processId: 9, type: "move", description: "上塗りを3日後に移動", reason: "中塗り乾燥待ち+雨天回避" },
      { processId: 10, type: "parallel", description: "付帯部塗装を上塗りと並行", reason: "工期短縮のため" },
    ],
  };
}
