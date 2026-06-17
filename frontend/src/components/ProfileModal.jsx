import { useState, useEffect } from "react";
import { usersAPI } from "../api";
import toast from "react-hot-toast";

const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const PALETTE = ["var(--blue)","var(--green)","var(--lime)","var(--amber)","var(--rose)","var(--violet)"];
const getC = n => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];
const mono = { fontFamily: "'JetBrains Mono',monospace" };

const KF = `
@keyframes pm-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pm-in{from{opacity:0}to{opacity:1}}
@keyframes pm-tag{from{opacity:0;transform:scale(0.6) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes pm-scan{from{top:-1px}to{top:100%}}
`;

const GOAL_MAP = { clients:"Find new clients", vendors:"Find vendors / suppliers", partnership:"Form partnerships", investment:"Raise investment", distribution:"Expand distribution", networking:"General networking" };

export default function ProfileModal({ userId, onClose, onOpenChat, onRemove, isConnected }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remState, setRemState] = useState("idle");
  const [msgState, setMsgState] = useState("idle");

  useEffect(() => {
    if (!userId) return;
    setLoading(true); setRemState("idle"); setMsgState("idle");
    usersAPI.profile(userId)
      .then(({ data }) => setUser(data.user))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const c = getC(user?.name || "");

  return (
    <>
      <style>{KF}</style>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "1rem", animation: "pm-in .2s ease" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b2)", width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", animation: "pm-up .45s cubic-bezier(.16,1,.3,1) both", position: "relative", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
          {/* Scan */}
          <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(24,120,200,.4),transparent)", animation: "pm-scan 4s linear infinite", zIndex: 5, pointerEvents: "none" }} />

          {loading ? (
            <div style={{ padding: "2.5rem", textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: "-2px", color: "var(--t2)", animation: "pm-float 2s infinite" }}>B²</div>
            </div>
          ) : user ? (
            <>
              {/* Header */}
              <div style={{ background: "var(--s2)", padding: "20px", borderBottom: "1px solid var(--b)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: -16, right: -6, fontWeight: 900, fontSize: 80, letterSpacing: "-4px", color: "rgba(255,255,255,.025)", pointerEvents: "none", lineHeight: 1 }}>B²</div>
                <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "var(--s3)", border: "1px solid var(--b)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)", fontSize: 14, fontFamily: "inherit", transition: "all .2s", zIndex: 2 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--lime)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--s3)"; e.currentTarget.style.color = "var(--t2)"; }}>×</button>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 56, height: 56, border: "1px solid", borderColor: `${c}35`, background: `${c}12`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, letterSpacing: "-.5px", color: c, flexShrink: 0, animation: "pm-float 3s ease-in-out infinite" }}>
                    {initials(user.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "clamp(16px,2vw,20px)", letterSpacing: "-0.8px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                    {user.founder_name && <div style={{ ...mono, fontSize: 10, color: "var(--t2)", letterSpacing: ".3px", marginBottom: 8 }}>{user.founder_name}</div>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {user.industry && <span style={{ ...mono, fontSize: 8, color: c, border: `1px solid ${c}30`, padding: "2px 7px", letterSpacing: "1.5px", textTransform: "uppercase" }}>{user.industry}</span>}
                      <span style={{ ...mono, fontSize: 8, color: "var(--green)", border: "1px solid rgba(57,217,138,.25)", padding: "2px 7px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                        {user.verification_type === "din" ? "DIN ✓" : user.verification_type === "linkedin" ? "LI ✓" : "SUC ✓"}
                      </span>
                      {user.city && <span style={{ ...mono, fontSize: 8, color: "var(--t3)", border: "1px solid var(--b)", padding: "2px 7px", letterSpacing: "1px" }}>📍 {user.city}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "18px 20px" }}>
                {/* Bio */}
                {user.bio && <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65, fontWeight: 300, marginBottom: 16 }}>{user.bio}</p>}

                {/* Stats */}
                {(user.company_size || user.year_founded || user.revenue_range) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--b)", marginBottom: 16 }}>
                    {[[user.company_size, "Team"], [user.year_founded, "Founded"], [user.revenue_range, "Revenue"]].filter(([v]) => v).map(([val, label]) => (
                      <div key={label} style={{ background: "var(--s2)", padding: "10px 8px", textAlign: "center", transition: "background .18s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--s3)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--s2)"}>
                        <div style={{ fontWeight: 700, fontSize: "clamp(13px,1.5vw,16px)", letterSpacing: "-.5px", lineHeight: 1, marginBottom: 4 }}>{val}</div>
                        <div style={{ ...mono, fontSize: 8, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ height: 1, background: "var(--b)", margin: "4px 0 14px" }} />

                {/* Contact */}
                {isConnected && (user.email || user.phone) && (
                  <div style={{ background: "rgba(57,217,138,.06)", border: "1px solid rgba(57,217,138,.18)", padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ ...mono, fontSize: 8, color: "var(--green)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 9 }}>Contact</div>
                    {user.email && <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--t2)", fontWeight: 400, padding: "3px 0" }}><span style={{ color: "var(--green)" }}>↗</span>{user.email}</div>}
                    {user.phone && <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--t2)", fontWeight: 400, padding: "3px 0" }}><span style={{ color: "var(--green)" }}>☎</span>{user.phone}</div>}
                  </div>
                )}

                {/* Tags */}
                {user.looking_for?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ ...mono, fontSize: 8, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 9 }}>Looking to connect with</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {user.looking_for.map((item, i) => (
                        <span key={item} style={{ ...mono, fontSize: 9, color: "var(--blue)", border: "1px solid rgba(77,158,255,.22)", background: "rgba(77,158,255,.06)", padding: "4px 9px", textTransform: "uppercase", letterSpacing: "1px", transition: "all .18s", animation: `pm-tag .3s ${.4 + i * .04}s both`, cursor: "default" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(77,158,255,.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(77,158,255,.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.business_interests?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ ...mono, fontSize: 8, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 9 }}>Business interests</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {user.business_interests.map((item, i) => (
                        <span key={item} style={{ ...mono, fontSize: 9, color: "var(--violet)", border: "1px solid rgba(196,181,253,.22)", background: "rgba(196,181,253,.06)", padding: "4px 9px", textTransform: "uppercase", letterSpacing: "1px", transition: "all .18s", animation: `pm-tag .3s ${.5 + i * .04}s both`, cursor: "default" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,181,253,.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,181,253,.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.business_goal && (
                  <div style={{ background: "rgba(24,120,200,.05)", border: "1px solid rgba(24,120,200,.15)", padding: "11px 14px", marginBottom: 16, position: "relative", cursor: "default", transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(24,120,200,.09)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(24,120,200,.05)"}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--lime)" }} />
                    <div style={{ ...mono, fontSize: 8, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 5 }}>Primary Goal</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lime)", letterSpacing: "-.2px" }}>{GOAL_MAP[user.business_goal] || user.business_goal}</div>
                  </div>
                )}

                {/* Actions */}
                {isConnected && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={() => { setMsgState("loading"); setTimeout(() => { onOpenChat({ id: user.id, name: user.name, industry: user.industry }); onClose(); }, 280); }}
                      style={{ padding: 12, background: "var(--lime)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", letterSpacing: ".3px", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--t)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--lime)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      {msgState === "loading" ? "Opening..." : "Message"}
                    </button>
                    <button onClick={() => { if (remState === "confirm") { onRemove(user.id, user.name); onClose(); } else { setRemState("confirm"); setTimeout(() => setRemState("idle"), 2200); } }}
                      style={{ padding: 12, background: "transparent", color: remState === "confirm" ? "var(--red)" : "rgba(255,61,61,.5)", border: `1px solid ${remState === "confirm" ? "rgba(255,61,61,.4)" : "rgba(255,61,61,.18)"}`, fontSize: remState === "confirm" ? 11 : 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,61,61,.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      {remState === "confirm" ? "Confirm remove?" : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : <div style={{ padding: "2rem", textAlign: "center", ...mono, fontSize: 10, color: "var(--t3)" }}>Profile not found</div>}
        </div>
      </div>
    </>
  );
}
