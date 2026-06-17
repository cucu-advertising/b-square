import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./AuthContext";
import { authAPI } from "./api";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Nearby from "./pages/Nearby";
import Events from "./pages/Events";
import Connections from "./pages/Connections";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import ChatModal from "./components/ChatModal";

const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

function LocationTracker() {
  const { user } = useAuth();
  const watchRef = useRef(null);
  useEffect(() => {
    if (!user || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      pos => authAPI.updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {}),
      () => {}, { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [user]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F8FC" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/logo.png" alt="B Square" style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: "#8AACC8", letterSpacing: "2px", textTransform: "uppercase" }}>Loading...</div>
        <style>{"@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.95)}}"}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/home" replace />;
  if (!user.is_admin && !user.onboarding_done) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/app" replace /> : children;
}

function MobileNav() {
  const location = useLocation();
  const tabs = [
    { to: "/app", icon: "⬡", label: "Nearby" },
    { to: "/app/events", icon: "✦", label: "Events" },
    { to: "/app/connections", icon: "◇", label: "Connect" },
    { to: "/app/requests", icon: "△", label: "Requests" },
    { to: "/app/profile", icon: "○", label: "Profile" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #E2EBF5", display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -4px 20px rgba(10,22,40,.06)" }}>
      {tabs.map(t => {
        const active = t.to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(t.to);
        return (
          <NavLink key={t.to} to={t.to} end={t.to === "/app"} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0 7px", textDecoration: "none", color: active ? "#1878C8" : "#8AACC8", fontSize: 9, fontWeight: 600, transition: "all .15s", letterSpacing: "1px", textTransform: "uppercase" }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </NavLink>
        );
      })}
    </div>
  );
}

function AppLayout() {
  const { user, logout } = useAuth();
  const [chatTarget, setChatTarget] = useState(null);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => { setScrolled(window.scrollY > 4); setIsMobile(window.innerWidth < 768); };
    window.addEventListener("scroll", h); window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, []);

  const ns = ({ isActive }) => ({
    height: 60, display: "flex", alignItems: "center", padding: "0 16px",
    textDecoration: "none", fontSize: 13, fontWeight: 600, letterSpacing: "-.1px",
    transition: "all .15s", borderBottom: `2.5px solid ${isActive ? "#1878C8" : "transparent"}`,
    color: isActive ? "#1878C8" : "#4B6280", background: "transparent", fontFamily: "'Plus Jakarta Sans',sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC" }}>
      {!isMobile && (
        <nav style={{ background: scrolled ? "rgba(255,255,255,.96)" : "#fff", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: "1px solid #E2EBF5", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,3vw,40px)", position: "sticky", top: 0, zIndex: 100, transition: "all .3s", boxShadow: scrolled ? "0 2px 16px rgba(10,22,40,.06)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/app")}>
            <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "#0A1628", letterSpacing: "-.4px" }}>B Square</span>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            <NavLink to="/app" style={ns} end>Nearby</NavLink>
            <NavLink to="/app/events" style={ns}>Events</NavLink>
            <NavLink to="/app/connections" style={ns}>Connections</NavLink>
            <NavLink to="/app/requests" style={ns}>Requests</NavLink>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => navigate("/app/profile")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 12px", borderRadius: 24, border: "1.5px solid transparent", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C2DAFF"; e.currentTarget.style.background = "#EEF6FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1878C8,#3B9EE8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{initials(user?.name)}</div>
              <span style={{ fontSize: 13, color: "#4B6280", fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</span>
            </div>
            <button onClick={logout} style={{ padding: "7px 16px", background: "transparent", color: "#8AACC8", border: "1.5px solid #E2EBF5", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#EF4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8AACC8"; e.currentTarget.style.borderColor = "#E2EBF5"; }}>
              Sign out
            </button>
          </div>
        </nav>
      )}
      {isMobile && (
        <nav style={{ background: "#fff", borderBottom: "1px solid #E2EBF5", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0A1628", letterSpacing: "-.3px" }}>B Square</span>
          </div>
          <div onClick={() => navigate("/app/profile")} style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#1878C8,#3B9EE8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer" }}>{initials(user?.name)}</div>
        </nav>
      )}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${isMobile ? "0" : "clamp(14px,2.5vw,28px)"} ${isMobile ? "72px" : "40px"}` }}>
        <Routes>
          <Route path="/" element={<Nearby />} />
          <Route path="/events" element={<Events />} />
          <Route path="/connections" element={<Connections onOpenChat={setChatTarget} />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-panel-bsquare" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isMobile && <MobileNav />}
      {chatTarget && <ChatModal target={chatTarget} onClose={() => setChatTarget(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 500, borderRadius: 12, border: "1px solid #E2EBF5", background: "#fff", color: "#0A1628", boxShadow: "0 4px 24px rgba(10,22,40,.1)" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        }} />
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app/*" element={<ProtectedRoute><LocationTracker /><AppLayout /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
