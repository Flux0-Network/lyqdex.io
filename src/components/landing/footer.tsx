import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#080910] border-t border-black/[0.06] dark:border-white/[0.05] py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/lyqdex-icon.png" alt="LyqDex" width={20} height={20} />
            <span className="font-bold text-white text-sm">LyqDex</span>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed max-w-[180px]">
            Professionelle Charts. Non-custodial Trading. Deine Keys, deine Coins.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Produkt</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/trade" className="hover:text-white transition">Trading Terminal</Link></li>
            <li><Link href="/register" className="hover:text-white transition">Registrieren</Link></li>
            <li><Link href="/login" className="hover:text-white transition">Einloggen</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Ressourcen</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-white transition">Dokumentation</Link></li>
            <li><Link href="#" className="hover:text-white transition">API</Link></li>
            <li><Link href="#" className="hover:text-white transition">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Rechtliches</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-white transition">AGB</Link></li>
            <li><Link href="#" className="hover:text-white transition">Datenschutz</Link></li>
            <li><Link href="#" className="hover:text-white transition">Impressum</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-400 text-xs">
        <span>&copy; 2026 LyqDex. Alle Rechte vorbehalten.</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Beta · Kostenlos testen
        </span>
      </div>
    </footer>
  );
}
