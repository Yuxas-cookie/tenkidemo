"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-4">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl shadow-lg shadow-blue-200"
            whileHover={{ scale: 1.05 }}
          >
            K
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              PaintAI Scheduler
            </h1>
            <p className="text-xs text-gray-500 leading-tight tracking-wide">
              AI工程最適化システム
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ダッシュボード
          </Link>
          <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
            </span>
            <span className="text-sm font-semibold text-purple-700">AI Active</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
