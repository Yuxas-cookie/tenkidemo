"use client";

import Link from "next/link";
import {
  Building2,
  HardHat,
  CloudRain,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { sampleSites } from "@/lib/data/sites";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import {
  getProgressPercentage,
  getStatusLabel,
  getStatusColor,
  getBuildingTypeIcon,
  formatDateFull,
  getWeatherEmoji,
} from "@/lib/utils";

export default function Dashboard() {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];
  const alertDays = forecast.days.filter((d) => !d.canWork).length;
  const inProgress = sampleSites.filter((s) => s.status === "in_progress").length;
  const avgProgress = Math.round(
    sampleSites.reduce((sum, s) => sum + getProgressPercentage(s.processes), 0) /
      sampleSites.length
  );

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="塗装工事の全体状況をリアルタイムで把握"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<Building2 size={28} className="text-blue-600" />}
          label="管理現場数"
          value={`${sampleSites.length}`}
          unit="件"
          bg="bg-blue-50"
          accent="text-blue-700"
        />
        <StatCard
          icon={<HardHat size={28} className="text-green-600" />}
          label="進行中"
          value={`${inProgress}`}
          unit="件"
          bg="bg-green-50"
          accent="text-green-700"
        />
        <StatCard
          icon={<CloudRain size={28} className="text-amber-600" />}
          label="施工不可日"
          value={`${alertDays}`}
          unit="日"
          bg="bg-amber-50"
          accent="text-amber-700"
        />
        <StatCard
          icon={<TrendingUp size={28} className="text-purple-600" />}
          label="平均進捗率"
          value={`${avgProgress}`}
          unit="%"
          bg="bg-purple-50"
          accent="text-purple-700"
        />
      </div>

      {/* Alerts */}
      {alertDays > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-500" />
            天気アラート
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecast.days
              .filter((d) => !d.canWork)
              .slice(0, 6)
              .map((day) => (
                <Card
                  key={day.date}
                  className="border-amber-200 bg-amber-50/50"
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="text-4xl">
                      {getWeatherEmoji(day.weather)}
                    </span>
                    <div>
                      <p className="text-base font-bold text-amber-800">
                        {formatDateFull(day.date)}
                      </p>
                      <p className="text-sm text-amber-600">
                        {day.tempMax}° / {day.tempMin}° ・ 湿度{day.humidity}%
                      </p>
                      <Badge className="bg-red-100 text-red-700 mt-1 text-sm">
                        施工不可
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Recent sites */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">現場ステータス</h2>
          <Link
            href="/sites"
            className="flex items-center gap-1 text-base font-medium text-blue-600 hover:text-blue-700"
          >
            すべて見る <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sampleSites.map((site) => {
            const progress = getProgressPercentage(site.processes);
            return (
              <Link href={`/sites/${site.id}`} key={site.id}>
                <Card className="hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">
                        {getBuildingTypeIcon(site.buildingType)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {site.name}
                        </h3>
                        <p className="text-sm text-gray-500">{site.address}</p>
                      </div>
                      <Badge
                        className={`${getStatusColor(site.status)} text-sm`}
                        variant="secondary"
                      >
                        {getStatusLabel(site.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">進捗</span>
                        <span className="font-bold text-gray-900">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2.5" />
                      <p className="text-sm text-gray-400">
                        開始: {formatDateFull(site.startDate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  bg,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  bg: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`${bg} rounded-xl p-3`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`text-3xl font-extrabold ${accent}`}>
              {value}
              <span className="text-lg font-semibold ml-0.5">{unit}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
