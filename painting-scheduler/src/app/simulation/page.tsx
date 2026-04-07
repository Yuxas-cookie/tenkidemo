"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { sampleSites } from "@/lib/data/sites";
import { useAISimulation } from "@/hooks/use-ai-simulation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { GanttChart } from "@/components/sites/gantt-chart";
import { Site, SimulationMode } from "@/lib/types";
import { WeatherDay } from "@/lib/types";
import {
  getBuildingTypeIcon,
  getProgressPercentage,
} from "@/lib/utils";

export default function SimulationPage() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];
  const sim = useAISimulation();

  const handleRun = (mode: SimulationMode) => {
    if (!selectedSite) return;
    sim.reset();
    sim.run(selectedSite, forecast.days, mode);
  };

  return (
    <div>
      <PageHeader
        title="AIシミュレーション"
        description="AIが天気予報を分析し、最適な工程スケジュールを提案します"
      />

      {/* Site selection */}
      {!selectedSite && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            現場を選択してください
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sampleSites.map((site) => (
              <Card
                key={site.id}
                className="cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all"
                onClick={() => setSelectedSite(site)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{getBuildingTypeIcon(site.buildingType)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-500">{site.address}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-base text-gray-500">
                    <span>{site.paintArea}m²</span>
                    <span>進捗 {getProgressPercentage(site.processes)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Simulation panel */}
      {selectedSite && (
        <div>
          {/* Selected site header */}
          <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getBuildingTypeIcon(selectedSite.buildingType)}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedSite.name}</h2>
                  <p className="text-purple-100">{selectedSite.address} | {selectedSite.paintArea}m²</p>
                </div>
              </div>
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/20" onClick={() => { setSelectedSite(null); sim.reset(); }}>
                別の現場を選ぶ
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="optimize">
            <TabsList className="mb-6">
              <TabsTrigger value="optimize" className="text-base px-6 py-2.5">事前シミュレーション</TabsTrigger>
              <TabsTrigger value="reschedule" className="text-base px-6 py-2.5">緊急リスケ</TabsTrigger>
            </TabsList>

            <TabsContent value="optimize">
              <SimPanel mode="optimize" label="AI最適化を実行" desc="天気予報を元に最適な工程スケジュールを自動生成します。" sim={sim} onRun={() => handleRun("optimize")} forecast={forecast} site={selectedSite} />
            </TabsContent>
            <TabsContent value="reschedule">
              <SimPanel mode="reschedule" label="緊急リスケを実行" desc="天気急変に対応し、残工程を即座にリスケジュールします。" sim={sim} onRun={() => handleRun("reschedule")} forecast={forecast} site={selectedSite} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function SimPanel({ label, desc, sim, onRun, forecast, site }: {
  mode: SimulationMode; label: string; desc: string;
  sim: ReturnType<typeof useAISimulation>; onRun: () => void;
  forecast: { days: WeatherDay[] };
  site: Site;
}) {
  return (
    <div className="space-y-8">
      {sim.state === "idle" && (
        <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
          <CardContent className="p-8 text-center">
            <Sparkles size={48} className="text-purple-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-6">{desc}</p>
            <Button onClick={onRun} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-3 text-lg px-10 py-7 rounded-xl shadow-xl">
              <Sparkles size={24} />
              {label}
            </Button>
          </CardContent>
        </Card>
      )}

      {sim.state === "thinking" && (
        <Card className="border-2 border-purple-200">
          <CardContent className="py-16 text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-4xl text-white mb-6 animate-pulse shadow-xl shadow-purple-200/50">
              ✨
            </div>
            <p className="text-2xl font-bold text-gray-700">{sim.statusMessage}</p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mt-6">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" style={{ width: "50%", animation: "slide 1.5s ease-in-out infinite alternate", animationName: "none" }} />
            </div>
          </CardContent>
        </Card>
      )}

      {(sim.state === "streaming" || sim.state === "complete") && sim.reasoning && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl shadow-md">✨</div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-700 mb-2">AI工程アドバイザー</p>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 max-h-64 overflow-y-auto">
                  <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{sim.reasoning}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sim.state === "complete" && sim.result && (
        <div className="space-y-8">
          {/* Summary */}
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles size={24} className="text-purple-500 shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{sim.result.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox icon="📅" label="工期変更" value={`+${sim.result.impactDays}日`} />
            <StatBox icon="💰" label="追加コスト" value={`約${sim.result.impactCost}万円`} />
            <StatBox icon="⚡" label="リスク" value={{ low: "低", medium: "中", high: "高" }[sim.result.riskLevel]} />
            <StatBox icon="✨" label="変更工程" value={`${sim.result.suggestions.length}件`} />
          </div>

          {/* Before/After */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent className="p-5">
              <h3 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-gray-400" /> 変更前</h3>
              <GanttChart processes={sim.result.originalSchedule} weatherDays={forecast.days} compact />
            </CardContent></Card>
            <Card className="border-purple-200 shadow-md"><CardContent className="p-5">
              <h3 className="text-base font-bold text-purple-700 mb-3 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-purple-400" /> AI最適化後 <Badge className="bg-purple-100 text-purple-700 text-sm">✨ AI</Badge></h3>
              <GanttChart processes={sim.result.optimizedSchedule} weatherDays={forecast.days} compact />
            </CardContent></Card>
          </div>

          {/* Suggestions */}
          {sim.result.suggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles size={20} className="text-purple-500" /> AI提案</h3>
              <div className="space-y-3">
                {sim.result.suggestions.map((s, i) => (
                  <Card key={i} className="border-l-4 border-l-purple-400">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xl">✨</div>
                      <div>
                        <p className="text-base font-bold text-gray-900">工程{s.processId}: {s.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{s.reason}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 shrink-0" variant="secondary">
                        {{ move: "日程変更", split: "工程分割", parallel: "並行作業", cancel: "中止" }[s.type]}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl" onClick={sim.reset}>もう一度実行する</Button>
          </div>
        </div>
      )}

      {sim.state === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-base text-red-600 font-medium">エラー: {sim.error}</p>
            <Button variant="outline" className="mt-4" onClick={sim.reset}>リトライ</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card><CardContent className="p-5 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </CardContent></Card>
  );
}
