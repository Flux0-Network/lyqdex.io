"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

export function ChartPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: {
        vertLine: { color: "rgba(139,92,246,0.3)" },
        horzLine: { color: "rgba(139,92,246,0.3)" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.05)" },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderDownColor: "#f87171",
      borderUpColor: "#34d399",
      wickDownColor: "#f87171",
      wickUpColor: "#34d399",
    });

    const now = Math.floor(Date.now() / 1000);
    const data = [];
    let price = 43250;
    for (let i = 200; i >= 0; i--) {
      const open = price + (Math.random() - 0.5) * 500;
      const close = open + (Math.random() - 0.5) * 400;
      const high = Math.max(open, close) + Math.random() * 200;
      const low = Math.min(open, close) - Math.random() * 200;
      price = close;
      data.push({ time: now - i * 3600, open, high, low, close });
    }

    candleSeries.setData(data as Parameters<typeof candleSeries.setData>[0]);
    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5 text-xs">
        <span className="font-semibold text-white">BTC/USDT</span>
        <span className="text-emerald-400">43,251.20</span>
        <span className="text-emerald-400 text-[10px]">+2.34%</span>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
