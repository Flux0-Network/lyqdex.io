"use client";

import { useEffect, useRef } from "react";

/* Animated aurora ribbon via canvas */
function AuroraCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const STRANDS = [
      { color: "#7c3aed", alpha: 0.35, speed: 0.0008, amp: 180, freq: 1.2, phase: 0 },
      { color: "#06b6d4", alpha: 0.25, speed: 0.0006, amp: 140, freq: 0.9, phase: 2 },
      { color: "#a855f7", alpha: 0.20, speed: 0.0010, amp: 220, freq: 1.5, phase: 4 },
      { color: "#3b82f6", alpha: 0.18, speed: 0.0007, amp: 160, freq: 1.1, phase: 1 },
      { color: "#ec4899", alpha: 0.15, speed: 0.0009, amp: 130, freq: 0.8, phase: 3 },
    ];

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      STRANDS.forEach((s, si) => {
        const pts: [number, number][] = [];
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const x = (W / steps) * i;
          const y =
            H * 0.45 +
            Math.sin((x / W) * Math.PI * s.freq * 2 + t * s.speed * 1000 + s.phase) * s.amp +
            Math.sin((x / W) * Math.PI * 3 + t * s.speed * 800 + si) * (s.amp * 0.3);
          pts.push([x, y]);
        }

        // draw thick blurry stroke
        for (let width = 60; width >= 2; width -= 4) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            const mx = (pts[i - 1][0] + pts[i][0]) / 2;
            const my = (pts[i - 1][1] + pts[i][1]) / 2;
            ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
          }
          const a = s.alpha * (1 - width / 60) * 0.6;
          ctx.strokeStyle = s.color + Math.round(a * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = width;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      });

      t += 16;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}

/* Static star field */
function Stars() {
  const STARS = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.508) % 100),
    y: ((i * 97.3) % 100),
    r: i % 5 === 0 ? 1.5 : 0.8,
    o: 0.2 + (i % 7) * 0.1,
    d: 2 + (i % 4),
  }));

  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          opacity={s.o}
          style={{ animation: `pulse ${s.d}s ease-in-out infinite alternate` }}
        />
      ))}
      <style>{`@keyframes pulse { from { opacity: 0.1; } to { opacity: 0.6; } }`}</style>
    </svg>
  );
}

/* Glowing orbs */
function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-right large orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          top: -200, right: -100,
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite alternate",
        }}
      />
      {/* Center orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: "30%", left: "40%",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          animation: "orbFloat 11s ease-in-out infinite alternate-reverse",
        }}
      />
      {/* Bottom-left orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          bottom: -150, left: -100,
          background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)",
          animation: "orbFloat 9s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes orbFloat {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(40px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

/* Grid overlay */
function Grid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

export function HeroBg() {
  return (
    <div className="absolute inset-0 bg-[#06070f] overflow-hidden">
      <Stars />
      <Orbs />
      <AuroraCanvas />
      <Grid />
      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#06070f] to-transparent" />
    </div>
  );
}
