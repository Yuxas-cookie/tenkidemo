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
  if (aiModified) return "bg-gradient-to-r from-purple-400 to-purple-500";
  switch (status) {
    case "completed":
      return "bg-gradient-to-r from-green-400 to-green-500";
    case "in_progress":
      return "bg-gradient-to-r from-blue-400 to-blue-500";
    case "weather_hold":
      return "bg-gradient-to-r from-amber-400 to-amber-500";
    default:
      return "bg-gradient-to-r from-gray-300 to-gray-400";
  }
}

export function GanttChart({
  processes,
  weatherDays,
  compact = false,
}: GanttChartProps) {
  const { dateRange, dateToCol } = useMemo(() => {
    let minDate = new Date("2099-12-31");
    let maxDate = new Date("2000-01-01");

    for (const p of processes) {
      const start = new Date(p.scheduledStart);
      const end = new Date(p.scheduledEnd);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    }

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
    };
  }, [processes]);

  const weatherMap = useMemo(() => {
    const map = new Map<string, WeatherDay>();
    for (const day of weatherDays) {
      map.set(day.date, day);
    }
    return map;
  }, [weatherDays]);

  const labelWidth = compact ? "min-w-[150px]" : "min-w-[220px]";
  const colWidth = compact ? "min-w-[40px]" : "min-w-[56px]";
  const rowHeight = compact ? "h-10" : "h-14";

  return (
    <ScrollArea className="w-full">
      <div className="min-w-fit">
        {/* Date header */}
        <div className="flex border-b-2 border-gray-200">
          <div
            className={`${labelWidth} shrink-0 border-r-2 border-gray-200 p-3`}
          >
            <span className="text-sm font-bold text-gray-600">工程名</span>
          </div>
          <div className="flex">
            {dateRange.map((date) => {
              const weather = weatherMap.get(date);
              const canWork = weather?.canWork ?? true;
              return (
                <div
                  key={date}
                  className={`${colWidth} shrink-0 text-center border-r border-gray-100 py-2 ${
                    !canWork ? "bg-red-50" : ""
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500">
                    {formatDate(date)}
                  </div>
                  {weather && (
                    <div className={`${compact ? "text-sm" : "text-lg"} leading-none mt-0.5`}>
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
              className="flex border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              {/* Label */}
              <div
                className={`${labelWidth} shrink-0 border-r-2 border-gray-200 p-3 flex items-center gap-2`}
              >
                <span className={compact ? "text-sm" : "text-base"}>
                  {getRainToleranceIcon(process.rainTolerance)}
                </span>
                <span
                  className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-700 truncate`}
                >
                  {process.name}
                </span>
                {!compact && (
                  <Badge
                    className={`${getStatusColor(process.status)} text-[11px] px-2 py-0.5 ml-auto shrink-0`}
                    variant="secondary"
                  >
                    {getStatusLabel(process.status)}
                  </Badge>
                )}
              </div>

              {/* Timeline */}
              <div className={`flex relative ${rowHeight}`}>
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
                    className={`absolute ${compact ? "top-2 h-6" : "top-2 h-10"} rounded-lg ${getBarColor(process.status, process.aiModified)} shadow-md cursor-pointer flex items-center px-3 hover:brightness-110 transition-all`}
                    style={{
                      left: `calc(${startCol} * ${compact ? "40px" : "56px"})`,
                      width: `calc(${span} * ${compact ? "40px" : "56px"} - 4px)`,
                    }}
                  >
                    {!compact && (
                      <span className="text-xs text-white font-semibold truncate">
                        {process.name}
                      </span>
                    )}
                    {process.aiModified && (
                      <span className="ml-auto text-sm">✨</span>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1.5 p-1">
                      <p className="font-bold text-base">{process.name}</p>
                      <p className="text-sm text-gray-400">
                        {process.scheduledStart} 〜 {process.scheduledEnd}
                      </p>
                      <p className="text-sm">{process.description}</p>
                      {process.aiModified && process.aiReason && (
                        <p className="text-sm text-purple-400 font-medium">
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
