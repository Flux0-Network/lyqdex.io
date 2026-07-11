"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconLoader2, IconAlertCircle, IconMail, IconPhone } from "@tabler/icons-react";

type AuthMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/wallet");
    } catch {
      setError("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition";

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

        <h1 className="text-xl font-semibold text-white text-center mb-1">Anmelden</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          <Link href="/register" className="text-violet-400 hover:text-violet-300">
            Neues Konto erstellen
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex gap-1 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setIdentifier("");
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition ${
                  authMethod === "email"
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <IconMail className="h-3 w-3" /> E-Mail
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setIdentifier("");
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition ${
                  authMethod === "phone"
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <IconPhone className="h-3 w-3" /> Telefon
              </button>
            </div>
            <input
              type={authMethod === "email" ? "email" : "tel"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder={authMethod === "email" ? "max@beispiel.de" : "+49 170 1234567"}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Dein Passwort"
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
            disabled={loading || !identifier.trim() || !password}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
