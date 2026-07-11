import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#080910] border-t border-gray-100 dark:border-white/[0.05] py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Produkte</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Spot Trading</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Futures</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Earn</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Copy Trading</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Hilfe-Center</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">API Docs</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Gebühren</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Unternehmen</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Über uns</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Karriere</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Rechtliches</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">AGB</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Datenschutz</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition">Impressum</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-100 dark:border-white/[0.05] text-center text-gray-400 text-xs">
        &copy; 2025 LyqDex. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
