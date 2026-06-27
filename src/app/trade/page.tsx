"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ResponsiveGridLayout, type Layout } from "react-grid-layout";
import { AppNavbar } from "@/components/shared/app-navbar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { TradesPanel } from "@/components/trade/trades-panel";
import { OrderFormPanel } from "@/components/trade/order-form-panel";
import { WalletPanel } from "@/components/trade/wallet-panel";
import { PositionsPanel } from "@/components/trade/positions-panel";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const defaultLayouts = {
  lg: [
    { i: "chart", x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 6 },
    { i: "orderbook", x: 8, y: 0, w: 2, h: 12, minW: 2, minH: 6 },
    { i: "orderform", x: 10, y: 0, w: 2, h: 12, minW: 2, minH: 8 },
    { i: "positions", x: 0, y: 12, w: 8, h: 6, minW: 4, minH: 4 },
    { i: "trades", x: 8, y: 12, w: 2, h: 8, minW: 2, minH: 4 },
    { i: "wallet", x: 10, y: 12, w: 2, h: 8, minW: 2, minH: 4 },
  ],
  md: [
    { i: "chart", x: 0, y: 0, w: 7, h: 10, minW: 3, minH: 5 },
    { i: "orderbook", x: 7, y: 0, w: 3, h: 10, minW: 2, minH: 5 },
    { i: "orderform", x: 0, y: 10, w: 4, h: 10, minW: 2, minH: 6 },
    { i: "positions", x: 0, y: 20, w: 10, h: 6, minW: 4, minH: 4 },
    { i: "trades", x: 4, y: 10, w: 3, h: 10, minW: 2, minH: 4 },
    { i: "wallet", x: 7, y: 10, w: 3, h: 10, minW: 2, minH: 4 },
  ],
  sm: [
    { i: "chart", x: 0, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: "orderform", x: 0, y: 8, w: 6, h: 8, minW: 2, minH: 6 },
    { i: "positions", x: 0, y: 16, w: 6, h: 6, minW: 3, minH: 4 },
    { i: "orderbook", x: 0, y: 22, w: 3, h: 8, minW: 2, minH: 5 },
    { i: "trades", x: 3, y: 22, w: 3, h: 8, minW: 2, minH: 4 },
    { i: "wallet", x: 0, y: 30, w: 6, h: 6, minW: 2, minH: 4 },
  ],
};

const panelConfig: Record<string, { title: string; component: React.ComponentType }> = {
  chart: { title: "Chart", component: ChartPanel },
  orderbook: { title: "Orderbuch", component: OrderbookPanel },
  orderform: { title: "Order", component: OrderFormPanel },
  positions: { title: "Positionen", component: PositionsPanel },
  trades: { title: "Trades", component: TradesPanel },
  wallet: { title: "Wallet", component: WalletPanel },
};

export default function TradePage() {
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = useCallback((_: any, allLayouts: any) => {
    setLayouts(allLayouts);
  }, []);

  const handleReset = () => {
    setLayouts({ ...defaultLayouts });
    setFullscreen(null);
  };

  if (fullscreen) {
    const Panel = panelConfig[fullscreen].component;
    return (
      <div className="h-screen bg-[#0a0b0e] flex flex-col">
        <AppNavbar />
        <div className="mt-12 flex-1 flex flex-col">
          <div className="flex items-center justify-between px-3 py-1 bg-gray-900/50 border-b border-white/5">
            <span className="text-xs text-gray-400">{panelConfig[fullscreen].title}</span>
            <button onClick={() => setFullscreen(null)} className="text-gray-500 hover:text-white">
              <IconMinimize className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <Panel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0b0e] flex flex-col overflow-hidden">
      <AppNavbar />
      <div className="mt-12 flex-1 min-h-0 flex flex-col" ref={containerRef}>
        <div className="flex items-center justify-end px-3 py-1 border-b border-white/5 bg-gray-950/50 shrink-0">
          <button onClick={handleReset} className="text-[10px] text-gray-500 hover:text-white transition">
            Layout zurücksetzen
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveGridLayout
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 900, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={30}
            width={width}
            onLayoutChange={handleLayoutChange}
            dragConfig={{ enabled: true, bounded: false, handle: ".drag-handle" }}
            margin={[2, 2] as [number, number]}
          >
            {Object.entries(panelConfig).map(([key, { title, component: Panel }]) => (
              <div key={key} className="bg-[#12131a] border border-white/5 rounded-lg overflow-hidden flex flex-col">
                <div className="drag-handle flex items-center justify-between px-3 py-1.5 bg-gray-900/30 cursor-grab active:cursor-grabbing border-b border-white/5 shrink-0">
                  <span className="text-[11px] text-gray-400 font-medium select-none">{title}</span>
                  <button
                    onClick={() => setFullscreen(key)}
                    className="text-gray-600 hover:text-white transition"
                  >
                    <IconMaximize className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Panel />
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
}
