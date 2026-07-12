"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Candle {
  time: number; open: number; high: number; low: number; close: number; volume?: number;
}
interface UserTrade { side: "buy" | "sell"; price: number; time: number; }

export type DrawingTool  = "cursor" | "trendline" | "hline" | "rect" | "fib" | "long" | "short";
export type ChartType    = "candle" | "bar" | "line" | "area";
export type MagnetMode   = "off" | "weak" | "strong";
export interface DrawingPoint { time: number; price: number; }
export type Drawing =
  | { id: string; type: "trendline"; p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "hline";     price: number }
  | { id: string; type: "rect";      p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "fib";       p1: DrawingPoint; p2: DrawingPoint }
  | { id: string; type: "long";  entry: number; target: number; stop: number; startTime: number }
  | { id: string; type: "short"; entry: number; target: number; stop: number; startTime: number };

const MA_PERIODS = [5, 10, 30, 60];
const PAD        = { top: 10, right: 72, bottom: 28, left: 4 };
const VOL_RATIO  = 0.18;
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS = ["#22d3ee","#a855f7","#3b82f6","#f59e0b","#ef5350","#a855f7","#22d3ee"];

function calcMA(candles: Candle[], p: number): (number | null)[] {
  return candles.map((_, i) =>
    i < p - 1 ? null : candles.slice(i - p + 1, i + 1).reduce((s, c) => s + c.close, 0) / p
  );
}
function uid() { return Math.random().toString(36).slice(2, 9); }

function buildDrawing(tool: DrawingTool, p1: DrawingPoint, p2: DrawingPoint): Drawing | null {
  if (tool === "trendline") return { id: uid(), type: "trendline", p1, p2 };
  if (tool === "hline")     return { id: uid(), type: "hline", price: p1.price };
  if (tool === "rect")      return { id: uid(), type: "rect", p1, p2 };
  if (tool === "fib")       return { id: uid(), type: "fib", p1, p2 };
  if (tool === "long")      return { id: uid(), type: "long",  entry: p1.price, target: p1.price * 1.02,  stop: p1.price * 0.99, startTime: p1.time };
  if (tool === "short")     return { id: uid(), type: "short", entry: p1.price, target: p1.price * 0.98,  stop: p1.price * 1.01, startTime: p1.time };
  return null;
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

// Smart time label based on visible range
function fmtTime(ts: number, rangeSec: number): string {
  const d = new Date(ts * 1000);
  const H = (n: number) => n.toString().padStart(2, "0");
  if (rangeSec < 3_600)     return `${H(d.getHours())}:${H(d.getMinutes())}`;
  if (rangeSec < 86_400)    return `${H(d.getHours())}:00`;
  if (rangeSec < 86_400*60) return `${H(d.getMonth()+1)}/${H(d.getDate())}`;
  return `${d.getFullYear()}/${H(d.getMonth()+1)}`;
}

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (p >= 1)    return p.toFixed(4);
  return p.toFixed(6);
}

export function ChartCanvas({
  candles, userTrades = [], onHover,
  chartType = "candle", visibleMAs = [true, true, true, true], showVolume = true,
  candleColors = { up: "#26a69a", down: "#ef5350" },
  magnetMode = "off",
  activeTool = "cursor", drawings = [],
  onAddDrawing, onUpdateDrawing, onDeleteDrawing,
  saveRef, symbol = "BTCUSDT",
}: {
  candles:       Candle[];
  userTrades?:   UserTrade[];
  onHover?:      (c: Candle | null) => void;
  chartType?:    ChartType;
  visibleMAs?:   boolean[];
  showVolume?:   boolean;
  candleColors?: { up: string; down: string };
  magnetMode?:   MagnetMode;
  activeTool?:   DrawingTool;
  drawings?:     Drawing[];
  onAddDrawing?:    (d: Drawing) => void;
  onUpdateDrawing?: (d: Drawing) => void;
  onDeleteDrawing?: (id: string) => void;
  saveRef?:      React.MutableRefObject<(() => void) | null>;
  symbol?:       string;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [candleWidth, setCandleWidth] = useState(8);
  const [offset,      setOffset]      = useState(0);
  const [crosshair,   setCrosshair]   = useState<{ x: number; y: number } | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [yZoom,       setYZoom]       = useState(1.0);
  const [logScale,    setLogScale]    = useState(false);

  const dragRef     = useRef<{ startX: number; startOffset: number } | null>(null);
  const yDragRef    = useRef<{ startY: number; startZoom: number } | null>(null);
  const xDragRef    = useRef<{ startX: number; startCW: number; startOffset: number } | null>(null);
  const velRef      = useRef(0);
  const animRef     = useRef<number | null>(null);
  const lastMXRef   = useRef<{ x: number; t: number } | null>(null);
  const offsetRef   = useRef(offset);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const drawStartRef = useRef<{ point: DrawingPoint } | null>(null);
  const drawDragRef  = useRef<{
    id: string; handle: "whole"|"entry"|"target"|"stop";
    startPrice: number; startDrawing: Drawing;
  } | null>(null);

  const maData   = useMemo(() => MA_PERIODS.map(p => calcMA(candles, p)), [candles]);
  const volRatio = showVolume ? VOL_RATIO : 0;

  // ── Shared coordinate system
  function getCoords(W: number, H: number) {
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const volH   = chartH * volRatio;
    const priceH = chartH - volH - (showVolume ? 4 : 0);
    const cw     = Math.max(2, candleWidth);
    const rp     = 16;
    const rmi    = candles.length - 1 - Math.floor(offset / cw);
    const lmi    = Math.max(0, rmi - Math.ceil(chartW / cw) - 2);
    const vis    = candles.slice(lmi, rmi + 1);
    let lo = Infinity, hi = -Infinity;
    for (const c of vis) { if (c.low < lo) lo = c.low; if (c.high > hi) hi = c.high; }
    const pr = (hi - lo) * 0.07; lo -= pr; hi += pr;
    if (yZoom !== 1.0) { const mid=(lo+hi)/2, half=(hi-lo)/2/yZoom; lo=mid-half; hi=mid+half; }
    const priceRange = hi - lo || 1;
    const maxVol = Math.max(...vis.map(c => c.volume ?? 0), 1);

    // Log scale helpers
    const safeLo  = Math.max(lo, 1e-10);
    const safeHi  = Math.max(hi, 1e-10);
    const logLo   = Math.log(safeLo);
    const logHi   = Math.log(safeHi);
    const logRange = (logHi - logLo) || 1;

    const pY = (price: number) => {
      if (logScale) {
        return PAD.top + priceH * (1 - (Math.log(Math.max(price, 1e-10)) - logLo) / logRange);
      }
      return PAD.top + priceH - ((price - lo) / priceRange) * priceH;
    };
    const cX = (idx: number) => PAD.left + chartW - rp - (rmi - idx) * cw;
    const vY = (vol: number) => H - PAD.bottom - (vol / maxVol) * volH;
    const xyToPoint = (x: number, y: number): DrawingPoint => {
      let price: number;
      if (logScale) {
        price = Math.exp(logLo + logRange * (1 - (y - PAD.top) / priceH));
      } else {
        price = hi - ((y - PAD.top) / priceH) * priceRange;
      }
      const idx = Math.max(0, Math.min(candles.length - 1, Math.round(rmi - (PAD.left + chartW - rp - x) / cw)));
      return { time: candles[idx]?.time ?? 0, price };
    };
    const pointToX = (p: DrawingPoint) => {
      let ni = lmi, nd = Infinity;
      for (let i = Math.max(0, lmi-5); i <= Math.min(candles.length-1, rmi+5); i++) {
        const d = Math.abs(candles[i].time - p.time); if (d < nd) { nd = d; ni = i; }
      }
      return cX(ni);
    };
    return { chartW, priceH, cw, rp, rmi, lmi, vis, lo, hi, priceRange, volH, logLo, logRange, pY, cX, vY, xyToPoint, pointToX };
  }

  // ── Magnet snap
  function applyMagnet(point: DrawingPoint, my: number, W: number, H: number): DrawingPoint {
    if (magnetMode === "off") return point;
    const { pY, lmi, rmi } = getCoords(W, H);
    let ni = lmi;
    for (let i = lmi; i <= rmi; i++) { if (candles[i].time >= point.time) { ni = i; break; } }
    const c = candles[Math.max(lmi, Math.min(rmi, ni))];
    if (!c) return point;
    let snapP = point.price, snapD = Infinity;
    for (const p of [c.open, c.high, c.low, c.close]) {
      const d = Math.abs(pY(p) - my); if (d < snapD) { snapD = d; snapP = p; }
    }
    const thr = magnetMode === "strong" ? Infinity : 15;
    return snapD <= thr ? { ...point, price: snapP } : point;
  }

  // ── Hit-test helpers
  function hitTestPos(d: Drawing & { type:"long"|"short"; entry:number; target:number; stop:number }, my: number, H: number) {
    const { pY } = getCoords(containerRef.current?.clientWidth ?? 0, H);
    const THR = 8;
    if (Math.abs(pY(d.entry)  - my) < THR) return "entry"  as const;
    if (Math.abs(pY(d.target) - my) < THR) return "target" as const;
    if (Math.abs(pY(d.stop)   - my) < THR) return "stop"   as const;
    const minY = Math.min(pY(d.entry), pY(d.target), pY(d.stop)) - THR;
    const maxY = Math.max(pY(d.entry), pY(d.target), pY(d.stop)) + THR;
    if (my > minY && my < maxY) return "whole" as const;
    return null;
  }
  function hitTestOther(d: Drawing, mx: number, my: number, W: number, H: number): boolean {
    const THR = 8;
    const { pY, pointToX } = getCoords(W, H);
    if (d.type === "hline") return Math.abs(pY(d.price) - my) < THR;
    if (d.type === "trendline") return distToSeg(mx, my, pointToX(d.p1), pY(d.p1.price), pointToX(d.p2), pY(d.p2.price)) < THR;
    if (d.type === "fib") {
      const x1=pointToX(d.p1),x2=pointToX(d.p2),dp=d.p2.price-d.p1.price;
      if (mx<Math.min(x1,x2)-THR||mx>Math.max(x1,x2)+THR) return false;
      return FIB_LEVELS.some(l => Math.abs(pY(d.p1.price+dp*l)-my) < THR);
    }
    if (d.type === "rect") {
      const x1=pointToX(d.p1),y1=pY(d.p1.price),x2=pointToX(d.p2),y2=pY(d.p2.price);
      return mx>Math.min(x1,x2)-THR&&mx<Math.max(x1,x2)+THR&&my>Math.min(y1,y2)-THR&&my<Math.max(y1,y2)+THR;
    }
    return false;
  }

  function translateDrawing(d: Drawing, dp: number): Drawing {
    if (d.type==="trendline") return {...d,p1:{...d.p1,price:d.p1.price+dp},p2:{...d.p2,price:d.p2.price+dp}};
    if (d.type==="hline")     return {...d,price:d.price+dp};
    if (d.type==="rect")      return {...d,p1:{...d.p1,price:d.p1.price+dp},p2:{...d.p2,price:d.p2.price+dp}};
    if (d.type==="fib")       return {...d,p1:{...d.p1,price:d.p1.price+dp},p2:{...d.p2,price:d.p2.price+dp}};
    if (d.type==="long"||d.type==="short") return {...d,entry:d.entry+dp,target:d.target+dp,stop:d.stop+dp};
    return d;
  }

  const draw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth, H = container.clientHeight;
    if (W < 10 || H < 10) return;
    canvas.width = W*dpr; canvas.height = H*dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const { chartW, priceH, cw, rp, rmi, lmi, vis, lo, hi, priceRange, volH, logLo, logRange, pY, cX, vY, xyToPoint, pointToX } = getCoords(W, H);
    const bodyW = Math.max(1, cw * 0.55);
    const CUP = candleColors.up, CDN = candleColors.down;

    ctx.fillStyle = "#0a0b10"; ctx.fillRect(0, 0, W, H);

    // ── Grid + price labels
    ctx.font = "10px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    for (let i = 0; i <= 5; i++) {
      let price: number;
      if (logScale) {
        price = Math.exp(logLo + (logRange / 5) * i);
      } else {
        price = lo + (priceRange / 5) * i;
      }
      const y = pY(price);
      ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.fillText(fmtPrice(price), W - PAD.right + 5, y);
    }
    // Right border / price axis
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W-PAD.right, PAD.top); ctx.lineTo(W-PAD.right, H-PAD.bottom); ctx.stroke();

    // ── MA lines
    const maColors = ["#f59e0b","#22d3ee","#3b82f6","#a855f7"];
    for (let mi = 0; mi < MA_PERIODS.length; mi++) {
      if (!visibleMAs[mi]) continue;
      ctx.strokeStyle = maColors[mi]; ctx.lineWidth = 1; ctx.beginPath();
      let started = false;
      for (let i = lmi; i <= rmi; i++) {
        const v = maData[mi][i]; if (v == null) continue;
        if (!started) { ctx.moveTo(cX(i), pY(v)); started = true; } else ctx.lineTo(cX(i), pY(v));
      }
      ctx.stroke();
    }

    // ── Volume
    if (showVolume) {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i]; if (!c.volume) continue;
        ctx.fillStyle = c.close>=c.open ? "rgba(38,166,154,0.3)" : "rgba(239,83,80,0.3)";
        const top = vY(c.volume); ctx.fillRect(cX(i)-bodyW/2, top, bodyW, H-PAD.bottom-top);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD.left, H-PAD.bottom-volH); ctx.lineTo(W-PAD.right, H-PAD.bottom-volH); ctx.stroke();
    }

    // ── Chart body
    if (chartType === "candle") {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i], x = cX(i), col = c.close>=c.open ? CUP : CDN;
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low)); ctx.stroke();
        ctx.fillStyle = col; ctx.fillRect(x-bodyW/2, pY(Math.max(c.open,c.close)), bodyW, Math.max(1, pY(Math.min(c.open,c.close))-pY(Math.max(c.open,c.close))));
      }
    } else if (chartType === "bar") {
      for (let i = lmi; i <= rmi; i++) {
        const c = candles[i], x = cX(i), tick = Math.max(2, bodyW*0.8);
        ctx.strokeStyle = c.close>=c.open ? CUP : CDN; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, pY(c.high)); ctx.lineTo(x, pY(c.low));
        ctx.moveTo(x-tick, pY(c.open)); ctx.lineTo(x, pY(c.open));
        ctx.moveTo(x, pY(c.close)); ctx.lineTo(x+tick, pY(c.close));
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      for (let i=lmi;i<=rmi;i++){const x=cX(i),y=pY(candles[i].close);if(i===lmi)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      if (chartType==="area") {
        ctx.lineTo(cX(rmi),PAD.top+priceH);ctx.lineTo(cX(lmi),PAD.top+priceH);ctx.closePath();
        const g=ctx.createLinearGradient(0,PAD.top,0,PAD.top+priceH);
        g.addColorStop(0,"rgba(38,166,154,0.28)");g.addColorStop(1,"rgba(38,166,154,0)");
        ctx.fillStyle=g;ctx.fill();ctx.beginPath();
        for(let i=lmi;i<=rmi;i++){const x=cX(i),y=pY(candles[i].close);if(i===lmi)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      }
      ctx.strokeStyle=CUP;ctx.lineWidth=1.5;ctx.stroke();
    }

    // ── User trades
    for (const trade of userTrades) {
      const ts=Math.floor(trade.time/1000);let ni=lmi,nd=Infinity;
      for(let i=lmi;i<=rmi;i++){const d=Math.abs(candles[i].time-ts);if(d<nd){nd=d;ni=i;}}
      const c=candles[ni],x=cX(ni),isBuy=trade.side==="buy";
      const y=isBuy?pY(c.low)+16:pY(c.high)-16;
      ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fillStyle=isBuy?"#26a69a":"#ef5350";ctx.fill();
      ctx.fillStyle="#fff";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(isBuy?"B":"S",x,y);
    }

    // ── Current price line
    const lc = candles.at(-1)?.close;
    if (lc && lc>=lo && lc<=hi) {
      const y=pY(lc);
      ctx.setLineDash([4,4]);ctx.strokeStyle="rgba(255,255,255,0.25)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(PAD.left,y);ctx.lineTo(W-PAD.right,y);ctx.stroke();ctx.setLineDash([]);
      const isUp=(candles.at(-1)?.close??0)>=(candles.at(-1)?.open??0);
      ctx.fillStyle=isUp?CUP:CDN;ctx.fillRect(W-PAD.right,y-9,PAD.right-2,18);
      ctx.fillStyle="#fff";ctx.font="bold 9px ui-monospace,monospace";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(lc.toLocaleString("en-US",{minimumFractionDigits:2}),W-PAD.right+(PAD.right-2)/2,y);
    }

    // ── Time axis (smart formatting)
    ctx.fillStyle="#6b7280";ctx.font="10px ui-monospace,monospace";ctx.textAlign="center";ctx.textBaseline="top";
    const visRange = (candles[rmi]?.time ?? 0) - (candles[lmi]?.time ?? 0);
    const le = Math.max(1, Math.ceil(90/cw));
    for (let i=lmi;i<=rmi;i+=le) {
      const x=cX(i);if(x<PAD.left+30||x>W-PAD.right-10)continue;
      ctx.fillText(fmtTime(candles[i].time, visRange), x, H-PAD.bottom+3);
    }

    // ── Drawings
    function renderDrawing(d: Drawing, alpha=1, sel=false) {
      ctx.save(); ctx.globalAlpha=alpha;
      const COL=sel?"#67e8f9":"#22d3ee", LW=sel?2:1.5;
      if (d.type==="long"||d.type==="short") {
        const isLong=d.type==="long";
        const ey=pY(d.entry),ty=pY(d.target),sy=pY(d.stop);
        const sx=Math.max(PAD.left,pointToX({time:d.startTime,price:d.entry}));
        const ex=W-PAD.right;
        ctx.fillStyle=isLong?"rgba(38,166,154,0.1)":"rgba(239,83,80,0.1)";
        ctx.fillRect(sx,Math.min(ey,ty),ex-sx,Math.abs(ey-ty));
        ctx.fillStyle=isLong?"rgba(239,83,80,0.1)":"rgba(38,166,154,0.1)";
        ctx.fillRect(sx,Math.min(ey,sy),ex-sx,Math.abs(ey-sy));
        const drawLine=(y:number,color:string,dash=false)=>{
          if(dash)ctx.setLineDash([4,4]);ctx.strokeStyle=color;ctx.lineWidth=LW;
          ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(ex,y);ctx.stroke();ctx.setLineDash([]);
          ctx.fillStyle=color;ctx.beginPath();ctx.arc(ex,y,3,0,Math.PI*2);ctx.fill();
        };
        drawLine(ey,"#9ca3af",true);
        drawLine(ty,isLong?"#26a69a":"#ef5350");
        drawLine(sy,isLong?"#ef5350":"#26a69a");
        ctx.font="9px ui-monospace,monospace";ctx.textAlign="left";ctx.textBaseline="middle";
        const pct=(p:number)=>((p-d.entry)/d.entry*100).toFixed(2);
        ctx.fillStyle="#9ca3af";ctx.fillText("ENTRY",ex+5,ey);
        ctx.fillStyle=isLong?"#26a69a":"#ef5350";
        ctx.fillText(`${isLong?"+":""}${pct(d.target)}%`,ex+5,ty);
        ctx.fillStyle=isLong?"#ef5350":"#26a69a";
        ctx.fillText(`${pct(d.stop)}%`,ex+5,sy);
      } else if (d.type==="trendline") {
        const x1=pointToX(d.p1),y1=pY(d.p1.price),x2=pointToX(d.p2),y2=pY(d.p2.price);
        ctx.strokeStyle=COL;ctx.lineWidth=LW;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
        ctx.fillStyle=COL;[[x1,y1],[x2,y2]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,sel?4:3,0,Math.PI*2);ctx.fill();});
      } else if (d.type==="hline") {
        const y=pY(d.price);
        ctx.setLineDash([6,3]);ctx.strokeStyle=COL;ctx.lineWidth=LW;
        ctx.beginPath();ctx.moveTo(PAD.left,y);ctx.lineTo(W-PAD.right,y);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="rgba(34,211,238,0.12)";ctx.fillRect(W-PAD.right,y-9,PAD.right-2,18);
        ctx.fillStyle=COL;ctx.font="9px ui-monospace,monospace";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(d.price.toLocaleString("en-US",{minimumFractionDigits:2}),W-PAD.right+(PAD.right-2)/2,y);
      } else if (d.type==="rect") {
        const x1=pointToX(d.p1),y1=pY(d.p1.price),x2=pointToX(d.p2),y2=pY(d.p2.price);
        const rx=Math.min(x1,x2),ry=Math.min(y1,y2),rw=Math.abs(x2-x1),rh=Math.abs(y2-y1);
        ctx.fillStyle="rgba(34,211,238,0.05)";ctx.fillRect(rx,ry,rw,rh);
        ctx.strokeStyle=COL;ctx.lineWidth=LW;ctx.beginPath();ctx.strokeRect(rx,ry,rw,rh);
      } else if (d.type==="fib") {
        const x1=pointToX(d.p1),x2=pointToX(d.p2),dp=d.p2.price-d.p1.price;
        FIB_LEVELS.forEach((lvl,li)=>{
          const y=pY(d.p1.price+dp*lvl),fc=FIB_COLORS[li];
          ctx.strokeStyle=fc;ctx.lineWidth=1;ctx.setLineDash([4,4]);
          ctx.beginPath();ctx.moveTo(Math.min(x1,x2),y);ctx.lineTo(Math.max(x1,x2),y);ctx.stroke();ctx.setLineDash([]);
          ctx.fillStyle=fc;ctx.font="8px ui-monospace,monospace";ctx.textAlign="left";ctx.textBaseline="bottom";
          ctx.fillText(`${(lvl*100).toFixed(1)}%`,Math.min(x1,x2)+3,y-1);
        });
      }
      ctx.restore();
    }

    for (const d of drawings) renderDrawing(d, 1, d.id===selectedId);
    if (drawStartRef.current && crosshair && activeTool!=="cursor") {
      const rawP2=xyToPoint(crosshair.x,crosshair.y);
      const p2=applyMagnet(rawP2,crosshair.y,W,H);
      const preview=buildDrawing(activeTool,drawStartRef.current.point,p2);
      if (preview) renderDrawing(preview,0.55);
    }

    // ── Crosshair
    if (crosshair) {
      ctx.setLineDash([3,3]);ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(crosshair.x,PAD.top);ctx.lineTo(crosshair.x,H-PAD.bottom);ctx.stroke();
      ctx.beginPath();ctx.moveTo(PAD.left,crosshair.y);ctx.lineTo(W-PAD.right,crosshair.y);ctx.stroke();
      ctx.setLineDash([]);
      let hp: number;
      if (logScale) {
        hp = Math.exp(logLo + logRange * (1 - (crosshair.y - PAD.top) / priceH));
      } else {
        hp = hi - ((crosshair.y - PAD.top) / priceH) * priceRange;
      }
      if (crosshair.y>=PAD.top&&crosshair.y<=PAD.top+priceH) {
        ctx.fillStyle="#374151";ctx.fillRect(W-PAD.right,crosshair.y-9,PAD.right-2,18);
        ctx.fillStyle="#e5e7eb";ctx.font="9px ui-monospace,monospace";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(hp.toLocaleString("en-US",{minimumFractionDigits:2}),W-PAD.right+(PAD.right-2)/2,crosshair.y);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, candleWidth, offset, yZoom, logScale, crosshair, maData, userTrades, chartType, visibleMAs, showVolume, volRatio, candleColors, drawings, activeTool, selectedId, magnetMode]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!saveRef) return;
    saveRef.current = () => {
      const canvas=canvasRef.current;if(!canvas)return;
      const link=document.createElement("a");
      link.download=`${symbol.toLowerCase()}-${new Date().toISOString().slice(0,10)}.png`;
      link.href=canvas.toDataURL("image/png");link.click();
    };
  }, [saveRef, symbol]);

  useEffect(() => {
    const container=containerRef.current;if(!container)return;
    const obs=new ResizeObserver(()=>draw());
    obs.observe(container);
    return ()=>obs.disconnect();
  }, [draw]);

  // ── Touch events — two-finger pan + spread/vertical zoom
  useEffect(() => {
    const el=containerRef.current;if(!el)return;
    // Two-finger state (closure vars, not React state)
    let t2: {prevMidX:number;prevMidY:number;prevSpread:number}|null=null;

    function onTS(e:TouchEvent) {
      e.preventDefault();
      if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
      if (e.touches.length===1) {
        t2=null;
        dragRef.current={startX:e.touches[0].clientX,startOffset:offsetRef.current};
        velRef.current=0;lastMXRef.current={x:e.touches[0].clientX,t:performance.now()};
      } else if (e.touches.length===2) {
        dragRef.current=null;
        const midX=(e.touches[0].clientX+e.touches[1].clientX)/2;
        const midY=(e.touches[0].clientY+e.touches[1].clientY)/2;
        const spread=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);
        t2={prevMidX:midX,prevMidY:midY,prevSpread:spread};
        velRef.current=0;
      }
    }
    function onTM(e:TouchEvent) {
      e.preventDefault();
      if (e.touches.length===1&&dragRef.current) {
        const dx=e.touches[0].clientX-dragRef.current.startX;
        const now=performance.now();
        setOffset(Math.max(0,dragRef.current.startOffset-dx));
        if(lastMXRef.current){const dt=now-lastMXRef.current.t;if(dt>0)velRef.current=-(e.touches[0].clientX-lastMXRef.current.x)/dt*16;}
        lastMXRef.current={x:e.touches[0].clientX,t:performance.now()};
      } else if (e.touches.length===2&&t2) {
        const midX=(e.touches[0].clientX+e.touches[1].clientX)/2;
        const midY=(e.touches[0].clientY+e.touches[1].clientY)/2;
        const spread=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);

        // Pan from horizontal midpoint movement
        const panDx=midX-t2.prevMidX;
        setOffset(p=>Math.max(0,p-panDx));

        // Zoom from spread change (pinch) + vertical midpoint movement
        // Up swipe = zoom in (bigger candles), down swipe = zoom out
        const spreadRatio=t2.prevSpread>0?spread/t2.prevSpread:1;
        const dampedSpread=1+(spreadRatio-1)*0.25;
        const panDy=midY-t2.prevMidY;
        const vertFactor=1-panDy*0.007;
        const combined=dampedSpread*Math.max(0.5,Math.min(2,vertFactor));
        if(Math.abs(combined-1)>0.0005){
          setCandleWidth(w=>Math.min(40,Math.max(2,w*combined)));
        }

        t2.prevMidX=midX;t2.prevMidY=midY;t2.prevSpread=spread;
      }
    }
    function onTE() {
      if(dragRef.current){
        dragRef.current=null;
        const vel=velRef.current;
        if(Math.abs(vel)>0.5){let v=vel;function step(){v*=0.88;if(Math.abs(v)<0.3)return;setOffset(p=>Math.max(0,p+v));animRef.current=requestAnimationFrame(step);}requestAnimationFrame(step);}
      }
      t2=null;
    }
    el.addEventListener("touchstart",onTS,{passive:false});
    el.addEventListener("touchmove",onTM,{passive:false});
    el.addEventListener("touchend",onTE);
    return()=>{el.removeEventListener("touchstart",onTS);el.removeEventListener("touchmove",onTM);el.removeEventListener("touchend",onTE);};
  }, []);

  // ── Keyboard delete
  useEffect(()=>{
    if(!selectedId)return;
    function onKey(e:KeyboardEvent){
      if(e.key==="Delete"||e.key==="Backspace"){onDeleteDrawing?.(selectedId!);setSelectedId(null);}
      if(e.key==="Escape")setSelectedId(null);
    }
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[selectedId,onDeleteDrawing]);

  // ── Event handlers
  function onWheel(e:React.WheelEvent) {
    e.preventDefault();
    const rect=containerRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left;
    if(mx>rect.width-PAD.right){
      setYZoom(z=>Math.max(0.1,Math.min(10,z*(e.deltaY>0?0.9:1.1))));
      return;
    }
    const oldCW=Math.max(2,candleWidth),newCW=Math.min(40,Math.max(2,oldCW*(e.deltaY>0?0.85:1.18)));
    const rp=16,cW=rect.width-PAD.left-PAD.right;
    setOffset(p=>Math.max(0,p+(PAD.left+cW-rp-mx)*(newCW/oldCW-1)));
    setCandleWidth(newCW);
  }

  function onDblClick(e:React.MouseEvent) {
    const rect=containerRef.current?.getBoundingClientRect();if(!rect)return;
    if(e.clientX-rect.left>rect.width-PAD.right)setYZoom(1.0);
  }

  function onMouseDown(e:React.MouseEvent) {
    if(e.button!==0)return;
    if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
    const rect=containerRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const W=rect.width,H=rect.height;

    // Price axis drag → Y zoom
    if(mx>W-PAD.right){
      yDragRef.current={startY:my,startZoom:yZoom};return;
    }
    // Time axis drag → X zoom (right edge anchor)
    if(my>H-PAD.bottom){
      xDragRef.current={startX:mx,startCW:candleWidth,startOffset:offset};return;
    }
    // Drawing tool
    if(activeTool!=="cursor"){
      const{xyToPoint}=getCoords(W,H);
      const rawP=xyToPoint(mx,my);
      drawStartRef.current={point:applyMagnet(rawP,my,W,H)};return;
    }
    // Hit-test drawings
    for(let i=drawings.length-1;i>=0;i--){
      const d=drawings[i];
      const{xyToPoint}=getCoords(W,H);
      if(d.type==="long"||d.type==="short"){
        const handle=hitTestPos(d,my,H);
        if(handle){setSelectedId(d.id);drawDragRef.current={id:d.id,handle,startPrice:xyToPoint(mx,my).price,startDrawing:d};return;}
      } else if(hitTestOther(d,mx,my,W,H)){
        setSelectedId(d.id);drawDragRef.current={id:d.id,handle:"whole",startPrice:xyToPoint(mx,my).price,startDrawing:d};return;
      }
    }
    setSelectedId(null);
    dragRef.current={startX:e.clientX,startOffset:offset};
    velRef.current=0;lastMXRef.current={x:e.clientX,t:performance.now()};
  }

  function onMouseMove(e:React.MouseEvent) {
    const rect=containerRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    setCrosshair({x:mx,y:my});
    const W=rect.width,H=rect.height;
    const{cw,rmi,chartW,xyToPoint}=getCoords(W,H);
    const rp=16;
    const fromRight=Math.round((PAD.left+chartW-rp-mx)/cw);
    onHover?.(candles[Math.max(0,Math.min(candles.length-1,rmi-fromRight))]??null);

    // Y-axis drag
    if(yDragRef.current){
      const dy=my-yDragRef.current.startY;
      setYZoom(Math.max(0.1,Math.min(10,yDragRef.current.startZoom*Math.pow(1.004,-dy))));return;
    }
    // X-axis drag (time axis zoom)
    if(xDragRef.current){
      const dx=mx-xDragRef.current.startX;
      const newCW=Math.min(40,Math.max(2,xDragRef.current.startCW*Math.pow(1.005,dx)));
      const ratio=newCW/xDragRef.current.startCW;
      setCandleWidth(newCW);
      setOffset(Math.max(0,xDragRef.current.startOffset*ratio));
      return;
    }
    // Drag drawing
    if(drawDragRef.current){
      const pt=xyToPoint(mx,my),dp=pt.price-drawDragRef.current.startPrice;
      const d=drawDragRef.current.startDrawing,h=drawDragRef.current.handle;
      let moved:Drawing;
      if((d.type==="long"||d.type==="short")&&h!=="whole"){
        if(h==="entry")  moved={...d,entry:d.entry+dp};
        else if(h==="target") moved={...d,target:d.target+dp};
        else             moved={...d,stop:d.stop+dp};
      } else {
        moved=translateDrawing(d,dp);
      }
      onUpdateDrawing?.(moved);return;
    }
    // Pan
    if(dragRef.current){
      const dx=e.clientX-dragRef.current.startX,now=performance.now();
      setOffset(Math.max(0,dragRef.current.startOffset-dx));
      if(lastMXRef.current){const dt=now-lastMXRef.current.t;if(dt>0)velRef.current=-(e.clientX-lastMXRef.current.x)/dt*16;}
      lastMXRef.current={x:e.clientX,t:performance.now()};
    }
  }

  function onMouseUp(e:React.MouseEvent) {
    yDragRef.current=null;xDragRef.current=null;
    if(drawDragRef.current){drawDragRef.current=null;return;}
    if(dragRef.current){
      dragRef.current=null;
      const vel=velRef.current;
      if(Math.abs(vel)>0.5){let v=vel;function step(){v*=0.88;if(Math.abs(v)<0.3)return;setOffset(p=>Math.max(0,p+v));animRef.current=requestAnimationFrame(step);}requestAnimationFrame(step);}
      return;
    }
    if(activeTool!=="cursor"&&drawStartRef.current){
      const rect=containerRef.current?.getBoundingClientRect();
      if(!rect||!onAddDrawing){drawStartRef.current=null;return;}
      const{xyToPoint}=getCoords(rect.width,rect.height);
      const rawP2=xyToPoint(e.clientX-rect.left,e.clientY-rect.top);
      const p2=applyMagnet(rawP2,e.clientY-rect.top,rect.width,rect.height);
      const d=buildDrawing(activeTool,drawStartRef.current.point,p2);
      if(d)onAddDrawing(d);
      drawStartRef.current=null;
    }
  }

  function onMouseLeave() {
    dragRef.current=null;yDragRef.current=null;xDragRef.current=null;
    drawStartRef.current=null;drawDragRef.current=null;
    setCrosshair(null);onHover?.(null);
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none ${activeTool==="cursor"?"cursor-grab":"cursor-crosshair"}`}
      onWheel={onWheel}
      onDoubleClick={onDblClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Price axis scale buttons */}
      <div className="absolute flex flex-col gap-0.5 z-10 pointer-events-auto" style={{ right: 4, bottom: 34 }}>
        <button
          onClick={() => setYZoom(1)}
          title="Auto Scale"
          className="w-5 h-4 text-[9px] font-bold rounded border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition leading-none"
        >
          A
        </button>
        <button
          onClick={() => setLogScale(l => !l)}
          title="Logarithmische Skala"
          className={`w-5 h-4 text-[9px] font-bold rounded border transition leading-none ${
            logScale
              ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-400"
              : "border-white/10 text-gray-500 hover:text-white hover:bg-white/10"
          }`}
        >
          L
        </button>
      </div>
    </div>
  );
}
