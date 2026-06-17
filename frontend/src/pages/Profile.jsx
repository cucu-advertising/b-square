import { useState } from "react";
import { useAuth } from "../AuthContext";
import { authAPI } from "../api";
import toast from "react-hot-toast";

const mono = { fontFamily: "'JetBrains Mono',monospace" };
const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "", industry: user?.industry || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const pf = k => e => setPwForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try { const { data } = await authAPI.updateProfile(form); updateUser(data.user); setEditMode(false); toast.success("Profile updated."); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setSaving(false); }
  };

  const changePw = async () => {
    const e = {};
    if (!pwForm.currentPassword) e.currentPassword = "Required";
    if (!pwForm.newPassword || pwForm.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword) e.confirmPassword = "Don't match";
    setPwErrors(e); if (Object.keys(e).length > 0) return;
    setSaving(true);
    try { await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); toast.success("Password changed. Please sign in again."); logout(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setSaving(false); }
  };

  const IS = err => ({
    width: "100%", padding: "10px 12px", background: "var(--s2)",
    border: `1px solid ${err ? "rgba(255,61,61,.4)" : "var(--b)"}`, color: "var(--t)",
    fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color .2s",
  });

  const verLabel = { din: "DIN Verified", linkedin: "LinkedIn Verified", succession: "Succession Verified", admin: "Administrator" };

  return (
    <div style={{ paddingTop: 24, maxWidth: 560, animation: "fadeUp .4s ease" }}>
      <h1 style={{ fontWeight: 900, fontSize: "clamp(24px,4vw,40px)", letterSpacing: "-2px", marginBottom: 24 }}>My Profile</h1>

      {/* PROFILE CARD */}
      <div style={{ background: "var(--s1)", border: "1px solid var(--b)", marginBottom: "1px" }}>
        <div style={{ padding: "clamp(18px,2.5vw,26px)", borderBottom: "1px solid var(--b)", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, border: "1px solid var(--b2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, letterSpacing: "-1px", flexShrink: 0, color: "var(--lime)" }}>
            {initials(user?.name)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "clamp(18px,2.5vw,24px)", letterSpacing: "-1px", marginBottom: 4 }}>{user?.name}</div>
            <span style={{ ...mono, fontSize: 9, color: "var(--t3)", border: "1px solid var(--b2)", padding: "3px 10px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              ✓ {verLabel[user?.verification_type] || "Verified"}
            </span>
          </div>
        </div>

        {editMode ? (
          <div style={{ padding: "clamp(16px,2.5vw,24px)" }}>
            {[["Business Name", "name", "text", user?.name], ["Industry", "industry", "text", "e.g. IT Services"], ["Phone", "phone", "tel", "98xxxxxxxx"]].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: "var(--t3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <input type={type} value={form[key]} onChange={f(key)} placeholder={ph} style={IS(false)}
                  onFocus={e => e.target.style.borderColor = "var(--b2)"}
                  onBlur={e => e.target.style.borderColor = "var(--b)"} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 9, color: "var(--t3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Bio</div>
              <textarea value={form.bio} onChange={f("bio")} rows={3} style={{ ...IS(false), resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = "var(--b2)"}
                onBlur={e => e.target.style.borderColor = "var(--b)"} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "var(--lime)", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--t)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--lime)"}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditMode(false)} style={{ padding: "9px 16px", background: "transparent", color: "var(--t2)", border: "1px solid var(--b)", fontFamily: "inherit", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              {[["Email", user?.email], ["Phone", user?.phone || "—"], ["City", user?.city || "—"], ["Industry", user?.industry || "—"]].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid var(--b)" }}>
                  <td style={{ padding: "11px clamp(16px,2vw,22px)", ...mono, fontSize: 9, color: "var(--t3)", letterSpacing: "1.5px", textTransform: "uppercase", width: 90 }}>{k}</td>
                  <td style={{ padding: "11px clamp(16px,2vw,22px)", fontSize: 13, fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </table>
            {user?.bio && <p style={{ padding: "14px clamp(16px,2vw,22px)", fontSize: 13, color: "var(--t2)", lineHeight: 1.65, fontWeight: 300, borderTop: "1px solid var(--b)" }}>{user.bio}</p>}
            <div style={{ padding: "14px clamp(16px,2vw,22px)", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--b)" }}>
              {[["Edit Profile", () => setEditMode(true)], ["Change Password", () => setPwMode(!pwMode)]].map(([label, action]) => (
                <button key={label} onClick={action} style={{ padding: "8px 16px", background: "var(--s2)", color: "var(--t2)", border: "1px solid var(--b)", fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--s3)"; e.currentTarget.style.color = "var(--t)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--s2)"; e.currentTarget.style.color = "var(--t2)"; }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {pwMode && (
        <div style={{ background: "var(--s1)", border: "1px solid var(--b)", padding: "clamp(16px,2.5vw,24px)", marginBottom: "1px", animation: "fadeUp .3s ease" }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px", marginBottom: 16 }}>Change Password</div>
          {[["currentPassword", "Current Password"], ["newPassword", "New Password (min 8)"], ["confirmPassword", "Confirm New Password"]].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ ...mono, fontSize: 9, color: "var(--t3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <input type="password" value={pwForm[key]} onChange={pf(key)} style={IS(pwErrors[key])}
                onFocus={e => e.target.style.borderColor = "var(--b2)"}
                onBlur={e => e.target.style.borderColor = pwErrors[key] ? "rgba(255,61,61,.4)" : "var(--b)"} />
              {pwErrors[key] && <p style={{ ...mono, fontSize: 10, color: "var(--red)", marginTop: 3 }}>{pwErrors[key]}</p>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={changePw} disabled={saving} style={{ padding: "9px 20px", background: "var(--lime)", color: "#fff", border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>
              {saving ? "Saving..." : "Update Password"}
            </button>
            <button onClick={() => setPwMode(false)} style={{ padding: "9px 14px", background: "transparent", color: "var(--t2)", border: "1px solid var(--b)", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: "var(--s1)", border: "1px solid rgba(255,61,61,.18)", padding: "clamp(14px,2vw,20px)" }}>
        <div style={{ ...mono, fontSize: 10, color: "rgba(255,61,61,.6)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Sign Out</div>
        <button onClick={logout} style={{ padding: "8px 18px", background: "transparent", color: "rgba(255,61,61,.6)", border: "1px solid rgba(255,61,61,.2)", fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: ".3px", transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,61,61,.08)"; e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,61,61,.6)"; }}>
          Sign out of B Square
        </button>
      </div>
    </div>
  );
}
