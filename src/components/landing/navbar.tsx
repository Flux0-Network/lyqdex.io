"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconX, IconMenu2 } from "@tabler/icons-react";
import { ThemeToggle } from "./theme-toggle";

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
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0d14] shadow-xl shadow-black/8 p-2 z-50">
      {items.map((item) => (
        <Link
          key={item.label}
          href="#"
          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group"
        >
          <span className="text-lg mt-0.5 w-7 text-center flex-shrink-0">{item.icon}</span>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition">
              {item.label}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{item.desc}</div>
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
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">

      {/* Desktop: floating pill */}
      <nav className="hidden lg:flex items-center gap-0.5 px-2 py-2 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#08090f]/92 backdrop-blur-xl shadow-lg shadow-black/[0.06] dark:shadow-black/60">
        <Link href="/" className="flex items-center justify-center w-9 h-9 mr-1.5">
          <Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} className="invert dark:invert-0" />
        </Link>

        {navLinks.map((item) => (
          <div key={item.label} className="relative">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 rounded-full text-sm text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white transition"
              >
                {item.label}
              </Link>
            ) : (
              <button
                onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition ${
                  openMenu === item.label
                    ? "text-black dark:text-white"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
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

        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1.5" />

        <ThemeToggle />

        <Link href="/login" className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition rounded-full">
          Anmelden
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 text-sm font-semibold rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition"
        >
          Registrieren
        </Link>
      </nav>

      {/* Mobile: compact centered pill */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#08090f]/92 backdrop-blur-xl shadow-lg shadow-black/[0.06]">
        <Link href="/">
          <Image src="/lyqdex-icon.png" alt="LyqDex" width={22} height={22} className="invert dark:invert-0" />
        </Link>
        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
        <ThemeToggle />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
        >
          {mobileOpen ? <IconX className="h-4 w-4" /> : <IconMenu2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full mt-2 left-4 right-4 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#08090f] shadow-xl shadow-black/8 p-3 flex flex-col gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className="px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-2">
            <Link
              href="/login"
              className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition"
              onClick={() => setMobileOpen(false)}
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="px-4 py-3 text-sm text-center font-semibold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(false)}
            >
              Registrieren
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
