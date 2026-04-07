"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  Scale,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Ruler,
  Building2,
} from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { useSchedule } from "@/providers/schedule-provider";
import { useAISimulation } from "@/hooks/use-ai-simulation";
import { sampleSites } from "@/lib/data/sites";
import { processMasters } from "@/lib/data/processes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { GanttChart } from "@/components/sites/gantt-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Site,
  SiteProcess,
  ScheduleProposal,
  BuildingType,
  WeatherDay,
} from "@/lib/types";
import {
  getBuildingTypeIcon,
  getBuildingTypeLabel,
  addBusinessDays,
  getWeatherEmoji,
  formatDateFull,
} from "@/lib/utils";

const planIcons = { fastest: Zap, balanced: Scale, safe: Shield };
const planColors = {
  fastest: { border: "border-red-200", accent: "text-red-600", badge: "bg-red-100 text-red-700", bg: "bg-red-50" },
  balanced: { border: "border-blue-200", accent: "text-blue-600", badge: "bg-blue-100 text-blue-700", bg: "bg-blue-50" },
  safe: { border: "border-green-200", accent: "text-green-600", badge: "bg-green-100 text-green-700", bg: "bg-green-50" },
};
const riskLabels = { low: "低リスク", medium: "中リスク", high: "高リスク" };

// Generate processes for a custom site
function buildProcesses(startDate: string): SiteProcess[] {
  let currentDate = new Date(startDate);
  return processMasters.map((master) => {
    const start = new Date(currentDate);
    const totalDays = master.durationDays + master.dryingDays;
    const end = addBusinessDays(start, totalDays);
    const process: SiteProcess = {
      ...master,
      status: "pending",
      scheduledStart: start.toISOString().split("T")[0],
      scheduledEnd: end.toISOString().split("T")[0],
    };
    currentDate = new Date(end);
    currentDate.setDate(currentDate.getDate() + 1);
    return process;
  });
}

export default function Dashboard() {
  const { getEffectiveDays } = useWeatherMode();
  const { adoptPlan } = useSchedule();
  const sim = useAISimulation();
  const days = getEffectiveDays();

  // Form state
  const [siteName, setSiteName] = useState("");
  const [address, setAddress] = useState("");
  const [buildingType, setBuildingType] = useState<BuildingType>("house");
  const [paintArea, setPaintArea] = useState("150");
  const [startDate, setStartDate] = useState("2026-04-14");
  const [useExisting, setUseExisting] = useState<string>("");

  // Result state
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [adoptedId, setAdoptedId] = useState<string | null>(null);

  const handlePreset = (siteId: string) => {
    const site = sampleSites.find((s) => s.id === siteId);
    if (site) {
      setSiteName(site.name);
      setAddress(site.address);
      setBuildingType(site.buildingType);
      setPaintArea(String(site.paintArea));
      setStartDate(site.startDate);
    }
    setUseExisting(siteId);
  };

  const handleSimulate = () => {
    const site: Site = {
      id: useExisting || "custom-site",
      name: siteName || "新規現場",
      address: address || "大阪府高石市",
      ownerName: "施主",
      buildingType,
      paintArea: Number(paintArea) || 150,
      startDate,
      status: "scheduled",
      processes: useExisting
        ? sampleSites.find((s) => s.id === useExisting)?.processes || buildProcesses(startDate)
        : buildProcesses(startDate),
    };
    sim.reset();
    setAdoptedId(null);
    setExpandedPlan(null);
    sim.run(site, days, "optimize");
  };

  const handleAdopt = (proposal: ScheduleProposal) => {
    if (!sim.proposals) return;
    const siteId = useExisting || "custom-site";
    adoptPlan(siteId, proposal, sim.proposals);
    setAdoptedId(proposal.id);
  };

  // Weather summary for display
  const alertDays = days.filter((d) => !d.canWork);

  return (
    <div>
      <PageHeader
        title="スケジュールシミュレーター"
        description="施工内容を入力して、AIが最適な工程スケジュールを提案します"
      />

      {/* Input Form */}
      <Card className="mb-8 border-2">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 size={24} className="text-blue-600" />
            施工情報を入力
          </h2>

          {/* Preset selection */}
          <div className="mb-6">
            <label className="block text-base font-semibold text-gray-700 mb-2">
              既存の現場から選ぶ（任意）
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handlePreset(site.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    useExisting === site.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-3xl">{getBuildingTypeIcon(site.buildingType)}</span>
                  <div>
                    <p className="text-base font-bold text-gray-900">{site.name}</p>
                    <p className="text-sm text-gray-500">{site.paintArea}m²</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                <MapPin size={16} className="inline mr-1" />現場名
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => { setSiteName(e.target.value); setUseExisting(""); }}
                placeholder="例: 高石市 田中邸"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                <Building2 size={16} className="inline mr-1" />建物種別
              </label>
              <Select value={buildingType} onValueChange={(v) => setBuildingType(v as BuildingType)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">戸建て住宅</SelectItem>
                  <SelectItem value="apartment">マンション</SelectItem>
                  <SelectItem value="public">公共施設</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                <Ruler size={16} className="inline mr-1" />塗装面積（m²）
              </label>
              <input
                type="number"
                value={paintArea}
                onChange={(e) => setPaintArea(e.target.value)}
                placeholder="150"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                <Calendar size={16} className="inline mr-1" />開始予定日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Weather preview */}
          {alertDays.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-base font-semibold text-amber-800 mb-2">
                天気予報: {alertDays.length}日間の施工不可日あり
              </p>
              <div className="flex gap-2 flex-wrap">
                {alertDays.slice(0, 5).map((d) => (
                  <span key={d.date} className="inline-flex items-center gap-1 bg-amber-100 rounded-lg px-3 py-1 text-sm text-amber-700">
                    {getWeatherEmoji(d.weather)} {formatDateFull(d.date)}
                  </span>
                ))}
                {alertDays.length > 5 && <span className="text-sm text-amber-600">他{alertDays.length - 5}日</span>}
              </div>
            </div>
          )}

          {/* Run button */}
          <Button
            onClick={handleSimulate}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-3 text-lg py-7 rounded-xl shadow-xl"
            disabled={sim.state === "thinking" || sim.state === "streaming"}
          >
            <Sparkles size={24} />
            AIでスケジュールを生成
          </Button>
        </CardContent>
      </Card>

      {/* Thinking */}
      {sim.state === "thinking" && (
        <Card className="mb-8 border-2 border-purple-200">
          <CardContent className="py-16 text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-4xl text-white mb-6 animate-pulse shadow-xl shadow-purple-200/50">
              ✨
            </div>
            <p className="text-2xl font-bold text-gray-700">{sim.statusMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Reasoning */}
      {(sim.state === "streaming" || sim.state === "complete") && sim.reasoning && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl shadow-md">✨</div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-700 mb-2">AI工程アドバイザー</p>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 max-h-48 overflow-y-auto">
                  <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{sim.reasoning}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3 Proposals */}
      {sim.state === "complete" && sim.proposals && (
        <div className="space-y-8">
          {adoptedId && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-5 flex items-center gap-3">
                <Check size={24} className="text-green-600" />
                <p className="text-lg font-bold text-green-800">プランをカレンダーに登録しました！</p>
                <span className="text-base text-green-600">（不採用プランは代替ストックに保存済み）</span>
              </CardContent>
            </Card>
          )}

          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-purple-500" />
            3つのプラン提案
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sim.proposals.map((proposal) => {
              const colors = planColors[proposal.type];
              const Icon = planIcons[proposal.type];
              const isAdopted = adoptedId === proposal.id;
              const isExpanded = expandedPlan === proposal.id;

              return (
                <div key={proposal.id} className="space-y-3">
                  <Card className={`${isAdopted ? "ring-2 ring-green-500" : ""} ${colors.border} border-2 transition-all`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`${colors.bg} rounded-xl p-2.5`}>
                          <Icon size={28} className={colors.accent} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{proposal.name}</h4>
                          <Badge className={`${colors.badge} text-sm mt-1`}>{riskLabels[proposal.riskLevel]}</Badge>
                        </div>
                        {isAdopted && (
                          <Badge className="bg-green-500 text-white ml-auto text-sm px-3 py-1"><Check size={14} className="mr-1" /> 採用済み</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center bg-white rounded-lg p-3 border">
                          <p className="text-sm text-gray-400">工期</p>
                          <p className="text-2xl font-extrabold text-gray-900">{proposal.totalDays}<span className="text-base">日</span></p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-3 border">
                          <p className="text-sm text-gray-400">遅延</p>
                          <p className="text-2xl font-extrabold text-gray-900">+{proposal.impactDays}<span className="text-base">日</span></p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-3 border">
                          <p className="text-sm text-gray-400">コスト</p>
                          <p className="text-2xl font-extrabold text-gray-900">{proposal.impactCost}<span className="text-base">万円</span></p>
                        </div>
                      </div>

                      <p className="text-base text-gray-600 mb-4 leading-relaxed">{proposal.summary}</p>

                      <div className="flex gap-2">
                        {!isAdopted && (
                          <Button onClick={() => handleAdopt(proposal)} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                            <Check size={18} /> このプランを採用
                          </Button>
                        )}
                        <Button variant="outline" className="gap-1" onClick={() => setExpandedPlan(isExpanded ? null : proposal.id)}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />} 詳細
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {isExpanded && (
                    <Card><CardContent className="p-4">
                      <GanttChart processes={proposal.schedule} weatherDays={days} compact />
                    </CardContent></Card>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl" onClick={() => { sim.reset(); setAdoptedId(null); setExpandedPlan(null); }}>
              条件を変えてもう一度
            </Button>
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
