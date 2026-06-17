import { useState } from "react";
import { useAuth } from "../AuthContext";
import { authAPI, profileAPI } from "../api";
import toast from "react-hot-toast";
import ImageCropModal from "../components/ImageCropModal";

const mono = { fontFamily: "'JetBrains Mono',monospace" };
const initials = n => n?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
  name: user?.name || "",
  phone: user?.phone || "",
  bio: user?.bio || "",
  industry: user?.industry || "",

  companyName: user?.company_name || "",
  headline: user?.headline || "",
  companyLogo: user?.company_logo || "",
  profilePhoto: user?.profile_photo || ""
});

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});

  const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);

const [logoCrop, setLogoCrop] = useState({ x: 0, y: 0 });
const [logoZoom, setLogoZoom] = useState(1);

const [showProfileCropper, setShowProfileCropper] = useState(false);
const [showLogoCropper, setShowLogoCropper] = useState(false);

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

{/* MY BSQUARE CARD */}

<div
  style={{
    background: "var(--s1)",
    border: "1px solid var(--b)",
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 16
  }}
>
  <div
    style={{
      padding: "14px 18px",
      borderBottom: "1px solid var(--b)",
      fontWeight: 800,
      fontSize: 18
    }}
  >
    My BSquare Card
  </div>

  {/* COMPANY BANNER */}
  <div
    style={{
      height: 180,
      position: "relative",
      overflow: "hidden",
      background: "#EEF6FF"
    }}
  >
    {form.companyLogo ? (
      <img
        src={form.companyLogo}
        alt="Company Logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#1878C8"
        }}
      >
        <div style={{ fontSize: 48 }}>🏢</div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700
          }}
        >
          Upload Company Logo
        </div>
      </div>
    )}

    <div
  style={{
    position: "absolute",
    top: 14,
    right: 14,
    display: "flex",
    gap: 10,
    zIndex: 20
  }}
>
  <button
    type="button"
    onClick={() =>
      setForm(prev => ({
        ...prev,
        companyLogo: ""
      }))
    }
    style={{
      background: "#EF4444",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700
    }}
  >
    Remove Logo
  </button>

  <label
    style={{
      background: "#fff",
      padding: "10px 14px",
      cursor: "pointer",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: "0 2px 10px rgba(0,0,0,.12)"
    }}
  >
    Change Logo

    <input
      hidden
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
          setForm(p => ({
            ...p,
            companyLogo: reader.result
          }));

          setShowLogoCropper(true);
        };

        reader.readAsDataURL(file);
      }}
    />
  </label>
</div>
  </div>

  <div
    style={{
      padding: "0 24px 28px",
      textAlign: "center"
    }}
    
  >

    
    {/* PROFILE PHOTO */}
    <div
      style={{
        width: 120,
        height: 120,
        margin: "5px auto 12px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "5px solid white",
        background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,.12)"
      }}
    >
      {form.profilePhoto ? (
        <img
          src={form.profilePhoto}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 800,
            color: "#1878C8"
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "P"}
        </div>
      )}
    </div>

    <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap"
  }}
>
  <button
    type="button"
    onClick={() =>
      setForm(prev => ({
        ...prev,
        profilePhoto: ""
      }))
    }
    style={{
      background: "#EF4444",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700
    }}
  >
    Remove Profile Photo
  </button>

  <label
    style={{
      background: "#1878C8",
      color: "#fff",
      borderRadius: 10,
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700
    }}
  >
    Change Profile Photo

    <input
      hidden
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
          setForm(p => ({
            ...p,
            profilePhoto: reader.result
          }));

          setShowProfileCropper(true);
        };

        reader.readAsDataURL(file);
      }}
    />
  </label>
</div>

    <input
      value={form.companyName}
      placeholder="Company Name"
      onChange={f("companyName")}
      style={{
        width: "100%",
        padding: 12,
        marginBottom: 12,
        border: "1px solid var(--b)",
        borderRadius: 10
      }}
    />

    <input
      value={form.headline}
      placeholder="Headline"
      onChange={f("headline")}
      style={{
        width: "100%",
        padding: 12,
        marginBottom: 18,
        border: "1px solid var(--b)",
        borderRadius: 10
      }}
    />

    {/* LIVE PREVIEW */}

    <div
      style={{
        fontSize: 28,
        fontWeight: 800,
        color: "#0A1628",
        letterSpacing: "-1px",
        marginBottom: 6
      }}
    >
      {form.companyName || "Your Company"}
    </div>

    <div
      style={{
        color: "#4B6280",
        fontSize: 15,
        lineHeight: 1.6,
        maxWidth: 450,
        margin: "0 auto 12px"
      }}
    >
      {form.headline || "Your business headline"}
    </div>

    <div
      style={{
        fontWeight: 700,
        color: "#1878C8",
        marginBottom: 22
      }}
    >
      ✓ I'm a Verified Member of BSquare
    </div>

    <button
      onClick={async () => {
        try {
          await profileAPI.updateCard({
            companyName: form.companyName,
            headline: form.headline,
            companyLogo: form.companyLogo || null,
profilePhoto: form.profilePhoto || null
          });

          toast.success("Business card updated");
        } catch (err) {
          toast.error("Failed to update");
        }
      }}
      style={{
        padding: "12px 28px",
        background: "#1878C8",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700
      }}
    >
      Save Business Card
    </button>

    <ImageCropModal
  open={showProfileCropper}
  image={form.profilePhoto}
  crop={crop}
  setCrop={setCrop}
  zoom={zoom}
  setZoom={setZoom}
  onClose={() => setShowProfileCropper(false)}
/>

<ImageCropModal
  open={showLogoCropper}
  image={form.companyLogo}
  crop={logoCrop}
  setCrop={setLogoCrop}
  zoom={logoZoom}
  setZoom={setLogoZoom}
  onClose={() => setShowLogoCropper(false)}
/>
  </div>
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
