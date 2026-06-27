"use client";

import { useState } from "react";

type Tab = "positions" | "orders" | "history";

export function PositionsPanel() {
  const [tab, setTab] = useState<Tab>("positions");

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="flex items-center gap-0 border-b border-white/5 shrink-0">
        {(["positions", "orders", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs transition ${tab === t ? "text-white border-b border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t === "positions" ? "Positionen (0)" : t === "orders" ? "Offene Orders" : "Historie"}
          </button>
        ))}
      </div>

      {tab === "positions" && (
        <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Keine offenen Positionen</div>
      )}
      {tab === "orders" && (
        <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Keine offenen Orders</div>
      )}
      {tab === "history" && (
        <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Keine Trade-Historie</div>
      )}
    </div>
  );
}
