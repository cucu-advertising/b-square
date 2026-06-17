import { useState, useEffect, useRef, useCallback } from "react";
import { messagesAPI } from "../api";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const mono = { fontFamily: "'JetBrains Mono',monospace" };
const PALETTE = ["var(--blue)","var(--green)","var(--lime)","var(--amber)","var(--rose)","var(--violet)"];
const getC = n => PALETTE[(n?.charCodeAt(0) || 0) % PALETTE.length];

export default function ChatModal({ target, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try { const { data } = await messagesAPI.getConversation(target.id); setMessages(data.messages); }
    catch { if (!silent) toast.error("Failed to load messages"); }
    finally { if (!silent) setLoading(false); }
  }, [target.id]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 4000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    const opt = { id: "tmp-" + Date.now(), sender_id: user.id, receiver_id: target.id, content: text, created_at: new Date().toISOString(), is_system: false };
    setMessages(p => [...p, opt]); setInput("");
    try { await messagesAPI.send(target.id, text); fetchMessages(true); }
    catch { setMessages(p => p.filter(m => m.id !== opt.id)); setInput(text); toast.error("Failed"); }
    finally { setSending(false); }
  };

  const fmtTime = ts => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = ts => { const d = new Date(ts), t = new Date(); if (d.toDateString() === t.toDateString()) return "Today"; const y = new Date(t); y.setDate(t.getDate() - 1); if (d.toDateString() === y.toDateString()) return "Yesterday"; return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };

  const grouped = messages.reduce((acc, m) => { const date = fmtDate(m.created_at); if (!acc[date]) acc[date] = []; acc[date].push(m); return acc; }, {});

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "clamp(10px,2vw,20px)", zIndex: 1000, animation: "fadeIn .2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(400px,95vw)", maxHeight: "78vh", background: "var(--s1)", border: "1px solid var(--b2)", display: "flex", flexDirection: "column", animation: "fadeUp .25s ease", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
        {/* Header */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--b)", display: "flex", gap: 10, alignItems: "center", background: "var(--s2)", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, border: "1px solid", borderColor: `${getC(target.name)}35`, background: `${getC(target.name)}12`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: getC(target.name), flexShrink: 0 }}>{initials(target.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{target.name}</div>
            <div style={{ ...mono, fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "1px" }}>{target.industry}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--s3)", border: "1px solid var(--b)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)", fontSize: 14, transition: "all .2s", flexShrink: 0, fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--lime)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--s3)"; e.currentTarget.style.color = "var(--t2)"; }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", background: "var(--bg)" }}>
          {loading ? <div style={{ textAlign: "center", paddingTop: 40, ...mono, fontSize: 10, color: "var(--t3)", letterSpacing: "1px", textTransform: "uppercase" }}>Loading...</div>
            : messages.length === 0 ? <div style={{ textAlign: "center", paddingTop: 50 }}><div style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-1.5px", color: "var(--t2)", marginBottom: 6 }}>Start talking.</div><p style={{ ...mono, fontSize: 10, color: "var(--t3)", letterSpacing: ".5px" }}>Your first message with {target.name}</p></div>
            : Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <span style={{ ...mono, fontSize: 8, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "2px", border: "1px solid var(--b)", padding: "3px 10px" }}>{date}</span>
                </div>
                {msgs.map(m => {
                  const isMe = m.sender_id === user.id;
                  if (m.is_system) return (
                    <div key={m.id} style={{ textAlign: "center", margin: "10px 0" }}>
                      <div style={{ background: "rgba(57,217,138,.08)", border: "1px solid rgba(57,217,138,.18)", padding: "8px 12px", display: "inline-block", maxWidth: "90%", textAlign: "left" }}>
                        <p style={{ fontSize: 12, color: "var(--green)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line", fontWeight: 400 }}>{m.content}</p>
                      </div>
                    </div>
                  );
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8 }}>
                      <div style={{ maxWidth: "74%", padding: "9px 12px", background: isMe ? "var(--lime)" : "var(--s2)", color: isMe ? "#fff" : "var(--t)", fontSize: 13.5, lineHeight: 1.55, fontWeight: isMe ? 500 : 400, border: isMe ? "none" : "1px solid var(--b)" }}>
                        <p style={{ margin: 0 }}>{m.content}</p>
                        <p style={{ ...mono, fontSize: 9, color: isMe ? "rgba(255,255,255,.65)" : "var(--t3)", marginTop: 5, textAlign: "right", letterSpacing: ".3px" }}>{fmtTime(m.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--b)", display: "flex", gap: 7, background: "var(--s1)", flexShrink: 0 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Type a message..." style={{ flex: 1, padding: "9px 12px", background: "var(--s2)", border: "1px solid var(--b)", color: "var(--t)", fontFamily: "inherit", fontSize: 13.5, outline: "none", transition: "border-color .15s" }}
            onFocus={e => e.target.style.borderColor = "var(--b2)"}
            onBlur={e => e.target.style.borderColor = "var(--b)"} />
          <button onClick={send} disabled={!input.trim() || sending}
            style={{ padding: "9px 16px", background: input.trim() ? "var(--lime)" : "var(--s3)", color: input.trim() ? "#fff" : "var(--t3)", border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed", letterSpacing: ".3px", transition: "all .15s" }}
            onMouseEnter={e => { if (input.trim()) e.currentTarget.style.background = "var(--t)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = input.trim() ? "var(--lime)" : "var(--s3)"; }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
