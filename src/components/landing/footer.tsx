import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-medium text-white mb-3">Produkte</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-gray-300 transition">Spot Trading</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Futures</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Earn</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Copy Trading</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-white mb-3">Support</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-gray-300 transition">Hilfe-Center</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">API Docs</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Gebühren</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-white mb-3">Unternehmen</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-gray-300 transition">Über uns</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Karriere</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-white mb-3">Rechtliches</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="#" className="hover:text-gray-300 transition">AGB</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Datenschutz</Link></li>
            <li><Link href="#" className="hover:text-gray-300 transition">Impressum</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/5 text-center text-gray-600 text-xs">
        &copy; 2024 LyqDex. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
