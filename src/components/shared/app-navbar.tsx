"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconWallet, IconChevronDown, IconLogout, IconUser, IconChartBar } from "@tabler/icons-react";

interface User {
  id: string;
  email: string;
  name?: string;
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
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1800px] mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <Image src="/icon_logo.png" alt="LyqDex" width={24} height={24} />
            <span className="text-sm">LyqDex</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
            <Link href="/trade" className="hover:text-white transition flex items-center gap-1">
              <IconChartBar className="h-3.5 w-3.5" />
              Trading
            </Link>
            <Link href="/wallet" className="hover:text-white transition flex items-center gap-1">
              <IconWallet className="h-3.5 w-3.5" />
              Wallet
            </Link>
          </div>
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition"
            >
              <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                <IconUser className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="hidden sm:inline">{user.name || user.email}</span>
              <IconChevronDown className="h-3 w-3" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-gray-900 border border-white/10 rounded-xl py-1 shadow-xl">
                  <div className="px-3 py-2 border-b border-white/5">
                    <div className="text-xs text-white font-medium truncate">{user.email}</div>
                  </div>
                  <Link
                    href="/wallet"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <IconWallet className="h-3.5 w-3.5" />
                    Wallet
                  </Link>
                  <Link
                    href="/trade"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <IconChartBar className="h-3.5 w-3.5" />
                    Trading
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition"
                  >
                    <IconLogout className="h-3.5 w-3.5" />
                    Abmelden
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-xs text-gray-300 hover:text-white transition">
              Anmelden
            </Link>
            <Link href="/register" className="text-xs bg-white text-black font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition">
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
