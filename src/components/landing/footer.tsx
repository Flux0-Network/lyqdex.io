import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Produkte</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-gray-200">Spot Trading</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Futures</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Earn</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Copy Trading</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-gray-200">Hilfe-Center</Link></li>
            <li><Link href="#" className="hover:text-gray-200">API Docs</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Gebühren</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Unternehmen</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-gray-200">Über uns</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Karriere</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Rechtliches</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#" className="hover:text-gray-200">AGB</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Datenschutz</Link></li>
            <li><Link href="#" className="hover:text-gray-200">Impressum</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-800/50 text-center text-gray-500 text-sm">
        &copy; 2024 LyqDex. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
