"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
} from "lightweight-charts";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MarketData {
  ticker: { price: string; change: string; high: string; low: string; volume: string };
  candles: Candle[];
}

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];
const MA_CONFIG = [
  { period: 5, color: "#f59e0b", label: "MA5" },
  { period: 10, color: "#34d399", label: "MA10" },
  { period: 30, color: "#60a5fa", label: "MA30" },
  { period: 60, color: "#a855f7", label: "MA60" },
];

function calcMA(candles: Candle[], period: number) {
  return candles.flatMap((c, i) => {
    if (i < period - 1) return [];
    const avg = candles.slice(i - period + 1, i + 1).reduce((s, x) => s + x.close, 0) / period;
    return [{ time: c.time as unknown as import("lightweight-charts").Time, value: +avg.toFixed(2) }];
  });
}

function detectSignals(candles: Candle[]) {
  const ma5 = new Map(calcMA(candles, 5).map((x) => [x.time, x.value]));
  const ma10 = new Map(calcMA(candles, 10).map((x) => [x.time, x.value]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers: any[] = [];
  let prev5 = 0, prev10 = 0;

  for (const c of candles) {
    const t = c.time as unknown as import("lightweight-charts").Time;
    const cur5 = ma5.get(t) ?? 0;
    const cur10 = ma10.get(t) ?? 0;
    if (prev5 && prev10) {
      if (prev5 <= prev10 && cur5 > cur10) {
        markers.push({ time: t, position: "belowBar", color: "#34d399", shape: "circle", text: "B", size: 0.6 });
      } else if (prev5 >= prev10 && cur5 < cur10) {
        markers.push({ time: t, position: "aboveBar", color: "#f87171", shape: "circle", text: "S", size: 0.6 });
      }
    }
    prev5 = cur5;
    prev10 = cur10;
  }
  return markers;
}

export function ChartPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MarketData | null>(null);
  const [timeframe, setTimeframe] = useState("1H");
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !data?.candles) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.025)" },
        horzLines: { color: "rgba(255,255,255,0.025)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#1a1b24" },
        horzLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#1a1b24" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: true },
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

    // MA lines
    for (const { period, color } of MA_CONFIG) {
      const maData = calcMA(data.candles, period);
      if (!maData.length) continue;
      const maSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      maSeries.setData(maData);
    }

    // B/S markers
    const signals = detectSignals(data.candles);
    if (signals.length) createSeriesMarkers(candleSeries, signals);

    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      const c = param.seriesData.get(candleSeries);
      setHoverCandle(c ? (c as Candle) : null);
    });

    const observer = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    });
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [data]);

  const maValues = useMemo(() => {
    if (!data?.candles) return null;
    return MA_CONFIG.map(({ period, color, label }) => ({
      label,
      color,
      value: calcMA(data.candles, period).at(-1)?.value ?? 0,
    }));
  }, [data]);

  const display = hoverCandle ?? data?.candles?.at(-1) ?? null;
  const displayDelta = display ? display.close - display.open : 0;
  const displayDeltaPct = display?.open ? (displayDelta / display.open) * 100 : 0;
  const isUp = displayDelta >= 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/[0.06] shrink-0">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-0.5 text-[11px] rounded transition ${
              timeframe === tf ? "text-white bg-white/10" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tf}
          </button>
        ))}
        <div className="ml-auto flex items-center border border-white/[0.07] rounded overflow-hidden">
          {["Original", "TradingView", "Depth"].map((t) => (
            <button
              key={t}
              className={`px-2.5 py-0.5 text-[11px] border-r border-white/[0.06] last:border-r-0 transition ${
                t === "Original" ? "text-white bg-white/8" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* OHLC info bar */}
      {display && (
        <div className="flex flex-wrap items-center gap-x-3 px-2 py-0.5 text-[11px] shrink-0 border-b border-white/[0.03]">
          <span className="text-gray-500">Open: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.open)}</span></span>
          <span className="text-gray-500">Close: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.close)}</span></span>
          <span className="text-gray-500">High: <span className="text-emerald-400">{fmt(display.high)}</span></span>
          <span className="text-gray-500">Low: <span className="text-red-400">{fmt(display.low)}</span></span>
          <span className={isUp ? "text-emerald-400" : "text-red-400"}>
            {isUp ? "+" : ""}{fmt(displayDelta)} ({isUp ? "+" : ""}{displayDeltaPct.toFixed(2)}%)
          </span>
          {maValues && (
            <span className="hidden xl:flex items-center gap-2 ml-1">
              <span className="text-gray-600">MA</span>
              {maValues.map(({ label, color, value }) => (
                <span key={label} style={{ color }} className="tabular-nums">
                  {label}: {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ))}
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
