"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Site } from "@/lib/types";
import {
  getBuildingTypeIcon,
  getBuildingTypeLabel,
  getStatusLabel,
  getStatusColor,
  formatDateFull,
} from "@/lib/utils";

interface PropertyInfoProps {
  site: Site;
}

export function PropertyInfo({ site }: PropertyInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">
                {getBuildingTypeIcon(site.buildingType)}
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{site.name}</h2>
                <p className="text-blue-100 text-base mt-1">{site.address}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(site.status)} text-sm px-4 py-1.5`} variant="secondary">
              {getStatusLabel(site.status)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <InfoItem label="施主" value={site.ownerName} />
            <InfoItem
              label="建物種別"
              value={getBuildingTypeLabel(site.buildingType)}
            />
            <InfoItem label="塗装面積" value={`${site.paintArea}m²`} />
            <InfoItem label="開始予定" value={formatDateFull(site.startDate)} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
