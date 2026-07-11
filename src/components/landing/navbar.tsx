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
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl border border-white/8 bg-[#10121a]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-2 z-50">
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
    <div ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">

      {/* Desktop: floating pill */}
      <nav className="hidden lg:flex items-center gap-0.5 px-2 py-2 rounded-full border border-white/[0.09] bg-[#0c0d17]/90 backdrop-blur-xl shadow-2xl shadow-black/60">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center w-9 h-9 mr-1.5">
          <Image
            src="/lyqdex-icon.png"
            alt="LyqDex"
            width={26}
            height={26}
            className="brightness-[2]"
          />
        </Link>

        {/* Nav links */}
        {navLinks.map((item) => (
          <div key={item.label} className="relative">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 rounded-full text-sm text-gray-400 hover:text-white transition"
              >
                {item.label}
              </Link>
            ) : (
              <button
                onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition ${
                  openMenu === item.label ? "text-white" : "text-gray-400 hover:text-white"
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

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-1.5" />

        {/* CTAs */}
        <Link
          href="/login"
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition rounded-full hover:bg-white/5"
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 text-sm font-semibold rounded-full bg-white text-[#0a0b0e] hover:bg-gray-100 transition"
        >
          Registrieren
        </Link>
      </nav>

      {/* Mobile: pill bar */}
      <div className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-white/[0.09] bg-[#0c0d17]/90 backdrop-blur-xl shadow-xl shadow-black/50">
        <Link href="/">
          <Image
            src="/lyqdex-icon.png"
            alt="LyqDex"
            width={26}
            height={26}
            className="brightness-[2]"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="px-4 py-1.5 text-sm font-semibold rounded-full bg-white text-[#0a0b0e] hover:bg-gray-100 transition"
          >
            Registrieren
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full mt-2 left-4 right-4 rounded-2xl border border-white/10 bg-[#0c0d17]/95 backdrop-blur-xl shadow-2xl p-3 flex flex-col gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-white/8 flex flex-col gap-2">
            <Link
              href="/login"
              className="px-4 py-2.5 text-sm text-center text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 transition"
            >
              Anmelden
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
