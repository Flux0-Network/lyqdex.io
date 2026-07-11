"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconX, IconMenu2 } from "@tabler/icons-react";

const navLinks = [
  {
    label: "Trading",
    dropdown: [
      { label: "Spot Trading", desc: "Krypto kaufen & verkaufen", icon: "📈" },
      { label: "Futures", desc: "Bis zu 125x Hebel", icon: "⚡" },
      { label: "Copy Trading", desc: "Top-Trader automatisch kopieren", icon: "🔄" },
    ],
  },
  { label: "Märkte", href: "#" },
  { label: "Earn", href: "#" },
  {
    label: "Mehr",
    dropdown: [
      { label: "API Docs", desc: "Für Entwickler & Bots", icon: "🛠" },
      { label: "Launchpad", desc: "Neue Token entdecken", icon: "🚀" },
      { label: "Blog", desc: "News & Analysen", icon: "📰" },
    ],
  },
];

function Dropdown({ items }: { items: { label: string; desc: string; icon: string }[] }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl border border-white/8 bg-[#10121a]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-2 z-50">
      {items.map((item) => (
        <Link
          key={item.label}
          href="#"
          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition group"
        >
          <span className="text-lg mt-0.5 w-7 text-center flex-shrink-0">{item.icon}</span>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-violet-300 transition">
              {item.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 bg-[#0a0b0e]/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image src="/icon_logo.png" alt="LyqDex" width={36} height={36} className="brightness-[2]" />
        </Link>

        {/* Center nav links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((item) => (
            <div key={item.label} className="relative">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition ${
                    openMenu === item.label
                      ? "text-white bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  <IconChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      openMenu === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
              {item.dropdown && openMenu === item.label && (
                <Dropdown items={item.dropdown} />
              )}
            </div>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition rounded-xl hover:bg-white/5"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-lg shadow-violet-900/30"
          >
            Registrieren
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden ml-auto p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0b0e] px-6 py-4 flex flex-col gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className="px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <Link href="/login" className="px-3 py-2.5 text-sm text-center text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 transition">
              Anmelden
            </Link>
            <Link href="/register" className="px-3 py-2.5 text-sm text-center font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition">
              Registrieren
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
