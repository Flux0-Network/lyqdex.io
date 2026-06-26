"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/shared/app-navbar";
import {
  IconPlus,
  IconWallet,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconCopy,
} from "@tabler/icons-react";

interface Wallet {
  id: string;
  currency: string;
  balance: string;
  created_at: string;
}

const CURRENCY_INFO: Record<string, { name: string; color: string }> = {
  USDT: { name: "Tether", color: "#26a17b" },
  BTC: { name: "Bitcoin", color: "#f7931a" },
  ETH: { name: "Ethereum", color: "#627eea" },
  BNB: { name: "BNB", color: "#f3ba2f" },
  SOL: { name: "Solana", color: "#9945ff" },
  XRP: { name: "Ripple", color: "#00aae4" },
  DOGE: { name: "Dogecoin", color: "#c2a633" },
  ADA: { name: "Cardano", color: "#0033ad" },
  AVAX: { name: "Avalanche", color: "#e84142" },
  DOT: { name: "Polkadot", color: "#e6007a" },
  MATIC: { name: "Polygon", color: "#8247e5" },
  LINK: { name: "Chainlink", color: "#2a5ada" },
  LTC: { name: "Litecoin", color: "#bfbbbb" },
  UNI: { name: "Uniswap", color: "#ff007a" },
  ATOM: { name: "Cosmos", color: "#2e3148" },
};

export default function WalletPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [supported, setSupported] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setWallets(data.wallets);
          setSupported(data.supported);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const existingCurrencies = wallets.map((w) => w.currency);
  const available = supported.filter((c) => !existingCurrencies.includes(c));

  async function handleCreate(currency: string) {
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setWallets((prev) => [...prev, data.wallet].sort((a, b) => a.currency.localeCompare(b.currency)));
      setSuccess(`${currency} Wallet erstellt!`);
      setTimeout(() => setSuccess(""), 3000);
      setShowCreate(false);
    } catch {
      setError("Fehler beim Erstellen.");
    } finally {
      setCreating(false);
    }
  }

  function copyAddress(walletId: string) {
    navigator.clipboard.writeText(walletId);
    setCopied(walletId);
    setTimeout(() => setCopied(null), 2000);
  }

  const totalUSDT = wallets.reduce((sum, w) => {
    if (w.currency === "USDT") return sum + parseFloat(w.balance);
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0b0e]">
      <AppNavbar />
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Wallet</h1>
            <p className="text-sm text-gray-500 mt-1">Verwalte deine Krypto-Wallets</p>
          </div>
          {available.length > 0 && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 text-xs bg-white text-black font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Wallet erstellen
            </button>
          )}
        </div>

        {/* Total Balance */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
          <div className="text-xs text-gray-500 mb-1">Geschätzter Gesamtwert</div>
          <div className="text-3xl font-semibold text-white">
            {totalUSDT.toLocaleString("de-DE", { minimumFractionDigits: 2 })} <span className="text-lg text-gray-400">USDT</span>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-2.5 mb-4">
            <IconCheck className="h-4 w-4" />
            {success}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2.5 mb-4">
            <IconAlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
            <h3 className="text-sm font-medium text-white mb-4">Neues Wallet erstellen</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {available.map((currency) => {
                const info = CURRENCY_INFO[currency];
                return (
                  <button
                    key={currency}
                    onClick={() => handleCreate(currency)}
                    disabled={creating}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition disabled:opacity-40"
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: info?.color || "#666" }}
                    >
                      {currency.slice(0, 2)}
                    </div>
                    <span className="text-xs font-medium text-white">{currency}</span>
                    <span className="text-[10px] text-gray-500">{info?.name || currency}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Wallets List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-6 w-6 text-gray-500 animate-spin" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-20">
            <IconWallet className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Noch keine Wallets vorhanden.</p>
            <p className="text-gray-600 text-sm mt-1">Erstelle dein erstes Wallet um loszulegen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet) => {
              const info = CURRENCY_INFO[wallet.currency];
              const balance = parseFloat(wallet.balance);
              return (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: info?.color || "#666" }}
                    >
                      {wallet.currency.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{wallet.currency}</div>
                      <div className="text-xs text-gray-500">{info?.name || wallet.currency}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {balance.toFixed(wallet.currency === "USDT" ? 2 : 6)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        ≈ $0.00
                      </div>
                    </div>
                    <button
                      onClick={() => copyAddress(wallet.id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition"
                      title="Wallet-ID kopieren"
                    >
                      {copied === wallet.id ? (
                        <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <IconCopy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
