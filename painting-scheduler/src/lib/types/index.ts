// ===== 現場 =====
export type BuildingType = "house" | "apartment" | "public";
export type SiteStatus = "scheduled" | "in_progress" | "completed" | "suspended";

export interface Site {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  buildingType: BuildingType;
  paintArea: number;
  startDate: string;
  status: SiteStatus;
  processes: SiteProcess[];
}

// ===== 工程 =====
export type ProcessStatus = "pending" | "in_progress" | "completed" | "weather_hold";
export type RainTolerance = "ok" | "partial" | "ng";

export interface ProcessMaster {
  id: number;
  name: string;
  durationDays: number;
  dryingDays: number;
  rainTolerance: RainTolerance;
  dependencies: number[];
  canParallel: number[];
  description: string;
}

export interface SiteProcess extends ProcessMaster {
  status: ProcessStatus;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  aiModified?: boolean;
  aiReason?: string;
}

// ===== 天気 =====
export type WeatherType = "sunny" | "cloudy" | "rainy" | "heavy_rain" | "storm";

export interface WeatherDay {
  date: string;
  weather: WeatherType;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  canWork: boolean;
}

export interface WeatherForecast {
  location: string;
  days: WeatherDay[];
  fetchedAt: string;
  isDemo: boolean;
}

export type WeatherScenario = "sunny" | "mid_rain" | "rainy_season";
export type WeatherMode = "real" | "demo";

export interface WeatherModeState {
  mode: WeatherMode;
  scenario: WeatherScenario;
}

// ===== AI応答 =====
export interface AISuggestion {
  processId: number;
  type: "move" | "split" | "parallel" | "cancel";
  description: string;
  reason: string;
}

export interface AIOptimizationResult {
  originalSchedule: SiteProcess[];
  optimizedSchedule: SiteProcess[];
  summary: string;
  reasoning: string;
  impactDays: number;
  impactCost: number;
  riskLevel: "low" | "medium" | "high";
  suggestions: AISuggestion[];
}

// ===== AIストリーミング =====
export type AIStreamEventType = "status" | "reasoning_chunk" | "result" | "error";

export interface AIStreamEvent {
  type: AIStreamEventType;
  data: string | AIOptimizationResult | { message: string };
}

export type SimulationMode = "optimize" | "reschedule";
export type SimulationState = "idle" | "thinking" | "streaming" | "complete" | "error";
