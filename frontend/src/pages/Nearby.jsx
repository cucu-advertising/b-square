import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Circle, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { usersAPI, connectionsAPI, authAPI } from "../api";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COLORS = ["#1878C8","#0E5DA0","#1D6B3A","#B45309","#6D28D9","#0E5DA0"];
const getColor = n => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];
const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

function makePin(color, ini, label, isYou = false) {
  return L.divIcon({
    className: "",
    iconSize: [80, 60],
    iconAnchor: [40, 56],
    html: `<div style="display:flex;flex-direction:column;align-items:center;font-family:'Plus Jakarta Sans',sans-serif">
      <div style="width:${isYou ? 44 : 38}px;height:${isYou ? 44 : 38}px;border-radius:50%;background:${color};border:${isYou ? "3px" : "2.5px"} solid #fff;box-shadow:${isYou ? "0 0 0 5px rgba(24,120,200,.2)," : ""}0 4px 14px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:${isYou ? 20 : 13}px;font-weight:800;color:#fff">${ini}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin-top:-1px"></div>
      <div style="background:${color};color:#fff;font-size:8px;font-weight:700;padding:2px 7px;border-radius:8px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25)">${label}</div>
    </div>`,
  });
}

function makeConnectionPin(color, ini, label) {
  return L.divIcon({
    className: "",
    iconSize: [80, 64],
    iconAnchor: [40, 60],
    html: `<div style="display:flex;flex-direction:column;align-items:center;font-family:'Plus Jakarta Sans',sans-serif">
      <div style="width:40px;height:40px;border-radius:50%;background:${color};border:3px solid #22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25),0 4px 14px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff">${ini}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #22c55e;margin-top:-1px"></div>
      <div style="background:#22c55e;color:#fff;font-size:8px;font-weight:700;padding:2px 7px;border-radius:8px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25)">✓ ${label}</div>
    </div>`,
  });
}

function ConnectionPins({ connections }) {
  const map = useMap();
  useEffect(() => {
    const markers = [];
    connections.forEach(c => {
      if (!c.lat || !c.lng) return;
      const m = L.marker([c.lat, c.lng], { icon: makeConnectionPin(getColor(c.name), initials(c.name), c.name.split(" ")[0]) }).addTo(map);
      m.bindPopup(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px"><span style="font-size:9px;font-weight:700;color:#22c55e;letter-spacing:.5px;text-transform:uppercase">✓ Connected</span><br/><b style="font-size:13px;color:#0A1628">${c.name}</b><br/><span style="font-size:11px;color:#4B6280">${c.industry || "Business"}</span></div>`);
      markers.push(m);
    });
    return () => markers.forEach(m => m.remove());
  }, [map, connections]);
  return null;
}
function popupHtml(u, pendingIds) {
  const isPending = pendingIds.has(u.id);
  const status = u.connection_status;
  let actionHtml;
  if (status === "connected") {
    actionHtml = `<div style="margin-top:8px;padding:6px 10px;background:rgba(34,197,94,.12);color:#15803d;font-size:10px;font-weight:700;border-radius:8px;text-align:center;letter-spacing:.3px">✓ Connected</div>`;
  } else if (status === "request_sent" || isPending) {
    actionHtml = `<button disabled style="margin-top:8px;width:100%;padding:7px 10px;background:#F5F8FC;color:#8AACC8;font-size:10px;font-weight:700;border:1px solid #E2EBF5;border-radius:8px;cursor:default;font-family:inherit;letter-spacing:.3px">${isPending ? "Sending..." : "✓ Request Sent"}</button>`;
  } else {
    actionHtml = `<button id="pin-connect-${u.id}" style="margin-top:8px;width:100%;padding:7px 10px;background:#1878C8;color:#fff;font-size:10px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-family:inherit;letter-spacing:.3px">Send Request</button>`;
  }
  return `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px;min-width:140px">
    <b style="font-size:13px;color:#0A1628">${u.name}</b><br/>
    <span style="font-size:11px;color:#4B6280">${u.industry || "Business"}${u.distance_km != null ? ` · ${u.distance_km}km` : ""}</span>
    ${actionHtml}
  </div>`;
}

function MapPins({ users, userLat, userLng, onConnect, pendingIds }) {
  const map = useMap();
  useEffect(() => {
    const markers = [];
    if (userLat && userLng) {
      markers.push(L.marker([userLat, userLng], { icon: makePin("#1878C8", "📍", "You", true) }).addTo(map));
    }
    users.forEach(u => {
      if (!u.lat || !u.lng) return;
      const m = L.marker([u.lat, u.lng], { icon: makePin(getColor(u.name), initials(u.name), `${u.name.split(" ")[0]} · ${u.distance_km}km`) }).addTo(map);
      m.bindPopup(popupHtml(u, pendingIds));
      m.on("popupopen", () => {
        const btn = document.getElementById(`pin-connect-${u.id}`);
        if (btn) btn.onclick = () => { onConnect(u); m.closePopup(); };
      });
      markers.push(m);
    });
    return () => markers.forEach(m => m.remove());
  }, [map, users, userLat, userLng, onConnect, pendingIds]);
  return null;
}

export default function Nearby() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);
  const [industry, setIndustry] = useState("");
  const [pending, setPending] = useState(new Set());
  const [idx, setIdx] = useState(0);
  const [view, setView] = useState("cards");
  const [swiping, setSwiping] = useState(null);
  const cardRef = useRef(null);
  const drag = useRef({ on: false, sx: 0, dx: 0, vx: 0, lx: 0, lt: 0 });
  const [connections, setConnections] = useState([]);
  const [locationError, setLocationError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState(() => { const h = new Date().getHours(); return (h >= 6 && h < 19) ? "day" : "night"; });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const fetchNearby = useCallback(async () => {
    setLoading(true); setIdx(0);
    try {
      const { data } = await usersAPI.nearby({ radius, industry: industry || undefined });
      setUsers(data.users);
      setLocationError(false);
    } catch (err) {
      if (err.response?.status === 400 && /location/i.test(err.response?.data?.error || "")) {
        setLocationError(true);
        setUsers([]);
      } else {
        toast.error(err.response?.data?.error || "Failed");
      }
    } finally { setLoading(false); }
  }, [radius, industry]);

  const fetchConnections = useCallback(async () => {
    try { const { data } = await connectionsAPI.list(); setConnections(data.connections || []); }
    catch { /* non-fatal — map just won't show connection pins */ }
  }, []);

  useEffect(() => { fetchNearby(); fetchConnections(); }, [fetchNearby, fetchConnections]);

  const enableLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported by this browser"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          await authAPI.updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          await fetchNearby();
          await fetchConnections();
          toast.success("Location updated!");
        } catch { toast.error("Couldn't save location"); }
        finally { setLocating(false); }
      },
      () => { toast.error("Location permission denied"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sendRequest = async u => {
    setPending(p => new Set([...p, u.id]));
    try {
      const { data } = await connectionsAPI.sendRequest(u.id);
      toast.success(data.message);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, connection_status: data.status === "connected" ? "connected" : "request_sent" } : x));
      if (data.status === "connected") fetchConnections();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setPending(p => { const n = new Set(p); n.delete(u.id); return n; }); }
  };

  const doSwipe = useCallback((dir, u) => {
    if (!u) return;
    setSwiping(dir);
    setTimeout(() => {
      setSwiping(null);
      if (dir === "right" && u.connection_status === "none") sendRequest(u);
      setIdx(i => i + 1);
    }, 380);
  }, [sendRequest]);

  const startDrag = e => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    drag.current = { on: true, sx: x, dx: 0, vx: 0, lx: x, lt: Date.now() };
    if (cardRef.current) cardRef.current.style.transition = "none";
    if (e.preventDefault) e.preventDefault();
  };
  const moveDrag = e => {
    const d = drag.current; if (!d.on || !cardRef.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const now = Date.now(); d.dx = x - d.sx; d.vx = (x - d.lx) / (now - d.lt + 1) * 16; d.lx = x; d.lt = now;
    cardRef.current.style.transform = `translateX(${d.dx}px) rotate(${d.dx / 24}deg)`;
    const lp = cardRef.current?.querySelector(".sw-pass"); const lc = cardRef.current?.querySelector(".sw-conn");
    if (lp) lp.style.opacity = d.dx < -20 ? Math.min(1, (Math.abs(d.dx) - 20) / 60) : 0;
    if (lc) lc.style.opacity = d.dx > 20 ? Math.min(1, (d.dx - 20) / 60) : 0;
  };
  const endDrag = () => {
    const d = drag.current; if (!d.on || !cardRef.current) return; d.on = false;
    cardRef.current.style.transition = "transform .38s cubic-bezier(.16,1,.3,1)";
    const lp = cardRef.current?.querySelector(".sw-pass"); const lc = cardRef.current?.querySelector(".sw-conn");
    if (lp) lp.style.opacity = 0; if (lc) lc.style.opacity = 0;
    const momentum = d.dx + d.vx * 8;
    if (Math.abs(momentum) > 90) doSwipe(momentum > 0 ? "right" : "left", users[idx]);
    else cardRef.current.style.transform = "";
    d.dx = 0;
  };

  const userLat = user?.lat || 17.388; const userLng = user?.lng || 78.487;
  const cu = users[idx];

  const connectedIds = useMemo(() => new Set(connections.map(c => c.id)), [connections]);
  const nearbyPins = useMemo(() => users.filter(u => u.lat && u.lng && !connectedIds.has(u.id)), [users, connectedIds]);
  const connectionPins = useMemo(() => connections.filter(c => c.lat && c.lng), [connections]);

  const VerBadge = ({ type }) => {
    const m = { din: ["#1878C8", "#EEF6FF", "DIN ✓"], linkedin: ["#1D6B3A", "#EDFAF2", "LI ✓"], succession: ["#B45309", "#FFF8EE", "SUC ✓"] };
    const [c, bg, l] = m[type] || ["#8AACC8", "#F5F8FC", "✓"];
    return <span style={{ fontSize: 9, fontWeight: 700, color: c, background: bg, padding: "3px 9px", borderRadius: 20, border: `1px solid ${c}30` }}>{l}</span>;
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      {/* Header (cards view only — map view has its own floating header) */}
      {view !== "map" && (
      <div style={{ background: "#fff", borderBottom: "1px solid #E2EBF5", padding: "clamp(16px,2.5vw,24px) 0 clamp(18px,2.8vw,26px)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#22c55e", opacity: .2, animation: "ping 2s infinite" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase" }}>Live GPS · {user?.city || "Detecting..."}</span>
        </div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 4, color: "#0A1628" }}>Nearby Businesses</h1>
        <p style={{ fontSize: 12, color: "#8AACC8", fontWeight: 500, marginBottom: 16 }}>{loading ? "Loading..." : locationError ? "Location not set" : users.length === 0 ? "No businesses nearby" : `${users.length} verified within ${radius} km`}</p>

        {locationError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#FFF8E8", border: "1.5px solid #FCE3A8", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <span style={{ fontSize: 12, color: "#8A5800", fontWeight: 500, flex: 1 }}>We need your location to find businesses and show the map around you.</span>
            <button onClick={enableLocation} disabled={locating} style={{ padding: "7px 16px", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: locating ? "default" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s" }}
              onMouseEnter={e => { if (!locating) e.currentTarget.style.background = "#D97706"; }}
              onMouseLeave={e => e.currentTarget.style.background = "#F59E0B"}>
              {locating ? "Locating..." : "Enable Location"}
            </button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setView("map")} style={{ padding: "7px 16px", background: "#EEF6FF", color: "#1878C8", border: "1.5px solid #C2DAFF", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            🗺 Map View
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#F8FAFF", border: "1.5px solid #E2EBF5", borderRadius: 20, padding: "6px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#4B6280", whiteSpace: "nowrap" }}>{radius} km</span>
            <input type="range" min="1" max="50" value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: 70, accentColor: "#1878C8" }} />
          </div>
          <div style={{ position: "relative", flex: 1, minWidth: 140 }}>
            <input value={industry} onChange={e => setIndustry(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchNearby()} placeholder="Filter by industry..."
              style={{ width: "100%", padding: "8px 8px 8px 12px", background: "#F8FAFF", border: "1.5px solid #E2EBF5", borderRadius: 20, fontSize: 12, color: "#0A1628", fontFamily: "inherit", outline: "none", transition: "all .15s", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "#C2DAFF"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#E2EBF5"; e.target.style.background = "#F8FAFF"; }} />
          </div>
          <button onClick={fetchNearby} style={{ padding: "8px 18px", background: "#1878C8", color: "#fff", border: "none", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0E5DA0"}
            onMouseLeave={e => e.currentTarget.style.background = "#1878C8"}>Search</button>
        </div>
      </div>
      )}

      {view === "map" ? (
        <div style={{
          position: "relative", width: "100vw",
          marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)",
          height: isMobile ? "calc(100dvh - 124px)" : "calc(100dvh - 100px)",
          minHeight: isMobile ? 420 : 480,
          background: mapStyle === "night" ? "#0a1322" : "#cfe8f0",
          isolation: "isolate",
        }}>
          <MapContainer center={[userLat, userLng]} zoom={13} style={{ position: "absolute", inset: 0, height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
            {mapStyle === "night" ? (
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={20} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' />
            ) : (
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maxZoom={20} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' />
            )}
            <Circle center={[userLat, userLng]} radius={radius * 1000} pathOptions={{ color: "#1878C8", fillColor: "#1878C8", fillOpacity: .05, weight: 1.5, dashArray: "6 4" }} />
            <MapPins users={nearbyPins} userLat={userLat} userLng={userLng} onConnect={sendRequest} pendingIds={pending} />
            <ConnectionPins connections={connectionPins} />
            <ZoomControl position="bottomright" />
          </MapContainer>

          {/* Floating glass header */}
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 1000, background: "rgba(255,255,255,.94)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(226,235,245,.9)", borderRadius: 18, padding: "12px 14px", boxShadow: "0 8px 28px rgba(10,22,40,.16)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }} />
                <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#22c55e", opacity: .2, animation: "ping 2s infinite" }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase" }}>Live · {user?.city || "Detecting..."}</span>
            </div>
            <div style={{ fontSize: "clamp(16px,2.2vw,20px)", fontWeight: 800, letterSpacing: "-.6px", color: "#0A1628", lineHeight: 1.15 }}>Nearby Businesses</div>
            <div style={{ fontSize: 11, color: "#8AACC8", fontWeight: 500, marginTop: 2 }}>{loading ? "Loading..." : locationError ? "Location not set" : users.length === 0 ? "No businesses nearby" : `${users.length} verified within ${radius} km`}</div>

            {locationError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#FFF8E8", border: "1.5px solid #FCE3A8", borderRadius: 10, padding: "8px 12px", marginTop: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontSize: 11, color: "#8A5800", fontWeight: 500, flex: 1 }}>We need your location to find businesses nearby.</span>
                <button onClick={enableLocation} disabled={locating} style={{ padding: "6px 13px", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: locating ? "default" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  {locating ? "Locating..." : "Enable"}
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
              <button onClick={() => setView("cards")} style={{ padding: "6px 13px", background: "#EEF6FF", color: "#1878C8", border: "1.5px solid #C2DAFF", borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>⬡ Cards</button>
              <button onClick={() => setMapStyle(s => s === "day" ? "night" : "day")} style={{ padding: "6px 13px", background: mapStyle === "night" ? "#0A1628" : "#F5F8FC", color: mapStyle === "night" ? "#fff" : "#4B6280", border: `1.5px solid ${mapStyle === "night" ? "#0A1628" : "#E2EBF5"}`, borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                {mapStyle === "day" ? "🌙 Night" : "☀️ Day"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8FAFF", border: "1.5px solid #E2EBF5", borderRadius: 18, padding: "5px 10px" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#4B6280", whiteSpace: "nowrap" }}>{radius} km</span>
                <input type="range" min="1" max="50" value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: 60, accentColor: "#1878C8" }} />
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <input value={industry} onChange={e => setIndustry(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchNearby()} placeholder="Industry..."
                  style={{ width: "100%", padding: "7px 10px", background: "#F8FAFF", border: "1.5px solid #E2EBF5", borderRadius: 18, fontSize: 11, color: "#0A1628", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={fetchNearby} style={{ padding: "7px 15px", background: "#1878C8", color: "#fff", border: "none", borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0E5DA0"}
                onMouseLeave={e => e.currentTarget.style.background = "#1878C8"}>Search</button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(255,255,255,.95)", backdropFilter: "blur(8px)", border: "1px solid #E2EBF5", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 16px rgba(10,22,40,.1)", zIndex: 999, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#1878C8", border: "2px solid #fff", boxShadow: "0 0 0 2px rgba(24,120,200,.25)", display: "inline-block" }} /><span style={{ fontSize: 10, color: "#4B6280", fontWeight: 600 }}>You</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0E5DA0", border: "2px solid #fff", display: "inline-block" }} /><span style={{ fontSize: 10, color: "#4B6280", fontWeight: 600 }}>Tap to connect</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0E5DA0", border: "2px solid #22c55e", display: "inline-block" }} /><span style={{ fontSize: 10, color: "#4B6280", fontWeight: 600 }}>Connected</span></div>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(16px,3vw,32px) clamp(16px,3vw,32px) 24px", background: "#F5F8FC", minHeight: "calc(100dvh - 280px)" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #E2EBF5", borderTop: "3px solid #1878C8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#8AACC8" }}>Finding businesses nearby...</span>
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
            </div>
          ) : idx >= users.length ? (
            <div style={{ textAlign: "center", padding: "clamp(48px,6vw,80px)", maxWidth: 360 }}>
              {locationError ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                  <h3 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 8, color: "#0A1628" }}>Turn on location</h3>
                  <p style={{ fontSize: 14, color: "#4B6280", lineHeight: 1.65, marginBottom: 24 }}>We need your GPS location to find verified businesses near you.</p>
                  <button onClick={enableLocation} disabled={locating} style={{ padding: "12px 24px", background: "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 700, borderRadius: 24, cursor: locating ? "default" : "pointer" }}>{locating ? "Locating..." : "Enable Location"}</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 8, color: "#0A1628" }}>You're all caught up!</h3>
                  <p style={{ fontSize: 14, color: "#4B6280", lineHeight: 1.65, marginBottom: 24 }}>Expand your radius to discover more.</p>
                  <button onClick={() => { setRadius(r => Math.min(r + 10, 50)); }} style={{ padding: "12px 24px", background: "#1878C8", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 700, borderRadius: 24, cursor: "pointer" }}>Expand Radius</button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Card stack */}
              <div style={{ position: "relative", width: "min(340px,90vw)", height: 440 }}>
                {/* Back cards */}
                {[2, 1].map(offset => {
                  const u = users[idx + offset]; if (!u) return null;
                  return (
                    <div key={u.id} style={{ position: "absolute", width: "100%", top: offset * 10, transform: `scale(${1 - offset * .03})`, borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 4px 20px rgba(10,22,40,.08)", filter: `brightness(${1 - offset * .06})`, zIndex: 3 - offset }}>
                      <div style={{ height: 190, background: `linear-gradient(160deg,${getColor(u.name)}cc,${getColor(u.name)})` }} />
                      <div style={{ padding: "12px 16px" }}><div style={{ fontSize: 15, fontWeight: 800, color: "#0A1628", letterSpacing: "-.3px" }}>{u.name}</div></div>
                    </div>
                  );
                })}

                {/* Front card */}
                {cu && (
                  <div ref={cardRef}
                    onMouseDown={startDrag} onMouseMove={moveDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
                    onTouchStart={startDrag} onTouchMove={moveDrag} onTouchEnd={endDrag}
                    style={{
                      position: "absolute", top: 0, width: "100%", borderRadius: 24, overflow: "hidden", background: "#fff",
                      boxShadow: "0 8px 40px rgba(10,22,40,.14)", cursor: "grab", userSelect: "none", zIndex: 3,
                      willChange: "transform", touchAction: "none",
                      ...(swiping === "left" ? { transition: "transform .38s ease,opacity .35s ease", transform: "translateX(-150%) rotate(-26deg)", opacity: 0 } :
                        swiping === "right" ? { transition: "transform .38s ease,opacity .35s ease", transform: "translateX(150%) rotate(26deg)", opacity: 0 } : {}),
                      animation: "cardIn .5s cubic-bezier(.16,1,.3,1)",
                    }}>
                    {/* PASS / CONNECT labels */}
                    <div className="sw-pass" style={{ position: "absolute", top: 18, left: 14, opacity: 0, fontSize: 16, fontWeight: 800, padding: "6px 12px", borderRadius: 10, border: "2.5px solid #EF4444", color: "#EF4444", zIndex: 20, pointerEvents: "none", letterSpacing: "1px", transform: "rotate(-10deg)", transition: "opacity .1s" }}>PASS</div>
                    <div className="sw-conn" style={{ position: "absolute", top: 18, right: 14, opacity: 0, fontSize: 16, fontWeight: 800, padding: "6px 12px", borderRadius: 10, border: "2.5px solid #1878C8", color: "#1878C8", zIndex: 20, pointerEvents: "none", letterSpacing: "1px", transform: "rotate(10deg)", transition: "opacity .1s" }}>CONNECT</div>
                    {/* Card header */}
                    <div style={{ height: 200, background: `linear-gradient(160deg,${getColor(cu.name)}cc,${getColor(cu.name)})`, position: "relative", display: "flex", alignItems: "flex-end", padding: "14px 16px" }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.5) 100%)" }} />
                      {cu.distance_km && <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 20, fontSize: 9, fontWeight: 700, color: "#0A1628" }}>📍 {cu.distance_km} km</div>}
                      <div style={{ position: "absolute", top: 12, right: 12 }}><VerBadge type={cu.verification_type} /></div>
                      <div style={{ width: 56, height: 56, borderRadius: 16, border: "2.5px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", position: "relative", zIndex: 1 }}>
                        {initials(cu.name)}
                      </div>
                    </div>
                    {/* Card body */}
                    <div style={{ padding: "14px 16px 16px", background: "#fff" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0A1628", letterSpacing: "-.4px", marginBottom: 5 }}>{cu.name}</div>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
                        {cu.industry && <span style={{ fontSize: 10, fontWeight: 600, color: "#1878C8", background: "#EEF6FF", padding: "3px 9px", borderRadius: 20, border: "1px solid #C2DAFF" }}>{cu.industry}</span>}
                        {cu.city && <span style={{ fontSize: 10, color: "#8AACC8", fontWeight: 500 }}>{cu.city}</span>}
                      </div>
                      {cu.bio && <p style={{ fontSize: 12, color: "#4B6280", lineHeight: 1.55, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cu.bio}</p>}
                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
                        <button onClick={() => doSwipe("left", cu)} style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px solid #FECACA", background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", transition: "all .18s" }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,.25)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}>✕</button>
                        <button style={{ width: 42, height: 42, borderRadius: "50%", border: "1.5px solid #FDE68A", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "all .18s" }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,158,11,.25)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}>★</button>
                        <button onClick={() => doSwipe("right", cu)} disabled={pending.has(cu?.id)} style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px solid #C2DAFF", background: "#EEF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", transition: "all .18s" }}
                          onMouseEnter={e => { if (!pending.has(cu?.id)) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(24,120,200,.28)"; e.currentTarget.style.transform = "scale(1.08)"; } }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}>
                          {pending.has(cu?.id) ? "⏳" : "✓"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#8AACC8", fontWeight: 500, marginTop: 14 }}>{idx + 1} / {users.length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
