"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconWallet, IconChevronDown, IconLogout, IconUser, IconChartBar } from "@tabler/icons-react";

interface User {
  id: string;
  wallet_address: string;
}

export function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data.user))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0c0d14] border-b border-white/[0.06]">
      <div className="max-w-[1800px] mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/lyqdex-icon.png" alt="LyqDex" width={22} height={22} />
            <span className="text-white font-bold text-sm tracking-wide">LyqDex</span>
          </Link>
          <div className="hidden md:flex items-center">
            <Link href="/trade" className="px-3 h-12 flex items-center text-xs text-gray-300 hover:text-white border-b-2 border-white transition">
              <IconChartBar className="h-3.5 w-3.5 mr-1.5" />
              Trading
            </Link>
            <Link href="/wallet" className="px-3 h-12 flex items-center text-xs text-gray-500 hover:text-white border-b-2 border-transparent hover:border-white/30 transition">
              <IconWallet className="h-3.5 w-3.5 mr-1.5" />
              Wallet
            </Link>
          </div>
        </div>

        {/* Right: user */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                <IconUser className="h-3.5 w-3.5 text-gray-300" />
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-gray-400">
                {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
              </span>
              <IconChevronDown className="h-3 w-3 text-gray-600" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-[#0f1018] border border-white/[0.08] rounded-xl py-1 shadow-2xl">
                  <div className="px-3 py-2.5 border-b border-white/[0.06]">
                    <div className="text-[10px] text-gray-500 mb-0.5">Wallet</div>
                    <div className="text-[11px] text-white font-mono truncate">{user.wallet_address}</div>
                  </div>
                  <Link href="/wallet" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition" onClick={() => setMenuOpen(false)}>
                    <IconWallet className="h-3.5 w-3.5" /> Wallet
                  </Link>
                  <Link href="/trade" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition" onClick={() => setMenuOpen(false)}>
                    <IconChartBar className="h-3.5 w-3.5" /> Trading
                  </Link>
                  <div className="border-t border-white/[0.06] mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition">
                      <IconLogout className="h-3.5 w-3.5" /> Abmelden
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-xs text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5">
              Anmelden
            </Link>
            <Link href="/register" className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
