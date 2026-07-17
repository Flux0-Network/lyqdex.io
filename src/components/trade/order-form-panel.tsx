"use client";

import { useState, useEffect } from "react";
import { IconCheck, IconAlertTriangle } from "@tabler/icons-react";

const LEVERAGES = [1, 2, 5, 10, 20, 50, 100];

export function OrderFormPanel({ symbol = "BTCUSDT", base = "BTC" }: { symbol?: string; base?: string }) {
  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [price, setPrice] = useState("");
  const [mktPrice, setMktPrice] = useState(0);
  const [margin, setMargin] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [avail, setAvail] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let alive = true;
    function load() {
      fetch(`/api/market?symbol=${symbol}`)
        .then(r => r.json())
        .then(d => { if (alive && d.ticker?.price) setMktPrice(parseFloat(d.ticker.price)); })
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [symbol]);

  useEffect(() => {
    fetch("/api/wallet")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const usdt = d?.wallets?.find((w: { currency: string }) => w.currency === "USDT");
        setAvail(parseFloat(usdt?.balance || "0"));
      })
      .catch(() => {});
  }, [state]);

  const effPrice = orderType === "limit" && price ? parseFloat(price) : mktPrice;
  const mar = parseFloat(margin) || 0;
  const positionSize = effPrice > 0 ? (mar * leverage) / effPrice : 0;
  const notional = positionSize * effPrice;
  const liqDist = effPrice / leverage;
  const liqPrice = side === "long" ? effPrice - liqDist : effPrice + liqDist;

  function setPct(pct: number) {
    if (avail <= 0) return;
    setMargin(((avail * pct) / 100).toFixed(2));
  }

  async function handleOrder() {
    if (mar <= 0 || effPrice <= 0) return;
    setState("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, side, entryPrice: effPrice, leverage, margin: mar }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error ?? "Fehler"); setState("error"); return; }
      setMargin("");
      setState("done");
      window.dispatchEvent(new CustomEvent("lyqdex-position-opened", { detail: data.position }));
      window.dispatchEvent(new CustomEvent("lyqdex-trade", { detail: { side: side === "long" ? "buy" : "sell", price: effPrice, time: Date.now() } }));
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setErrMsg("Netzwerkfehler.");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col text-xs">
      <div className="px-3 pt-3 pb-2 space-y-2">
        {/* Long / Short */}
        <div className="grid grid-cols-2 gap-1 bg-black/40 rounded-lg p-0.5">
          <button
            onClick={() => setSide("long")}
            className={`py-1.5 rounded-md font-semibold transition ${side === "long" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}
          >
            Long
          </button>
          <button
            onClick={() => setSide("short")}
            className={`py-1.5 rounded-md font-semibold transition ${side === "short" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Short
          </button>
        </div>

        {/* Market / Limit */}
        <div className="flex gap-2">
          <button onClick={() => setOrderType("market")} className={`text-[11px] px-2 py-1 rounded transition ${orderType === "market" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Markt</button>
          <button onClick={() => { setOrderType("limit"); if (!price && mktPrice) setPrice(mktPrice.toFixed(2)); }} className={`text-[11px] px-2 py-1 rounded transition ${orderType === "limit" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Limit</button>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-2.5">
        {orderType === "limit" && (
          <div>
            <label className="text-gray-500 text-[11px]">Preis (USDT)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/20" />
          </div>
        )}

        {/* Margin input */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-gray-500 text-[11px]">Margin (USDT)</label>
            <span className="text-[11px] text-gray-500 tabular-nums">{avail.toLocaleString("en-US", { maximumFractionDigits: 2 })} verfügbar</span>
          </div>
          <input
            type="number"
            value={margin}
            onChange={e => { setMargin(e.target.value); setState("idle"); setErrMsg(""); }}
            placeholder="0.00"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/20"
          />
        </div>

        <div className="flex justify-between gap-1">
          {[25, 50, 75, 100].map(pct => (
            <button key={pct} onClick={() => setPct(pct)} className="flex-1 py-0.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-[11px]">{pct}%</button>
          ))}
        </div>

        {/* Leverage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-500 text-[11px]">Hebel</label>
            <span className="text-[11px] font-bold text-amber-400">{leverage}x</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {LEVERAGES.map(lv => (
              <button
                key={lv}
                onClick={() => setLeverage(lv)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${leverage === lv ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-gray-400 border border-transparent hover:text-white"}`}
              >
                {lv}x
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1 pt-1 border-t border-white/[0.05] text-[11px]">
          <div className="flex justify-between text-gray-500">
            <span>Positionsgröße</span>
            <span className="text-gray-300 tabular-nums">{positionSize.toFixed(6)} {base}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Notional</span>
            <span className="text-white tabular-nums">${notional.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Liq. Preis (est.)</span>
            <span className={`tabular-nums ${side === "long" ? "text-red-400" : "text-emerald-400"}`}>
              ${effPrice > 0 ? liqPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
            </span>
          </div>
        </div>

        {errMsg && (
          <div className="flex items-start gap-1.5 text-[11px] text-red-400 bg-red-500/10 rounded-lg px-2 py-1.5">
            <IconAlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
            {errMsg}
          </div>
        )}

        <button
          onClick={handleOrder}
          disabled={state === "loading" || mar <= 0 || effPrice <= 0}
          className={`w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 ${
            state === "done" ? "bg-white/10 text-white"
            : side === "long" ? "bg-emerald-500 hover:bg-emerald-600 text-black"
            : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {state === "done" ? (
            <><IconCheck className="h-4 w-4" /> Position eröffnet</>
          ) : state === "loading" ? "…" : (
            <>{side === "long" ? "Long" : "Short"} {base} · {leverage}x</>
          )}
        </button>
      </div>
    </div>
  );
}
