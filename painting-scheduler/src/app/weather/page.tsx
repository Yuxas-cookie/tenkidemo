"use client";

import { Sun, CloudRain } from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { getWeatherEmoji, getWeatherLabel, formatDateFull } from "@/lib/utils";

export default function WeatherPage() {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];
  const workDays = forecast.days.filter((d) => d.canWork).length;
  const noWorkDays = forecast.days.filter((d) => !d.canWork).length;

  return (
    <div>
      <PageHeader
        title="天気予報"
        description="大阪府高石市 ・ 今後16日間の天気予報"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 rounded-xl p-3">
              <Sun size={32} className="text-green-600" />
            </div>
            <div>
              <p className="text-base text-green-700">施工可能</p>
              <p className="text-4xl font-extrabold text-green-800">
                {workDays}
                <span className="text-xl font-semibold ml-1">日</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-red-100 rounded-xl p-3">
              <CloudRain size={32} className="text-red-600" />
            </div>
            <div>
              <p className="text-base text-red-700">施工不可</p>
              <p className="text-4xl font-extrabold text-red-800">
                {noWorkDays}
                <span className="text-xl font-semibold ml-1">日</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {forecast.days.map((day) => (
          <Card
            key={day.date}
            className={
              !day.canWork
                ? "border-2 border-red-300 bg-red-50/50"
                : "border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
            }
          >
            <CardContent className="p-6 text-center">
              <p className="text-base font-bold text-gray-700 mb-3">
                {formatDateFull(day.date)}
              </p>
              <div className="text-6xl mb-3">{getWeatherEmoji(day.weather)}</div>
              <p className="text-lg font-semibold text-gray-900 mb-3">
                {getWeatherLabel(day.weather)}
              </p>

              <div className="space-y-2 text-base">
                <div className="flex justify-between">
                  <span className="text-gray-400">気温</span>
                  <span className="font-semibold">
                    <span className="text-red-500">{day.tempMax}°</span>
                    {" / "}
                    <span className="text-blue-500">{day.tempMin}°</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">湿度</span>
                  <span className="font-semibold">{day.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">風速</span>
                  <span className="font-semibold">{day.windSpeed}m/s</span>
                </div>
              </div>

              <div className="mt-4">
                {day.canWork ? (
                  <Badge className="bg-green-100 text-green-700 text-base px-4 py-1.5">
                    施工可能
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 text-base px-4 py-1.5">
                    施工不可
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
