"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SiteProcess, WeatherDay } from "@/lib/types";
import {
  formatDate,
  getWeatherEmoji,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

interface GanttChartProps {
  processes: SiteProcess[];
  weatherDays: WeatherDay[];
  compact?: boolean;
}

function getRainToleranceIcon(tolerance: string) {
  switch (tolerance) {
    case "ok":
      return "✅";
    case "partial":
      return "⚠️";
    case "ng":
      return "🚫";
    default:
      return "";
  }
}

function getBarColor(status: string, aiModified?: boolean) {
  if (aiModified) return "bg-purple-400";
  switch (status) {
    case "completed":
      return "bg-green-400";
    case "in_progress":
      return "bg-blue-400";
    case "weather_hold":
      return "bg-amber-400";
    default:
      return "bg-gray-300";
  }
}

export function GanttChart({
  processes,
  weatherDays,
  compact = false,
}: GanttChartProps) {
  const { dateRange, dateToCol, totalCols } = useMemo(() => {
    // Find the date range from processes
    let minDate = new Date("2099-12-31");
    let maxDate = new Date("2000-01-01");

    for (const p of processes) {
      const start = new Date(p.scheduledStart);
      const end = new Date(p.scheduledEnd);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    }

    // Add buffer
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 2);

    const dates: string[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const colMap = new Map<string, number>();
    dates.forEach((d, i) => colMap.set(d, i));

    return {
      dateRange: dates,
      dateToCol: (date: string) => colMap.get(date) ?? 0,
      totalCols: dates.length,
    };
  }, [processes]);

  const weatherMap = useMemo(() => {
    const map = new Map<string, WeatherDay>();
    for (const day of weatherDays) {
      map.set(day.date, day);
    }
    return map;
  }, [weatherDays]);

  const labelWidth = compact ? "min-w-[140px]" : "min-w-[200px]";
  const colWidth = compact ? "min-w-[36px]" : "min-w-[48px]";
  const rowHeight = compact ? "h-8" : "h-10";

  return (
    <ScrollArea className="w-full">
      <div className="min-w-fit">
        {/* Date header */}
        <div className="flex border-b border-gray-200">
          <div
            className={`${labelWidth} shrink-0 border-r border-gray-200 p-2`}
          >
            <span className="text-xs font-medium text-gray-500">工程</span>
          </div>
          <div className="flex">
            {dateRange.map((date) => {
              const weather = weatherMap.get(date);
              const canWork = weather?.canWork ?? true;
              return (
                <div
                  key={date}
                  className={`${colWidth} shrink-0 text-center border-r border-gray-100 p-1 ${
                    !canWork ? "bg-red-50" : ""
                  }`}
                >
                  <div className="text-[10px] text-gray-400">
                    {formatDate(date)}
                  </div>
                  {weather && (
                    <div className="text-xs leading-none">
                      {getWeatherEmoji(weather.weather)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Process rows */}
        {processes.map((process, i) => {
          const startCol = dateToCol(process.scheduledStart);
          const endCol = dateToCol(process.scheduledEnd);
          const span = endCol - startCol + 1;

          return (
            <motion.div
              key={process.id}
              className="flex border-b border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              {/* Label */}
              <div
                className={`${labelWidth} shrink-0 border-r border-gray-200 p-2 flex items-center gap-1.5`}
              >
                <span className="text-xs">
                  {getRainToleranceIcon(process.rainTolerance)}
                </span>
                <span
                  className={`text-xs font-medium text-gray-700 truncate ${compact ? "max-w-[100px]" : ""}`}
                >
                  {process.name}
                </span>
                {!compact && (
                  <Badge
                    className={`${getStatusColor(process.status)} text-[10px] px-1.5 py-0 ml-auto shrink-0`}
                    variant="secondary"
                  >
                    {getStatusLabel(process.status)}
                  </Badge>
                )}
              </div>

              {/* Timeline */}
              <div className={`flex relative ${rowHeight}`}>
                {/* Background columns with weather highlight */}
                {dateRange.map((date) => {
                  const weather = weatherMap.get(date);
                  const canWork = weather?.canWork ?? true;
                  return (
                    <div
                      key={date}
                      className={`${colWidth} shrink-0 border-r border-gray-50 ${
                        !canWork ? "bg-red-50/50" : ""
                      }`}
                    />
                  );
                })}

                {/* Process bar */}
                <Tooltip>
                  <TooltipTrigger
                    className={`absolute top-1.5 ${compact ? "h-5" : "h-7"} rounded-md ${getBarColor(process.status, process.aiModified)} shadow-sm cursor-pointer flex items-center px-2`}
                    style={{
                      left: `calc(${startCol} * ${compact ? "36px" : "48px"})`,
                      width: `calc(${span} * ${compact ? "36px" : "48px"} - 4px)`,
                    }}
                  >
                    {!compact && (
                      <span className="text-[10px] text-white font-medium truncate">
                        {process.name}
                      </span>
                    )}
                    {process.aiModified && (
                      <span className="ml-auto text-[10px]">✨</span>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{process.name}</p>
                      <p className="text-xs text-gray-500">
                        {process.scheduledStart} 〜 {process.scheduledEnd}
                      </p>
                      <p className="text-xs">{process.description}</p>
                      {process.aiModified && process.aiReason && (
                        <p className="text-xs text-purple-600">
                          ✨ AI: {process.aiReason}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
