import { Site, SiteProcess, WeatherDay } from "@/lib/types";

export function getSystemPrompt(): string {
  return `あなたは塗装工事の工程管理AIアシスタントです。
天気予報データと工程情報を分析し、最適な工程スケジュールを提案します。

## 塗装工事の天候ルール
- 気温5℃以上・湿度85%未満が施工条件
- 雨天時は塗装系工程（高圧洗浄〜付帯部塗装）すべて不可
- 足場関連（足場設置、足場解体）は小雨可・強風NG
- 点検は目視可だが手直し塗装は雨天不可
- 各塗装工程後には乾燥時間が必要（下塗り・中塗り・上塗りは各1日）

## 雨天耐性
- "ok": 雨天でも作業可能（近隣挨拶・準備）
- "partial": 小雨なら可能（足場設置、点検、足場解体）
- "ng": 雨天不可（高圧洗浄、下地処理、シーリング、養生、下塗り、中塗り、上塗り、付帯部塗装）

## 工程の依存関係
工程は基本的に順序通り進行します。付帯部塗装（工程10）のみ上塗り（工程9）と並行作業可能です。

## 回答形式
必ず以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

\`\`\`json
{
  "summary": "変更の要約（日本語・1〜2文）",
  "reasoning": "詳細な判断理由（日本語・天気データを元にした具体的な説明）",
  "impactDays": 数値（工期への影響日数。短縮ならマイナス、延長ならプラス）,
  "impactCost": 数値（追加コスト概算・万円単位）,
  "riskLevel": "low" | "medium" | "high",
  "suggestions": [
    {
      "processId": 工程ID,
      "type": "move" | "split" | "parallel" | "cancel",
      "description": "変更内容の説明",
      "reason": "変更理由"
    }
  ],
  "optimizedSchedule": [
    {
      "id": 工程ID,
      "scheduledStart": "YYYY-MM-DD",
      "scheduledEnd": "YYYY-MM-DD",
      "aiModified": true/false,
      "aiReason": "変更理由（変更した場合のみ）"
    }
  ]
}
\`\`\``;
}

function formatProcesses(processes: SiteProcess[]): string {
  return processes
    .map(
      (p) =>
        `| ${p.id} | ${p.name} | ${p.scheduledStart} | ${p.scheduledEnd} | ${p.status} | 雨天:${p.rainTolerance} | 乾燥:${p.dryingDays}日 |`
    )
    .join("\n");
}

function formatWeather(days: WeatherDay[]): string {
  return days
    .map(
      (d) =>
        `| ${d.date} | ${d.weather} | ${d.tempMax}℃/${d.tempMin}℃ | 湿度${d.humidity}% | 風速${d.windSpeed}m/s | 施工${d.canWork ? "可" : "不可"} |`
    )
    .join("\n");
}

export function getOptimizeUserPrompt(
  site: Site,
  processes: SiteProcess[],
  weather: WeatherDay[]
): string {
  return `## 現場情報
- 現場名: ${site.name}
- 住所: ${site.address}
- 建物種別: ${site.buildingType}
- 塗装面積: ${site.paintArea}m²
- 開始日: ${site.startDate}

## 現在の工程スケジュール
| ID | 工程名 | 開始予定 | 終了予定 | ステータス | 雨天耐性 | 乾燥時間 |
|----|--------|---------|---------|----------|---------|---------|
${formatProcesses(processes)}

## 天気予報（今後16日間）
| 日付 | 天気 | 気温 | 湿度 | 風速 | 施工可否 |
|------|------|------|------|------|---------|
${formatWeather(weather)}

上記の天気予報を考慮して、最適な工程スケジュールを提案してください。
雨天で施工不可の日は工程をずらし、工期の遅延を最小限に抑えてください。`;
}

export function getRescheduleUserPrompt(
  site: Site,
  processes: SiteProcess[],
  weather: WeatherDay[]
): string {
  const completed = processes.filter((p) => p.status === "completed");
  const remaining = processes.filter((p) => p.status !== "completed");

  return `## 緊急リスケジュール依頼

天気予報が急変しました。残りの工程を再スケジュールしてください。

## 現場情報
- 現場名: ${site.name}
- 塗装面積: ${site.paintArea}m²

## 完了済み工程
${completed.length > 0 ? completed.map((p) => `- ${p.name}（${p.scheduledEnd}完了）`).join("\n") : "なし"}

## 残り工程（リスケ対象）
| ID | 工程名 | 開始予定 | 終了予定 | ステータス | 雨天耐性 | 乾燥時間 |
|----|--------|---------|---------|----------|---------|---------|
${formatProcesses(remaining)}

## 最新天気予報
| 日付 | 天気 | 気温 | 湿度 | 風速 | 施工可否 |
|------|------|------|------|------|---------|
${formatWeather(weather)}

緊急度が高いため、工期遅延を最小限に抑える最適なスケジュールを即座に提案してください。`;
}
