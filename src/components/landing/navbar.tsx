"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-100">
          Lyq<span className="text-emerald-400">Dex</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="#" className="hover:text-gray-100 transition">
            Trading
          </Link>
          <Link href="#" className="hover:text-gray-100 transition">
            Märkte
          </Link>
          <Link href="#" className="hover:text-gray-100 transition">
            Earn
          </Link>
          <Link href="#" className="hover:text-gray-100 transition">
            Über uns
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-300 hover:text-white transition">
            Anmelden
          </button>
          <button className="text-sm bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition">
            Registrieren
          </button>
        </div>
      </div>
    </nav>
  );
}
