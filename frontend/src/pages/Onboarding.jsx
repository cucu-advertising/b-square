import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingAPI } from "../api";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const CONNECT_WITH = ["Manufacturers","Logistics Firms","Retailers","Tech Companies","Investors","Distributors","Service Providers","Exporters","Importers","Franchises","Government Bodies","Startups"];
const INTERESTS = ["B2B Sales","Digital Transformation","SaaS Partnerships","Tech Outsourcing","Import/Export","Franchise Expansion","Joint Ventures","Product Distribution","Raw Materials","Contract Manufacturing","Financial Services","Marketing & PR"];
const GOALS = [
  { value:"clients", label:"Find new clients / customers", sub:"Expand your customer base" },
  { value:"vendors", label:"Find vendors / suppliers", sub:"Source materials or services" },
  { value:"partnership", label:"Form partnerships", sub:"Joint ventures and collaborations" },
  { value:"investment", label:"Raise investment / funding", sub:"Connect with investors" },
  { value:"distribution", label:"Expand distribution network", sub:"Reach new markets" },
  { value:"networking", label:"General networking", sub:"Build industry relationships" },
];
const SIZES = ["1–10","11–50","51–200","201–500","500+"];
const REVENUES = ["Under ₹50L","₹50L–1Cr","₹1–5Cr","₹5–20Cr","₹20Cr+"];
const YEARS = Array.from({length:50},(_,i)=>(new Date().getFullYear()-i).toString());

export default function Onboarding() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
  founderName: "",
  lookingFor: [],
  businessGoal: "",
  companySize: "",
  revenueRange: "",
  businessInterests: [],
  yearFounded: "",

  companyName: "",
  headline: "I'm a Member of BSquare",
  companyLogo: "",
  profilePhoto: "",
});

  const toggle = (key, val) => setForm(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(x=>x!==val) : [...p[key], val]
  }));

  const sel = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const submit = async () => {
    setSaving(true);
    try {
      await onboardingAPI.save(form);
      updateUser({ onboarding_done: true });
      toast.success("Profile complete! Welcome to B Square.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally { setSaving(false); }
  };

  const ChipBtn = ({ selected, onClick, children }) => (
    <button onClick={onClick} style={{
      padding:"8px 14px", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer",
      fontFamily:"inherit", transition:"all 0.15s",
      border: selected ? "1.5px solid #1251A3" : "1.5px solid #C8D9F0",
      background: selected ? "#EEF3FC" : "transparent",
      color: selected ? "#1251A3" : "#4A6FA5",
    }}>{children}</button>
  );

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#F0F4FF,#E2EBF8)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem 1rem" }}>
      <div style={{ width:"100%", maxWidth:520, animation:"fadeUp 0.4s ease" }}>

        <div style={{ background:"#1251A3", borderRadius:"18px 18px 0 0", padding:"24px 28px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>
            Step {step} of {totalSteps} — Almost done!
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#fff", marginBottom:4 }}>
            {step===1 && "Tell us about yourself"}
            {step===2 && "Your business goals"}
            {step===3 && "Who you want to connect with"}
            {step===4 && "Business interests & details"}
          </div>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:500, marginBottom:14 }}>
            This helps us show you the most relevant connections nearby
          </p>
          <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:4, height:4, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"#fff", borderRadius:4, width:`${progress}%`, transition:"width 0.4s ease" }} />
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:"0 0 18px 18px", padding:"24px 28px", border:"1px solid #E2EBF8", borderTop:"none" }}>

          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px" }}>
                  Your Name (Founder / Director) *
                </label>
                <input value={form.founderName} onChange={e=>setForm(p=>({...p,founderName:e.target.value}))}
                  placeholder="e.g. Prathik Sharma"
                  style={{ width:"100%", padding:"11px 13px", border:"1.5px solid #C8D9F0", borderRadius:9, fontSize:13.5, background:"#F8FAFF", color:"#0A1628", fontFamily:"inherit", fontWeight:500, outline:"none", boxSizing:"border-box", transition:"all 0.18s" }}
                  onFocus={e=>{e.target.style.borderColor="#1251A3";e.target.style.background="#fff";e.target.style.boxShadow="0 0 0 3px rgba(18,81,163,0.1)";}}
                  onBlur={e=>{e.target.style.borderColor="#C8D9F0";e.target.style.background="#F8FAFF";e.target.style.boxShadow="none";}} />
              </div>
              <div>
  <label style={{
    fontSize:11,
    fontWeight:700,
    color:"#1251A3",
    display:"block",
    marginBottom:6,
    textTransform:"uppercase",
    letterSpacing:"0.7px"
  }}>
    Company Name
  </label>

  <input
    value={form.companyName}
    onChange={e=>setForm(p=>({...p,companyName:e.target.value}))}
    placeholder="e.g. Ravi Textiles"
    style={{
      width:"100%",
      padding:"11px 13px",
      border:"1.5px solid #C8D9F0",
      borderRadius:9,
      fontSize:13.5,
      background:"#F8FAFF",
      color:"#0A1628",
      fontFamily:"inherit"
    }}
  />
</div>

<div>
  <label style={{
    fontSize:11,
    fontWeight:700,
    color:"#1251A3",
    display:"block",
    marginBottom:6,
    textTransform:"uppercase",
    letterSpacing:"0.7px"
  }}>
    Profile Headline
  </label>

  <input
    value={form.headline}
    onChange={e=>setForm(p=>({...p,headline:e.target.value}))}
    placeholder="I'm a Member of BSquare"
    style={{
      width:"100%",
      padding:"11px 13px",
      border:"1.5px solid #C8D9F0",
      borderRadius:9,
      fontSize:13.5,
      background:"#F8FAFF",
      color:"#0A1628",
      fontFamily:"inherit"
    }}
  />
</div>

<div>
  <label style={{
    fontSize:11,
    fontWeight:700,
    color:"#1251A3",
    display:"block",
    marginBottom:6,
    textTransform:"uppercase",
    letterSpacing:"0.7px"
  }}>
    Company Logo
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e)=>{
      const file=e.target.files[0];
      if(!file) return;

      const reader=new FileReader();

      reader.onload=()=>{
        setForm(p=>({
          ...p,
          companyLogo: reader.result
        }));
      };

      reader.readAsDataURL(file);
    }}
  />
</div>

<div>
  <label style={{
    fontSize:11,
    fontWeight:700,
    color:"#1251A3",
    display:"block",
    marginBottom:6,
    textTransform:"uppercase",
    letterSpacing:"0.7px"
  }}>
    Profile Photo
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e)=>{
      const file=e.target.files[0];
      if(!file) return;

      const reader=new FileReader();

      reader.onload=()=>{
        setForm(p=>({
          ...p,
          profilePhoto: reader.result
        }));
      };

      reader.readAsDataURL(file);
    }}
  />
</div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.7px" }}>Year Founded</label>
                <select value={form.yearFounded} onChange={e=>sel("yearFounded",e.target.value)}
                  style={{ width:"100%", padding:"11px 13px", border:"1.5px solid #C8D9F0", borderRadius:9, fontSize:13.5, background:"#F8FAFF", color:form.yearFounded?"#0A1628":"#9EB0CC", fontFamily:"inherit", fontWeight:500, outline:"none", boxSizing:"border-box" }}>
                  <option value="">Select year founded</option>
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.7px" }}>Company Size</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {SIZES.map(s=><ChipBtn key={s} selected={form.companySize===s} onClick={()=>sel("companySize",s)}>{s} employees</ChipBtn>)}
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.7px" }}>Annual Revenue Range</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {REVENUES.map(r=><ChipBtn key={r} selected={form.revenueRange===r} onClick={()=>sel("revenueRange",r)}>{r}</ChipBtn>)}
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {GOALS.map(g=>(
                <div key={g.value} onClick={()=>sel("businessGoal",g.value)}
                  style={{ padding:"13px 15px", border:`1.5px solid ${form.businessGoal===g.value?"#1251A3":"#E2EBF8"}`, borderRadius:11, cursor:"pointer", background:form.businessGoal===g.value?"#F8FAFF":"#fff", display:"flex", alignItems:"center", gap:12, transition:"all 0.15s" }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${form.businessGoal===g.value?"#1251A3":"#C8D9F0"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                    {form.businessGoal===g.value && <div style={{ width:8, height:8, borderRadius:"50%", background:"#1251A3" }} />}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0A1628", letterSpacing:"-0.2px" }}>{g.label}</div>
                    <div style={{ fontSize:12, color:"#7A90B0", fontWeight:500, marginTop:2 }}>{g.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step===3 && (
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.7px" }}>
                Select all that apply (choose multiple)
              </label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {CONNECT_WITH.map(item=>(
                  <ChipBtn key={item} selected={form.lookingFor.includes(item)} onClick={()=>toggle("lookingFor",item)}>{item}</ChipBtn>
                ))}
              </div>
              {form.lookingFor.length > 0 && (
                <div style={{ marginTop:14, padding:"10px 13px", background:"#EEF3FC", borderRadius:9, fontSize:12, color:"#1251A3", fontWeight:500 }}>
                  {form.lookingFor.length} selected: {form.lookingFor.join(", ")}
                </div>
              )}
            </div>
          )}

          {step===4 && (
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"#1251A3", display:"block", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.7px" }}>
                Business interests (choose multiple)
              </label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {INTERESTS.map(item=>(
                  <ChipBtn key={item} selected={form.businessInterests.includes(item)} onClick={()=>toggle("businessInterests",item)}>{item}</ChipBtn>
                ))}
              </div>
              {form.businessInterests.length > 0 && (
                <div style={{ marginTop:14, padding:"10px 13px", background:"#EEF3FC", borderRadius:9, fontSize:12, color:"#1251A3", fontWeight:500 }}>
                  {form.businessInterests.length} selected
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {step > 1 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ padding:"11px 20px", background:"transparent", color:"#7A90B0", border:"1.5px solid #C8D9F0", borderRadius:10, fontSize:13, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                ← Back
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={()=>setStep(s=>s+1)} style={{ flex:1, padding:"12px", background:"#1251A3", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#0E3F85";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#1251A3";}}>
                Continue →
              </button>
            ) : (
              <button onClick={submit} disabled={saving} style={{ flex:1, padding:"12px", background:saving?"#A0BDDF":"#1251A3", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                {saving ? "Saving..." : "Complete Profile →"}
              </button>
            )}
            <button onClick={()=>{updateUser({onboarding_done:true});navigate("/");}} style={{ padding:"11px 16px", background:"transparent", color:"#9EB0CC", border:"none", borderRadius:10, fontSize:13, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
