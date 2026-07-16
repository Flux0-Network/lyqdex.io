"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconLayoutDashboard, IconChartCandle, IconWallet, IconLogin, IconLogout,
  IconStar, IconRobot, IconChartBar, IconPencil, IconHelp,
} from "@tabler/icons-react";

export const SIDEBAR_W = 44;

type Active = "dashboard" | "trade" | "portfolio" | "watchlist" | "bots" | "indicators" | "indicator-editor" | "support";

function Nav({ href, title, active: on, children }: { href: string; title: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={title}
      className={`h-7 w-7 rounded-lg flex items-center justify-center transition ${
        on ? "text-cyan-400 bg-white/[0.08]" : "text-gray-600 hover:text-cyan-400 hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </Link>
  );
}

function Divider() {
  return <div className="w-5 h-px bg-white/[0.06] my-0.5" />;
}

export function AppSidebar({ active, walletAddr }: { active?: Active; walletAddr?: string | null }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 bg-[#0c0d14] z-50 flex flex-col items-center" style={{ width: SIDEBAR_W }}>
      {/* Logo */}
      <div className="h-11 flex items-center justify-center shrink-0">
        <Link href="/"><Image src="/lyqdex-icon.png" alt="LyqDex" width={24} height={24} /></Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 w-full border-r border-white/[0.06] flex flex-col items-center pt-1.5 gap-0.5">
        <Nav href="/dashboard"        title="Dashboard"        active={active === "dashboard"}><IconLayoutDashboard className="h-3.5 w-3.5" /></Nav>
        <Nav href="/trade"            title="Chart & Trading"  active={active === "trade"}><IconChartCandle className="h-3.5 w-3.5" /></Nav>
        <Nav href="/portfolio"        title="Portfolio"        active={active === "portfolio"}><IconWallet className="h-3.5 w-3.5" /></Nav>

        <Divider />

        <Nav href="/watchlist"        title="Watchlist"        active={active === "watchlist"}><IconStar className="h-3.5 w-3.5" /></Nav>
        <Nav href="/indicators"       title="Indikatoren"      active={active === "indicators"}><IconChartBar className="h-3.5 w-3.5" /></Nav>
        <Nav href="/indicator-editor" title="Indikator-Editor" active={active === "indicator-editor"}><IconPencil className="h-3.5 w-3.5" /></Nav>

        <Divider />

        <Nav href="/bots"             title="Bot-Editor"       active={active === "bots"}><IconRobot className="h-3.5 w-3.5" /></Nav>

        <Divider />

        <Nav href="/support"          title="Support"          active={active === "support"}><IconHelp className="h-3.5 w-3.5" /></Nav>
      </div>

      {/* User avatar */}
      <div className="w-full border-r border-white/[0.06] flex flex-col items-center pb-3">
        {walletAddr ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title={walletAddr}
              className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center hover:border-cyan-500/40 transition"
            >
              <span className="text-[9px] font-bold text-cyan-300">{walletAddr.slice(2, 4).toUpperCase()}</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-0 left-full ml-2 z-50 w-48 bg-[#0f1018] border border-white/[0.08] rounded-xl py-1 shadow-2xl">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <div className="text-[10px] text-gray-500 mb-0.5">Wallet</div>
                    <div className="text-[11px] text-white font-mono truncate">{walletAddr}</div>
                  </div>
                  <Link href="/portfolio" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/[0.04] transition">
                    <IconWallet className="h-3.5 w-3.5" /> Portfolio
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition">
                    <IconLogout className="h-3.5 w-3.5" /> Abmelden
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" title="Anmelden" className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition">
            <IconLogin className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
