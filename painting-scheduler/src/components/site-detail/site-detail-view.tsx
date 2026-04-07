"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Site } from "@/lib/types";
import { PropertyInfo } from "./property-info";
import { GanttChart } from "./gantt-chart";
import { ProcessList } from "./process-list";
import { ImpactSummary } from "./impact-summary";

interface SiteDetailViewProps {
  site: Site;
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          ダッシュボード
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{site.name}</span>
      </nav>

      {/* Property info */}
      <PropertyInfo site={site} />

      {/* Impact summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ImpactSummary
          processes={site.processes}
          weatherDays={forecast.days}
          paintArea={site.paintArea}
        />
      </motion.div>

      {/* Schedule views */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">工程スケジュール</CardTitle>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-gray-300 inline-block" />{" "}
                  未着手
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-blue-400 inline-block" />{" "}
                  進行中
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-green-400 inline-block" />{" "}
                  完了
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-amber-400 inline-block" />{" "}
                  天候待ち
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-purple-400 inline-block" />{" "}
                  AI変更
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gantt">
              <TabsList className="mb-4">
                <TabsTrigger value="gantt">ガントチャート</TabsTrigger>
                <TabsTrigger value="list">工程リスト</TabsTrigger>
              </TabsList>
              <TabsContent value="gantt">
                <GanttChart
                  processes={site.processes}
                  weatherDays={forecast.days}
                />
              </TabsContent>
              <TabsContent value="list">
                <ProcessList processes={site.processes} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA to AI simulation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-center"
      >
        <Link href={`/simulation/${site.id}`}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg gap-2"
          >
            <span className="text-lg">✨</span>
            AIスケジュール最適化を実行
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
