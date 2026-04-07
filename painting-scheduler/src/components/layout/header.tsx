"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg"
            whileHover={{ scale: 1.05 }}
          >
            K
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              PaintAI Scheduler
            </h1>
            <p className="text-[10px] text-gray-500 leading-tight">
              AI工程最適化システム
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ダッシュボード
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            <span className="text-xs font-medium text-purple-700">AI Active</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
