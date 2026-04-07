"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WeatherDay } from "@/lib/types";
import { Site } from "@/lib/types";
import { formatDateFull, getWeatherEmoji } from "@/lib/utils";

interface WeatherAlertBannerProps {
  days: WeatherDay[];
  sites: Site[];
}

interface Alert {
  date: string;
  weather: WeatherDay;
  affectedSites: { siteName: string; processName: string }[];
}

function generateAlerts(days: WeatherDay[], sites: Site[]): Alert[] {
  const alerts: Alert[] = [];

  for (const day of days) {
    if (day.canWork) continue;

    const affected: { siteName: string; processName: string }[] = [];
    for (const site of sites) {
      for (const process of site.processes) {
        if (
          process.rainTolerance === "ng" &&
          process.scheduledStart <= day.date &&
          process.scheduledEnd >= day.date
        ) {
          affected.push({ siteName: site.name, processName: process.name });
        }
      }
    }

    if (affected.length > 0) {
      alerts.push({ date: day.date, weather: day, affectedSites: affected });
    }
  }

  return alerts.slice(0, 3);
}

export function WeatherAlertBanner({ days, sites }: WeatherAlertBannerProps) {
  const alerts = generateAlerts(days, sites);

  if (alerts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-3"
      >
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm shadow-amber-100/50"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-3xl">{getWeatherEmoji(alert.weather.weather)}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-amber-800">
                {formatDateFull(alert.date)} — 天候による影響あり
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {alert.affectedSites.map((a, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center rounded-lg bg-amber-100 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700"
                  >
                    {a.siteName} / {a.processName}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
