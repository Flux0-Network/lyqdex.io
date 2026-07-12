import {
  IconChartCandleFilled,
  IconBolt,
  IconShieldLock,
  IconChartArrows,
  IconSourceCode,
  IconCoin,
} from "@tabler/icons-react";

const features = [
  {
    title: "Professionelle Charts",
    description: "Eigene Candlestick-Charts mit MA, Indikatoren und Replay-Modus — direkt im Browser.",
    icon: IconChartCandleFilled,
    color: "text-cyan-400",
  },
  {
    title: "Unter 1ms Latenz",
    description: "WebSocket-Feeds von Binance und Bybit parallel — Echtzeit-Tick-Daten ohne Verzögerung.",
    icon: IconBolt,
    color: "text-amber-400",
  },
  {
    title: "Non-Custodial",
    description: "Du behältst deine Keys. Hybrid-Matching On-Chain — kein Vertrauen in Drittparteien nötig.",
    icon: IconShieldLock,
    color: "text-emerald-400",
  },
  {
    title: "Aggregierte Preise",
    description: "Median aus Binance, Bybit, OKX und CoinGecko — manipulationsresistenter Referenzpreis.",
    icon: IconChartArrows,
    color: "text-blue-400",
  },
  {
    title: "Open Source",
    description: "Vollständig verifizierbare Smart Contracts — alles on-chain nachprüfbar, kein Blackbox-Backend.",
    icon: IconSourceCode,
    color: "text-purple-400",
  },
  {
    title: "Kostenlos in der Beta",
    description: "Kein KYC. Kein Abo. Während der Beta-Phase kostenlos und ohne Einschränkungen.",
    icon: IconCoin,
    color: "text-pink-400",
  },
];

export function Features() {
  return (
    <section className="py-24 px-5 bg-gray-50 dark:bg-[#080910]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] text-xs text-gray-500 mb-4">
            Warum LyqDex
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
            Alles was du brauchst.
            <span className="block mt-1 bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
              Nichts was du nicht brauchst.
            </span>
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-sm mx-auto">
            Professionelle Trading-Tools, dezentral und ohne Kompromisse.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:shadow-sm transition"
            >
              <f.icon className={`h-5 w-5 ${f.color} mb-3`} />
              <h3 className="font-semibold text-black dark:text-white mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
