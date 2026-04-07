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
    low: "text-green-600 bg-green-50 border-green-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };
  const riskLabels = { low: "低", medium: "中", high: "高" };

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard
          icon="📅"
          label="工期変更"
          value={`${originalDays}日 → ${optimizedDays}日`}
          sub={
            result.impactDays > 0
              ? `+${result.impactDays}日延長`
              : result.impactDays < 0
                ? `${result.impactDays}日短縮`
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
          icon="💰"
          label="追加コスト"
          value={
            result.impactCost > 0 ? `約${result.impactCost}万円` : "なし"
          }
          sub={result.impactCost > 0 ? "天候遅延による" : ""}
          subColor="text-gray-500"
        />
        <StatCard
          icon="⚡"
          label="リスク"
          value={riskLabels[result.riskLevel]}
          sub=""
          subColor={riskColors[result.riskLevel]}
          valueClassName={`${riskColors[result.riskLevel]} border-2 rounded-full px-4 py-1 inline-block`}
        />
        <StatCard
          icon="✨"
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
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">✨</span>
              <p className="text-lg text-gray-700 leading-relaxed">{result.summary}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Before/After comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-gray-400" />
                変更前スケジュール
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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
          <Card className="border-2 border-purple-200 shadow-lg shadow-purple-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-purple-400" />
                AI最適化後スケジュール
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold border border-purple-200">
                  ✨ AI
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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
  icon,
  label,
  value,
  sub,
  subColor,
  valueClassName,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  subColor: string;
  valueClassName?: string;
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-5 text-center">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm text-gray-500 mt-2 mb-1">{label}</p>
        <p
          className={`text-lg font-bold ${valueClassName || "text-gray-900"}`}
        >
          {value}
        </p>
        {sub && <p className={`text-sm mt-1 font-medium ${subColor}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}
