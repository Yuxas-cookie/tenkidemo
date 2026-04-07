"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Scale,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarDays,
  Ruler,
  Building2,
  Clock,
  Wallet,
  ArrowRight,
  RotateCcw,
  Settings2,
  CloudRain,
} from "lucide-react";
import { useWeatherMode } from "@/providers/weather-mode-provider";
import { useSchedule } from "@/providers/schedule-provider";
import { useAISimulation } from "@/hooks/use-ai-simulation";
import { sampleSites } from "@/lib/data/sites";
import { processMasters } from "@/lib/data/processes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
} from "@/lib/types";
import {
  getBuildingTypeIcon,
  addBusinessDays,
  getWeatherEmoji,
  formatDateFull,
} from "@/lib/utils";

const planMeta = {
  fastest: { icon: Zap, label: "最速プラン", color: "from-orange-500 to-red-500", bg: "bg-orange-50", border: "border-orange-200", accent: "text-orange-600", badgeCls: "bg-orange-100 text-orange-700" },
  balanced: { icon: Scale, label: "バランスプラン", color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", border: "border-blue-200", accent: "text-blue-600", badgeCls: "bg-blue-100 text-blue-700" },
  safe: { icon: Shield, label: "安全プラン", color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-600", badgeCls: "bg-emerald-100 text-emerald-700" },
};
const riskMap = { low: { label: "低", cls: "bg-green-100 text-green-700" }, medium: { label: "中", cls: "bg-amber-100 text-amber-700" }, high: { label: "高", cls: "bg-red-100 text-red-700" } };

function buildProcesses(startDate: string): SiteProcess[] {
  let cur = new Date(startDate);
  return processMasters.map((m) => {
    const s = new Date(cur);
    const e = addBusinessDays(s, m.durationDays + m.dryingDays);
    const p: SiteProcess = { ...m, status: "pending", scheduledStart: s.toISOString().split("T")[0], scheduledEnd: e.toISOString().split("T")[0] };
    cur = new Date(e); cur.setDate(cur.getDate() + 1);
    return p;
  });
}

export default function Dashboard() {
  const { getEffectiveDays } = useWeatherMode();
  const { adoptPlan } = useSchedule();
  const sim = useAISimulation();
  const days = getEffectiveDays();

  // Form
  const [siteName, setSiteName] = useState("");
  const [address, setAddress] = useState("");
  const [buildingType, setBuildingType] = useState<BuildingType>("house");
  const [paintArea, setPaintArea] = useState("150");
  const [startDate, setStartDate] = useState("2026-04-14");
  const [ownerName, setOwnerName] = useState("");
  const [useExisting, setUseExisting] = useState("");

  // Options
  const [showOptions, setShowOptions] = useState(false);
  const [priority, setPriority] = useState<"speed" | "cost" | "quality">("quality");
  const [avoidWeekends, setAvoidWeekends] = useState(false);
  const [includeBuffer, setIncludeBuffer] = useState(true);

  // Result
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [adoptedId, setAdoptedId] = useState<string | null>(null);

  const handlePreset = (siteId: string) => {
    const site = sampleSites.find((s) => s.id === siteId);
    if (site) { setSiteName(site.name); setAddress(site.address); setBuildingType(site.buildingType); setPaintArea(String(site.paintArea)); setStartDate(site.startDate); setOwnerName(site.ownerName); }
    setUseExisting(siteId);
  };

  const handleSimulate = () => {
    const site: Site = {
      id: useExisting || "custom-site", name: siteName || "新規現場", address: address || "大阪府", ownerName: ownerName || "施主",
      buildingType, paintArea: Number(paintArea) || 150, startDate, status: "scheduled",
      processes: useExisting ? sampleSites.find((s) => s.id === useExisting)?.processes || buildProcesses(startDate) : buildProcesses(startDate),
    };
    sim.reset(); setAdoptedId(null); setExpandedPlan(null);
    sim.run(site, days, "optimize");
  };

  const handleAdopt = (proposal: ScheduleProposal) => {
    if (!sim.proposals) return;
    adoptPlan(useExisting || "custom-site", proposal, sim.proposals);
    setAdoptedId(proposal.id);
  };

  const alertDays = days.filter((d) => !d.canWork);
  const isRunning = sim.state === "thinking" || sim.state === "streaming";

  return (
    <div className="max-w-6xl">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-200/50">
            <Sparkles size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              スケジュールシミュレーター
            </h1>
            <p className="text-lg text-gray-500 mt-1">
              施工内容を入力するだけで、AIが最適な工程プランを3つ提案します
            </p>
          </div>
        </div>
      </div>

      {/* ━━━ STEP 1: 現場選択 ━━━ */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
        <h2 className="text-xl font-bold text-gray-900">現場を選ぶ or 入力する</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {sampleSites.map((site) => (
          <button key={site.id} onClick={() => handlePreset(site.id)}
            className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
              useExisting === site.id ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100" : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            {useExisting === site.id && (
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"><Check size={14} /></div>
            )}
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getBuildingTypeIcon(site.buildingType)}</span>
              <div>
                <p className="text-lg font-bold text-gray-900">{site.name}</p>
                <p className="text-base text-gray-500">{site.address}</p>
                <p className="text-sm text-gray-400 mt-1">{site.paintArea}m² ・ {site.ownerName}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ━━━ STEP 2: 詳細入力 ━━━ */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
        <h2 className="text-xl font-bold text-gray-900">施工の詳細</h2>
      </div>
      <Card className="mb-8 border-2 border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <InputField icon={<MapPin size={18} />} label="現場名" value={siteName}
              onChange={(v) => { setSiteName(v); setUseExisting(""); }} placeholder="例: 高石市 田中邸" />
            <InputField icon={<MapPin size={18} />} label="住所" value={address}
              onChange={(v) => { setAddress(v); setUseExisting(""); }} placeholder="例: 大阪府高石市取石3丁目" />
            <InputField icon={<Building2 size={18} />} label="施主名" value={ownerName}
              onChange={(v) => setOwnerName(v)} placeholder="例: 田中 太郎" />
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                <Building2 size={18} className="text-gray-400" /> 建物種別
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "house" as const, icon: "🏠", label: "戸建て住宅", desc: "一般住宅の外壁塗装" },
                  { value: "apartment" as const, icon: "🏢", label: "マンション", desc: "集合住宅の大規模修繕" },
                  { value: "public" as const, icon: "🏛️", label: "公共施設", desc: "公共建築物の塗装工事" },
                ]).map((item) => (
                  <button key={item.value} onClick={() => setBuildingType(item.value)}
                    className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                      buildingType === item.value
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {buildingType === item.value && (
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"><Check size={14} /></div>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{item.icon}</span>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <InputField icon={<Ruler size={18} />} label="塗装面積（m²）" value={paintArea}
              onChange={(v) => setPaintArea(v)} placeholder="150" type="number" />
            <InputField icon={<CalendarDays size={18} />} label="開始予定日" value={startDate}
              onChange={(v) => setStartDate(v)} type="date" />
          </div>

          {/* Options toggle */}
          <button onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-base font-semibold text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <Settings2 size={20} />
            オプション設定
            {showOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showOptions && (
            <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-6 mb-6 space-y-5">
              <div>
                <label className="text-base font-semibold text-gray-700 mb-2 block">優先事項</label>
                <div className="flex gap-3">
                  {([["speed", "🚀 スピード重視", "工期を最短に"], ["cost", "💰 コスト重視", "追加費用を最小に"], ["quality", "✨ 品質重視", "天候リスクを最小に"]] as const).map(
                    ([val, label, desc]) => (
                      <button key={val} onClick={() => setPriority(val)}
                        className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                          priority === val ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-300"
                        }`}
                      >
                        <p className="text-base font-bold text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-700">土日を避ける</p>
                  <p className="text-sm text-gray-500">近隣への配慮で土日の作業を避けます</p>
                </div>
                <Switch checked={avoidWeekends} onCheckedChange={setAvoidWeekends} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-700">バッファ日を含める</p>
                  <p className="text-sm text-gray-500">予備日を追加してスケジュールに余裕を持たせます</p>
                </div>
                <Switch checked={includeBuffer} onCheckedChange={setIncludeBuffer} />
              </div>
            </div>
          )}

          {/* Weather alert */}
          {alertDays.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-6 flex items-start gap-4">
              <CloudRain size={24} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-amber-800">
                  天気予報: {alertDays.length}日間の施工不可日を検出
                </p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {alertDays.slice(0, 5).map((d) => (
                    <span key={d.date} className="inline-flex items-center gap-1 bg-amber-100 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700">
                      {getWeatherEmoji(d.weather)} {formatDateFull(d.date)}
                    </span>
                  ))}
                  {alertDays.length > 5 && <span className="text-sm text-amber-600 self-center">他{alertDays.length - 5}日</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ━━━ STEP 3: 生成 ━━━ */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">3</span>
        <h2 className="text-xl font-bold text-gray-900">AIでスケジュールを生成</h2>
      </div>
      <Button onClick={handleSimulate} size="lg" disabled={isRunning}
        className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white gap-3 text-xl py-8 rounded-2xl shadow-xl shadow-purple-200/40 mb-10 disabled:opacity-60"
      >
        <Sparkles size={26} />
        {isRunning ? "生成中..." : "AIでスケジュールを生成"}
      </Button>

      {/* ━━━ RESULTS ━━━ */}
      {sim.state === "thinking" && (
        <div className="text-center py-20">
          <div className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-5xl text-white mb-8 animate-pulse shadow-2xl shadow-purple-300/50">✨</div>
          <p className="text-2xl font-bold text-gray-700">{sim.statusMessage}</p>
          <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mt-6">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      )}

      {(sim.state === "streaming" || sim.state === "complete") && sim.reasoning && (
        <Card className="mb-10 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl shadow-md">✨</div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-800 mb-3">AI分析レポート</p>
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 max-h-52 overflow-y-auto">
                  <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{sim.reasoning}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sim.state === "complete" && sim.proposals && (
        <div className="space-y-10">
          {/* Adopted toast */}
          {adoptedId && (
            <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"><Check size={24} /></div>
                <div>
                  <p className="text-xl font-bold text-green-800">カレンダーに登録完了！</p>
                  <p className="text-base text-green-600">不採用プランは代替ストックに保存しました</p>
                </div>
              </div>
              <Link href="/calendar">
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 text-base px-6 py-5 rounded-xl">
                  カレンダーを見る <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          )}

          {/* Proposals header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">3つのプラン提案</h2>
            <p className="text-lg text-gray-500">AIが天気予報と工程の依存関係を分析して生成しました</p>
          </div>

          {/* 3 Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {sim.proposals.map((proposal, idx) => {
              const meta = planMeta[proposal.type];
              const Icon = meta.icon;
              const isAdopted = adoptedId === proposal.id;
              const isExpanded = expandedPlan === proposal.id;
              const risk = riskMap[proposal.riskLevel];
              const isRecommended = idx === 1;

              return (
                <div key={proposal.id} className="space-y-4">
                  <Card className={`relative overflow-hidden transition-all duration-300 ${isAdopted ? "ring-3 ring-green-500 shadow-xl shadow-green-100" : "hover:shadow-xl"} ${meta.border} border-2`}>
                    {/* Recommended badge */}
                    {isRecommended && !adoptedId && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-bold tracking-wide">
                        おすすめ
                      </div>
                    )}
                    {isAdopted && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-bold tracking-wide flex items-center justify-center gap-1.5">
                        <Check size={16} /> 採用済み
                      </div>
                    )}

                    <CardContent className="p-7">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} text-white shadow-md`}>
                          <Icon size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-gray-900">{proposal.name}</h3>
                          <Badge className={`${risk.cls} text-sm mt-1`}>リスク: {risk.label}</Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatBox icon={<Clock size={18} className="text-gray-400" />} label="工期" value={`${proposal.totalDays}日`} />
                        <StatBox icon={<CalendarDays size={18} className="text-gray-400" />} label="遅延" value={`+${proposal.impactDays}日`} />
                        <StatBox icon={<Wallet size={18} className="text-gray-400" />} label="追加コスト" value={`${proposal.impactCost}万円`} />
                      </div>

                      {/* Summary */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6">{proposal.summary}</p>

                      {/* Actions */}
                      <div className="space-y-3">
                        {!isAdopted && (
                          <Button onClick={() => handleAdopt(proposal)}
                            className={`w-full bg-gradient-to-r ${meta.color} hover:opacity-90 text-white gap-2 text-base py-6 rounded-xl shadow-md`}
                          >
                            <Check size={20} /> このプランを採用
                          </Button>
                        )}
                        <Button variant="outline" className="w-full gap-2 text-base py-5 rounded-xl"
                          onClick={() => setExpandedPlan(isExpanded ? null : proposal.id)}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          工程の詳細を見る
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expanded Gantt */}
                  {isExpanded && (
                    <Card className="border-2 shadow-md">
                      <CardContent className="p-5">
                        <p className="text-base font-bold text-gray-700 mb-3">工程ガントチャート</p>
                        <GanttChart processes={proposal.schedule} weatherDays={days} compact />
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>

          {/* Retry */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" className="text-base px-10 py-6 rounded-xl gap-2"
              onClick={() => { sim.reset(); setAdoptedId(null); setExpandedPlan(null); }}
            >
              <RotateCcw size={20} /> 条件を変えてもう一度
            </Button>
          </div>
        </div>
      )}

      {sim.state === "error" && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-red-600 font-semibold">エラー: {sim.error}</p>
            <Button variant="outline" className="mt-4" size="lg" onClick={sim.reset}>リトライ</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InputField({ icon, label, value, onChange, placeholder, type = "text" }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
        <span className="text-gray-400">{icon}</span> {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border-2 border-gray-200 px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
      />
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}
