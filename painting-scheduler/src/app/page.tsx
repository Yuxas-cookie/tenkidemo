"use client";

import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { sampleSites } from "@/lib/data/sites";
import { SiteCard } from "@/components/dashboard/site-card";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { WeatherAlertBanner } from "@/components/dashboard/weather-alert-banner";
import { WeatherModeSwitch } from "@/components/dashboard/weather-mode-switch";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="text-sm text-gray-500 mt-1">
            現場一覧と天気予報を確認できます
          </p>
        </div>
        <WeatherModeSwitch />
      </div>

      {/* 天気アラート */}
      <WeatherAlertBanner days={forecast.days} sites={sampleSites} />

      {/* 天気予報 */}
      <WeatherWidget days={forecast.days} />

      {/* 現場一覧 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">現場一覧</h3>
          <motion.div
            className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-xs text-blue-600 font-medium">
              {sampleSites.length}件の現場
            </span>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleSites.map((site, i) => (
            <SiteCard key={site.id} site={site} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
