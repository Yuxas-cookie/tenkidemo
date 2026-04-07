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
        <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-blue-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getBuildingTypeIcon(site.buildingType)}</span>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-xs text-gray-500">{site.address}</p>
                </div>
              </div>
              <Badge className={getStatusColor(site.status)} variant="secondary">
                {getStatusLabel(site.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{getBuildingTypeLabel(site.buildingType)}</span>
                <span>{site.paintArea}m²</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">進捗</span>
                  <span className="font-medium text-gray-700">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">開始予定</span>
                <span className="font-medium text-gray-700">
                  {formatDateFull(site.startDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
