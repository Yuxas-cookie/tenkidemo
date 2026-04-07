"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SiteProcess, WeatherDay } from "@/lib/types";
import { getDaysBetween } from "@/lib/utils";

interface ImpactSummaryProps {
  processes: SiteProcess[];
  weatherDays: WeatherDay[];
  paintArea: number;
}

export function ImpactSummary({
  processes,
  weatherDays,
  paintArea,
}: ImpactSummaryProps) {
  const firstStart = processes[0]?.scheduledStart;
  const lastEnd = processes[processes.length - 1]?.scheduledEnd;
  const totalDays = firstStart && lastEnd ? getDaysBetween(firstStart, lastEnd) : 0;

  // Count non-workable days within the schedule range
  const weatherImpactDays = weatherDays.filter((d) => {
    if (!firstStart || !lastEnd) return false;
    return d.date >= firstStart && d.date <= lastEnd && !d.canWork;
  }).length;

  // Estimate cost impact (simplified: 15,000 yen/day for house, scaled by area)
  const dailyCost = Math.round((paintArea / 150) * 1.5);
  const estimatedExtraCost = weatherImpactDays * dailyCost;

  const stats = [
    {
      label: "予定工期",
      value: `${totalDays}日`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "天候影響",
      value: `${weatherImpactDays}日`,
      color: weatherImpactDays > 0 ? "text-amber-600" : "text-green-600",
      bg: weatherImpactDays > 0 ? "bg-amber-50" : "bg-green-50",
    },
    {
      label: "予想遅延",
      value: `${weatherImpactDays}日`,
      color: weatherImpactDays > 0 ? "text-red-600" : "text-green-600",
      bg: weatherImpactDays > 0 ? "bg-red-50" : "bg-green-50",
    },
    {
      label: "追加コスト概算",
      value: estimatedExtraCost > 0 ? `約${estimatedExtraCost}万円` : "なし",
      color: estimatedExtraCost > 0 ? "text-red-600" : "text-green-600",
      bg: estimatedExtraCost > 0 ? "bg-red-50" : "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Card className={stat.bg}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
