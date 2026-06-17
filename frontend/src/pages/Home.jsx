import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const INDS = ["IT Services","Logistics & Transport","Textiles","Food & Beverages","Pharma","Manufacturing","Real Estate","Finance & Banking","Healthcare","Education","Retail","Construction","Agriculture","Automotive","Chemicals","Media"];

export default function Home() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const f = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); };

  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid";
    if (!form.password) errs.password = "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      toast.success("Welcome back!");
      navigate("/app");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "PENDING_REVIEW") toast("Pending review.", { icon: "⏳" });
      else if (code === "REJECTED") toast.error(err.response?.data?.error || "Rejected.");
      else setErrors({ password: "Invalid email or password" });
    } finally { setLoading(false); }
  };

  const IS = key => ({
    width: "100%", padding: "12px 14px", background: errors[key] ? "#FFF5F5" : "#F8FAFF",
    border: `1.5px solid ${errors[key] ? "#E24B4A" : "#C8D9F0"}`, borderRadius: 12,
    fontFamily: "inherit", fontSize: 14, color: "#0A1628", outline: "none",
    marginBottom: 9, transition: "all .18s", boxSizing: "border-box",
  });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ height: 64, background: "rgba(255,255,255,.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #E2EBF5", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,3.5vw,48px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/home")}>
          <img src="/logo.png" alt="B Square" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0A1628", letterSpacing: "-.4px" }}>B Square</span>
        </div>
        <div style={{ display: "flex", gap: "clamp(10px,2vw,24px)", alignItems: "center" }}>
          {["Mission", "How it works", "Verify"].map(l => (
            <button key={l} style={{ fontSize: 13, fontWeight: 500, color: "#4B6280", background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", padding: 0, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0A1628"}
              onMouseLeave={e => e.currentTarget.style.color = "#4B6280"}>{l}</button>
          ))}
          <button onClick={() => navigate("/register")} style={{ padding: "10px 22px", background: "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 700, borderRadius: 24, cursor: "pointer", transition: "all .18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#0E5DA0"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(24,120,200,.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1878C8"; e.currentTarget.style.boxShadow = "none"; }}>
            Apply Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: window.innerWidth < 768 ? "100%" : "44%", background: "linear-gradient(135deg,#EEF6FF,#DCEEff)", clipPath: "polygon(8% 0,100% 0,100% 100%,0% 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(24,120,200,.05) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div
  style={{
    display: "grid",
    gridTemplateColumns:
      window.innerWidth < 768 ? "1fr" : "1fr auto",
    gap: "clamp(24px,4vw,64px)",
    alignItems: "center",
    padding: "clamp(52px,7vw,88px) clamp(16px,3.5vw,56px)",
    maxWidth: 1140,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  }}
>
          {/* Left */}
          <div style={{ maxWidth: 560, animation: "fadeUp .7s .1s both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#EEF6FF", border: "1.5px solid rgba(24,120,200,.2)", borderRadius: 24, marginBottom: 24 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%" }} />
                <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#22c55e", opacity: .2, animation: "ping 2s infinite" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1878C8", letterSpacing: ".8px", textTransform: "uppercase" }}>Verified B2B · India · Live</span>
            </div>

            <h1 style={{ fontSize: "clamp(38px,5.5vw,60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: .95, color: "#0A1628", marginBottom: 20 }}>
              Find your next<br /><span style={{ background: "linear-gradient(135deg,#1878C8,#3B9EE8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>business match.</span>
            </h1>

            <p style={{ fontSize: "clamp(14px,1.5vw,17px)", color: "#4B6280", lineHeight: 1.72, marginBottom: 34, fontWeight: 400, maxWidth: 460 }}>
              Like Hinge, but for business. Swipe through DIN-verified professionals near you. GPS-powered, manually reviewed.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <button onClick={() => navigate("/register")} style={{ padding: "clamp(13px,1.6vw,16px) clamp(24px,3vw,36px)", background: "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 700, borderRadius: 28, cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0E5DA0"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(24,120,200,.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#1878C8"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                Join B Square →
              </button>
              <button style={{ padding: "clamp(13px,1.6vw,16px) clamp(20px,2.5vw,28px)", background: "transparent", color: "#1878C8", border: "1.5px solid #C2DAFF", fontFamily: "inherit", fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 600, borderRadius: 28, cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#EEF6FF"; e.currentTarget.style.borderColor = "#1878C8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#C2DAFF"; }}>
                How we verify
              </button>
            </div>

            <div style={{ display: "flex", gap: "clamp(20px,3vw,40px)" }}>
              {[["100%", "Verified"], ["GPS", "Proximity"], ["24h", "Review"]].map(([v, l], i) => (
                <div key={l} style={{ paddingLeft: 16, borderLeft: `2px solid ${i === 0 ? "#1878C8" : "#E2EBF5"}` }}>
                  <div style={{ fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, color: "#0A1628", letterSpacing: "-1px", lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#8AACC8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Login card */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(10,22,40,.1),0 2px 8px rgba(24,120,200,.08)", padding: "clamp(24px,3vw,36px)", width: "100%",maxWidth:"330px", flexShrink: 0, position: "relative", overflow: "hidden", animation: "fadeUp .6s .3s both" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "#EEF6FF", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0A1628", letterSpacing: "-.5px", marginBottom: 4 }}>Welcome back.</div>
              <div style={{ fontSize: 12, color: "#8AACC8", fontWeight: 400, marginBottom: 22 }}>Sign in to your verified network</div>
              <form onSubmit={submit}>
                <input type="email" value={form.email} onChange={f("email")} placeholder="your@business.in" style={IS("email")}
                  onFocus={e => { e.target.style.borderColor = "#1878C8"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(24,120,200,.1)"; }}
                  onBlur={e => { if (!errors.email) { e.target.style.borderColor = "#C8D9F0"; e.target.style.background = "#F8FAFF"; e.target.style.boxShadow = "none"; } }} />
                {errors.email && <p style={{ fontSize: 11, color: "#EF4444", marginTop: -6, marginBottom: 8, fontWeight: 500 }}>{errors.email}</p>}
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={f("password")} placeholder="Password" style={{ ...IS("password"), paddingRight: 56 }}
                    onFocus={e => { e.target.style.borderColor = "#1878C8"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(24,120,200,.1)"; }}
                    onBlur={e => { if (!errors.password) { e.target.style.borderColor = "#C8D9F0"; e.target.style.background = "#F8FAFF"; e.target.style.boxShadow = "none"; } }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: 12, background: "transparent", border: "none", fontSize: 10, fontWeight: 700, color: "#8AACC8", fontFamily: "inherit", cursor: "pointer", letterSpacing: ".5px" }}>{showPw ? "HIDE" : "SHOW"}</button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: "#EF4444", marginTop: -6, marginBottom: 8, fontWeight: 500 }}>{errors.password}</p>}
                <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, background: loading ? "rgba(24,120,200,.5)" : "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", margin: "4px 0 14px", transition: "all .18s", letterSpacing: "-.1px" }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#0E5DA0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(24,120,200,.32)"; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#1878C8"; e.currentTarget.style.boxShadow = "none"; } }}>
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </form>
              <div style={{ textAlign: "center", fontSize: 11, color: "#BDD4E8", marginBottom: 12 }}>— or —</div>
              <button onClick={() => navigate("/register")} style={{ width: "100%", padding: 11, background: "transparent", color: "#4B6280", border: "1.5px solid #E2EBF5", borderRadius: 12, fontFamily: "inherit", fontSize: 13, cursor: "pointer", transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C2DAFF"; e.currentTarget.style.color = "#1878C8"; e.currentTarget.style.background = "#EEF6FF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2EBF5"; e.currentTarget.style.color = "#4B6280"; e.currentTarget.style.background = "transparent"; }}>
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div style={{ overflow: "hidden", borderTop: "1px solid #E2EBF5", borderBottom: "1px solid #E2EBF5", padding: "12px 0", background: "#F8FAFF" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 28s linear infinite" }}>
          {[...INDS, ...INDS].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 22px", fontSize: 11, fontWeight: 500, color: "#8AACC8", letterSpacing: ".4px" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1878C8", opacity: .5, display: "inline-block", flexShrink: 0 }} />{item}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "clamp(56px,7vw,88px) clamp(16px,3.5vw,56px)", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#1878C8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14 }}>Our Approach</p>
        <h2 style={{ fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 800, letterSpacing: "-1.5px", color: "#0A1628", marginBottom: 14, lineHeight: 1.1 }}>Built for real connections.</h2>
        <p style={{ fontSize: "clamp(13px,1.4vw,16px)", color: "#4B6280", lineHeight: 1.72, maxWidth: 520, margin: "0 auto 52px" }}>Verify once. Swipe nearby. Connect meaningfully.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { n: "01", icon: "🏛", title: "Verify Identity", desc: "DIN, LinkedIn or succession docs. Manually reviewed within 24 hours." },
            { n: "02", icon: "✉️", title: "Get Notified", desc: "Branded email on approval or rejection with exact reason." },
            { n: "03", icon: "📡", title: "Swipe Nearby", desc: "GPS-powered card stack. Swipe through verified businesses like Hinge." },
            { n: "04", icon: "🤝", title: "Connect & Chat", desc: "Accept → contacts auto-exchanged. Message and do business." },
          ].map((c, i) => (
            <div key={c.n} style={{ background: "#fff", border: "1.5px solid #E2EBF5", borderRadius: 20, padding: "clamp(20px,2.5vw,28px)", textAlign: "left", transition: "all .22s", cursor: "default", position: "relative", overflow: "hidden", animation: `fadeUp .5s ${.1 + i * .07}s both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C2DAFF"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(24,120,200,.1)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2EBF5"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#1878C8", transform: "scaleX(0)", transformOrigin: "left", transition: "transform .3s" }}
                ref={el => { if (el) { const p = el.parentElement; p.addEventListener("mouseenter", () => el.style.transform = "scaleX(1)"); p.addEventListener("mouseleave", () => el.style.transform = "scaleX(0)"); } }} />
              <div style={{ fontSize: 28, marginBottom: 16 }}>{c.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 9, letterSpacing: "-.2px" }}>{c.title}</div>
              <p style={{ fontSize: 13, color: "#4B6280", lineHeight: 1.65, fontWeight: 400 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 clamp(16px,3.5vw,56px) clamp(56px,7vw,88px)", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg,#1878C8,#0E5DA0)", borderRadius: 24, padding: "clamp(40px,5vw,64px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, background: "rgba(255,255,255,.08)", borderRadius: "50%", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 800, letterSpacing: "-1.5px", color: "#fff", marginBottom: 14, lineHeight: 1.1, position: "relative", zIndex: 1 }}>
            Ready to grow your network?
          </h2>
          <p style={{ fontSize: "clamp(13px,1.4vw,16px)", color: "rgba(255,255,255,.75)", marginBottom: 32, fontWeight: 400, lineHeight: 1.7, position: "relative", zIndex: 1 }}>Join verified businesses connecting across India.</p>
          <button onClick={() => navigate("/register")} style={{ padding: "clamp(13px,1.7vw,16px) clamp(28px,4vw,44px)", background: "#fff", color: "#1878C8", border: "none", fontFamily: "inherit", fontSize: "clamp(13px,1.3vw,15px)", fontWeight: 700, borderRadius: 28, cursor: "pointer", transition: "all .2s", position: "relative", zIndex: 1 }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            Get Started — Free →
          </button>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #E2EBF5", padding: "20px clamp(16px,3.5vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img src="/logo.png" alt="" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0A1628", letterSpacing: "-.4px" }}>B Square</span>
        </div>
        <p style={{ fontSize: 12, color: "#8AACC8", fontWeight: 400 }}>© 2026 B Square. All rights reserved.</p>
        <div style={{ display: "flex", gap: 18 }}>
          {["Privacy", "Terms", "Support"].map(item => (
            <span key={item} style={{ fontSize: 12, color: "#8AACC8", cursor: "pointer", transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0A1628"}
              onMouseLeave={e => e.currentTarget.style.color = "#8AACC8"}>{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
