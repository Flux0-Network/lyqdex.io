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

export type DrawingTool = "cursor" | "trendline" | "hline" | "rect" | "fib";
export type ChartType   = "candle" | "bar" | "line" | "area";

export interface DrawingPoint { time: number; price: number; }
export type Drawing =
  | { id: string; type: "trendline"; p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "hline";     price: number }
  | { id: string; type: "rect";      p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "fib";       p1: DrawingPoint; p2: DrawingPoint };

const C = {
  bg: "#0a0b10",
  grid: "rgba(255,255,255,0.03)",
  gridBorder: "rgba(255,255,255,0.06)",
  up: "#26a69a", down: "#ef5350",
  text: "#6b7280", textBright: "#9ca3af",
  crosshair: "rgba(255,255,255,0.18)",
  ma: ["#f59e0b", "#22d3ee", "#3b82f6", "#a855f7"],
  volUp: "rgba(38,166,154,0.3)", volDown: "rgba(239,83,80,0.3)",
  draw: "#22d3ee",
};

const MA_PERIODS  = [5, 10, 30, 60];
const PAD         = { top: 10, right: 72, bottom: 28, left: 4 };
const VOL_RATIO   = 0.18;
const FIB_LEVELS  = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS  = ["#22d3ee","#a855f7","#3b82f6","#f59e0b","#ef5350","#a855f7","#22d3ee"];

function calcMA(candles: Candle[], period: number): (number | null)[] {
  return candles.map((_, i) =>
    i < period - 1 ? null
      : candles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0) / period
  );
}
function uid() { return Math.random().toString(36).slice(2, 9); }

function buildDrawing(tool: DrawingTool, p1: DrawingPoint, p2: DrawingPoint): Drawing | null {
  if (tool === "trendline") return { id: uid(), type: "trendline", p1, p2 };
  if (tool === "hline")     return { id: uid(), type: "hline", price: p1.price };
  if (tool === "rect")      return { id: uid(), type: "rect", p1, p2 };
  if (tool === "fib")       return { id: uid(), type: "fib", p1, p2 };
  return null;
}

export function ChartCanvas({
  candles,
  userTrades = [],
  onHover,
  chartType   = "candle",
  visibleMAs  = [true, true, true, true],
  showVolume  = true,
  activeTool  = "cursor",
  drawings    = [],
  onAddDrawing,
}: {
  candles:      Candle[];
  userTrades?:  UserTrade[];
  onHover?:     (candle: Candle | null) => void;
  chartType?:   ChartType;
  visibleMAs?:  boolean[];
  showVolume?:  boolean;
  activeTool?:  DrawingTool;
  drawings?:    Drawing[];
  onAddDrawing?: (d: Drawing) => void;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [candleWidth, setCandleWidth] = useState(8);
  const [offset,      setOffset]      = useState(0);
  const [crosshair,   setCrosshair]   = useState<{ x: number; y: number } | null>(null);

  // Pan with inertia
  const dragRef      = useRef<{ startX: number; startOffset: number } | null>(null);
  const velRef       = useRef(0);
  const animRef      = useRef<number | null>(null);
  const lastMXRef    = useRef<{ x: number; t: number } | null>(null);
  const offsetRef    = useRef(offset);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // Drawing in-progress
  const drawStartRef = useRef<{ point: DrawingPoint } | null>(null);

  const maData = useMemo(() => MA_PERIODS.map(p => calcMA(candles, p)), [candles]);
  const volRatio = showVolume ? VOL_RATIO : 0;

  const draw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W < 10 || H < 10) return;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const chartW  = W - PAD.left - PAD.right;
    const chartH  = H - PAD.top - PAD.bottom;
    const volH    = chartH * volRatio;
    const priceH  = chartH - volH - (showVolume ? 4 : 0);
    const cw      = Math.max(2, candleWidth);
    const bodyW   = Math.max(1, cw * 0.55);
    const rightPad = 16;

    const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);
    const numVisible   = Math.ceil(chartW / cw) + 2;
    const leftmostIdx  = Math.max(0, rightmostIdx - numVisible);
    const visible      = candles.slice(leftmostIdx, rightmostIdx + 1);
    if (!visible.length) return;

    let lo = Infinity, hi = -Infinity;
    for (const c of visible) { if (c.low < lo) lo = c.low; if (c.high > hi) hi = c.high; }
    const pr = (hi - lo) * 0.07;
    lo -= pr; hi += pr;
    const priceRange = hi - lo || 1;
    const maxVol = Math.max(...visible.map(c => c.volume ?? 0), 1);

    const pY   = (price: number) => PAD.top + priceH - ((price - lo) / priceRange) * priceH;
    const cX   = (idx: number)   => PAD.left + chartW - rightPad - (rightmostIdx - idx) * cw;
    const vY   = (vol: number)   => H - PAD.bottom - (vol / maxVol) * volH;

    // coordinate converters for drawings
    const xyToPoint = (x: number, y: number): DrawingPoint => {
      const price      = hi - ((y - PAD.top) / priceH) * priceRange;
      const fromRight  = (PAD.left + chartW - rightPad - x) / cw;
      const idx        = Math.max(0, Math.min(candles.length - 1, Math.round(rightmostIdx - fromRight)));
      return { time: candles[idx].time, price };
    };
    const pointToX = (p: DrawingPoint): number => {
      let nearIdx = leftmostIdx, nearDist = Infinity;
      const lo2 = Math.max(0, leftmostIdx - 5);
      const hi2 = Math.min(candles.length - 1, rightmostIdx + 5);
      for (let i = lo2; i <= hi2; i++) {
        const d = Math.abs(candles[i].time - p.time);
        if (d < nearDist) { nearDist = d; nearIdx = i; }
      }
      return cX(nearIdx);
    };
    const pointToY = (p: DrawingPoint) => pY(p.price);

    // ── background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // ── grid + price labels
    const steps = 5;
    ctx.font = "10px ui-monospace,monospace";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    for (let i = 0; i <= steps; i++) {
      const price = lo + (priceRange / steps) * i;
      const y     = pY(price);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.fillStyle = C.text;
      ctx.fillText(
        price >= 100
          ? price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
          : price.toFixed(4),
        W - PAD.right + 5, y
      );
    }

    // ── right border
    ctx.strokeStyle = C.gridBorder; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W - PAD.right, PAD.top); ctx.lineTo(W - PAD.right, H - PAD.bottom); ctx.stroke();

    // ── MA lines
    for (let mi = 0; mi < MA_PERIODS.length; mi++) {
      if (!visibleMAs[mi]) continue;
      const ma = maData[mi];
      ctx.strokeStyle = C.ma[mi]; ctx.lineWidth = 1;
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
    if (showVolume) {
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const c = candles[i]; if (!c.volume) continue;
        ctx.fillStyle = c.close >= c.open ? C.volUp : C.volDown;
        const top = vY(c.volume);
        ctx.fillRect(cX(i) - bodyW / 2, top, bodyW, H - PAD.bottom - top);
      }
      ctx.strokeStyle = C.gridBorder; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, H - PAD.bottom - volH);
      ctx.lineTo(W - PAD.right, H - PAD.bottom - volH);
      ctx.stroke();
    }

    // ── candles / bars / line / area
    if (chartType === "candle") {
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const c = candles[i]; const x = cX(i); const isUp = c.close >= c.open;
        const color = isUp ? C.up : C.down;
        ctx.strokeStyle = color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low)); ctx.stroke();
        const top = pY(Math.max(c.open, c.close));
        const bh  = Math.max(1, pY(Math.min(c.open, c.close)) - top);
        ctx.fillStyle = color;
        ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
      }
    } else if (chartType === "bar") {
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const c = candles[i]; const x = cX(i); const isUp = c.close >= c.open;
        const tick = Math.max(2, bodyW * 0.8);
        ctx.strokeStyle = isUp ? C.up : C.down; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low));
        ctx.moveTo(x - tick, pY(c.open)); ctx.lineTo(x, pY(c.open));
        ctx.moveTo(x, pY(c.close)); ctx.lineTo(x + tick, pY(c.close));
        ctx.stroke();
      }
    } else {
      // line / area share the path
      ctx.beginPath();
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const x = cX(i), y = pY(candles[i].close);
        if (i === leftmostIdx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (chartType === "area") {
        ctx.lineTo(cX(rightmostIdx), PAD.top + priceH);
        ctx.lineTo(cX(leftmostIdx),  PAD.top + priceH);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + priceH);
        g.addColorStop(0, "rgba(38,166,154,0.28)"); g.addColorStop(1, "rgba(38,166,154,0)");
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath();
        for (let i = leftmostIdx; i <= rightmostIdx; i++) {
          const x = cX(i), y = pY(candles[i].close);
          if (i === leftmostIdx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = C.up; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // ── user trade markers
    for (const trade of userTrades) {
      const ts = Math.floor(trade.time / 1000);
      let nearIdx = leftmostIdx, nearDist = Infinity;
      for (let i = leftmostIdx; i <= rightmostIdx; i++) {
        const d = Math.abs(candles[i].time - ts);
        if (d < nearDist) { nearDist = d; nearIdx = i; }
      }
      const c = candles[nearIdx]; const x = cX(nearIdx);
      const isBuy = trade.side === "buy";
      const y = isBuy ? pY(c.low) + 16 : pY(c.high) - 16;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = isBuy ? "#26a69a" : "#ef5350"; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(isBuy ? "B" : "S", x, y);
    }

    // ── current price dashed line
    const lastClose = candles.at(-1)?.close;
    if (lastClose && lastClose >= lo && lastClose <= hi) {
      const y = pY(lastClose);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.setLineDash([]);
      const isUp = (candles.at(-1)?.close ?? 0) >= (candles.at(-1)?.open ?? 0);
      ctx.fillStyle = isUp ? C.up : C.down;
      ctx.fillRect(W - PAD.right, y - 9, PAD.right - 2, 18);
      ctx.fillStyle = "#fff"; ctx.font = "bold 9px ui-monospace,monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(lastClose.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, y);
    }

    // ── time axis
    ctx.fillStyle = C.text; ctx.font = "10px ui-monospace,monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    const labelEvery = Math.max(1, Math.ceil(90 / cw));
    for (let i = leftmostIdx; i <= rightmostIdx; i += labelEvery) {
      const x = cX(i);
      if (x < PAD.left + 30 || x > W - PAD.right - 10) continue;
      const d = new Date(candles[i].time * 1000);
      ctx.fillText(
        `${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:00`,
        x, H - PAD.bottom + 3
      );
    }

    // ── committed drawings
    function renderDrawing(d: Drawing, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = C.draw; ctx.lineWidth = 1.5;
      if (d.type === "trendline") {
        const x1 = pointToX(d.p1), y1 = pointToY(d.p1);
        const x2 = pointToX(d.p2), y2 = pointToY(d.p2);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = C.draw;
        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(p => {
          ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        });
      } else if (d.type === "hline") {
        const y = pY(d.price);
        ctx.setLineDash([6, 3]);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(34,211,238,0.12)";
        ctx.fillRect(W - PAD.right, y - 9, PAD.right - 2, 18);
        ctx.fillStyle = C.draw; ctx.font = "9px ui-monospace,monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(d.price.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, y);
      } else if (d.type === "rect") {
        const x1 = pointToX(d.p1), y1 = pointToY(d.p1);
        const x2 = pointToX(d.p2), y2 = pointToY(d.p2);
        const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1),  rh = Math.abs(y2 - y1);
        ctx.fillStyle = "rgba(34,211,238,0.05)"; ctx.fillRect(rx, ry, rw, rh);
        ctx.beginPath(); ctx.strokeRect(rx, ry, rw, rh);
      } else if (d.type === "fib") {
        const x1 = pointToX(d.p1), x2 = pointToX(d.p2);
        const dp  = d.p2.price - d.p1.price;
        FIB_LEVELS.forEach((lvl, li) => {
          const y = pY(d.p1.price + dp * lvl);
          ctx.strokeStyle = FIB_COLORS[li]; ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(Math.min(x1, x2), y); ctx.lineTo(Math.max(x1, x2), y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = FIB_COLORS[li]; ctx.font = "8px ui-monospace,monospace";
          ctx.textAlign = "left"; ctx.textBaseline = "bottom";
          ctx.fillText(`${(lvl * 100).toFixed(1)}%`, Math.min(x1, x2) + 3, y - 1);
        });
      }
      ctx.restore();
    }

    for (const d of drawings) renderDrawing(d);

    // in-progress preview
    const ds = drawStartRef.current;
    if (ds && crosshair && activeTool !== "cursor") {
      const p2 = xyToPoint(crosshair.x, crosshair.y);
      const preview = buildDrawing(activeTool, ds.point, p2);
      if (preview) renderDrawing(preview, 0.55);
    }

    // ── crosshair
    if (crosshair) {
      ctx.setLineDash([3, 3]); ctx.strokeStyle = C.crosshair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(crosshair.x, PAD.top); ctx.lineTo(crosshair.x, H - PAD.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, crosshair.y); ctx.lineTo(W - PAD.right, crosshair.y); ctx.stroke();
      ctx.setLineDash([]);
      const hPrice = hi - ((crosshair.y - PAD.top) / priceH) * priceRange;
      if (crosshair.y >= PAD.top && crosshair.y <= PAD.top + priceH) {
        ctx.fillStyle = "#374151";
        ctx.fillRect(W - PAD.right, crosshair.y - 9, PAD.right - 2, 18);
        ctx.fillStyle = "#e5e7eb"; ctx.font = "9px ui-monospace,monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(hPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, crosshair.y);
      }
    }
  }, [candles, candleWidth, offset, crosshair, maData, userTrades, chartType, visibleMAs, showVolume, volRatio, drawings, activeTool]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(container);
    return () => obs.disconnect();
  }, [draw]);

  // Touch events (need passive:false for preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let pinchDist = 0;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      if (e.touches.length === 1) {
        dragRef.current = { startX: e.touches[0].clientX, startOffset: offsetRef.current };
        velRef.current = 0;
        lastMXRef.current = { x: e.touches[0].clientX, t: performance.now() };
      } else if (e.touches.length === 2) {
        dragRef.current = null;
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        pinchDist = Math.hypot(dx, dy);
      }
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current) {
        const dx  = e.touches[0].clientX - dragRef.current.startX;
        const now = performance.now();
        setOffset(Math.max(0, dragRef.current.startOffset - dx));
        if (lastMXRef.current) {
          const dt = now - lastMXRef.current.t;
          if (dt > 0) velRef.current = -(e.touches[0].clientX - lastMXRef.current.x) / dt * 16;
        }
        lastMXRef.current = { x: e.touches[0].clientX, t: performance.now() };
      } else if (e.touches.length === 2 && pinchDist > 0) {
        const dx   = e.touches[1].clientX - e.touches[0].clientX;
        const dy   = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        const f    = dist / pinchDist;
        setCandleWidth(w => Math.min(40, Math.max(2, w * f)));
        pinchDist = dist;
      }
    }
    function onTouchEnd() {
      dragRef.current = null;
      pinchDist = 0;
      const vel = velRef.current;
      if (Math.abs(vel) > 0.5) {
        let v = vel;
        function step() {
          v *= 0.88;
          if (Math.abs(v) < 0.3) return;
          setOffset(p => Math.max(0, p + v));
          animRef.current = requestAnimationFrame(step);
        }
        animRef.current = requestAnimationFrame(step);
      }
    }
    el.addEventListener("touchstart",  onTouchStart, { passive: false });
    el.addEventListener("touchmove",   onTouchMove,  { passive: false });
    el.addEventListener("touchend",    onTouchEnd);
    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
    };
  }, []); // stable — reads offsetRef

  // ── event handlers
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX  = e.clientX - rect.left;
    const chartW  = rect.width - PAD.left - PAD.right;
    const rightPad = 16;
    const oldCW   = Math.max(2, candleWidth);
    const newCW   = Math.min(40, Math.max(2, oldCW * (e.deltaY > 0 ? 0.85 : 1.18)));
    const fromRight = PAD.left + chartW - rightPad - mouseX; // px from rightmost candle
    setOffset(prev => Math.max(0, prev + fromRight * (newCW / oldCW - 1)));
    setCandleWidth(newCW);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool !== "cursor") {
      // start a drawing
      const chartW   = rect.width - PAD.left - PAD.right;
      const cw       = Math.max(2, candleWidth);
      const rightPad = 16;
      const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);
      const fromRight    = (PAD.left + chartW - rightPad - x) / cw;
      const idx          = Math.max(0, Math.min(candles.length - 1, Math.round(rightmostIdx - fromRight)));
      const lo2 = -Infinity, hi2 = Infinity; // we don't know range here; use price approx
      // approximate price from last render — use the draw closure's pY inverse
      // We store no state about lo/hi outside draw, so compute price roughly
      // (exact price is non-critical for start point — it gets rendered precisely)
      const priceApprox = 0; // placeholder; actual value computed inside draw()
      void priceApprox;
      drawStartRef.current = {
        point: {
          time:  candles[idx]?.time ?? 0,
          // price: we'll compute accurately via the draw coordinate system
          // For now store canvas Y and recompute after first render updates lo/hi
          price: (e.clientY - rect.top), // raw Y; converted in onMouseUp
        },
      };
      // Store raw screen coords for accurate conversion on mouseup
      (drawStartRef.current as { point: DrawingPoint; rawY?: number }).rawY = y;
      (drawStartRef.current as { point: DrawingPoint; rawX?: number }).rawX = x;
      return;
    }
    // pan start
    dragRef.current = { startX: e.clientX, startOffset: offset };
    velRef.current  = 0;
    lastMXRef.current = { x: e.clientX, t: performance.now() };
  }

  function onMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshair({ x, y });

    // hover candle
    const chartW   = rect.width - PAD.left - PAD.right;
    const cw       = Math.max(2, candleWidth);
    const rightPad = 16;
    const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);
    const fromRight    = Math.round((PAD.left + chartW - rightPad - x) / cw);
    const idx          = Math.max(0, Math.min(candles.length - 1, rightmostIdx - fromRight));
    onHover?.(candles[idx] ?? null);

    if (dragRef.current) {
      const dx  = e.clientX - dragRef.current.startX;
      const now = performance.now();
      setOffset(Math.max(0, dragRef.current.startOffset - dx));
      if (lastMXRef.current) {
        const dt = now - lastMXRef.current.t;
        if (dt > 0) velRef.current = -(e.clientX - lastMXRef.current.x) / dt * 16;
      }
      lastMXRef.current = { x: e.clientX, t: performance.now() };
    }
  }

  function onMouseUp(e: React.MouseEvent) {
    if (dragRef.current) {
      dragRef.current = null;
      const vel = velRef.current;
      if (Math.abs(vel) > 0.5) {
        let v = vel;
        function step() {
          v *= 0.88;
          if (Math.abs(v) < 0.3) return;
          setOffset(p => Math.max(0, p + v));
          animRef.current = requestAnimationFrame(step);
        }
        animRef.current = requestAnimationFrame(step);
      }
      return;
    }

    // finalize drawing
    if (activeTool !== "cursor" && drawStartRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !onAddDrawing) { drawStartRef.current = null; return; }

      const chartW   = rect.width - PAD.left - PAD.right;
      const cw       = Math.max(2, candleWidth);
      const rightPad = 16;
      const rightmostIdx = candles.length - 1 - Math.floor(offset / cw);

      // compute price range for y→price conversion
      const numVisible  = Math.ceil(chartW / cw) + 2;
      const leftmostIdx = Math.max(0, rightmostIdx - numVisible);
      const visible     = candles.slice(leftmostIdx, rightmostIdx + 1);
      let lo = Infinity, hi = -Infinity;
      for (const c of visible) { if (c.low < lo) lo = c.low; if (c.high > hi) hi = c.high; }
      const pd = (hi - lo) * 0.07; lo -= pd; hi += pd;
      const chartH  = rect.height - PAD.top - PAD.bottom;
      const volH    = chartH * volRatio;
      const priceH  = chartH - volH - (showVolume ? 4 : 0);
      const priceRange = hi - lo || 1;

      const xyToPointFull = (x: number, y: number): DrawingPoint => {
        const price     = hi - ((y - PAD.top) / priceH) * priceRange;
        const fromRight = (PAD.left + chartW - rightPad - x) / cw;
        const idx       = Math.max(0, Math.min(candles.length - 1, Math.round(rightmostIdx - fromRight)));
        return { time: candles[idx].time, price };
      };

      const ds = drawStartRef.current as { point: DrawingPoint; rawX?: number; rawY?: number };
      const p1 = xyToPointFull(ds.rawX ?? 0, ds.rawY ?? 0);
      const p2 = xyToPointFull(e.clientX - rect.left, e.clientY - rect.top);
      const d  = buildDrawing(activeTool, p1, p2);
      if (d) onAddDrawing(d);
      drawStartRef.current = null;
    }
  }

  function onMouseLeave() {
    dragRef.current    = null;
    drawStartRef.current = null;
    setCrosshair(null);
    onHover?.(null);
  }

  const cursor = activeTool === "cursor" ? "cursor-grab" : "cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none ${cursor}`}
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
