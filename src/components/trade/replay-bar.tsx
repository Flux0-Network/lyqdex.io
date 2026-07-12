"use client";

import {
  IconPlayerPlay, IconPlayerPause,
  IconPlayerSkipBack, IconPlayerSkipForward,
  IconChevronLeft, IconChevronRight, IconX,
} from "@tabler/icons-react";
import type { ReplayControls } from "@/hooks/use-replay";
import type { Candle } from "./chart-canvas";

interface Props {
  replay:    ReplayControls;
  current:   Candle | null;
  timeframe: string;
}

const SPEEDS = [1, 2, 5, 10];

function fmtTime(ts: number, tf: string) {
  const d = new Date(ts * 1000);
  if (tf === "1D") return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return d.toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function ReplayBar({ replay, current, timeframe }: Props) {
  return (
    <div className="shrink-0 border-t border-cyan-500/20 bg-[#090a10] px-3 pt-2 pb-2.5 select-none">
      <div className="flex items-center gap-1 mb-2">

        <span className="text-[9px] font-bold text-cyan-400 tracking-widest mr-1.5">REPLAY</span>

        {/* |◀ */}
        <button onClick={() => replay.seek(1)} title="Zum Anfang"
          className="p-0.5 text-gray-600 hover:text-white transition">
          <IconPlayerSkipBack className="h-3 w-3" />
        </button>
        {/* ◀ step */}
        <button onClick={replay.stepBack} title="Schritt zurück"
          className="p-0.5 text-gray-600 hover:text-white transition">
          <IconChevronLeft className="h-3.5 w-3.5" />
        </button>
        {/* ▶/⏸ */}
        <button
          onClick={replay.playing ? replay.pause : replay.play}
          className="w-5 h-5 rounded-full flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition mx-0.5"
        >
          {replay.playing
            ? <IconPlayerPause className="h-2.5 w-2.5" />
            : <IconPlayerPlay  className="h-2.5 w-2.5" />}
        </button>
        {/* ▶ step */}
        <button onClick={replay.stepForward} title="Schritt vor"
          className="p-0.5 text-gray-600 hover:text-white transition">
          <IconChevronRight className="h-3.5 w-3.5" />
        </button>
        {/* ▶| */}
        <button onClick={() => replay.seek(replay.total - 1)} title="Zum Ende"
          className="p-0.5 text-gray-600 hover:text-white transition">
          <IconPlayerSkipForward className="h-3 w-3" />
        </button>

        {/* Speed selector */}
        <div className="flex ml-3 border border-white/[0.07] rounded overflow-hidden">
          {SPEEDS.map(s => (
            <button key={s} onClick={() => replay.setSpeed(s)}
              className={`text-[8px] px-1.5 py-0.5 transition ${
                replay.speed === s
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-gray-600 hover:text-gray-300"
              }`}>
              {s}×
            </button>
          ))}
        </div>

        {/* Current timestamp */}
        <span className="text-[9px] text-gray-500 font-mono ml-3 tabular-nums">
          {current ? fmtTime(current.time, timeframe) : "—"}
        </span>

        {/* Candle counter */}
        <span className="text-[9px] text-gray-700 ml-1.5 tabular-nums">
          {replay.cursor} / {replay.total}
        </span>

        {/* Exit */}
        <button onClick={replay.toggle}
          className="ml-auto flex items-center gap-1 text-[9px] text-gray-600 hover:text-red-400 transition px-1.5 py-0.5 rounded border border-white/[0.06] hover:border-red-500/30">
          <IconX className="h-2.5 w-2.5" />
          Beenden
        </button>
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={1}
        max={Math.max(1, replay.total - 1)}
        value={replay.cursor}
        onChange={e => replay.seek(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "#22d3ee", height: "3px" }}
      />
    </div>
  );
}
