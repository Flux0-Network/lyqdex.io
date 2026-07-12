"use client";

import {
  IconCursorText,
  IconTrendingUp,
  IconMinus,
  IconRectangle,
  IconChartLine,
  IconChartCandle,
  IconChartBar,
  IconChartAreaLine,
  IconTrash,
} from "@tabler/icons-react";
import type { DrawingTool, ChartType } from "./chart-canvas";

interface Props {
  activeTool:    DrawingTool;
  onToolChange:  (t: DrawingTool) => void;
  chartType:     ChartType;
  onTypeChange:  (t: ChartType) => void;
  onClearAll?:   () => void;
}

const TOOLS: { tool: DrawingTool; Icon: React.ComponentType<{ className?: string }>; title: string }[] = [
  { tool: "cursor",    Icon: IconCursorText,  title: "Cursor / Pan" },
  { tool: "trendline", Icon: IconTrendingUp,  title: "Trendlinie" },
  { tool: "hline",     Icon: IconMinus,       title: "Horizontale Linie" },
  { tool: "rect",      Icon: IconRectangle,   title: "Rechteck" },
  { tool: "fib",       Icon: IconChartLine,   title: "Fibonacci" },
];

const TYPES: { type: ChartType; Icon: React.ComponentType<{ className?: string }>; title: string }[] = [
  { type: "candle", Icon: IconChartCandle,   title: "Kerzen" },
  { type: "bar",    Icon: IconChartBar,      title: "Bars" },
  { type: "line",   Icon: IconChartLine,     title: "Linie" },
  { type: "area",   Icon: IconChartAreaLine, title: "Fläche" },
];

function Btn({
  active, title, onClick, children,
}: {
  active?: boolean;
  title:   string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded transition ${
        active
          ? "bg-cyan-500/20 text-cyan-400"
          : "text-gray-600 hover:text-gray-300 hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

export function ChartToolbar({ activeTool, onToolChange, chartType, onTypeChange, onClearAll }: Props) {
  return (
    <div className="shrink-0 w-7 flex flex-col items-center gap-0.5 py-1 border-r border-white/[0.05] bg-[#080910]">
      {/* Drawing tools */}
      {TOOLS.map(({ tool, Icon, title }) => (
        <Btn key={tool} active={activeTool === tool} title={title} onClick={() => onToolChange(tool)}>
          <Icon className="h-3.5 w-3.5" />
        </Btn>
      ))}

      <div className="w-4 border-t border-white/[0.06] my-0.5" />

      {/* Chart types */}
      {TYPES.map(({ type, Icon, title }) => (
        <Btn key={type} active={chartType === type} title={title} onClick={() => onTypeChange(type)}>
          <Icon className="h-3.5 w-3.5" />
        </Btn>
      ))}

      {/* Clear drawings */}
      {onClearAll && (
        <>
          <div className="w-4 border-t border-white/[0.06] my-0.5" />
          <Btn title="Zeichnungen löschen" onClick={onClearAll}>
            <IconTrash className="h-3.5 w-3.5" />
          </Btn>
        </>
      )}
    </div>
  );
}
