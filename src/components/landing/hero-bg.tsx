"use client";

import { useEffect, useRef } from "react";

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
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const STRANDS = [
      { r: 139, g: 92,  b: 246, speed: 0.6, amp: 160, freq: 1.1, phase: 0,   width: 120 },
      { r: 6,   g: 182, b: 212, speed: 0.4, amp: 120, freq: 0.8, phase: 2.1, width: 90  },
      { r: 168, g: 85,  b: 247, speed: 0.8, amp: 200, freq: 1.4, phase: 4.2, width: 100 },
      { r: 59,  g: 130, b: 246, speed: 0.5, amp: 140, freq: 1.0, phase: 1.0, width: 80  },
      { r: 236, g: 72,  b: 153, speed: 0.7, amp: 110, freq: 0.7, phase: 3.0, width: 70  },
    ];

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const sec = t * 0.001;

      STRANDS.forEach((s) => {
        const pts: [number, number][] = [];
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const x = (W / steps) * i;
          const y =
            H * 0.5 +
            Math.sin((i / steps) * Math.PI * s.freq * 2 + sec * s.speed + s.phase) * s.amp +
            Math.sin((i / steps) * Math.PI * 3.7 + sec * s.speed * 1.3 + s.phase) * (s.amp * 0.25);
          pts.push([x, y]);
        }

        // outer glow
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const mx = (pts[i - 1][0] + pts[i][0]) / 2;
          const my = (pts[i - 1][1] + pts[i][1]) / 2;
          ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
        }
        ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},0.08)`;
        ctx.lineWidth = s.width * 3;
        ctx.lineCap = "round";
        ctx.stroke();

        // mid
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const mx = (pts[i - 1][0] + pts[i][0]) / 2;
          const my = (pts[i - 1][1] + pts[i][1]) / 2;
          ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
        }
        ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},0.18)`;
        ctx.lineWidth = s.width;
        ctx.stroke();

        // bright core
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const mx = (pts[i - 1][0] + pts[i][0]) / 2;
          const my = (pts[i - 1][1] + pts[i][1]) / 2;
          ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
        }
        ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},0.55)`;
        ctx.lineWidth = 3;
        ctx.stroke();
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

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

function Stars() {
  const STARS = Array.from({ length: 100 }, (_, i) => ({
    x: (i * 137.508) % 100,
    y: (i * 97.3) % 100,
    r: i % 6 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7,
    delay: (i % 5) * 0.8,
    dur: 2 + (i % 4),
  }));

  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </defs>
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          style={{ animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

function Orbs() {
  return (
    <>
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,40px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(1.05)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.08)} }
      `}</style>

      {/* Top-right violet */}
      <div style={{
        position:"absolute", width:700, height:700,
        top:-250, right:-150,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0.1) 45%, transparent 70%)",
        animation:"float1 10s ease-in-out infinite",
        filter:"blur(20px)",
      }} />

      {/* Center cyan */}
      <div style={{
        position:"absolute", width:500, height:500,
        top:"20%", left:"35%",
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(6,182,212,0.30) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)",
        animation:"float2 13s ease-in-out infinite",
        filter:"blur(25px)",
      }} />

      {/* Bottom-left pink/purple */}
      <div style={{
        position:"absolute", width:600, height:600,
        bottom:-200, left:-150,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(168,85,247,0.38) 0%, rgba(168,85,247,0.08) 45%, transparent 70%)",
        animation:"float3 11s ease-in-out infinite",
        filter:"blur(20px)",
      }} />

      {/* Small accent top-left */}
      <div style={{
        position:"absolute", width:300, height:300,
        top:"10%", left:"10%",
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
        animation:"float2 8s ease-in-out infinite",
        filter:"blur(15px)",
      }} />
    </>
  );
}

function Grid() {
  return (
    <div style={{
      position:"absolute", inset:0,
      backgroundImage:`
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
      backgroundSize:"60px 60px",
    }} />
  );
}

export function HeroBg() {
  return (
    <div style={{ position:"absolute", inset:0, background:"#06070f", overflow:"hidden" }}>
      <Stars />
      <Orbs />
      <Grid />
      <AuroraCanvas />
      {/* bottom fade */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:200,
        background:"linear-gradient(to top, #06070f, transparent)",
      }} />
    </div>
  );
}
