import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);
  const [vis, setVis] = useState(false);

  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 7 + 2;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setPct(Math.floor(p));
    }, 110);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (pct >= 100) {
      setTimeout(() => {
        document.body.style.transition = "opacity .4s ease";
        document.body.style.opacity = "0";
        setTimeout(() => { document.body.style.opacity = ""; document.body.style.transition = ""; navigate("/home"); }, 400);
      }, 600);
    }
  }, [pct, navigate]);

  const T = (d) => ({ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)", transition: `opacity .6s ${d}s, transform .6s ${d}s` });

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Soft radial glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(24,120,200,.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* Subtle rings */}
      {[320, 230, 160].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: s, height: s, border: "1px solid rgba(24,120,200,.07)", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      ))}

      {/* Glass card */}
      <div style={{ background: "rgba(255,255,255,.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(24,120,200,.15)", borderRadius: 28, padding: "clamp(32px,5vw,52px) clamp(36px,6vw,60px)", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 20px 60px rgba(10,22,40,.1),0 2px 8px rgba(24,120,200,.08),inset 0 1px 0 rgba(255,255,255,.9)", position: "relative", zIndex: 2, minWidth: 260 }}>

        {/* Logo */}
        <div style={{ position: "relative", width: 90, height: 90, marginBottom: 24, opacity: vis ? 1 : 0, transform: vis ? "scale(1) rotate(0)" : "scale(.5) rotate(-8deg)", transition: "opacity .9s .15s cubic-bezier(.16,1,.3,1), transform .9s .15s cubic-bezier(.16,1,.3,1)" }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(24,120,200,.22), transparent 65%)" }} />
          <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "1.5px solid rgba(24,120,200,.2)", animation: "rippleOut 2.5s ease-out .8s infinite" }} />
          <img src="/logo.png" alt="B Square" style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 12px rgba(24,120,200,.3))" }} />
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: "#0A1628", letterSpacing: "-.5px", marginBottom: 4, ...T(.55) }}>B Square</div>
        <div style={{ fontSize: 11, color: "#8AACC8", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 28, ...T(.7) }}>Business · Verified · Nearby</div>

        {/* Progress bar */}
        <div style={{ width: 160, height: 3, background: "#EEF2F8", borderRadius: 2, overflow: "hidden", ...T(.85) }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#0E5DA0,#1878C8,#3B9EE8)", borderRadius: 2, width: pct + "%", transition: "width .15s ease" }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1878C8", marginTop: 10, letterSpacing: ".3px", ...T(.95) }}>
          {pct >= 100 ? "Ready ✓" : `${pct}%`}
        </div>
      </div>
      <style>{`@keyframes rippleOut{0%{transform:scale(.7);opacity:.5}100%{transform:scale(2.6);opacity:0}}`}</style>
    </div>
  );
}
