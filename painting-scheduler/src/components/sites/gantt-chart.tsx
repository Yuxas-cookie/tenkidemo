"use client";

import { useMemo } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SiteProcess, WeatherDay } from "@/lib/types";
import { formatDate, getWeatherEmoji, getStatusLabel, getStatusColor } from "@/lib/utils";

interface GanttChartProps {
  processes: SiteProcess[];
  weatherDays: WeatherDay[];
  compact?: boolean;
}

function getBarColor(status: string, aiModified?: boolean) {
  if (aiModified) return "bg-gradient-to-r from-purple-400 to-purple-500";
  switch (status) {
    case "completed": return "bg-gradient-to-r from-green-400 to-green-500";
    case "in_progress": return "bg-gradient-to-r from-blue-400 to-blue-500";
    case "weather_hold": return "bg-gradient-to-r from-amber-400 to-amber-500";
    default: return "bg-gradient-to-r from-gray-300 to-gray-400";
  }
}

function getRainIcon(tolerance: string) {
  return tolerance === "ok" ? "✅" : tolerance === "partial" ? "⚠️" : "🚫";
}

export function GanttChart({ processes, weatherDays, compact = false }: GanttChartProps) {
  const { dateRange, dateToCol } = useMemo(() => {
    let minDate = new Date("2099-12-31");
    let maxDate = new Date("2000-01-01");
    for (const p of processes) {
      const s = new Date(p.scheduledStart);
      const e = new Date(p.scheduledEnd);
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 2);
    const dates: string[] = [];
    const cur = new Date(minDate);
    while (cur <= maxDate) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    const colMap = new Map<string, number>();
    dates.forEach((d, i) => colMap.set(d, i));
    return { dateRange: dates, dateToCol: (d: string) => colMap.get(d) ?? 0 };
  }, [processes]);

  const weatherMap = useMemo(() => {
    const map = new Map<string, WeatherDay>();
    weatherDays.forEach((d) => map.set(d.date, d));
    return map;
  }, [weatherDays]);

  const lw = compact ? "min-w-[140px]" : "min-w-[230px]";
  const cw = compact ? "min-w-[40px]" : "min-w-[56px]";
  const rh = compact ? "h-10" : "h-14";

  return (
    <ScrollArea className="w-full">
      <div className="min-w-fit">
        {/* Header */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50/50">
          <div className={`${lw} shrink-0 border-r-2 border-gray-200 p-3`}>
            <span className="text-sm font-bold text-gray-500">工程名</span>
          </div>
          <div className="flex">
            {dateRange.map((date) => {
              const w = weatherMap.get(date);
              return (
                <div key={date} className={`${cw} shrink-0 text-center border-r border-gray-100 py-2 ${w && !w.canWork ? "bg-red-50" : ""}`}>
                  <div className="text-sm font-medium text-gray-500">{formatDate(date)}</div>
                  {w && <div className={compact ? "text-base" : "text-xl"}>{getWeatherEmoji(w.weather)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        {processes.map((proc) => {
          const sc = dateToCol(proc.scheduledStart);
          const ec = dateToCol(proc.scheduledEnd);
          const span = ec - sc + 1;
          return (
            <div key={proc.id} className="flex border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
              <div className={`${lw} shrink-0 border-r-2 border-gray-200 p-3 flex items-center gap-2`}>
                <span className={compact ? "text-sm" : "text-base"}>{getRainIcon(proc.rainTolerance)}</span>
                <span className={`${compact ? "text-sm" : "text-base"} font-semibold text-gray-700 truncate`}>{proc.name}</span>
                {!compact && (
                  <Badge className={`${getStatusColor(proc.status)} text-sm ml-auto shrink-0`} variant="secondary">
                    {getStatusLabel(proc.status)}
                  </Badge>
                )}
              </div>
              <div className={`flex relative ${rh}`}>
                {dateRange.map((date) => {
                  const w = weatherMap.get(date);
                  return <div key={date} className={`${cw} shrink-0 border-r border-gray-50 ${w && !w.canWork ? "bg-red-50/40" : ""}`} />;
                })}
                <Tooltip>
                  <TooltipTrigger
                    className={`absolute ${compact ? "top-1.5 h-7" : "top-2 h-10"} rounded-lg ${getBarColor(proc.status, proc.aiModified)} shadow-md cursor-pointer flex items-center px-3 hover:brightness-110 transition-all`}
                    style={{
                      left: `calc(${sc} * ${compact ? "40px" : "56px"})`,
                      width: `calc(${span} * ${compact ? "40px" : "56px"} - 4px)`,
                    }}
                  >
                    {!compact && <span className="text-sm text-white font-semibold truncate">{proc.name}</span>}
                    {proc.aiModified && <span className="ml-auto text-sm">✨</span>}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-bold text-base">{proc.name}</p>
                    <p className="text-sm text-gray-400">{proc.scheduledStart} 〜 {proc.scheduledEnd}</p>
                    <p className="text-sm mt-1">{proc.description}</p>
                    {proc.aiModified && proc.aiReason && (
                      <p className="text-sm text-purple-400 mt-1">✨ {proc.aiReason}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
