"use client";

import { useEffect, useRef, useState } from "react";
import type { Candle } from "@/components/trade/chart-canvas";

// Binance WS interval format
const TF_BINANCE: Record<string, string> = {
  "1m":"1m","5m":"5m","15m":"15m","1H":"1h","4H":"4h","1D":"1d",
};
// Bybit WS interval format
const TF_BYBIT: Record<string, string> = {
  "1m":"1","5m":"5","15m":"15","1H":"60","4H":"240","1D":"D",
};

export interface LiveMarket {
  candle: Candle | null;   // current forming candle
  price:  number | null;   // latest price (close of current candle)
  source: "binance" | "bybit" | null;
  connected: boolean;
}

export function useMarketWS(symbol: string, timeframe: string): LiveMarket {
  const [state, setState] = useState<LiveMarket>({
    candle: null, price: null, source: null, connected: false,
  });
  const wsRef    = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let retryTimer: ReturnType<typeof setTimeout>;
    let usedBybit = false;

    function set(patch: Partial<LiveMarket>) {
      if (mountedRef.current) setState(p => ({ ...p, ...patch }));
    }

    function parseBinance(raw: string) {
      try {
        const msg = JSON.parse(raw);
        const k = msg.k;
        if (!k) return;
        set({
          candle: {
            time:   Math.floor(Number(k.t) / 1000),
            open:   parseFloat(k.o),
            high:   parseFloat(k.h),
            low:    parseFloat(k.l),
            close:  parseFloat(k.c),
            volume: parseFloat(k.v),
          },
          price: parseFloat(k.c),
          source: "binance",
          connected: true,
        });
      } catch { /* ignore parse errors */ }
    }

    function parseBybit(raw: string) {
      try {
        const msg = JSON.parse(raw);
        const k = msg.data?.[0];
        if (!k || !msg.topic?.startsWith("kline")) return;
        set({
          candle: {
            time:   Math.floor(Number(k.start) / 1000),
            open:   parseFloat(k.open),
            high:   parseFloat(k.high),
            low:    parseFloat(k.low),
            close:  parseFloat(k.close),
            volume: parseFloat(k.volume),
          },
          price: parseFloat(k.close),
          source: "bybit",
          connected: true,
        });
      } catch { /* ignore parse errors */ }
    }

    function connectBybit() {
      usedBybit = true;
      const tf  = TF_BYBIT[timeframe] ?? "60";
      const ws  = new WebSocket("wss://stream.bybit.com/v5/public/spot");
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ op: "subscribe", args: [`kline.${tf}.${symbol}`] }));
      };
      ws.onmessage = (e) => parseBybit(e.data);
      ws.onclose   = () => {
        set({ connected: false });
        retryTimer = setTimeout(connectBinance, 5000);
      };
      ws.onerror = () => ws.close();
    }

    function connectBinance() {
      usedBybit = false;
      const tf  = TF_BINANCE[timeframe] ?? "1h";
      const sym = symbol.toLowerCase();
      const ws  = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@kline_${tf}`);
      wsRef.current = ws;

      ws.onmessage = (e) => parseBinance(e.data);
      ws.onerror   = () => { ws.close(); if (!usedBybit) connectBybit(); };
      ws.onclose   = () => {
        set({ connected: false });
        if (!usedBybit) retryTimer = setTimeout(connectBinance, 3000);
        else            retryTimer = setTimeout(connectBinance, 5000);
      };
    }

    connectBinance();

    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, [symbol, timeframe]);

  return state;
}
