"use client";

import { useWeatherMode } from "@/providers/weather-mode-provider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WeatherScenario } from "@/lib/types";
import { scenarioLabels } from "@/lib/data/weather-scenarios";
import { motion, AnimatePresence } from "framer-motion";

export function WeatherModeSwitch() {
  const { weatherMode, setMode, setScenario } = useWeatherMode();
  const isDemo = weatherMode.mode === "demo";

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${!isDemo ? "text-blue-600" : "text-gray-400"}`}>
          リアル
        </span>
        <Switch
          checked={isDemo}
          onCheckedChange={(checked) => setMode(checked ? "demo" : "real")}
        />
        <span className={`text-xs font-medium ${isDemo ? "text-purple-600" : "text-gray-400"}`}>
          デモ
        </span>
      </div>

      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Select
              value={weatherMode.scenario}
              onValueChange={(v) => setScenario(v as WeatherScenario)}
            >
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(scenarioLabels) as WeatherScenario[]).map((key) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <span className="font-medium">{scenarioLabels[key].name}</span>
                    <span className="ml-2 text-gray-400">{scenarioLabels[key].description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
