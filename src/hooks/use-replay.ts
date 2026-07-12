"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Candle } from "@/components/trade/chart-canvas";

export interface ReplayControls {
  active:  boolean;
  playing: boolean;
  cursor:  number;
  speed:   number;
  total:   number;
  toggle:      () => void;
  play:        () => void;
  pause:       () => void;
  stepForward: () => void;
  stepBack:    () => void;
  seek:        (index: number) => void;
  setSpeed:    (s: number) => void;
}

export function useReplay(candles: Candle[]): ReplayControls {
  const [active,  setActive]  = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cursor,  setCursor]  = useState(0);
  const [speed,   setSpeedState] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!active || !playing || candles.length === 0) return;
    const ms = Math.max(40, 500 / speed);
    timerRef.current = setInterval(() => {
      setCursor(prev => {
        if (prev >= candles.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, playing, speed, candles.length]);

  const clamp = (i: number) => Math.max(1, Math.min(i, candles.length - 1));

  const toggle = useCallback(() => {
    setActive(prev => {
      if (prev) { setPlaying(false); return false; }
      setCursor(Math.max(10, candles.length - 60));
      return true;
    });
  }, [candles.length]);

  return {
    active, playing, cursor, speed, total: candles.length,
    toggle,
    play:        () => setPlaying(true),
    pause:       () => setPlaying(false),
    stepForward: () => { setPlaying(false); setCursor(p => clamp(p + 1)); },
    stepBack:    () => { setPlaying(false); setCursor(p => clamp(p - 1)); },
    seek:        (i) => setCursor(clamp(i)),
    setSpeed:    setSpeedState,
  };
}
