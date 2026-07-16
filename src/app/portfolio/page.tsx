"use client";

import { useEffect, useState, useCallback } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconArrowDownLeft, IconArrowUpRight, IconRefresh } from "@tabler/icons-react";

const DEMO_START = 10_000;

function fmt(n: number) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortfolioPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [tab, setTab] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    fetch("/api/wallet")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const usdt = d?.wallets?.find((w: { currency: string; balance: string }) => w.currency === "USDT");
        setBalance(parseFloat(usdt?.balance ?? DEMO_START));
      });
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addDemo() {
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/wallet/transaction", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: "USDT", amount: amt, type: "deposit" }),
    });
    if (res.ok) { load(); setAmount(""); setTab(null); setMsg(`+${fmt(amt)} USDT Demo-Guthaben hinzugefügt`); setTimeout(() => setMsg(""), 4000); }
    setBusy(false);
  }

  async function removeDemo() {
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/wallet/transaction", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: "USDT", amount: amt, type: "withdraw" }),
    });
    if (res.ok) { load(); setAmount(""); setTab(null); setMsg(`-${fmt(amt)} USDT abgezogen`); setTimeout(() => setMsg(""), 4000); }
    else { const d = await res.json(); setMsg(d.error ?? "Fehler"); }
    setBusy(false);
  }

  function resetDemo() {
    setBalance(null);
    fetch("/api/wallet/transaction", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: "USDT", amount: DEMO_START, type: "set" }),
    }).then(() => load());
  }

  return (
    <div className="min-h-screen bg-[#080910] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="portfolio" walletAddr={walletAddr} />
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-xs uppercase tracking-widest text-gray-600 mb-6">Portfolio</h1>

        {/* Balance card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Demo-Guthaben · USDT</div>
          <div className="text-4xl font-bold tabular-nums mb-1">
            {balance === null ? "—" : `$${fmt(balance)}`}
          </div>
          <div className="text-[11px] text-gray-600">Simuliertes Guthaben — kein echtes Geld</div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => { setTab(t => t === "deposit" ? null : "deposit"); setAmount(""); setMsg(""); }}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border transition ${tab === "deposit" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-gray-300 hover:text-white"}`}
            >
              <IconArrowDownLeft className="h-3.5 w-3.5" /> Einzahlen
            </button>
            <button
              onClick={() => { setTab(t => t === "withdraw" ? null : "withdraw"); setAmount(""); setMsg(""); }}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border transition ${tab === "withdraw" ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/10 text-gray-300 hover:text-white"}`}
            >
              <IconArrowUpRight className="h-3.5 w-3.5" /> Abheben
            </button>
            <button
              onClick={resetDemo}
              title="Demo zurücksetzen auf $10,000"
              className="ml-auto flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-gray-600 hover:text-gray-400 transition"
            >
              <IconRefresh className="h-3 w-3" /> Reset
            </button>
          </div>

          {tab && (
            <div className="mt-3 flex gap-2">
              <input
                type="number" inputMode="decimal" autoFocus
                value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") tab === "deposit" ? addDemo() : removeDemo(); if (e.key === "Escape") setTab(null); }}
                placeholder="Betrag USDT"
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={tab === "deposit" ? addDemo : removeDemo}
                disabled={busy}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition disabled:opacity-40 ${tab === "deposit" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"} text-white`}
              >
                {busy ? "…" : "OK"}
              </button>
            </div>
          )}
          {msg && <p className={`text-[11px] mt-2 ${msg.startsWith("+") ? "text-emerald-400" : msg.startsWith("-") ? "text-red-400" : "text-gray-400"}`}>{msg}</p>}
        </div>

        {/* Info */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 text-[11px] text-gray-600 leading-relaxed">
          Das ist ein Demo-Konto. Einzahlungen und Abhebungen sind simuliert und haben keinen Effekt auf echte Gelder.
          Nutze das Guthaben um Hebel-Trades zu testen.
        </div>
      </div>
    </div>
  );
}
