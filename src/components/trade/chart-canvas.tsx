"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface UserTrade {
  side: "buy" | "sell";
  price: number;
  time: number;
}

const C = {
  bg: "#0a0b10",
  grid: "rgba(255,255,255,0.03)",
  gridBorder: "rgba(255,255,255,0.06)",
  up: "#26a69a",
  down: "#ef5350",
  upFill: "#26a69a",
  downFill: "#ef5350",
  text: "#6b7280",
  textBright: "#9ca3af",
  crosshair: "rgba(255,255,255,0.18)",
  ma: ["#f59e0b", "#22d3ee", "#3b82f6", "#a855f7"],
  volUp: "rgba(38,166,154,0.3)",
  volDown: "rgba(239,83,80,0.3)",
};

const MA_PERIODS = [5, 10, 30, 60];
const PAD = { top: 10, right: 72, bottom: 28, left: 4 };
const VOL_RATIO = 0.18;

function calcMA(candles: Candle[], period: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null;
    return candles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0) / period;
  });
}

export function ChartCanvas({
  candles,
  userTrades = [],
  onHover,
}: {
  candles: Candle[];
  userTrades?: UserTrade[];
  onHover?: (candle: Candle | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [candleWidth, setCandleWidth] = useState(8);
  const [offset, setOffset] = useState(0); // px from right edge
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);

  const maData = useMemo(() => MA_PERIODS.map((p) => calcMA(candles, p)), [candles]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W < 10 || H < 10) return;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const volH = chartH * VOL_RATIO;
    const priceH = chartH - volH - 4;

    const cw = Math.max(2, candleWidth);
    const bodyW = Math.max(1, cw * 0.55);
    const rightPad = 16;

    // visible candle range
    const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);
    const numVisible = Math.ceil(chartW / cw) + 2;
    const leftmostIdx = Math.max(0, rightmostIdx - numVisible);
    const visible = candles.slice(leftmostIdx, rightmostIdx + 1);
    if (!visible.length) return;

    // price range from visible
    let lo = Infinity, hi = -Infinity;
    for (const c of visible) {
      if (c.low < lo) lo = c.low;
      if (c.high > hi) hi = c.high;
    }
    const pad = (hi - lo) * 0.07;
    lo -= pad; hi += pad;
    const priceRange = hi - lo || 1;
    const maxVol = Math.max(...visible.map((c) => c.volume ?? 0), 1);

    function pY(price: number) {
      return PAD.top + priceH - ((price - lo) / priceRange) * priceH;
    }
    function cX(idx: number) {
      const fromRight = rightmostIdx - idx;
      return PAD.left + chartW - rightPad - fromRight * cw;
    }
    function vY(vol: number) {
      return H - PAD.bottom - (vol / maxVol) * volH;
    }

    // ── background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // ── horizontal grid + price labels
    const steps = 5;
    ctx.font = `10px ui-monospace, monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    for (let i = 0; i <= steps; i++) {
      const price = lo + (priceRange / steps) * i;
      const y = pY(price);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();

      ctx.fillStyle = C.text;
      const label = price >= 100
        ? price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : price.toFixed(4);
      ctx.fillText(label, W - PAD.right + 5, y);
    }

    // ── right border
    ctx.strokeStyle = C.gridBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W - PAD.right, PAD.top);
    ctx.lineTo(W - PAD.right, H - PAD.bottom);
    ctx.stroke();

    // ── MA lines
    for (let mi = 0; mi < MA_PERIODS.length; mi++) {
      const ma = maData[mi];
      ctx.strokeStyle = C.ma[mi];
      ctx.lineWidth = 1;
      ctx.beginPath();
      let started = false;
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const v = ma[i];
        if (v == null) continue;
        const x = cX(i), y = pY(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // ── volume bars
    for (let i = leftmostIdx; i <= rightmostIdx; i++) {
      const c = candles[i];
      if (!c.volume) continue;
      const x = cX(i);
      ctx.fillStyle = c.close >= c.open ? C.volUp : C.volDown;
      const top = vY(c.volume);
      ctx.fillRect(x - bodyW / 2, top, bodyW, H - PAD.bottom - top);
    }

    // ── volume separator
    ctx.strokeStyle = C.gridBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, H - PAD.bottom - volH);
    ctx.lineTo(W - PAD.right, H - PAD.bottom - volH);
    ctx.stroke();

    // ── candles
    for (let i = leftmostIdx; i <= rightmostIdx; i++) {
      const c = candles[i];
      const x = cX(i);
      const isUp = c.close >= c.open;
      const color = isUp ? C.up : C.down;

      // wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, pY(c.high));
      ctx.lineTo(x, pY(c.low));
      ctx.stroke();

      // body
      const top = pY(Math.max(c.open, c.close));
      const bot = pY(Math.min(c.open, c.close));
      const bh = Math.max(1, bot - top);
      ctx.fillStyle = isUp ? C.upFill : C.downFill;
      ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
    }

    // ── user trade markers (B/S circles)
    for (const trade of userTrades) {
      const ts = Math.floor(trade.time / 1000);
      let nearIdx = leftmostIdx;
      let nearDist = Infinity;
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const d = Math.abs(candles[i].time - ts);
        if (d < nearDist) { nearDist = d; nearIdx = i; }
      }
      const c = candles[nearIdx];
      const x = cX(nearIdx);
      const isBuy = trade.side === "buy";
      const y = isBuy ? pY(c.low) + 16 : pY(c.high) - 16;

      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = isBuy ? "#26a69a" : "#ef5350";
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isBuy ? "B" : "S", x, y);
    }

    // ── current price dashed line + label
    const lastClose = candles.at(-1)?.close;
    if (lastClose && lastClose >= lo && lastClose <= hi) {
      const y = pY(lastClose);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      const isLastUp = (candles.at(-1)?.close ?? 0) >= (candles.at(-1)?.open ?? 0);
      ctx.fillStyle = isLastUp ? C.up : C.down;
      const lw = PAD.right - 2;
      ctx.fillRect(W - PAD.right, y - 9, lw, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lastClose.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + lw / 2, y);
    }

    // ── time axis
    ctx.fillStyle = C.text;
    ctx.font = "10px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const labelEvery = Math.max(1, Math.ceil(90 / cw));
    for (let i = leftmostIdx; i <= rightmostIdx; i += labelEvery) {
      const x = cX(i);
      if (x < PAD.left + 30 || x > W - PAD.right - 10) continue;
      const d = new Date(candles[i].time * 1000);
      const label = `${(d.getMonth() + 1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:00`;
      ctx.fillText(label, x, H - PAD.bottom + 3);
    }

    // ── crosshair
    if (crosshair) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = C.crosshair;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crosshair.x, PAD.top);
      ctx.lineTo(crosshair.x, H - PAD.bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PAD.left, crosshair.y);
      ctx.lineTo(W - PAD.right, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // price label on Y axis
      const hPrice = hi - ((crosshair.y - PAD.top) / priceH) * priceRange;
      if (crosshair.y >= PAD.top && crosshair.y <= PAD.top + priceH) {
        ctx.fillStyle = "#374151";
        ctx.fillRect(W - PAD.right, crosshair.y - 9, PAD.right - 2, 18);
        ctx.fillStyle = "#e5e7eb";
        ctx.font = "9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, crosshair.y);
      }
    }
  }, [candles, candleWidth, offset, crosshair, maData, userTrades]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(container);
    return () => obs.disconnect();
  }, [draw]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setCandleWidth((w) => Math.min(40, Math.max(2, w * (e.deltaY > 0 ? 0.85 : 1.18))));
  }

  function onMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startOffset: offset };
  }

  function onMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCrosshair({ x, y });

      // find hovered candle
      const chartW = rect.width - PAD.left - PAD.right;
      const cw = Math.max(2, candleWidth);
      const rightPad = 16;
      const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);
      const fromRight = Math.round((PAD.left + chartW - rightPad - x) / cw);
      const idx = Math.max(0, Math.min(candles.length - 1, rightmostIdx - fromRight));
      onHover?.(candles[idx] ?? null);
    }
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      setOffset(Math.max(0, dragRef.current.startOffset - dx));
    }
  }

  function onMouseUp() { dragRef.current = null; }
  function onMouseLeave() {
    dragRef.current = null;
    setCrosshair(null);
    onHover?.(null);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair select-none"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
