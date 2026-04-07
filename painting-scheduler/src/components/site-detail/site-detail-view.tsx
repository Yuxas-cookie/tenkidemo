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
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-base text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          ダッシュボード
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">{site.name}</span>
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
          <CardHeader className="pb-4 px-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-2xl">工程スケジュール</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-gray-300 inline-block" />{" "}
                  未着手
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-blue-400 inline-block" />{" "}
                  進行中
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-green-400 inline-block" />{" "}
                  完了
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-amber-400 inline-block" />{" "}
                  天候待ち
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-purple-400 inline-block" />{" "}
                  AI変更
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="gantt">
              <TabsList className="mb-5">
                <TabsTrigger value="gantt" className="text-base px-6 py-2">ガントチャート</TabsTrigger>
                <TabsTrigger value="list" className="text-base px-6 py-2">工程リスト</TabsTrigger>
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
        className="flex justify-center py-4"
      >
        <Link href={`/simulation/${site.id}`}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl shadow-purple-200/50 gap-3 text-lg px-10 py-7 rounded-xl"
          >
            <span className="text-2xl">✨</span>
            AIスケジュール最適化を実行
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
