"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SiteProcess } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/utils";

interface ProcessListProps {
  processes: SiteProcess[];
}

function getRainToleranceLabel(tolerance: string) {
  switch (tolerance) {
    case "ok":
      return { label: "雨天OK", color: "bg-green-100 text-green-700" };
    case "partial":
      return { label: "小雨可", color: "bg-amber-100 text-amber-700" };
    case "ng":
      return { label: "雨天NG", color: "bg-red-100 text-red-700" };
    default:
      return { label: "", color: "" };
  }
}

export function ProcessList({ processes }: ProcessListProps) {
  return (
    <div className="space-y-2">
      {processes.map((process, i) => {
        const rain = getRainToleranceLabel(process.rainTolerance);
        return (
          <motion.div
            key={process.id}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
              {process.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {process.name}
                </span>
                {process.aiModified && (
                  <span className="text-xs text-purple-600">✨ AI変更</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">
                  {process.scheduledStart} 〜 {process.scheduledEnd}
                </span>
                {process.dryingDays > 0 && (
                  <span className="text-xs text-blue-500">
                    +乾燥{process.dryingDays}日
                  </span>
                )}
              </div>
              {process.aiReason && (
                <p className="text-xs text-purple-600 mt-1">
                  {process.aiReason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={`${rain.color} text-[10px]`} variant="secondary">
                {rain.label}
              </Badge>
              <Badge
                className={`${getStatusColor(process.status)} text-[10px]`}
                variant="secondary"
              >
                {getStatusLabel(process.status)}
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
