"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconLoader2, IconCheck, IconArrowRight } from "@tabler/icons-react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setState("done");
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Fehler beim Eintragen.");
        setState("error");
      }
    } catch {
      setErrorMsg("Verbindungsfehler. Bitte erneut versuchen.");
      setState("error");
    }
  }

  return (
    <section className="py-24 px-4 border-t border-white/[0.05]">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium border border-violet-500/20 bg-violet-500/10 text-violet-400">
            Early Access
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Sei einer der Ersten
          </h2>
          <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            LyqDex befindet sich in der privaten Beta. Trag dich ein und erhalte als Erster Zugang wenn wir öffnen.
          </p>

          {state === "done" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            >
              <IconCheck className="h-4 w-4" />
              Du bist auf der Liste — wir melden uns!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                placeholder="deine@email.de"
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition"
              />
              <button
                type="submit"
                disabled={state === "loading" || !email.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition disabled:opacity-50 shrink-0"
              >
                {state === "loading" ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Eintragen <IconArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {state === "error" && (
            <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
          )}

          <p className="mt-4 text-xs text-gray-600">
            Kein Spam. Kein Verkauf deiner Daten. Jederzeit abmeldbar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
