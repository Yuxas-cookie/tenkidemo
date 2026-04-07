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
      className="flex gap-4"
    >
      {/* AI avatar */}
      <div className="shrink-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl shadow-lg shadow-purple-200/50">
          ✨
        </div>
      </div>

      {/* Chat bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-base font-bold text-gray-700">
            AI工程アドバイザー
          </span>
          <AIBadge />
        </div>
        <div
          ref={scrollRef}
          className="rounded-2xl rounded-tl-none bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-6 max-h-72 overflow-y-auto shadow-sm"
        >
          <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
            {reasoning}
            {isStreaming && (
              <motion.span
                className="inline-block w-2.5 h-5 bg-purple-500 ml-0.5 align-middle rounded-sm"
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
