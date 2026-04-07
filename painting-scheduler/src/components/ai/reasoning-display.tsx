"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AIBadge } from "./ai-badge";

interface ReasoningDisplayProps {
  reasoning: string;
  isStreaming: boolean;
}

export function ReasoningDisplay({
  reasoning,
  isStreaming,
}: ReasoningDisplayProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reasoning]);

  if (!reasoning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-3"
    >
      {/* AI avatar */}
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg shadow-sm">
          ✨
        </div>
      </div>

      {/* Chat bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700">
            AI工程アドバイザー
          </span>
          <AIBadge />
        </div>
        <div
          ref={scrollRef}
          className="rounded-lg rounded-tl-none bg-gray-50 border border-gray-200 p-4 max-h-60 overflow-y-auto"
        >
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {reasoning}
            {isStreaming && (
              <motion.span
                className="inline-block w-2 h-4 bg-purple-500 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
