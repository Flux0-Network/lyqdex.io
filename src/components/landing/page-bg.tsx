"use client";

export function PageBg() {
  return (
    <>
      {/* Dark mode only — hidden in light mode */}
      <div className="hidden dark:block fixed inset-0 -z-10 overflow-hidden" style={{ background: "#08010f" }}>

        {/* Main purple radial gradient — center top, like Galxe */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% -5%, #6d28d9 0%, #4c1d95 25%, #1e0a3c 55%, #08010f 80%)",
        }} />

        {/* Secondary violet bloom left */}
        <div style={{
          position: "absolute",
          width: 800, height: 800,
          top: "10%", left: "-10%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.30) 0%, transparent 65%)",
          filter: "blur(60px)",
          animation: "bgDrift1 14s ease-in-out infinite alternate",
        }} />

        {/* Cyan accent right */}
        <div style={{
          position: "absolute",
          width: 600, height: 600,
          top: "5%", right: "-5%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.20) 0%, transparent 65%)",
          filter: "blur(70px)",
          animation: "bgDrift2 18s ease-in-out infinite alternate",
        }} />

        {/* Deep pink accent bottom */}
        <div style={{
          position: "absolute",
          width: 700, height: 500,
          bottom: "0%", left: "30%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "bgDrift3 20s ease-in-out infinite alternate",
        }} />

        <style>{`
          @keyframes bgDrift1 { from{transform:translate(0,0)} to{transform:translate(60px,40px)} }
          @keyframes bgDrift2 { from{transform:translate(0,0)} to{transform:translate(-40px,60px)} }
          @keyframes bgDrift3 { from{transform:translate(0,0)} to{transform:translate(30px,-40px)} }
        `}</style>
      </div>

    </>
  );
}
