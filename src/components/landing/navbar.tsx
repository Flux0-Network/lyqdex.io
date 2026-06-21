"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconQrcode, IconX } from "@tabler/icons-react";

export function Navbar() {
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-gray-950/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white tracking-tight">
            <Image src="/icon_logo.png" alt="LyqDex" width={28} height={28} />
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
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition">
              Anmelden
            </Link>
            <Link href="/register" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full transition hover:bg-gray-200">
              Registrieren
            </Link>
            <button
              onClick={() => setShowQr(!showQr)}
              className="ml-1 p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition"
              title="QR-Code Login"
            >
              <IconQrcode className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {showQr && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
            >
              <IconX className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-white mb-2">
              QR-Code Login
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Scanne den Code mit der LyqDex App um dich anzumelden.
            </p>
            <div className="mx-auto w-48 h-48 bg-white rounded-xl flex items-center justify-center">
              <div className="text-gray-400 text-xs">QR-Code</div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Bald verfügbar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
