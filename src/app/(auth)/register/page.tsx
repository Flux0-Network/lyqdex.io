"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconLoader2,
  IconAlertCircle,
  IconCopy,
  IconCheck,
  IconAlertTriangle,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";

type Step = "form" | "seed";
type AuthMethod = "email" | "phone";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [seedPhrase, setSeedPhrase] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          password,
          email: authMethod === "email" ? email : undefined,
          phone: authMethod === "phone" ? phone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSeedPhrase(data.seedPhrase);
      setAddress(data.user.address);
      setStep("seed");
    } catch {
      setError("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition";

  const toggleBtn = (method: AuthMethod, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setAuthMethod(method);
        setEmail("");
        setPhone("");
      }}
      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition ${
        authMethod === method
          ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm py-12">
        <Link href="/" className="flex items-center justify-center mb-10">
          <Image
            src="/lyqdex-icon.png"
            alt="LyqDex"
            width={32}
            height={32}
            className="brightness-[2]"
          />
        </Link>

        {step === "form" ? (
          <>
            <h1 className="text-xl font-semibold text-white text-center mb-1">Konto erstellen</h1>
            <p className="text-sm text-gray-500 text-center mb-8">
              <Link href="/login" className="text-violet-400 hover:text-violet-300">
                Bereits registriert? Anmelden
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Vorname</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Max"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Nachname</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Mustermann"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Benutzername</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="@benutzername"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex gap-1 mb-1.5">
                  {toggleBtn("email", "E-Mail", <IconMail className="h-3 w-3" />)}
                  {toggleBtn("phone", "Telefon", <IconPhone className="h-3 w-3" />)}
                </div>
                {authMethod === "email" ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="max@beispiel.de"
                    className={inputClass}
                  />
                ) : (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+49 170 1234567"
                    className={inputClass}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5">
                  <IconAlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Konto erstellen"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-white text-center mb-1">Wallet erstellt!</h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              Deine Wallet-Adresse wurde generiert.
            </p>

            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs text-gray-500 mb-1">Wallet-Adresse</div>
              <div className="text-sm text-white font-mono break-all">{address}</div>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Seed Phrase sichern!</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Dies ist dein einziger Zugang zu deinem Wallet. Speichere diese Wörter sicher ab.
                Wir können sie nicht wiederherstellen.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {seedPhrase.split(" ").map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-gray-900 rounded-lg px-2 py-1.5"
                  >
                    <span className="text-[10px] text-gray-600">{i + 1}</span>
                    <span className="text-xs text-white">{word}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white py-2 border border-white/10 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <IconCopy className="h-3.5 w-3.5" />
                    Seed Phrase kopieren
                  </>
                )}
              </button>
            </div>

            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 accent-violet-500"
              />
              <span className="text-xs text-gray-400">
                Ich habe meine Seed Phrase sicher gespeichert und verstehe, dass LyqDex sie nicht
                wiederherstellen kann.
              </span>
            </label>

            <button
              onClick={() => router.push("/wallet")}
              disabled={!confirmed}
              className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Zum Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
