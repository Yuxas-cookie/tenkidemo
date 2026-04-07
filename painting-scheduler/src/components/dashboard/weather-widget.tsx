"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WeatherDay } from "@/lib/types";
import { getWeatherEmoji, formatDate, formatDateFull } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  days: WeatherDay[];
}

export function WeatherWidget({ days }: WeatherWidgetProps) {
  const nonWorkDays = days.filter((d) => !d.canWork).length;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">天気予報</h3>
            <p className="text-sm text-gray-500 mt-1">大阪府高石市 ・ 16日間予報</p>
          </div>
          {nonWorkDays > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2">
              <span className="text-red-500 font-bold text-lg">{nonWorkDays}</span>
              <span className="text-sm text-red-600">日間 施工不可</span>
            </div>
          )}
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {days.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 min-w-[90px] transition-all",
                  !day.canWork
                    ? "border-red-300 bg-red-50 shadow-sm shadow-red-100"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                )}
              >
                <span className="text-xs font-medium text-gray-500">
                  {formatDate(day.date)}
                </span>
                <span className="text-3xl">{getWeatherEmoji(day.weather)}</span>
                <div className="flex gap-2 text-sm font-medium">
                  <span className="text-red-500">{day.tempMax}°</span>
                  <span className="text-blue-500">{day.tempMin}°</span>
                </div>
                {!day.canWork ? (
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    施工不可
                  </span>
                ) : (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    施工可
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
