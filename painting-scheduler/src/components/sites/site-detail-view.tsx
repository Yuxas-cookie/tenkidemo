"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Site } from "@/lib/types";
import { GanttChart } from "./gantt-chart";
import { ProcessList } from "./process-list";
import {
  getBuildingTypeIcon,
  getBuildingTypeLabel,
  getStatusLabel,
  getStatusColor,
  formatDateFull,
  getDaysBetween,
} from "@/lib/utils";

interface SiteDetailViewProps {
  site: Site;
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];

  const firstStart = site.processes[0]?.scheduledStart;
  const lastEnd = site.processes[site.processes.length - 1]?.scheduledEnd;
  const totalDays = firstStart && lastEnd ? getDaysBetween(firstStart, lastEnd) : 0;
  const weatherImpact = forecast.days.filter(
    (d) => !d.canWork && firstStart && lastEnd && d.date >= firstStart && d.date <= lastEnd
  ).length;

  return (
    <div>
      {/* Back */}
      <Link
        href="/sites"
        className="inline-flex items-center gap-2 text-base text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        現場一覧に戻る
      </Link>

      {/* Property header */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="text-6xl">{getBuildingTypeIcon(site.buildingType)}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">{site.name}</h1>
                <p className="text-lg text-blue-100 mt-1">{site.address}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(site.status)} text-base px-4 py-2`} variant="secondary">
              {getStatusLabel(site.status)}
            </Badge>
          </div>
        </div>
        <CardContent className="px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <InfoItem label="施主" value={site.ownerName} />
            <InfoItem label="建物種別" value={getBuildingTypeLabel(site.buildingType)} />
            <InfoItem label="塗装面積" value={`${site.paintArea}m²`} />
            <InfoItem label="予定工期" value={`${totalDays}日間`} />
            <InfoItem
              label="天候影響"
              value={`${weatherImpact}日`}
              valueColor={weatherImpact > 0 ? "text-red-600" : "text-green-600"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">工程スケジュール</h2>
            <div className="flex gap-4 text-sm">
              <Legend color="bg-gray-300" label="未着手" />
              <Legend color="bg-blue-400" label="進行中" />
              <Legend color="bg-green-400" label="完了" />
              <Legend color="bg-amber-400" label="天候待ち" />
              <Legend color="bg-purple-400" label="AI変更" />
            </div>
          </div>
          <Tabs defaultValue="gantt">
            <TabsList className="mb-6">
              <TabsTrigger value="gantt" className="text-base px-6 py-2.5">
                ガントチャート
              </TabsTrigger>
              <TabsTrigger value="list" className="text-base px-6 py-2.5">
                工程リスト
              </TabsTrigger>
            </TabsList>
            <TabsContent value="gantt">
              <GanttChart processes={site.processes} weatherDays={forecast.days} />
            </TabsContent>
            <TabsContent value="list">
              <ProcessList processes={site.processes} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center py-4">
        <Link href="/simulation">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl gap-3 text-lg px-10 py-7 rounded-xl"
          >
            <Sparkles size={24} />
            AIスケジュール最適化を実行
          </Button>
        </Link>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded ${color}`} />
      <span className="text-gray-500">{label}</span>
    </span>
  );
}
