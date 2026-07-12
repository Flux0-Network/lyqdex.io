"use client";

import { motion } from "framer-motion";
import {
  IconShieldLock,
  IconKey,
  IconLock,
  IconEye,
  IconFileCheck,
  IconServer,
} from "@tabler/icons-react";

const items = [
  {
    icon: IconKey,
    title: "Non-Custodial",
    desc: "Deine Private Keys verlassen niemals dein Gerät. Wir haben zu keiner Zeit Zugriff auf deine Funds.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: IconShieldLock,
    title: "End-to-End verschlüsselt",
    desc: "Alle Verbindungen laufen über TLS 1.3. Sensitive Daten werden client-seitig verschlüsselt.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: IconLock,
    title: "Smart Contract Audits",
    desc: "Alle On-Chain Contracts werden vor Launch durch unabhängige Sicherheitsfirmen geprüft.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: IconEye,
    title: "Open Source",
    desc: "Der Kern von LyqDex ist öffentlich einsehbar. Jeder kann den Code prüfen und verifizieren.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: IconFileCheck,
    title: "Regulatorisch konform",
    desc: "Wir bauen mit Blick auf EU MiCA. Compliance ist kein Nachgedanke, sondern Teil des Designs.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: IconServer,
    title: "Dezentrale Infrastruktur",
    desc: "Kein Single Point of Failure. Matching-Engine und Datenhaltung verteilt über mehrere Nodes.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export function Security() {
  return (
    <section className="py-24 px-4 bg-transparent">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            Sicherheit
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Gebaut für maximale Sicherheit
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Von Anfang an auf Security ausgelegt — nicht als Feature, sondern als Fundament.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition"
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${item.bg} mb-4`}>
                <item.icon className={`h-4.5 w-4.5 ${item.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
