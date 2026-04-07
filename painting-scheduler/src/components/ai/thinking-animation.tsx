"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingAnimationProps {
  statusMessage: string;
}

export function ThinkingAnimation({ statusMessage }: ThinkingAnimationProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = statusMessage || "AIが天気データを分析中...";

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Pulsing AI icon */}
      <div className="relative">
        <motion.div
          className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 text-5xl text-white shadow-2xl shadow-purple-300/50"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 0 0 rgba(147, 51, 234, 0.4)",
              "0 0 0 30px rgba(147, 51, 234, 0)",
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
            className="absolute h-4 w-4 rounded-full bg-purple-400 shadow-lg shadow-purple-300/50"
            style={{ top: "50%", left: "50%" }}
            animate={{
              x: [
                Math.cos((i * 2 * Math.PI) / 3) * 55,
                Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 55,
                Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 55,
              ],
              y: [
                Math.sin((i * 2 * Math.PI) / 3) * 55,
                Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 55,
                Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 55,
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

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-gray-700">
            {displayMessage}
          </p>
          <p className="text-lg text-gray-400 mt-2">
            {".".repeat(dotCount + 1)}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
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
