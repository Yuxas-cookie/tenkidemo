"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WeatherDay } from "@/lib/types";
import { getWeatherEmoji, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  days: WeatherDay[];
}

export function WeatherWidget({ days }: WeatherWidgetProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">天気予報（16日間）</h3>
          <span className="text-xs text-gray-500">大阪府高石市</span>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {days.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-3 py-2 min-w-[64px] transition-colors",
                  !day.canWork
                    ? "border-red-200 bg-red-50"
                    : "border-gray-100 bg-white"
                )}
              >
                <span className="text-[10px] text-gray-500">{formatDate(day.date)}</span>
                <span className="text-xl">{getWeatherEmoji(day.weather)}</span>
                <div className="flex gap-1 text-[10px]">
                  <span className="text-red-500 font-medium">{day.tempMax}°</span>
                  <span className="text-blue-500">{day.tempMin}°</span>
                </div>
                {!day.canWork && (
                  <span className="text-[9px] font-bold text-red-500">施工不可</span>
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
