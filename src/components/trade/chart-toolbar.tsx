"use client";

import {
  IconCursorText, IconTrendingUp, IconMinus, IconRectangle,
  IconChartLine, IconChartCandle, IconChartBar, IconChartAreaLine,
  IconTrash, IconMagnet, IconArrowBigUp, IconArrowBigDown,
} from "@tabler/icons-react";
import type { DrawingTool, ChartType, MagnetMode } from "./chart-canvas";

interface Props {
  activeTool:   DrawingTool;
  onToolChange: (t: DrawingTool) => void;
  chartType:    ChartType;
  onTypeChange: (t: ChartType) => void;
  magnetMode:   MagnetMode;
  onMagnetChange: (m: MagnetMode) => void;
  onClearAll?:  () => void;
}

const DRAW_TOOLS: { tool: DrawingTool; Icon: React.ComponentType<{ className?: string }>; title: string }[] = [
  { tool: "cursor",    Icon: IconCursorText,   title: "Cursor / Pan" },
  { tool: "trendline", Icon: IconTrendingUp,   title: "Trendlinie" },
  { tool: "hline",     Icon: IconMinus,        title: "Horizontale Linie" },
  { tool: "rect",      Icon: IconRectangle,    title: "Rechteck" },
  { tool: "fib",       Icon: IconChartLine,    title: "Fibonacci" },
  { tool: "long",      Icon: IconArrowBigUp,   title: "Long – Einstieg / TP / SL" },
  { tool: "short",     Icon: IconArrowBigDown, title: "Short – Einstieg / TP / SL" },
];

const CHART_TYPES: { type: ChartType; Icon: React.ComponentType<{ className?: string }>; title: string }[] = [
  { type: "candle", Icon: IconChartCandle,   title: "Kerzen" },
  { type: "bar",    Icon: IconChartBar,      title: "Bars" },
  { type: "line",   Icon: IconChartLine,     title: "Linie" },
  { type: "area",   Icon: IconChartAreaLine, title: "Fläche" },
];

const MAGNET_CYCLE: MagnetMode[] = ["off", "weak", "strong"];

function Btn({ active, title, onClick, children, color }: {
  active?: boolean; title: string; onClick: () => void;
  children: React.ReactNode; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-5 h-5 flex items-center justify-center rounded transition ${
        active
          ? color === "green" ? "bg-emerald-500/20 text-emerald-400"
            : color === "red" ? "bg-red-500/20 text-red-400"
            : color === "yellow" ? "bg-yellow-500/20 text-yellow-400"
            : "bg-cyan-500/20 text-cyan-400"
          : "text-gray-600 hover:text-gray-300 hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

export function ChartToolbar({ activeTool, onToolChange, chartType, onTypeChange, magnetMode, onMagnetChange, onClearAll }: Props) {
  function cycleMagnet() {
    const next = MAGNET_CYCLE[(MAGNET_CYCLE.indexOf(magnetMode) + 1) % MAGNET_CYCLE.length];
    onMagnetChange(next);
  }

  const magnetTitle = magnetMode === "off" ? "Magnet: Aus" : magnetMode === "weak" ? "Magnet: Schwach (15px)" : "Magnet: Stark (immer)";
  const magnetColor = magnetMode === "strong" ? "yellow" : magnetMode === "weak" ? undefined : undefined;

  return (
    <div className="shrink-0 w-6 flex flex-col items-center gap-px py-1 border-r border-white/[0.05] bg-[#080910]">
      {DRAW_TOOLS.map(({ tool, Icon, title }) => (
        <Btn
          key={tool}
          active={activeTool === tool}
          title={title}
          onClick={() => onToolChange(tool)}
          color={tool === "long" ? "green" : tool === "short" ? "red" : undefined}
        >
          <Icon className="h-3 w-3" />
        </Btn>
      ))}

      <div className="w-3 border-t border-white/[0.06] my-px" />

      <Btn active={magnetMode !== "off"} title={magnetTitle} onClick={cycleMagnet} color={magnetColor}>
        <IconMagnet className="h-3 w-3" />
      </Btn>

      <div className="w-3 border-t border-white/[0.06] my-px" />

      {CHART_TYPES.map(({ type, Icon, title }) => (
        <Btn key={type} active={chartType === type} title={title} onClick={() => onTypeChange(type)}>
          <Icon className="h-3 w-3" />
        </Btn>
      ))}

      {onClearAll && (
        <>
          <div className="w-3 border-t border-white/[0.06] my-px" />
          <Btn title="Zeichnungen löschen" onClick={onClearAll}>
            <IconTrash className="h-3 w-3" />
          </Btn>
        </>
      )}
    </div>
  );
}
