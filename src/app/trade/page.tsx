"use client";

import { AppNavbar } from "@/components/shared/app-navbar";
import { TerminalHeader } from "@/components/trade/terminal-header";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";

export default function TradePage() {
  return (
    <div className="h-screen bg-[#0a0b0e] flex flex-col overflow-hidden">
      <AppNavbar />

      {/* Below slim navbar */}
      <div className="mt-8 flex-1 min-h-0 flex">

        {/* Thin left sidebar */}
        <div className="w-8 shrink-0 bg-[#0c0d14] border-r border-white/[0.06] flex flex-col items-center justify-end pb-3 z-40">
          <div className="h-5 w-5 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center">
            <span className="text-[8px] text-gray-500">●</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TerminalHeader />
          <div className="flex-1 min-h-0 flex">
            <div className="flex-1 min-w-0 border-r border-white/5">
              <ChartPanel />
            </div>
            <div className="w-[220px] shrink-0 hidden md:block">
              <OrderbookPanel />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
