"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { useAISimulation } from "@/hooks/use-ai-simulation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Site, SimulationMode, WeatherDay } from "@/lib/types";
import { ThinkingAnimation } from "./thinking-animation";
import { ReasoningDisplay } from "./reasoning-display";
import { ScheduleComparison } from "./schedule-comparison";
import { SuggestionCard } from "./suggestion-card";
import { getBuildingTypeIcon, formatDateFull } from "@/lib/utils";

interface SimulationViewProps {
  site: Site;
}

export function SimulationView({ site }: SimulationViewProps) {
  const { weatherMode } = useWeatherMode();
  const forecast = weatherScenarios[weatherMode.scenario];
  const simulation = useAISimulation();

  const handleRun = (mode: SimulationMode) => {
    simulation.reset();
    simulation.run(site, forecast.days, mode);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          ダッシュボード
        </Link>
        <span>/</span>
        <Link
          href={`/sites/${site.id}`}
          className="hover:text-blue-600 transition-colors"
        >
          {site.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">AIシミュレーション</span>
      </nav>

      {/* Site summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {getBuildingTypeIcon(site.buildingType)}
              </span>
              <div>
                <h2 className="font-bold text-gray-900">{site.name}</h2>
                <p className="text-xs text-gray-500">
                  {site.address} | 開始: {formatDateFull(site.startDate)} |{" "}
                  {site.paintArea}m²
                </p>
              </div>
              {weatherMode.mode === "demo" && (
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  デモモード
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Simulation controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="optimize">
          <TabsList className="mb-4">
            <TabsTrigger value="optimize">事前シミュレーション</TabsTrigger>
            <TabsTrigger value="reschedule">緊急リスケ</TabsTrigger>
          </TabsList>

          <TabsContent value="optimize">
            <SimulationPanel
              mode="optimize"
              title="事前シミュレーション"
              description="天気予報を元に、最適な工程スケジュールをAIが自動生成します。雨天による影響を事前に把握し、工期の遅延を最小限に抑えます。"
              buttonLabel="AI最適化を実行"
              simulation={simulation}
              onRun={() => handleRun("optimize")}
              weatherDays={forecast.days}
            />
          </TabsContent>

          <TabsContent value="reschedule">
            <SimulationPanel
              mode="reschedule"
              title="緊急リスケジュール"
              description="天気予報の急変に対応し、残りの工程を即座にリスケジュールします。AIが代替スケジュールを生成し、工期への影響を最小化します。"
              buttonLabel="緊急リスケを実行"
              simulation={simulation}
              onRun={() => handleRun("reschedule")}
              weatherDays={forecast.days}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function SimulationPanel({
  title,
  description,
  buttonLabel,
  simulation,
  onRun,
  weatherDays,
}: {
  mode: SimulationMode;
  title: string;
  description: string;
  buttonLabel: string;
  simulation: ReturnType<typeof useAISimulation>;
  onRun: () => void;
  weatherDays: WeatherDay[];
}) {
  return (
    <div className="space-y-6">
      {/* Description + Run button */}
      {simulation.state === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">✨</span>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{description}</p>
            <Button
              onClick={onRun}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg gap-2"
              size="lg"
            >
              <span className="text-lg">✨</span>
              {buttonLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Thinking state */}
      {simulation.state === "thinking" && (
        <Card>
          <CardContent className="p-6">
            <ThinkingAnimation statusMessage={simulation.statusMessage} />
          </CardContent>
        </Card>
      )}

      {/* Streaming reasoning */}
      {(simulation.state === "streaming" || simulation.state === "complete") &&
        simulation.reasoning && (
          <ReasoningDisplay
            reasoning={simulation.reasoning}
            isStreaming={simulation.state === "streaming"}
          />
        )}

      {/* Results */}
      {simulation.state === "complete" && simulation.result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <ScheduleComparison
            result={simulation.result}
            weatherDays={weatherDays}
          />

          {/* Suggestion cards */}
          {simulation.result.suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>✨</span> AI提案
              </h3>
              <div className="space-y-3">
                {simulation.result.suggestions.map((suggestion, i) => (
                  <SuggestionCard
                    key={`${suggestion.processId}-${suggestion.type}`}
                    suggestion={suggestion}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reset button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={simulation.reset}>
              もう一度実行する
            </Button>
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {simulation.state === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">
              エラーが発生しました: {simulation.error}
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={simulation.reset}
            >
              リトライ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
