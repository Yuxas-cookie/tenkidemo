"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Cloud,
  Sparkles,
} from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WeatherScenario } from "@/lib/types";
import { scenarioLabels } from "@/lib/data/weather-scenarios";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/sites", label: "現場一覧", icon: Building2 },
  { href: "/weather", label: "天気予報", icon: Cloud },
  { href: "/simulation", label: "AIシミュレーション", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { weatherMode, setMode, setScenario } = useWeatherMode();
  const isDemo = weatherMode.mode === "demo";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg shadow-md">
          K
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            PaintAI
          </h1>
          <p className="text-sm text-gray-400 leading-tight">
            Scheduler
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all",
                active
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                size={22}
                className={cn(
                  active ? "text-blue-600" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Weather mode */}
      <div className="border-t border-gray-100 px-6 py-5 space-y-4">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          天気データ
        </p>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              !isDemo ? "text-blue-600" : "text-gray-400"
            )}
          >
            リアル
          </span>
          <Switch
            checked={isDemo}
            onCheckedChange={(checked) => setMode(checked ? "demo" : "real")}
          />
          <span
            className={cn(
              "text-sm font-medium",
              isDemo ? "text-purple-600" : "text-gray-400"
            )}
          >
            デモ
          </span>
        </div>
        {isDemo && (
          <Select
            value={weatherMode.scenario}
            onValueChange={(v) => setScenario(v as WeatherScenario)}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(scenarioLabels) as WeatherScenario[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {scenarioLabels[key].name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* AI status */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
          </span>
          <span className="text-sm font-semibold text-purple-700">
            AI Active
          </span>
        </div>
      </div>
    </aside>
  );
}
