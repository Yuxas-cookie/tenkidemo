"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AISuggestion } from "@/lib/types";
import { processMasters } from "@/lib/data/processes";

interface SuggestionCardProps {
  suggestion: AISuggestion;
  index: number;
}

function getSuggestionTypeStyle(type: string) {
  switch (type) {
    case "move":
      return { label: "日程変更", color: "bg-blue-100 text-blue-700 border-blue-200" };
    case "split":
      return { label: "工程分割", color: "bg-purple-100 text-purple-700 border-purple-200" };
    case "parallel":
      return { label: "並行作業", color: "bg-green-100 text-green-700 border-green-200" };
    case "cancel":
      return { label: "中止", color: "bg-red-100 text-red-700 border-red-200" };
    default:
      return { label: type, color: "bg-gray-100 text-gray-700" };
  }
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const typeStyle = getSuggestionTypeStyle(suggestion.type);
  const process = processMasters.find((p) => p.id === suggestion.processId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-l-4 border-l-purple-400 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-gray-900">
                  工程{suggestion.processId}: {process?.name || ""}
                </span>
                <Badge className={`${typeStyle.color} border text-sm px-3 py-1`} variant="secondary">
                  {typeStyle.label}
                </Badge>
              </div>
              <p className="text-base text-gray-700">{suggestion.description}</p>
              <p className="text-sm text-gray-500 mt-1.5">{suggestion.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
