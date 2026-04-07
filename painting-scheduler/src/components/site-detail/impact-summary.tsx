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

  const weatherImpactDays = weatherDays.filter((d) => {
    if (!firstStart || !lastEnd) return false;
    return d.date >= firstStart && d.date <= lastEnd && !d.canWork;
  }).length;

  const dailyCost = Math.round((paintArea / 150) * 1.5);
  const estimatedExtraCost = weatherImpactDays * dailyCost;

  const stats = [
    {
      label: "予定工期",
      value: `${totalDays}`,
      unit: "日",
      icon: "📅",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: "天候影響",
      value: `${weatherImpactDays}`,
      unit: "日",
      icon: "🌧️",
      color: weatherImpactDays > 0 ? "text-amber-600" : "text-green-600",
      bg: weatherImpactDays > 0 ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100",
    },
    {
      label: "予想遅延",
      value: `${weatherImpactDays}`,
      unit: "日",
      icon: "⏱️",
      color: weatherImpactDays > 0 ? "text-red-600" : "text-green-600",
      bg: weatherImpactDays > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100",
    },
    {
      label: "追加コスト概算",
      value: estimatedExtraCost > 0 ? `${estimatedExtraCost}` : "0",
      unit: "万円",
      icon: "💰",
      color: estimatedExtraCost > 0 ? "text-red-600" : "text-green-600",
      bg: estimatedExtraCost > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Card className={`${stat.bg} border-2`}>
            <CardContent className="p-5 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm text-gray-500 mt-2 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
                <span className="text-base font-medium ml-1">{stat.unit}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
