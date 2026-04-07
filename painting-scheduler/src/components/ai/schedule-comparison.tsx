"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIOptimizationResult, WeatherDay } from "@/lib/types";
import { GanttChart } from "@/components/site-detail/gantt-chart";
import { getDaysBetween } from "@/lib/utils";

interface ScheduleComparisonProps {
  result: AIOptimizationResult;
  weatherDays: WeatherDay[];
}

export function ScheduleComparison({
  result,
  weatherDays,
}: ScheduleComparisonProps) {
  const originalFirst = result.originalSchedule[0]?.scheduledStart;
  const originalLast =
    result.originalSchedule[result.originalSchedule.length - 1]?.scheduledEnd;
  const optimizedFirst = result.optimizedSchedule[0]?.scheduledStart;
  const optimizedLast =
    result.optimizedSchedule[result.optimizedSchedule.length - 1]?.scheduledEnd;

  const originalDays =
    originalFirst && originalLast
      ? getDaysBetween(originalFirst, originalLast)
      : 0;
  const optimizedDays =
    optimizedFirst && optimizedLast
      ? getDaysBetween(optimizedFirst, optimizedLast)
      : 0;

  const riskColors = {
    low: "text-green-600 bg-green-50",
    medium: "text-amber-600 bg-amber-50",
    high: "text-red-600 bg-red-50",
  };
  const riskLabels = { low: "低", medium: "中", high: "高" };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard
          label="工期変更"
          value={`${originalDays}日 → ${optimizedDays}日`}
          sub={
            result.impactDays > 0
              ? `+${result.impactDays}日`
              : result.impactDays < 0
                ? `${result.impactDays}日`
                : "変更なし"
          }
          subColor={
            result.impactDays > 0
              ? "text-red-600"
              : result.impactDays < 0
                ? "text-green-600"
                : "text-gray-600"
          }
        />
        <StatCard
          label="追加コスト"
          value={
            result.impactCost > 0 ? `約${result.impactCost}万円` : "なし"
          }
          sub={result.impactCost > 0 ? "天候遅延による" : ""}
          subColor="text-gray-500"
        />
        <StatCard
          label="リスク"
          value={riskLabels[result.riskLevel]}
          sub=""
          subColor={riskColors[result.riskLevel]}
          valueClassName={riskColors[result.riskLevel]}
        />
        <StatCard
          label="変更工程数"
          value={`${result.suggestions.length}件`}
          sub="AI提案"
          subColor="text-purple-600"
        />
      </motion.div>

      {/* AI summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">✨</span>
              <p className="text-sm text-gray-700">{result.summary}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Before/After comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-400" />
                変更前スケジュール
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <GanttChart
                processes={result.originalSchedule}
                weatherDays={weatherDays}
                compact
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-400" />
                AI最適化後スケジュール
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                  ✨ AI
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <GanttChart
                processes={result.optimizedSchedule}
                weatherDays={weatherDays}
                compact
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  subColor,
  valueClassName,
}: {
  label: string;
  value: string;
  sub: string;
  subColor: string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p
          className={`text-sm font-bold ${valueClassName || "text-gray-900"} ${
            valueClassName?.includes("bg-") ? "rounded-full px-2 py-0.5 inline-block" : ""
          }`}
        >
          {value}
        </p>
        {sub && <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}
