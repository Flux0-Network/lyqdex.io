"use client";

export function PageBg() {
  return (
    <>
      {/* Dark mode only — hidden in light mode */}
      <div className="hidden dark:block fixed inset-0 -z-10 overflow-hidden bg-[#06070f]">
        {/* Large violet orb top-right */}
        <div style={{
          position:"absolute", width:900, height:900,
          top:-300, right:-200,
          borderRadius:"50%",
          background:"radial-gradient(circle, rgba(109,40,217,0.35) 0%, rgba(109,40,217,0.08) 40%, transparent 70%)",
          filter:"blur(40px)",
          animation:"bgFloat1 12s ease-in-out infinite alternate",
        }} />
        {/* Cyan orb center */}
        <div style={{
          position:"absolute", width:700, height:700,
          top:"30%", left:"20%",
          borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.04) 45%, transparent 70%)",
          filter:"blur(60px)",
          animation:"bgFloat2 15s ease-in-out infinite alternate",
        }} />
        {/* Purple orb bottom-left */}
        <div style={{
          position:"absolute", width:800, height:800,
          bottom:-250, left:-200,
          borderRadius:"50%",
          background:"radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)",
          filter:"blur(50px)",
          animation:"bgFloat3 10s ease-in-out infinite alternate",
        }} />
        {/* Pink accent right-center */}
        <div style={{
          position:"absolute", width:500, height:500,
          top:"55%", right:"5%",
          borderRadius:"50%",
          background:"radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 70%)",
          filter:"blur(40px)",
          animation:"bgFloat1 18s ease-in-out infinite alternate-reverse",
        }} />
        {/* Subtle grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:`
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize:"80px 80px",
        }} />
        {/* Stars */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
          <defs><style>{`@keyframes tw{0%,100%{opacity:.08}50%{opacity:.5}}`}</style></defs>
          {Array.from({length:120},(_,i)=>({
            x:(i*137.508)%100, y:(i*97.3)%100,
            r:i%7===0?1.8:i%3===0?1.1:0.6,
            d:1.5+(i%5)*0.7, delay:(i%6)*0.5,
          })).map((s,i)=>(
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
              style={{animation:`tw ${s.d}s ${s.delay}s ease-in-out infinite`}}/>
          ))}
        </svg>
        <style>{`
          @keyframes bgFloat1{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,60px) scale(1.1)}}
          @keyframes bgFloat2{from{transform:translate(0,0)}to{transform:translate(-50px,40px)}}
          @keyframes bgFloat3{from{transform:translate(0,0) scale(1)}to{transform:translate(30px,-50px) scale(1.08)}}
        `}</style>
      </div>

      {/* Light mode bg */}
      <div className="dark:hidden fixed inset-0 -z-10 bg-white" />
    </>
  );
}
