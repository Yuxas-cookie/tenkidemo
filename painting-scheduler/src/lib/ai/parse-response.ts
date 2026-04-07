import { AIOptimizationResult, SiteProcess } from "@/lib/types";

interface AIRawScheduleItem {
  id: number;
  scheduledStart: string;
  scheduledEnd: string;
  aiModified: boolean;
  aiReason?: string;
}

interface AIRawResponse {
  summary: string;
  reasoning: string;
  impactDays: number;
  impactCost: number;
  riskLevel: "low" | "medium" | "high";
  suggestions: {
    processId: number;
    type: "move" | "split" | "parallel" | "cancel";
    description: string;
    reason: string;
  }[];
  optimizedSchedule: AIRawScheduleItem[];
}

export function extractJSON(text: string): string {
  // Try to extract JSON from code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
}

export function parseAIResponse(
  text: string,
  originalProcesses: SiteProcess[]
): AIOptimizationResult {
  const jsonStr = extractJSON(text);
  const raw: AIRawResponse = JSON.parse(jsonStr);

  const optimizedSchedule: SiteProcess[] = originalProcesses.map((proc) => {
    const aiItem = raw.optimizedSchedule?.find((item) => item.id === proc.id);
    if (aiItem && aiItem.aiModified) {
      return {
        ...proc,
        scheduledStart: aiItem.scheduledStart,
        scheduledEnd: aiItem.scheduledEnd,
        aiModified: true,
        aiReason: aiItem.aiReason || "",
      };
    }
    return { ...proc, aiModified: false };
  });

  return {
    originalSchedule: originalProcesses,
    optimizedSchedule,
    summary: raw.summary || "",
    reasoning: raw.reasoning || "",
    impactDays: raw.impactDays || 0,
    impactCost: raw.impactCost || 0,
    riskLevel: raw.riskLevel || "medium",
    suggestions: raw.suggestions || [],
  };
}

export function generateMockResult(
  originalProcesses: SiteProcess[],
  scenario: "optimize" | "reschedule"
): AIOptimizationResult {
  const optimizedSchedule: SiteProcess[] = originalProcesses.map((proc) => {
    // Simulate moving rain-sensitive processes for mid_rain scenario
    if (proc.id >= 7 && proc.id <= 9 && proc.rainTolerance === "ng") {
      const start = new Date(proc.scheduledStart);
      const end = new Date(proc.scheduledEnd);
      start.setDate(start.getDate() + 3);
      end.setDate(end.getDate() + 3);
      return {
        ...proc,
        scheduledStart: start.toISOString().split("T")[0],
        scheduledEnd: end.toISOString().split("T")[0],
        aiModified: true,
        aiReason:
          proc.id === 7
            ? "雨予報のため下塗りを3日後にずらしました"
            : proc.id === 8
              ? "下塗りの乾燥待ち＋雨天回避のため中塗りを3日後にずらしました"
              : "中塗りの乾燥待ち＋雨天回避のため上塗りを3日後にずらしました",
      };
    }
    if (proc.id >= 10) {
      const start = new Date(proc.scheduledStart);
      const end = new Date(proc.scheduledEnd);
      start.setDate(start.getDate() + 3);
      end.setDate(end.getDate() + 3);
      return {
        ...proc,
        scheduledStart: start.toISOString().split("T")[0],
        scheduledEnd: end.toISOString().split("T")[0],
        aiModified: true,
        aiReason: "前工程の遅延に伴い日程を調整しました",
      };
    }
    return { ...proc, aiModified: false };
  });

  const isReschedule = scenario === "reschedule";

  return {
    originalSchedule: originalProcesses,
    optimizedSchedule,
    summary: isReschedule
      ? "天気予報の急変に対応し、塗装工程を3日間後ろにずらしました。足場設置までの工程は予定通り進行可能です。"
      : "5日目からの3日間の雨予報を回避するため、下塗り以降の工程を3日後にずらす最適スケジュールを提案します。",
    reasoning: isReschedule
      ? "最新の天気予報によると、当初予定していた下塗り〜上塗りの期間に3日間の降雨が予想されます。塗装工程は湿度85%未満・気温5℃以上が必須条件のため、この期間の施工は品質リスクが高くなります。\n\n対応策として、下塗り（工程7）を雨天明けの日程に移動し、中塗り・上塗りもそれに合わせて順延します。付帯部塗装は上塗りと並行して実施し、全体の遅延を最小限に抑えます。\n\n工期は3日間延長となりますが、塗膜品質を確保し、手直し工事のリスクを回避できます。"
      : "天気予報を分析した結果、工事開始5日目から3日間の降雨が予想されます。この期間は高圧洗浄後の乾燥〜下塗りにあたるため、スケジュール調整が必要です。\n\n下塗り以降の6工程を3日後にずらすことで、すべての塗装工程を晴天日に実施できます。近隣挨拶〜養生までの6工程は予定通り進行可能です。\n\n工期全体は3日間延長（約17日→約20日）となりますが、天候リスクを完全に回避でき、塗膜の品質を確保できます。",
    impactDays: 3,
    impactCost: isReschedule ? 8 : 5,
    riskLevel: "medium",
    suggestions: [
      {
        processId: 7,
        type: "move",
        description: "下塗りを3日後に移動",
        reason: "雨予報期間を回避し、適切な気象条件下で施工するため",
      },
      {
        processId: 8,
        type: "move",
        description: "中塗りを3日後に移動",
        reason: "下塗りの乾燥時間確保と雨天回避のため",
      },
      {
        processId: 9,
        type: "move",
        description: "上塗りを3日後に移動",
        reason: "中塗りの乾燥時間確保と雨天回避のため",
      },
      {
        processId: 10,
        type: "parallel",
        description: "付帯部塗装を上塗りと並行実施",
        reason: "工期短縮のため並行作業を推奨",
      },
    ],
  };
}
