"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppNavbar } from "@/components/shared/app-navbar";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { OrderFormPanel } from "@/components/trade/order-form-panel";
import { WalletPanel } from "@/components/trade/wallet-panel";
import { PositionsPanel } from "@/components/trade/positions-panel";
import {
  IconChartCandle, IconBook, IconLayoutBottombarCollapse, IconEdit,
} from "@tabler/icons-react";

function baseOf(symbol: string) {
  return symbol.replace(/USDT$/i, "");
}

type MobileTab = "chart" | "orderbook" | "positions" | "order";

function TradePageInner() {
  const searchParams = useSearchParams();
  const initialSymbol = (searchParams.get("symbol") ?? "BTCUSDT").toUpperCase();
  const [symbol,       setSymbol]       = useState(initialSymbol);
  const [timeframe,    setTimeframe]    = useState("1H");
  const [walletAddr,   setWalletAddr]   = useState<string | null>(null);
  const [replayActive, setReplayActive] = useState(false);
  const [mobileTab,    setMobileTab]    = useState<MobileTab>("chart");

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

  const MOBILE_TABS: { key: MobileTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "chart",      label: "Chart",      Icon: IconChartCandle },
    { key: "orderbook",  label: "Orderbuch",  Icon: IconBook },
    { key: "positions",  label: "Positionen", Icon: IconLayoutBottombarCollapse },
    { key: "order",      label: "Order",      Icon: IconEdit },
  ];

  return (
    <div className="h-screen bg-[#050608] overflow-hidden">

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar active="trade" walletAddr={walletAddr} />
      </div>

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

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex absolute top-11 bottom-0 right-0" style={{ left: SIDEBAR_W }}>
        {/* Chart + positions strip */}
        <div className="flex-1 min-w-0 border-r border-white/5 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChartPanel
              symbol={symbol}
              timeframe={timeframe}
              onReplayChange={handleReplayChange}
              saveRef={saveChartRef}
            />
          </div>
          <div className="h-[160px] shrink-0 border-t border-white/[0.06]">
            <PositionsPanel />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[220px] shrink-0 flex flex-col border-l border-white/[0.05]">
          <div className="shrink-0 border-b border-white/[0.06]">
            <OrderFormPanel symbol={symbol} base={baseOf(symbol)} />
          </div>
          <div className="flex-1 min-h-0 border-b border-white/[0.06]">
            <OrderbookPanel symbol={symbol} />
          </div>
          <div className="h-[140px] shrink-0">
            <WalletPanel />
          </div>
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden flex flex-col absolute top-11 bottom-14 left-0 right-0">
        {mobileTab === "chart" && (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ChartPanel
                symbol={symbol}
                timeframe={timeframe}
                onReplayChange={handleReplayChange}
                saveRef={saveChartRef}
              />
            </div>
            {/* Draggable bottom sheet for positions */}
            <PositionsPanel isMobile />
          </div>
        )}
        {mobileTab === "orderbook" && (
          <div className="flex-1 min-h-0 overflow-auto">
            <OrderbookPanel symbol={symbol} />
          </div>
        )}
        {mobileTab === "positions" && (
          <div className="flex-1 min-h-0 overflow-auto bg-[#07080d]">
            <PositionsPanel />
          </div>
        )}
        {mobileTab === "order" && (
          <div className="flex-1 min-h-0 overflow-auto">
            <OrderFormPanel symbol={symbol} base={baseOf(symbol)} />
            <WalletPanel />
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#07080d] border-t border-white/[0.07] flex z-50">
        {MOBILE_TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition ${
              mobileTab === key ? "text-cyan-400" : "text-gray-400"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#050608]" />}>
      <TradePageInner />
    </Suspense>
  );
}
