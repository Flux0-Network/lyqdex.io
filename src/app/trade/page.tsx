"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { OrderFormPanel } from "@/components/trade/order-form-panel";
import { WalletPanel } from "@/components/trade/wallet-panel";

function baseOf(symbol: string) {
  return symbol.replace(/USDT$/i, "");
}

export default function TradePage() {
  const [symbol,       setSymbol]       = useState("BTCUSDT");
  const [timeframe,    setTimeframe]    = useState("1H");
  const [walletAddr,   setWalletAddr]   = useState<string | null>(null);
  const [replayActive, setReplayActive] = useState(false);

  const replayToggleFn = useRef<(() => void) | null>(null);
  const saveChartRef   = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  const handleReplayChange = useCallback((active: boolean, toggle: () => void) => {
    setReplayActive(active);
    replayToggleFn.current = toggle;
  }, []);

  return (
    <div className="h-screen bg-[#0a0b0e] overflow-hidden">

      {/* Full-height sidebar */}
      <AppSidebar active="trade" walletAddr={walletAddr} />

      {/* Navbar */}
      <AppNavbar
        sidebarWidth={SIDEBAR_W}
        symbol={symbol}
        onSymbol={setSymbol}
        timeframe={timeframe}
        onTimeframe={setTimeframe}
        replayActive={replayActive}
        onReplayToggle={() => replayToggleFn.current?.()}
        onSaveChart={() => saveChartRef.current?.()}
      />

      {/* Content */}
      <div className="absolute top-11 bottom-0 right-0 flex" style={{ left: SIDEBAR_W }}>
        {/* Chart */}
        <div className="flex-1 min-w-0 border-r border-white/5">
          <ChartPanel
            symbol={symbol}
            timeframe={timeframe}
            onReplayChange={handleReplayChange}
            saveRef={saveChartRef}
          />
        </div>

        {/* Right panel: order form + orderbook + wallet */}
        <div className="w-[220px] shrink-0 hidden md:flex flex-col border-l border-white/[0.05]">
          {/* Order form (top) */}
          <div className="shrink-0 border-b border-white/[0.06]">
            <OrderFormPanel symbol={symbol} base={baseOf(symbol)} />
          </div>

          {/* Orderbook (middle, grows) */}
          <div className="flex-1 min-h-0 border-b border-white/[0.06]">
            <OrderbookPanel symbol={symbol} />
          </div>

          {/* Wallet (bottom, fixed) */}
          <div className="h-[140px] shrink-0">
            <WalletPanel />
          </div>
        </div>
      </div>

    </div>
  );
}
