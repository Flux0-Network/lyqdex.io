"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBell, IconUser, IconLogout, IconStar,
  IconChevronDown, IconArrowUpRight, IconArrowDownRight,
} from "@tabler/icons-react";

interface User { id: string; wallet_address: string }
interface Ticker { price: string; change: string; high: string; low: string; volume: string }

export function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => d.ticker && setTicker(d.ticker))
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  const price = parseFloat(ticker?.price ?? "0");
  const change = parseFloat(ticker?.change ?? "0");
  const isUp = change >= 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-11 bg-[#0c0d14] border-b border-white/[0.06] flex items-center gap-3 px-3">

      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Image src="/lyqdex-icon.png" alt="LyqDex" width={28} height={28} />
      </Link>

      {/* Pair selector */}
      <button className="flex items-center gap-1.5 shrink-0 group">
        <IconStar className="h-3.5 w-3.5 text-gray-600 group-hover:text-yellow-400 transition" />
        <span className="text-white font-semibold text-sm">BTC</span>
        <span className="text-gray-500 text-sm">/USDT</span>
        <IconChevronDown className="h-3 w-3 text-gray-600" />
      </button>

      <div className="w-px h-6 bg-white/[0.07] shrink-0" />

      {/* Live price */}
      {ticker && (
        <div className="flex items-center gap-3 shrink-0">
          <div>
            <div className={`text-base font-bold tabular-nums leading-tight ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 tabular-nums leading-tight">
              ≈ ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className={`flex items-center gap-0.5 text-xs font-medium tabular-nums shrink-0 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <IconArrowUpRight className="h-3.5 w-3.5" /> : <IconArrowDownRight className="h-3.5 w-3.5" />}
            {isUp ? "+" : ""}{change.toFixed(2)}%
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="w-px h-5 bg-white/[0.07]" />
            {[
              { label: "24h High", value: ticker.high },
              { label: "24h Low",  value: ticker.low  },
              { label: "24h Vol (BTC)", value: parseFloat(ticker.volume).toLocaleString("en-US", { maximumFractionDigits: 0 }) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] text-gray-500 leading-tight">{label}</div>
                <div className="text-[11px] text-white font-medium tabular-nums leading-tight">
                  {label.startsWith("24h Vol")
                    ? value
                    : parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Bell */}
      <button className="p-1.5 text-gray-500 hover:text-white transition">
        <IconBell className="h-3.5 w-3.5" />
      </button>

      {/* User */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-white/5 transition"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
              <IconUser className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <span className="hidden sm:inline font-mono text-[10px] text-gray-500">
              {user.wallet_address.slice(0, 6)}…{user.wallet_address.slice(-4)}
            </span>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#0f1018] border border-white/[0.08] rounded-xl py-1 shadow-2xl">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <div className="text-[10px] text-gray-500 mb-0.5">Wallet</div>
                  <div className="text-[11px] text-white font-mono truncate">{user.wallet_address}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition"
                >
                  <IconLogout className="h-3.5 w-3.5" /> Abmelden
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="text-[11px] text-gray-500 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5">
            Anmelden
          </Link>
          <Link href="/register" className="text-[11px] bg-white text-black font-semibold px-2.5 py-1 rounded-lg hover:bg-gray-200 transition">
            Registrieren
          </Link>
        </div>
      )}
    </nav>
  );
}
