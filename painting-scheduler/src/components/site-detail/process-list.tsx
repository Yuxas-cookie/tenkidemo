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
      return { label: "雨天OK", color: "bg-green-100 text-green-700 border-green-200" };
    case "partial":
      return { label: "小雨可", color: "bg-amber-100 text-amber-700 border-amber-200" };
    case "ng":
      return { label: "雨天NG", color: "bg-red-100 text-red-700 border-red-200" };
    default:
      return { label: "", color: "" };
  }
}

export function ProcessList({ processes }: ProcessListProps) {
  return (
    <div className="space-y-3">
      {processes.map((process, i) => {
        const rain = getRainToleranceLabel(process.rainTolerance);
        return (
          <motion.div
            key={process.id}
            className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-lg font-bold text-gray-600">
              {process.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">
                  {process.name}
                </span>
                {process.aiModified && (
                  <span className="text-sm text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">✨ AI変更</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {process.scheduledStart} 〜 {process.scheduledEnd}
                </span>
                {process.dryingDays > 0 && (
                  <span className="text-sm text-blue-500 font-medium">
                    +乾燥{process.dryingDays}日
                  </span>
                )}
              </div>
              {process.aiReason && (
                <p className="text-sm text-purple-600 mt-1.5 font-medium">
                  {process.aiReason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={`${rain.color} border text-xs px-3 py-1`} variant="secondary">
                {rain.label}
              </Badge>
              <Badge
                className={`${getStatusColor(process.status)} text-xs px-3 py-1`}
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
