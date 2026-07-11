"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBell, IconUser, IconLogout } from "@tabler/icons-react";

interface User {
  id: string;
  wallet_address: string;
}

interface Ticker {
  price: string;
  change: string;
}

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

  const isUp = parseFloat(ticker?.change ?? "0") >= 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-8 bg-[#0c0d14] border-b border-white/[0.06] flex items-center px-2 gap-2">
      {/* Logo */}
      <Link href="/" className="flex items-center shrink-0 pr-1">
        <Image src="/lyqdex-icon.png" alt="LyqDex" width={18} height={18} className="invert dark:invert-0" />
      </Link>

      {/* Bell */}
      <button className="p-1 text-gray-500 hover:text-white transition">
        <IconBell className="h-3.5 w-3.5" />
      </button>

      {/* BTC/USDT live chip */}
      <Link
        href="/trade"
        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 transition"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
        </span>
        <span className="text-[11px] font-medium text-white">BTC/USDT</span>
        {ticker && (
          <span className={`text-[10px] tabular-nums font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {parseFloat(ticker.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-white/5 transition"
          >
            <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
              <IconUser className="h-3 w-3 text-gray-400" />
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
          <Link href="/login" className="text-[11px] text-gray-500 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/5">
            Anmelden
          </Link>
          <Link href="/register" className="text-[11px] bg-white text-black font-semibold px-2.5 py-0.5 rounded-md hover:bg-gray-200 transition">
            Registrieren
          </Link>
        </div>
      )}
    </nav>
  );
}
