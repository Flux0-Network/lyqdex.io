"use client";

import { AppNavbar } from "@/components/shared/app-navbar";
import { TerminalHeader } from "@/components/trade/terminal-header";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";

export default function TradePage() {
  return (
    <div className="h-screen bg-[#0a0b0e] flex flex-col overflow-hidden">
      <AppNavbar />
      <div className="mt-12 flex-1 min-h-0 flex flex-col">
        <TerminalHeader />
        <div className="flex-1 min-h-0 flex">
          {/* Chart — fills remaining space */}
          <div className="flex-1 min-w-0 border-r border-white/5">
            <ChartPanel />
          </div>
          {/* Orderbook — fixed sidebar */}
          <div className="w-[220px] shrink-0 hidden md:block">
            <OrderbookPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
