"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLayoutDashboard, IconChartCandle, IconWallet, IconLogin, IconLogout } from "@tabler/icons-react";

export const SIDEBAR_W = 36;

type Active = "dashboard" | "trade" | "wallet";
// Note: wallet is merged into the dashboard; "wallet" active still highlights Dashboard.

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
      <div className="h-11 flex items-center justify-center shrink-0">
        <Link href="/"><Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} /></Link>
      </div>
      <div className="flex-1 w-full border-r border-white/[0.06] flex flex-col items-center pt-2 gap-1">
        <Nav href="/dashboard" title="Dashboard & Wallet" active={active === "dashboard" || active === "wallet"}><IconLayoutDashboard className="h-3.5 w-3.5" /></Nav>
        <Nav href="/trade"     title="Chart"              active={active === "trade"}><IconChartCandle className="h-3.5 w-3.5" /></Nav>
      </div>
      <div className="w-full border-r border-white/[0.06] flex flex-col items-center pb-2.5">
        {walletAddr ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title={walletAddr}
              className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center hover:border-cyan-500/40 transition"
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
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/[0.04] transition">
                    <IconWallet className="h-3.5 w-3.5" /> Wallet & Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition">
                    <IconLogout className="h-3.5 w-3.5" /> Abmelden
                  </button>
                </div>
              </>
            )}
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
