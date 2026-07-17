"use client";

import { useEffect, useState, useRef } from "react";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";

export default function NewsPage() {
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // Clean up any previous widget
    el.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "all_symbols",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      colorTheme: "dark",
      locale: "de_DE",
    });
    el.appendChild(script);

    return () => { el.innerHTML = ""; };
  }, []);

  return (
    <div className="min-h-screen bg-[#080910] text-white flex flex-col" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="news" walletAddr={walletAddr} />

      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-semibold tracking-wide">News</h1>
          <span className="text-[10px] text-gray-700 uppercase tracking-widest">via TradingView</span>
        </div>

        {/* TradingView Timeline Widget */}
        <div
          ref={containerRef}
          className="tradingview-widget-container flex-1 rounded-2xl overflow-hidden"
          style={{ minHeight: "calc(100vh - 120px)" }}
        />
      </div>
    </div>
  );
}
