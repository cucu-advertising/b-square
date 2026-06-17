import { useState, useEffect, useCallback } from "react";
import { eventsAPI } from "../api";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const COLORS = ["#1878C8", "#0E5DA0", "#1D6B3A", "#B45309", "#6D28D9", "#0E5DA0"];
const getColor = n => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];
const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

const TYPES = [
  { id: "sale", label: "Sale & Promo", icon: "🏷️", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "launch", label: "Launch", icon: "🚀", color: "#1878C8", bg: "#EEF6FF", border: "#C2DAFF" },
  { id: "webinar", label: "Webinar", icon: "🎓", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "networking", label: "Networking", icon: "🤝", color: "#15803d", bg: "#F0FDF4", border: "#BBF7D0" },
  { id: "announcement", label: "Announcement", icon: "📢", color: "#BE185D", bg: "#FDF2F8", border: "#FBCFE8" },
  { id: "other", label: "Other", icon: "📅", color: "#4B6280", bg: "#F5F8FC", border: "#E2EBF5" },
];
const typeMeta = id => TYPES.find(t => t.id === id) || TYPES[TYPES.length - 1];

function fmtDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

const VerBadge = ({ type }) => {
  const m = { din: ["#1878C8", "#EEF6FF", "DIN ✓"], linkedin: ["#1D6B3A", "#EDFAF2", "LI ✓"], succession: ["#B45309", "#FFF8EE", "SUC ✓"] };
  const [c, bg, l] = m[type] || ["#8AACC8", "#F5F8FC", "✓"];
  return <span style={{ fontSize: 9, fontWeight: 700, color: c, background: bg, padding: "2px 7px", borderRadius: 20, border: `1px solid ${c}30`, whiteSpace: "nowrap" }}>{l}</span>;
};

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_type: "sale", event_date: "", location: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await eventsAPI.list(); setEvents(data.events || []); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to load events"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Add a title");
    if (!form.event_date) return toast.error("Pick a date & time");
    setSubmitting(true);
    try {
      const { data } = await eventsAPI.create(form);
      toast.success(data.message);
      setEvents(prev => [data.event, ...prev].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setForm({ title: "", description: "", event_type: "sale", event_date: "", location: "" });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.error || "Failed to post event"); }
    finally { setSubmitting(false); }
  };

  const remove = async id => {
    try { await eventsAPI.remove(id); setEvents(prev => prev.filter(e => e.id !== id)); toast.success("Event removed"); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const now = Date.now();
  const upcoming = events.filter(e => new Date(e.event_date).getTime() >= now);
  const past = events.filter(e => new Date(e.event_date).getTime() < now);

  const inputStyle = { width: "100%", padding: "9px 12px", background: "#F8FAFF", border: "1.5px solid #E2EBF5", borderRadius: 10, fontSize: 13, color: "#0A1628", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "all .15s" };
  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = "#C2DAFF"; e.target.style.background = "#fff"; },
    onBlur: e => { e.target.style.borderColor = "#E2EBF5"; e.target.style.background = "#F8FAFF"; },
  };

  const Card = ({ ev }) => {
    const tm = typeMeta(ev.event_type);
    const mine = ev.user_id === user?.id;
    const isPast = new Date(ev.event_date).getTime() < now;
    return (
      <div style={{ background: "#fff", border: "1px solid #E2EBF5", borderRadius: 16, padding: "16px 18px", marginBottom: 12, opacity: isPast ? .6 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${getColor(ev.business_name)}15`, border: `1px solid ${getColor(ev.business_name)}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: getColor(ev.business_name) }}>
              {initials(ev.business_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0A1628", letterSpacing: "-.2px" }}>{ev.business_name}</span>
                <VerBadge type={ev.verification_type} />
              </div>
              <div style={{ fontSize: 10.5, color: "#8AACC8", fontWeight: 500, marginTop: 1 }}>{ev.industry || "Business"}{ev.city ? ` · ${ev.city}` : ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: tm.color, background: tm.bg, border: `1px solid ${tm.border}`, padding: "3px 9px", borderRadius: 20, letterSpacing: ".4px", whiteSpace: "nowrap" }}>{tm.icon} {tm.label}</span>
            <span style={{ fontSize: 10.5, color: "#4B6280", fontWeight: 600, whiteSpace: "nowrap" }}>{isPast ? "Ended" : "📅"} {fmtDate(ev.event_date)}</span>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0A1628", letterSpacing: "-.3px", marginBottom: ev.description || ev.location ? 6 : 0 }}>{ev.title}</div>
        {ev.description && <p style={{ fontSize: 13, color: "#4B6280", lineHeight: 1.6, marginBottom: ev.location ? 8 : 0 }}>{ev.description}</p>}
        {ev.location && <div style={{ fontSize: 12, color: "#8AACC8", fontWeight: 500 }}>📍 {ev.location}</div>}
        {mine && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0F4FA", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => remove(ev.id)} style={{ padding: "5px 12px", background: "transparent", color: "rgba(239,68,68,.6)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.08)"; e.currentTarget.style.color = "#EF4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,.6)"; }}>
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ animation: "fadeUp .4s ease", padding: "clamp(16px,2.5vw,24px) 0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 4, color: "#0A1628" }}>Events</h1>
          <p style={{ fontSize: 12, color: "#8AACC8", fontWeight: 500 }}>{loading ? "Loading..." : events.length === 0 ? "No events yet — be the first to post one" : `${upcoming.length} upcoming · ${events.length} total`}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: "10px 20px", background: showForm ? "#F5F8FC" : "#1878C8", color: showForm ? "#4B6280" : "#fff", border: `1.5px solid ${showForm ? "#E2EBF5" : "#1878C8"}`, borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", whiteSpace: "nowrap" }}>
          {showForm ? "✕ Cancel" : "+ Post Event"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1.5px solid #C2DAFF", borderRadius: 16, padding: "18px 20px", marginBottom: 20, animation: "cardIn .3s ease" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0A1628", letterSpacing: "-.3px", marginBottom: 14 }}>Post a new event</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Event Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Festive Season Sale — 20% off all services" style={inputStyle} {...focusHandlers} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Type</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, event_type: t.id }))} type="button"
                  style={{ padding: "6px 12px", borderRadius: 18, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all .15s", border: `1.5px solid ${form.event_type === t.id ? t.color : t.border}`, background: form.event_type === t.id ? t.color : t.bg, color: form.event_type === t.id ? "#fff" : t.color }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Date &amp; Time</label>
              <input type="datetime-local" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} style={inputStyle} {...focusHandlers} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Location <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Online / Hyderabad office" style={inputStyle} {...focusHandlers} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Description <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell people what to expect, any promo codes, RSVP details..." rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} {...focusHandlers} />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 18px", background: "transparent", color: "#8AACC8", border: "1.5px solid #E2EBF5", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={submit} disabled={submitting} style={{ padding: "9px 22px", background: "#1878C8", color: "#fff", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: submitting ? "default" : "pointer", fontFamily: "inherit", opacity: submitting ? .7 : 1 }}>
              {submitting ? "Posting..." : "Post Event"}
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E2EBF5", borderTop: "3px solid #1878C8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 12, color: "#8AACC8" }}>Loading events...</span>
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "clamp(48px,6vw,80px) 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <h3 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 8, color: "#0A1628" }}>No events yet</h3>
          <p style={{ fontSize: 14, color: "#4B6280", lineHeight: 1.65, marginBottom: 24, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>Post a sale, product launch, or networking meetup — every verified business on B Square will see it.</p>
          <button onClick={() => setShowForm(true)} style={{ padding: "12px 24px", background: "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 700, borderRadius: 24, cursor: "pointer" }}>+ Post the first event</button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Upcoming</div>
              {upcoming.map(ev => <Card key={ev.id} ev={ev} />)}
            </>
          )}
          {past.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8AACC8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10, marginTop: upcoming.length > 0 ? 22 : 0 }}>Past</div>
              {past.map(ev => <Card key={ev.id} ev={ev} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}
