"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Site } from "@/lib/types";
import {
  getBuildingTypeIcon,
  getBuildingTypeLabel,
  getProgressPercentage,
  getStatusLabel,
  getStatusColor,
  formatDateFull,
} from "@/lib/utils";

interface SiteCardProps {
  site: Site;
  index: number;
}

export function SiteCard({ site, index }: SiteCardProps) {
  const progress = getProgressPercentage(site.processes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/sites/${site.id}`}>
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-2 hover:border-blue-200 h-full">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getBuildingTypeIcon(site.buildingType)}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{site.address}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(site.status)} text-xs px-3 py-1`} variant="secondary">
                {getStatusLabel(site.status)}
              </Badge>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{getBuildingTypeLabel(site.buildingType)}</span>
                <span className="font-medium text-gray-700">{site.paintArea}m²</span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">進捗</span>
                  <span className="text-lg font-bold text-gray-900">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Start date */}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-500">開始予定</span>
                <span className="font-semibold text-gray-700">
                  {formatDateFull(site.startDate)}
                </span>
              </div>
            </div>

            {/* CTA hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>詳細を見る</span>
              <span>→</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
