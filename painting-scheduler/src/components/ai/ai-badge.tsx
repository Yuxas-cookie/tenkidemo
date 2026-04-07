"use client";

import { cn } from "@/lib/utils";

interface AIBadgeProps {
  variant?: "inline" | "floating";
  className?: string;
}

export function AIBadge({ variant = "inline", className }: AIBadgeProps) {
  if (variant === "floating") {
    return (
      <span
        className={cn(
          "absolute -top-1 -right-1 flex items-center gap-0.5 rounded-full bg-purple-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm",
          className
        )}
      >
        ✨ AI
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700",
        className
      )}
    >
      ✨ AI
    </span>
  );
}
