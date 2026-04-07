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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {getBuildingTypeIcon(site.buildingType)}
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{site.name}</h2>
                <p className="text-sm text-gray-500">{site.address}</p>
              </div>
            </div>
            <Badge className={getStatusColor(site.status)} variant="secondary">
              {getStatusLabel(site.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
