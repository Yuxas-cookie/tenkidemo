import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { WeatherModeProvider } from "@/providers/weather-mode-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PaintAI Scheduler | AI工程最適化システム",
  description:
    "天気予報と連動してAIが塗装工事の工程を自動最適化するスケジューリングシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} h-full`}
    >
      <body className="h-full font-sans antialiased" style={{ fontFamily: "var(--font-noto-sans-jp), var(--font-inter), sans-serif" }}>
        <WeatherModeProvider>
          <TooltipProvider>
            <div className="flex h-full">
              <Sidebar />
              <main className="ml-72 flex-1 overflow-y-auto bg-gray-50/80">
                <div className="px-10 py-8">
                  {children}
                </div>
              </main>
            </div>
          </TooltipProvider>
        </WeatherModeProvider>
      </body>
    </html>
  );
}
