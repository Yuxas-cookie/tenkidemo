"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WeatherMode, WeatherScenario, WeatherModeState } from "@/lib/types";

interface WeatherModeContextType {
  weatherMode: WeatherModeState;
  setMode: (mode: WeatherMode) => void;
  setScenario: (scenario: WeatherScenario) => void;
}

const WeatherModeContext = createContext<WeatherModeContextType | null>(null);

export function WeatherModeProvider({ children }: { children: ReactNode }) {
  const [weatherMode, setWeatherMode] = useState<WeatherModeState>({
    mode: "demo",
    scenario: "mid_rain",
  });

  const setMode = (mode: WeatherMode) => {
    setWeatherMode((prev) => ({ ...prev, mode }));
  };

  const setScenario = (scenario: WeatherScenario) => {
    setWeatherMode((prev) => ({ ...prev, scenario }));
  };

  return (
    <WeatherModeContext.Provider value={{ weatherMode, setMode, setScenario }}>
      {children}
    </WeatherModeContext.Provider>
  );
}

export function useWeatherMode() {
  const context = useContext(WeatherModeContext);
  if (!context) throw new Error("useWeatherMode must be used within WeatherModeProvider");
  return context;
}
