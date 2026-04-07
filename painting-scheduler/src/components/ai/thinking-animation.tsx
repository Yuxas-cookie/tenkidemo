"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingAnimationProps {
  statusMessage: string;
}

const thinkingSteps = [
  "AIが天気データを分析中...",
  "工程の依存関係を確認中...",
  "最適スケジュールを計算中...",
  "提案を生成中...",
];

export function ThinkingAnimation({ statusMessage }: ThinkingAnimationProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = statusMessage || thinkingSteps[0];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Pulsing AI icon */}
      <div className="relative">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-3xl text-white shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 rgba(147, 51, 234, 0.4)",
              "0 0 0 20px rgba(147, 51, 234, 0)",
              "0 0 0 0 rgba(147, 51, 234, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 rounded-full bg-purple-400"
            style={{ top: "50%", left: "50%" }}
            animate={{
              x: [
                Math.cos((i * 2 * Math.PI) / 3) * 40,
                Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 40,
                Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 40,
              ],
              y: [
                Math.sin((i * 2 * Math.PI) / 3) * 40,
                Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 40,
                Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 40,
              ],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Status message with typewriter effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-gray-700">
            {displayMessage}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {".".repeat(dotCount + 1)}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  );
}
