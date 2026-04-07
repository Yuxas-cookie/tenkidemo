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

  // Sizes: compact for comparison view, large for main view
  const labelW = compact ? 160 : 280;
  const colW = compact ? 44 : 68;
  const rowH = compact ? 44 : 56;
  const barH = compact ? 28 : 40;
  const barTop = compact ? 8 : 8;

  return (
    <ScrollArea className="w-full">
      <div className="min-w-fit">
        {/* Header row */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50/80 sticky top-0 z-10">
          <div className="shrink-0 border-r-2 border-gray-200 px-4 py-3 flex items-center" style={{ minWidth: labelW }}>
            <span className="text-base font-bold text-gray-500">工程名</span>
          </div>
          <div className="flex">
            {dateRange.map((date) => {
              const w = weatherMap.get(date);
              return (
                <div key={date}
                  className={`shrink-0 text-center border-r border-gray-100 py-2 ${w && !w.canWork ? "bg-red-50" : ""}`}
                  style={{ minWidth: colW }}
                >
                  <div className="text-base font-semibold text-gray-600">{formatDate(date)}</div>
                  {w && <div className={compact ? "text-lg" : "text-2xl"}>{getWeatherEmoji(w.weather)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Process rows */}
        {processes.map((proc) => {
          const sc = dateToCol(proc.scheduledStart);
          const ec = dateToCol(proc.scheduledEnd);
          const span = ec - sc + 1;

          return (
            <div key={proc.id} className="flex border-b border-gray-100 hover:bg-blue-50/30 transition-colors" style={{ height: rowH }}>
              {/* Label column */}
              <div className="shrink-0 border-r-2 border-gray-200 px-4 flex items-center gap-2.5" style={{ minWidth: labelW }}>
                <span className={compact ? "text-base" : "text-lg"}>{getRainIcon(proc.rainTolerance)}</span>
                <span className={`${compact ? "text-sm" : "text-base"} font-bold text-gray-800`}>
                  {proc.name}
                </span>
                {!compact && (
                  <Badge className={`${getStatusColor(proc.status)} text-sm ml-auto shrink-0`} variant="secondary">
                    {getStatusLabel(proc.status)}
                  </Badge>
                )}
              </div>

              {/* Timeline columns */}
              <div className="flex relative" style={{ height: rowH }}>
                {dateRange.map((date) => {
                  const w = weatherMap.get(date);
                  return (
                    <div key={date}
                      className={`shrink-0 border-r border-gray-50 ${w && !w.canWork ? "bg-red-50/40" : ""}`}
                      style={{ minWidth: colW, height: rowH }}
                    />
                  );
                })}

                {/* Process bar */}
                <Tooltip>
                  <TooltipTrigger
                    className={`absolute rounded-lg ${getBarColor(proc.status, proc.aiModified)} shadow-md cursor-pointer flex items-center px-3 hover:brightness-110 hover:shadow-lg transition-all`}
                    style={{
                      top: barTop,
                      height: barH,
                      left: sc * colW,
                      width: span * colW - 4,
                    }}
                  >
                    <span className={`${compact ? "text-xs" : "text-sm"} text-white font-bold truncate`}>
                      {proc.name}
                    </span>
                    {proc.aiModified && <span className="ml-auto text-base">✨</span>}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm p-4">
                    <p className="font-bold text-lg">{proc.name}</p>
                    <p className="text-base text-gray-400 mt-1">{proc.scheduledStart} 〜 {proc.scheduledEnd}</p>
                    <p className="text-base mt-2">{proc.description}</p>
                    {proc.aiModified && proc.aiReason && (
                      <p className="text-base text-purple-400 mt-2 font-medium">✨ {proc.aiReason}</p>
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
