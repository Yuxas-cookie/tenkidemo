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
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white shadow-xl shadow-blue-200/50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              ダッシュボード
            </h2>
            <p className="text-blue-100 text-lg">
              現場一覧と天気予報をリアルタイムで管理
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <WeatherModeSwitch />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-1">管理現場数</p>
            <p className="text-3xl font-bold">{sampleSites.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-1">進行中</p>
            <p className="text-3xl font-bold">
              {sampleSites.filter((s) => s.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-1">天気アラート</p>
            <p className="text-3xl font-bold">
              {forecast.days.filter((d) => !d.canWork).length}
              <span className="text-lg text-blue-200 ml-1">日</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Weather alert */}
      <WeatherAlertBanner days={forecast.days} sites={sampleSites} />

      {/* Weather forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <WeatherWidget days={forecast.days} />
      </motion.div>

      {/* Site list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">現場一覧</h3>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2">
            <span className="text-sm text-blue-600 font-semibold">
              {sampleSites.length}件の現場
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleSites.map((site, i) => (
            <SiteCard key={site.id} site={site} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
