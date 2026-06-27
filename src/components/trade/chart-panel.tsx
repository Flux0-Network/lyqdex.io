"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

interface MarketData {
  ticker: { price: string; change: string; high: string; low: string; volume: string };
  candles: { time: number; open: number; high: number; low: number; close: number }[];
}

export function ChartPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    fetch("/api/market?symbol=BTCUSDT")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !data?.candles) return;

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

    candleSeries.setData(data.candles as Parameters<typeof candleSeries.setData>[0]);
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
  }, [data]);

  const price = data?.ticker?.price ? parseFloat(data.ticker.price) : 0;
  const change = data?.ticker?.change ? parseFloat(data.ticker.change) : 0;
  const isUp = change >= 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5 text-xs">
        <span className="font-semibold text-white">BTC/USDT</span>
        <span className={isUp ? "text-emerald-400" : "text-red-400"}>
          {price ? price.toLocaleString("de-DE", { minimumFractionDigits: 2 }) : "—"}
        </span>
        <span className={`text-[10px] ${isUp ? "text-emerald-400" : "text-red-400"}`}>
          {change ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : ""}
        </span>
        {data?.ticker && (
          <div className="hidden lg:flex items-center gap-3 ml-auto text-[10px] text-gray-500">
            <span>H: {parseFloat(data.ticker.high).toLocaleString("de-DE")}</span>
            <span>L: {parseFloat(data.ticker.low).toLocaleString("de-DE")}</span>
            <span>Vol: {parseFloat(data.ticker.volume).toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>
          </div>
        )}
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
