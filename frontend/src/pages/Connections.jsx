import { useState, useEffect, useCallback } from "react";
import { connectionsAPI } from "../api";
import ProfileModal from "../components/ProfileModal";
import toast from "react-hot-toast";

const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const PALETTE = ["var(--blue)","var(--green)","var(--lime)","var(--amber)","var(--rose)","var(--violet)"];
const getC = n => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];
const mono = { fontFamily: "'JetBrains Mono',monospace" };

export default function Connections({ onOpenChat }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await connectionsAPI.list(); setConnections(data.connections); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (userId, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    setRemoving(userId);
    try { await connectionsAPI.remove(userId); await load(); toast.success("Removed."); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setRemoving(null); }
  };

  if (loading) return (
    <div style={{ paddingTop: 24 }}>
      <div className="sk" style={{ height: 28, width: 200, marginBottom: 20 }} />
      {[...Array(4)].map((_, i) => <div key={i} className="sk" style={{ height: 64, marginBottom: "1px" }} />)}
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease", paddingTop: 24 }}>
      <div style={{ padding: "0 0 20px" }}>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(24px,4vw,40px)", letterSpacing: "-2px", marginBottom: 4 }}>Your Connections</h1>
        <p style={{ ...mono, fontSize: 10, color: "var(--t3)", letterSpacing: "1px", textTransform: "uppercase" }}>{connections.length} verified business connection{connections.length !== 1 ? "s" : ""}</p>
      </div>

      {connections.length === 0 ? (
        <div style={{ padding: "clamp(36px,5vw,56px)", textAlign: "center", border: "1px solid var(--b)", background: "var(--s1)" }}>
          <div style={{ fontWeight: 900, fontSize: "clamp(22px,4vw,36px)", letterSpacing: "-1.5px", color: "var(--t2)", marginBottom: 8 }}>No Connections Yet</div>
          <p style={{ ...mono, fontSize: 10, color: "var(--t3)", letterSpacing: ".5px" }}>Find nearby businesses and connect.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {connections.map((c, idx) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "50px 1fr auto", borderBottom: "1px solid var(--b)", background: "var(--bg)", transition: "background .15s", position: "relative", overflow: "hidden", animation: `fadeUp .4s ease ${idx * 0.05}s both` }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--s1)"; const line = e.currentTarget.querySelector(".cl"); if (line) line.style.width = "2px"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; const line = e.currentTarget.querySelector(".cl"); if (line) line.style.width = "0"; }}>
              <div className="cl" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 0, background: "var(--lime)", transition: "width .22s" }} />
              <div style={{ padding: "clamp(10px,1.5vw,14px) 0 clamp(10px,1.5vw,14px) clamp(10px,1.5vw,14px)", display: "flex", alignItems: "center" }}>
                <div onClick={() => setProfileId(c.id)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, letterSpacing: "-.3px", border: "1px solid", borderColor: `${getC(c.name)}30`, background: `${getC(c.name)}12`, color: getC(c.name), cursor: "pointer", transition: "transform .15s", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  {initials(c.name)}
                </div>
              </div>
              <div style={{ padding: "clamp(10px,1.5vw,14px)" }}>
                <div onClick={() => setProfileId(c.id)} style={{ fontWeight: 600, fontSize: "clamp(13px,1.4vw,15px)", letterSpacing: "-.3px", marginBottom: 4, cursor: "pointer", transition: "color .15s", display: "inline-block" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--lime)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--t)"}>
                  {c.name}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ ...mono, fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "1px" }}>{c.industry || "Business"}</span>
                  <span style={{ ...mono, fontSize: 9, color: "var(--t2)" }}>↗ {c.email}</span>
                  <span style={{ ...mono, fontSize: 9, color: "var(--t2)" }}>☎ {c.phone}</span>
                  <span style={{ ...mono, fontSize: 9, color: "var(--t3)" }}>📍 {c.city}</span>
                </div>
              </div>
              <div style={{ padding: "clamp(10px,1.5vw,14px)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                <button onClick={() => setProfileId(c.id)} style={{ padding: "6px 12px", background: "var(--s2)", color: "var(--t2)", border: "1px solid var(--b)", fontFamily: "inherit", fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--s3)"; e.currentTarget.style.color = "var(--t)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--s2)"; e.currentTarget.style.color = "var(--t2)"; }}>Profile</button>
                <button onClick={() => onOpenChat(c)} style={{ padding: "6px 12px", background: "var(--lime)", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--t)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--lime)"}>Message</button>
                <button onClick={() => remove(c.id, c.name)} disabled={removing === c.id} style={{ padding: "6px 10px", background: "transparent", color: "rgba(255,61,61,.5)", border: "1px solid rgba(255,61,61,.15)", fontFamily: "inherit", fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,61,61,.08)"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,61,61,.5)"; }}>
                  {removing === c.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProfileModal userId={profileId} onClose={() => setProfileId(null)} onOpenChat={onOpenChat} onRemove={remove} isConnected={true} />
    </div>
  );
}
