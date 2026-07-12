"use client";

import Link from "next/link";
import Image from "next/image";
import { IconLayoutDashboard, IconChartCandle, IconWallet, IconLogin } from "@tabler/icons-react";

export const SIDEBAR_W = 36;

type Active = "dashboard" | "trade" | "wallet";

function Nav({ href, title, active: on, children }: { href: string; title: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={title}
      className={`h-6 w-6 rounded flex items-center justify-center transition ${
        on ? "text-cyan-400 bg-white/[0.06]" : "text-gray-600 hover:text-cyan-400 hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </Link>
  );
}

export function AppSidebar({ active, walletAddr }: { active?: Active; walletAddr?: string | null }) {
  return (
    <div className="fixed left-0 top-0 bottom-0 bg-[#0c0d14] z-50 flex flex-col items-center" style={{ width: SIDEBAR_W }}>
      <div className="h-11 flex items-center justify-center shrink-0">
        <Link href="/"><Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} /></Link>
      </div>
      <div className="flex-1 w-full border-r border-white/[0.06] flex flex-col items-center pt-2 gap-1">
        <Nav href="/dashboard" title="Dashboard" active={active === "dashboard"}><IconLayoutDashboard className="h-3.5 w-3.5" /></Nav>
        <Nav href="/trade"     title="Chart"     active={active === "trade"}><IconChartCandle className="h-3.5 w-3.5" /></Nav>
        <Nav href="/wallet"    title="Wallet"    active={active === "wallet"}><IconWallet className="h-3.5 w-3.5" /></Nav>
      </div>
      <div className="w-full border-r border-white/[0.06] flex flex-col items-center pb-2.5">
        {walletAddr ? (
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center" title={walletAddr}>
            <span className="text-[9px] font-bold text-cyan-300">{walletAddr.slice(2, 4).toUpperCase()}</span>
          </div>
        ) : (
          <Link href="/login" title="Anmelden" className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition">
            <IconLogin className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
