import { useState, useEffect } from "react";
import { connectionsAPI } from "../api";
import toast from "react-hot-toast";

const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const PALETTE = ["var(--blue)","var(--green)","var(--lime)","var(--amber)","var(--rose)","var(--violet)"];
const getC = n => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];
const mono = { fontFamily: "'JetBrains Mono',monospace" };

export default function Requests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(new Set());

  useEffect(() => {
    Promise.all([connectionsAPI.receivedRequests(), connectionsAPI.sentRequests()])
      .then(([r, s]) => { setReceived(r.data.requests); setSent(s.data.requests); })
      .catch(() => toast.error("Failed")).finally(() => setLoading(false));
  }, []);

  const act = id => setPending(p => new Set([...p, id]));
  const done = id => setPending(p => { const n = new Set(p); n.delete(id); return n; });

  const accept = async req => {
    act(req.request_id);
    try { const { data } = await connectionsAPI.acceptRequest(req.request_id); toast.success(data.message); setReceived(p => p.filter(r => r.request_id !== req.request_id)); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { done(req.request_id); }
  };
  const decline = async req => {
    act(req.request_id);
    try { await connectionsAPI.declineRequest(req.request_id); toast.success("Declined"); setReceived(p => p.filter(r => r.request_id !== req.request_id)); }
    catch { toast.error("Failed"); } finally { done(req.request_id); }
  };
  const cancel = async req => {
    act(req.request_id);
    try { await connectionsAPI.cancelRequest(req.request_id); toast.success("Cancelled"); setSent(p => p.filter(r => r.request_id !== req.request_id)); }
    catch { toast.error("Failed"); } finally { done(req.request_id); }
  };

  if (loading) return <div style={{ paddingTop: 24 }}><div className="sk" style={{ height: 28, width: 180, marginBottom: 20 }} />{[...Array(3)].map((_, i) => <div key={i} className="sk" style={{ height: 60, marginBottom: "1px" }} />)}</div>;

  const Row = ({ r, children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "50px 1fr auto", borderBottom: "1px solid var(--b)", background: "var(--bg)", transition: "background .15s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--s1)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}>
      <div style={{ padding: "clamp(10px,1.5vw,14px) 0 clamp(10px,1.5vw,14px) clamp(10px,1.5vw,14px)", display: "flex", alignItems: "center" }}>
        <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, border: "1px solid", borderColor: `${getC(r.name)}30`, background: `${getC(r.name)}12`, color: getC(r.name), flexShrink: 0 }}>
          {initials(r.name)}
        </div>
      </div>
      <div style={{ padding: "clamp(10px,1.5vw,14px)" }}>
        <div style={{ fontWeight: 600, fontSize: "clamp(13px,1.4vw,15px)", letterSpacing: "-.3px", marginBottom: 4 }}>{r.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ ...mono, fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "1px" }}>{r.industry || "Business"}</span>
          <span style={{ ...mono, fontSize: 9, color: "var(--t3)" }}>· {r.city}</span>
        </div>
      </div>
      <div style={{ padding: "clamp(10px,1.5vw,14px)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>{children}</div>
    </div>
  );

  const SectionHead = ({ label, count, color = "var(--t)" }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--b)", display: "flex", alignItems: "center", gap: 12, marginBottom: 0 }}>
      <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-.2px" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color, letterSpacing: "-0.5px" }}>{count}</span>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease", paddingTop: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: "clamp(24px,4vw,40px)", letterSpacing: "-2px", marginBottom: 24 }}>Requests</h1>

      {received.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead label="Received" count={received.length} color="var(--lime)" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {received.map(r => (
              <Row key={r.request_id} r={r}>
                <button disabled={pending.has(r.request_id)} onClick={() => accept(r)}
                  style={{ padding: "7px 14px", background: "rgba(57,217,138,.1)", color: "var(--green)", border: "1px solid rgba(57,217,138,.22)", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { if (!pending.has(r.request_id)) e.currentTarget.style.background = "rgba(57,217,138,.2)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(57,217,138,.1)"}>
                  {pending.has(r.request_id) ? "..." : "Accept"}
                </button>
                <button disabled={pending.has(r.request_id)} onClick={() => decline(r)}
                  style={{ padding: "7px 12px", background: "transparent", color: "var(--t3)", border: "1px solid var(--b)", fontFamily: "inherit", fontSize: 11, fontWeight: 500, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--b2)"; e.currentTarget.style.color = "var(--t)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b)"; e.currentTarget.style.color = "var(--t3)"; }}>
                  Decline
                </button>
              </Row>
            ))}
          </div>
        </div>
      )}

      {sent.length > 0 && (
        <div>
          <SectionHead label="Sent" count={sent.length} color="var(--t2)" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sent.map(r => (
              <Row key={r.request_id} r={r}>
                <span style={{ ...mono, fontSize: 9, color: "var(--t3)", border: "1px solid var(--b)", padding: "5px 10px", textTransform: "uppercase", letterSpacing: "1px" }}>Pending</span>
                <button disabled={pending.has(r.request_id)} onClick={() => cancel(r)}
                  style={{ padding: "6px 12px", background: "transparent", color: "rgba(255,61,61,.5)", border: "none", fontFamily: "inherit", fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "rgba(255,61,61,.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,61,61,.5)"; e.currentTarget.style.background = "transparent"; }}>
                  Cancel
                </button>
              </Row>
            ))}
          </div>
        </div>
      )}

      {received.length === 0 && sent.length === 0 && (
        <div style={{ padding: "clamp(36px,5vw,56px)", textAlign: "center", border: "1px solid var(--b)", background: "var(--s1)" }}>
          <div style={{ fontWeight: 900, fontSize: "clamp(22px,4vw,36px)", letterSpacing: "-1.5px", color: "var(--t2)", marginBottom: 8 }}>No Pending Requests</div>
          <p style={{ ...mono, fontSize: 10, color: "var(--t3)", letterSpacing: ".5px" }}>Start connecting with nearby businesses.</p>
        </div>
      )}
    </div>
  );
}
