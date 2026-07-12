"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Candle {
  time: number; open: number; high: number; low: number; close: number; volume?: number;
}
interface UserTrade { side: "buy" | "sell"; price: number; time: number; }

export type DrawingTool = "cursor" | "trendline" | "hline" | "rect" | "fib" | "long" | "short";
export type ChartType   = "candle" | "bar" | "line" | "area";
export interface DrawingPoint { time: number; price: number; }
export type Drawing =
  | { id: string; type: "trendline"; p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "hline";     price: number }
  | { id: string; type: "rect";      p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "fib";       p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "long";      entry: number; target: number; stop: number }
  | { id: string; type: "short";     entry: number; target: number; stop: number };

const MA_PERIODS = [5, 10, 30, 60];
const PAD        = { top: 10, right: 72, bottom: 28, left: 4 };
const VOL_RATIO  = 0.18;
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS = ["#22d3ee","#a855f7","#3b82f6","#f59e0b","#ef5350","#a855f7","#22d3ee"];

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
  if (tool === "long")      return { id: uid(), type: "long",  entry: p1.price, target: p1.price * 1.05,  stop: p1.price * 0.975 };
  if (tool === "short")     return { id: uid(), type: "short", entry: p1.price, target: p1.price * 0.95,  stop: p1.price * 1.025 };
  return null;
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function translateDrawing(d: Drawing, dp: number): Drawing {
  if (d.type === "trendline") return { ...d, p1: { ...d.p1, price: d.p1.price + dp }, p2: { ...d.p2, price: d.p2.price + dp } };
  if (d.type === "hline")     return { ...d, price: d.price + dp };
  if (d.type === "rect")      return { ...d, p1: { ...d.p1, price: d.p1.price + dp }, p2: { ...d.p2, price: d.p2.price + dp } };
  if (d.type === "fib")       return { ...d, p1: { ...d.p1, price: d.p1.price + dp }, p2: { ...d.p2, price: d.p2.price + dp } };
  if (d.type === "long")      return { ...d, entry: d.entry + dp, target: d.target + dp, stop: d.stop + dp };
  if (d.type === "short")     return { ...d, entry: d.entry + dp, target: d.target + dp, stop: d.stop + dp };
  return d;
}

export function ChartCanvas({
  candles, userTrades = [], onHover,
  chartType = "candle", visibleMAs = [true, true, true, true], showVolume = true,
  candleColors = { up: "#26a69a", down: "#ef5350" },
  activeTool = "cursor", drawings = [],
  onAddDrawing, onUpdateDrawing, onDeleteDrawing,
  saveRef,
}: {
  candles: Candle[];  userTrades?: UserTrade[];  onHover?: (c: Candle | null) => void;
  chartType?: ChartType;  visibleMAs?: boolean[];  showVolume?: boolean;
  candleColors?: { up: string; down: string };
  activeTool?: DrawingTool;  drawings?: Drawing[];
  onAddDrawing?:    (d: Drawing) => void;
  onUpdateDrawing?: (d: Drawing) => void;
  onDeleteDrawing?: (id: string) => void;
  saveRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [candleWidth, setCandleWidth] = useState(8);
  const [offset,      setOffset]      = useState(0);
  const [crosshair,   setCrosshair]   = useState<{ x: number; y: number } | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const dragRef     = useRef<{ startX: number; startOffset: number } | null>(null);
  const velRef      = useRef(0);
  const animRef     = useRef<number | null>(null);
  const lastMXRef   = useRef<{ x: number; t: number } | null>(null);
  const offsetRef   = useRef(offset);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // Drawing in-progress
  const drawStartRef = useRef<{ point: DrawingPoint } | null>(null);
  // Moving an existing drawing
  const drawDragRef  = useRef<{ id: string; startPrice: number; startDrawing: Drawing } | null>(null);

  const maData   = useMemo(() => MA_PERIODS.map(p => calcMA(candles, p)), [candles]);
  const volRatio = showVolume ? VOL_RATIO : 0;

  // Shared coordinate system computed from container dimensions
  function getCoords(W: number, H: number) {
    const chartW  = W - PAD.left - PAD.right;
    const chartH  = H - PAD.top - PAD.bottom;
    const volH    = chartH * volRatio;
    const priceH  = chartH - volH - (showVolume ? 4 : 0);
    const cw      = Math.max(2, candleWidth);
    const rp      = 16; // rightPad
    const rmi     = candles.length - 1 - Math.floor(offset / cw); // rightmostIdx
    const lmi     = Math.max(0, rmi - Math.ceil(chartW / cw) - 2); // leftmostIdx
    const visible = candles.slice(lmi, rmi + 1);
    let lo = Infinity, hi = -Infinity;
    for (const c of visible) { if (c.low < lo) lo = c.low; if (c.high > hi) hi = c.high; }
    const pr = (hi - lo) * 0.07; lo -= pr; hi += pr;
    const priceRange = hi - lo || 1;
    const maxVol = Math.max(...visible.map(c => c.volume ?? 0), 1);

    const pY = (price: number) => PAD.top + priceH - ((price - lo) / priceRange) * priceH;
    const cX = (idx: number)   => PAD.left + chartW - rp - (rmi - idx) * cw;
    const vY = (vol: number)   => H - PAD.bottom - (vol / maxVol) * volH;

    const xyToPoint = (x: number, y: number): DrawingPoint => {
      const price = hi - ((y - PAD.top) / priceH) * priceRange;
      const idx   = Math.max(0, Math.min(candles.length - 1, Math.round(rmi - (PAD.left + chartW - rp - x) / cw)));
      return { time: candles[idx]?.time ?? 0, price };
    };
    const pointToX = (p: DrawingPoint): number => {
      let ni = lmi, nd = Infinity;
      for (let i = Math.max(0, lmi - 5); i <= Math.min(candles.length - 1, rmi + 5); i++) {
        const d = Math.abs(candles[i].time - p.time);
        if (d < nd) { nd = d; ni = i; }
      }
      return cX(ni);
    };
    return { chartW, priceH, cw, rp, rmi, lmi, lo, hi, priceRange, volH, pY, cX, vY, xyToPoint, pointToX };
  }

  // Hit-test a drawing, returns true if mouse (mx,my) in pixels is within threshold
  function hitTest(d: Drawing, mx: number, my: number, W: number, H: number): boolean {
    const THR = 8;
    const { pY, pointToX } = getCoords(W, H);
    if (d.type === "hline") return Math.abs(pY(d.price) - my) < THR;
    if (d.type === "long" || d.type === "short") {
      const ey = pY(d.entry), ty = pY(d.target), sy = pY(d.stop);
      const minY = Math.min(ey, ty, sy) - THR, maxY = Math.max(ey, ty, sy) + THR;
      return my > minY && my < maxY;
    }
    if (d.type === "trendline") {
      const x1 = pointToX(d.p1), y1 = pY(d.p1.price);
      const x2 = pointToX(d.p2), y2 = pY(d.p2.price);
      return distToSeg(mx, my, x1, y1, x2, y2) < THR;
    }
    if (d.type === "fib") {
      const x1 = pointToX(d.p1), x2 = pointToX(d.p2);
      if (mx < Math.min(x1, x2) - THR || mx > Math.max(x1, x2) + THR) return false;
      const dp = d.p2.price - d.p1.price;
      return FIB_LEVELS.some(lvl => Math.abs(pY(d.p1.price + dp * lvl) - my) < THR);
    }
    if (d.type === "rect") {
      const x1 = pointToX(d.p1), y1 = pY(d.p1.price);
      const x2 = pointToX(d.p2), y2 = pY(d.p2.price);
      return mx > Math.min(x1, x2) - THR && mx < Math.max(x1, x2) + THR
          && my > Math.min(y1, y2) - THR && my < Math.max(y1, y2) + THR;
    }
    return false;
  }

  const draw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth, H = container.clientHeight;
    if (W < 10 || H < 10) return;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const { chartW, priceH, cw, rp, rmi, lmi, lo, hi, priceRange, volH, pY, cX, vY, xyToPoint, pointToX } = getCoords(W, H);
    const bodyW = Math.max(1, cw * 0.55);

    // ── background
    ctx.fillStyle = "#0a0b10";
    ctx.fillRect(0, 0, W, H);

    // ── grid + price labels
    ctx.font = "10px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    for (let i = 0; i <= 5; i++) {
      const price = lo + (priceRange / 5) * i, y = pY(price);
      ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.fillText(price >= 100
        ? price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : price.toFixed(4), W - PAD.right + 5, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W - PAD.right, PAD.top); ctx.lineTo(W - PAD.right, H - PAD.bottom); ctx.stroke();

    // ── MA lines
    for (let mi = 0; mi < MA_PERIODS.length; mi++) {
      if (!visibleMAs[mi]) continue;
      const ma = maData[mi]; const colors = ["#f59e0b","#22d3ee","#3b82f6","#a855f7"];
      ctx.strokeStyle = colors[mi]; ctx.lineWidth = 1; ctx.beginPath();
      let started = false;
      for (let i = lmi; i <= rmi; i++) {
        const v = ma[i]; if (v == null) continue;
        const x = cX(i), y = pY(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // ── volume
    if (showVolume) {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i]; if (!c.volume) continue;
        ctx.fillStyle = c.close >= c.open ? "rgba(38,166,154,0.3)" : "rgba(239,83,80,0.3)";
        const top = vY(c.volume);
        ctx.fillRect(cX(i) - bodyW / 2, top, bodyW, H - PAD.bottom - top);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, H - PAD.bottom - volH); ctx.lineTo(W - PAD.right, H - PAD.bottom - volH); ctx.stroke();
    }

    // ── candles / bars / line / area
    const CUP = candleColors.up, CDN = candleColors.down;
    if (chartType === "candle") {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i], x = cX(i), isUp = c.close >= c.open, col = isUp ? CUP : CDN;
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low)); ctx.stroke();
        const top = pY(Math.max(c.open, c.close));
        ctx.fillStyle = col; ctx.fillRect(x - bodyW / 2, top, bodyW, Math.max(1, pY(Math.min(c.open, c.close)) - top));
      }
    } else if (chartType === "bar") {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i], x = cX(i), tick = Math.max(2, bodyW * 0.8);
        ctx.strokeStyle = c.close >= c.open ? CUP : CDN; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low));
        ctx.moveTo(x - tick, pY(c.open)); ctx.lineTo(x, pY(c.open));
        ctx.moveTo(x, pY(c.close)); ctx.lineTo(x + tick, pY(c.close));
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      for (let i = lmi; i <= rmi; i++) {
        const x = cX(i), y = pY(candles[i].close);
        if (i === lmi) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (chartType === "area") {
        ctx.lineTo(cX(rmi), PAD.top + priceH); ctx.lineTo(cX(lmi), PAD.top + priceH); ctx.closePath();
        const g = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + priceH);
        g.addColorStop(0, "rgba(38,166,154,0.28)"); g.addColorStop(1, "rgba(38,166,154,0)");
        ctx.fillStyle = g; ctx.fill(); ctx.beginPath();
        for (let i = lmi; i <= rmi; i++) {
          const x = cX(i), y = pY(candles[i].close);
          if (i === lmi) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = CUP; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // ── user trades
    for (const trade of userTrades) {
      const ts = Math.floor(trade.time / 1000);
      let ni = lmi, nd = Infinity;
      for (let i = lmi; i <= rmi; i++) { const d = Math.abs(candles[i].time - ts); if (d < nd) { nd = d; ni = i; } }
      const c = candles[ni], x = cX(ni), isBuy = trade.side === "buy";
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
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke(); ctx.setLineDash([]);
      const isUp = (candles.at(-1)?.close ?? 0) >= (candles.at(-1)?.open ?? 0);
      ctx.fillStyle = isUp ? CUP : CDN;
      ctx.fillRect(W - PAD.right, y - 9, PAD.right - 2, 18);
      ctx.fillStyle = "#fff"; ctx.font = "bold 9px ui-monospace,monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(lastClose.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, y);
    }

    // ── time axis
    ctx.fillStyle = "#6b7280"; ctx.font = "10px ui-monospace,monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    const le = Math.max(1, Math.ceil(90 / cw));
    for (let i = lmi; i <= rmi; i += le) {
      const x = cX(i); if (x < PAD.left + 30 || x > W - PAD.right - 10) continue;
      const d = new Date(candles[i].time * 1000);
      ctx.fillText(`${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:00`, x, H - PAD.bottom + 3);
    }

    // ── drawings (committed + in-progress)
    function renderDrawing(d: Drawing, alpha = 1, isSelected = false) {
      ctx.save(); ctx.globalAlpha = alpha;
      const COL = "#22d3ee";

      if (d.type === "long" || d.type === "short") {
        const isLong = d.type === "long";
        const ey = pY(d.entry), ty = pY(d.target), sy = pY(d.stop);
        // Profit zone
        ctx.fillStyle = isLong ? "rgba(38,166,154,0.12)" : "rgba(239,83,80,0.12)";
        ctx.fillRect(PAD.left, Math.min(ey, ty), W - PAD.right - PAD.left, Math.abs(ey - ty));
        // Stop zone
        ctx.fillStyle = isLong ? "rgba(239,83,80,0.12)" : "rgba(38,166,154,0.12)";
        ctx.fillRect(PAD.left, Math.min(ey, sy), W - PAD.right - PAD.left, Math.abs(ey - sy));
        // Entry line
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.left, ey); ctx.lineTo(W - PAD.right, ey); ctx.stroke();
        ctx.setLineDash([]);
        // Target line
        ctx.strokeStyle = isLong ? "#26a69a" : "#ef5350"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.left, ty); ctx.lineTo(W - PAD.right, ty); ctx.stroke();
        // Stop line
        ctx.strokeStyle = isLong ? "#ef5350" : "#26a69a"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD.left, sy); ctx.lineTo(W - PAD.right, sy); ctx.stroke();
        // Labels
        const pct = (p: number, ref: number) => ((p - ref) / ref * 100).toFixed(2);
        ctx.font = "9px ui-monospace,monospace"; ctx.textBaseline = "middle";
        const lx = W - PAD.right + 5;
        ctx.fillStyle = "#9ca3af"; ctx.textAlign = "left";
        ctx.fillText(`ENTRY`, lx, ey);
        ctx.fillStyle = isLong ? "#26a69a" : "#ef5350";
        ctx.fillText(`+${pct(d.target, d.entry)}%`, lx, ty);
        ctx.fillStyle = isLong ? "#ef5350" : "#26a69a";
        ctx.fillText(`${pct(d.stop, d.entry)}%`, lx, sy);
      } else if (d.type === "trendline") {
        const x1 = pointToX(d.p1), y1 = pY(d.p1.price), x2 = pointToX(d.p2), y2 = pY(d.p2.price);
        ctx.strokeStyle = isSelected ? "#67e8f9" : COL; ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = isSelected ? "#67e8f9" : COL;
        [[x1,y1],[x2,y2]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x, y, isSelected ? 4 : 3, 0, Math.PI * 2); ctx.fill(); });
      } else if (d.type === "hline") {
        const y = pY(d.price);
        ctx.setLineDash([6, 3]); ctx.strokeStyle = isSelected ? "#67e8f9" : COL; ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(34,211,238,0.12)"; ctx.fillRect(W - PAD.right, y - 9, PAD.right - 2, 18);
        ctx.fillStyle = COL; ctx.font = "9px ui-monospace,monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(d.price.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, y);
      } else if (d.type === "rect") {
        const x1 = pointToX(d.p1), y1 = pY(d.p1.price), x2 = pointToX(d.p2), y2 = pY(d.p2.price);
        const rx = Math.min(x1,x2), ry = Math.min(y1,y2), rw = Math.abs(x2-x1), rh = Math.abs(y2-y1);
        ctx.fillStyle = "rgba(34,211,238,0.05)"; ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = isSelected ? "#67e8f9" : COL; ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.beginPath(); ctx.strokeRect(rx, ry, rw, rh);
      } else if (d.type === "fib") {
        const x1 = pointToX(d.p1), x2 = pointToX(d.p2), dp = d.p2.price - d.p1.price;
        FIB_LEVELS.forEach((lvl, li) => {
          const y = pY(d.p1.price + dp * lvl); const fc = FIB_COLORS[li];
          ctx.strokeStyle = fc; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(Math.min(x1,x2), y); ctx.lineTo(Math.max(x1,x2), y); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = fc; ctx.font = "8px ui-monospace,monospace"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
          ctx.fillText(`${(lvl*100).toFixed(1)}%`, Math.min(x1,x2)+3, y-1);
        });
      }
      ctx.restore();
    }

    for (const d of drawings) renderDrawing(d, 1, d.id === selectedId);

    // In-progress drawing preview
    if (drawStartRef.current && crosshair && activeTool !== "cursor") {
      const p2 = xyToPoint(crosshair.x, crosshair.y);
      const preview = buildDrawing(activeTool, drawStartRef.current.point, p2);
      if (preview) renderDrawing(preview, 0.55);
    }

    // ── crosshair
    if (crosshair) {
      ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(crosshair.x, PAD.top); ctx.lineTo(crosshair.x, H - PAD.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, crosshair.y); ctx.lineTo(W - PAD.right, crosshair.y); ctx.stroke();
      ctx.setLineDash([]);
      const hp = hi - ((crosshair.y - PAD.top) / priceH) * priceRange;
      if (crosshair.y >= PAD.top && crosshair.y <= PAD.top + priceH) {
        ctx.fillStyle = "#374151"; ctx.fillRect(W - PAD.right, crosshair.y - 9, PAD.right - 2, 18);
        ctx.fillStyle = "#e5e7eb"; ctx.font = "9px ui-monospace,monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(hp.toLocaleString("en-US", { minimumFractionDigits: 2 }), W - PAD.right + (PAD.right - 2) / 2, crosshair.y);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, candleWidth, offset, crosshair, maData, userTrades, chartType, visibleMAs, showVolume, volRatio, candleColors, drawings, activeTool, selectedId]);

  useEffect(() => { draw(); }, [draw]);

  // Save-to-image ref
  useEffect(() => {
    if (!saveRef) return;
    saveRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `btcusdt-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  }, [saveRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(container);
    return () => obs.disconnect();
  }, [draw]);

  // Touch events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let pinchDist = 0;
    function onTS(e: TouchEvent) {
      e.preventDefault();
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      if (e.touches.length === 1) {
        dragRef.current = { startX: e.touches[0].clientX, startOffset: offsetRef.current };
        velRef.current = 0; lastMXRef.current = { x: e.touches[0].clientX, t: performance.now() };
      } else if (e.touches.length === 2) {
        dragRef.current = null;
        pinchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      }
    }
    function onTM(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current) {
        const dx = e.touches[0].clientX - dragRef.current.startX;
        const now = performance.now();
        setOffset(Math.max(0, dragRef.current.startOffset - dx));
        if (lastMXRef.current) { const dt = now - lastMXRef.current.t; if (dt > 0) velRef.current = -(e.touches[0].clientX - lastMXRef.current.x) / dt * 16; }
        lastMXRef.current = { x: e.touches[0].clientX, t: performance.now() };
      } else if (e.touches.length === 2 && pinchDist > 0) {
        const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        setCandleWidth(w => Math.min(40, Math.max(2, w * dist / pinchDist))); pinchDist = dist;
      }
    }
    function onTE() {
      dragRef.current = null; pinchDist = 0;
      const vel = velRef.current;
      if (Math.abs(vel) > 0.5) { let v = vel; function step() { v *= 0.88; if (Math.abs(v) < 0.3) return; setOffset(p => Math.max(0, p + v)); animRef.current = requestAnimationFrame(step); } requestAnimationFrame(step); }
    }
    el.addEventListener("touchstart", onTS, { passive: false });
    el.addEventListener("touchmove",  onTM, { passive: false });
    el.addEventListener("touchend",   onTE);
    return () => { el.removeEventListener("touchstart", onTS); el.removeEventListener("touchmove", onTM); el.removeEventListener("touchend", onTE); };
  }, []);

  // Keyboard delete
  useEffect(() => {
    if (!selectedId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") { onDeleteDrawing?.(selectedId!); setSelectedId(null); }
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, onDeleteDrawing]);

  // ── Event handlers
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const oldCW = Math.max(2, candleWidth), newCW = Math.min(40, Math.max(2, oldCW * (e.deltaY > 0 ? 0.85 : 1.18)));
    const rp = 16, chartW = rect.width - PAD.left - PAD.right;
    const fromRight = PAD.left + chartW - rp - (e.clientX - rect.left);
    setOffset(p => Math.max(0, p + fromRight * (newCW / oldCW - 1)));
    setCandleWidth(newCW);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    if (activeTool !== "cursor") {
      const { xyToPoint } = getCoords(rect.width, rect.height);
      drawStartRef.current = { point: xyToPoint(mx, my) };
      return;
    }

    // Check for drawing hit
    const W = rect.width, H = rect.height;
    for (let i = drawings.length - 1; i >= 0; i--) {
      if (hitTest(drawings[i], mx, my, W, H)) {
        const d = drawings[i];
        setSelectedId(d.id);
        const { xyToPoint } = getCoords(W, H);
        const pt = xyToPoint(mx, my);
        drawDragRef.current = { id: d.id, startPrice: pt.price, startDrawing: d };
        return;
      }
    }

    // Pan
    setSelectedId(null);
    dragRef.current = { startX: e.clientX, startOffset: offset };
    velRef.current = 0; lastMXRef.current = { x: e.clientX, t: performance.now() };
  }

  function onMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    setCrosshair({ x: mx, y: my });

    // hover candle
    const { cw, rmi, rp, chartW } = getCoords(rect.width, rect.height);
    const fromRight = Math.round((PAD.left + chartW - rp - mx) / cw);
    onHover?.(candles[Math.max(0, Math.min(candles.length - 1, rmi - fromRight))] ?? null);

    // drag existing drawing
    if (drawDragRef.current) {
      const { xyToPoint } = getCoords(rect.width, rect.height);
      const pt = xyToPoint(mx, my);
      const dp = pt.price - drawDragRef.current.startPrice;
      const moved = translateDrawing(drawDragRef.current.startDrawing, dp);
      onUpdateDrawing?.(moved);
      return;
    }

    // pan
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const now = performance.now();
      setOffset(Math.max(0, dragRef.current.startOffset - dx));
      if (lastMXRef.current) { const dt = now - lastMXRef.current.t; if (dt > 0) velRef.current = -(e.clientX - lastMXRef.current.x) / dt * 16; }
      lastMXRef.current = { x: e.clientX, t: performance.now() };
    }
  }

  function onMouseUp(e: React.MouseEvent) {
    // Finish drawing drag
    if (drawDragRef.current) { drawDragRef.current = null; return; }

    // Finish pan with inertia
    if (dragRef.current) {
      dragRef.current = null;
      const vel = velRef.current;
      if (Math.abs(vel) > 0.5) { let v = vel; function step() { v *= 0.88; if (Math.abs(v) < 0.3) return; setOffset(p => Math.max(0, p + v)); animRef.current = requestAnimationFrame(step); } requestAnimationFrame(step); }
      return;
    }

    // Finish drawing placement
    if (activeTool !== "cursor" && drawStartRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !onAddDrawing) { drawStartRef.current = null; return; }
      const { xyToPoint } = getCoords(rect.width, rect.height);
      const p1 = drawStartRef.current.point;
      const p2 = xyToPoint(e.clientX - rect.left, e.clientY - rect.top);
      const d = buildDrawing(activeTool, p1, p2);
      if (d) onAddDrawing(d);
      drawStartRef.current = null;
    }
  }

  function onMouseLeave() {
    dragRef.current = null; drawStartRef.current = null; drawDragRef.current = null;
    setCrosshair(null); onHover?.(null);
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none ${activeTool === "cursor" ? "cursor-grab" : "cursor-crosshair"}`}
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
