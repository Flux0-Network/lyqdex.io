"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white tracking-tight">
          LyqDex
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="#" className="hover:text-white transition">
            Trading
          </Link>
          <Link href="#" className="hover:text-white transition">
            Märkte
          </Link>
          <Link href="#" className="hover:text-white transition">
            Earn
          </Link>
          <Link href="#" className="hover:text-white transition">
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-300 hover:text-white transition">
            Anmelden
          </button>
          <button className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full transition hover:bg-gray-200">
            Registrieren
          </button>
        </div>
      </div>
    </nav>
  );
}
