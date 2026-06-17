import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const CITIES={Hyderabad:[17.385,78.4867],Mumbai:[19.076,72.8777],Delhi:[28.6139,77.209],Bangalore:[12.9716,77.5946],Chennai:[13.0827,80.2707],Pune:[18.5204,73.8567],Ahmedabad:[23.0225,72.5714],Kolkata:[22.5726,88.3639],Jaipur:[26.9124,75.7873],Surat:[21.1702,72.8311]};
const INDUSTRIES=["IT Services","Textiles & Garments","Food & Beverages","Pharmaceuticals","Logistics & Transport","Manufacturing","Real Estate","Finance & Banking","Healthcare","Education","Retail & Wholesale","Construction","Agriculture","Chemicals","Automotive","Other"];

export default function Register() {
  const { register } = useAuth();
  const [step,setStep]=useState(1);
  const [loading,setLoading]=useState(false);
  const [locStatus,setLocStatus]=useState("idle");
  const [coords,setCoords]=useState(null);
  const [verType,setVerType]=useState("din");
  const [submitted,setSubmitted]=useState(false);
  const [form,setForm]=useState({name:"",businessName:"",industry:"",city:"",bio:"",dinNumber:"",dinDirectorName:"",linkedinUrl:"",successionPrevDin:"",successionNewDin:"",successionDocNote:"",email:"",password:"",confirmPassword:"",phone:""});
  const [errors,setErrors]=useState({});

  useEffect(()=>{requestLocation();},[]);

  const requestLocation=()=>{
    if(!navigator.geolocation){setLocStatus("denied");return;}
    setLocStatus("requesting");
    navigator.geolocation.getCurrentPosition(pos=>{setCoords({lat:pos.coords.latitude,lng:pos.coords.longitude});setLocStatus("granted");},()=>setLocStatus("denied"),{enableHighAccuracy:true,timeout:10000});
  };

  const f=k=>e=>{setForm(p=>({...p,[k]:e.target.value}));if(errors[k])setErrors(p=>({...p,[k]:""}));};
  const IS=(key)=>({width:"100%",padding:"11px 13px",borderRadius:9,border:`1.5px solid ${errors[key]?"#E24B4A":"#C8D9F0"}`,fontSize:13.5,background:errors[key]?"#FFF5F5":"#F8FAFF",color:"#0A1628",fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:500,outline:"none",boxSizing:"border-box",transition:"all 0.18s"});
  const fo=e=>{e.target.style.borderColor="#1251A3";e.target.style.background="#fff";e.target.style.boxShadow="0 0 0 3px rgba(18,81,163,0.1)";};
  const bl=(e,key)=>{if(!errors[key]){e.target.style.borderColor="#C8D9F0";e.target.style.background="#F8FAFF";e.target.style.boxShadow="none";}};
  const Lbl=({children})=><label style={{fontSize:11,fontWeight:700,color:"#1251A3",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.7px"}}>{children}</label>;

  const v1=()=>{const e={};if(!form.name.trim())e.name="Required";if(!form.businessName.trim())e.businessName="Required";if(!form.city)e.city="Required";setErrors(e);return Object.keys(e).length===0;};
  const v2=()=>{const e={};if(verType==="din"){if(!form.dinNumber.trim())e.dinNumber="Required";else if(!/^\d{8}$/.test(form.dinNumber.trim()))e.dinNumber="Must be 8 digits";if(!form.dinDirectorName.trim())e.dinDirectorName="Required";}else if(verType==="linkedin"){if(!form.linkedinUrl.trim())e.linkedinUrl="Required";else if(!form.linkedinUrl.toLowerCase().includes("linkedin.com/in/"))e.linkedinUrl="Must be a valid LinkedIn URL";}else if(verType==="succession"){if(!form.successionDocNote.trim())e.successionDocNote="Required";}setErrors(e);return Object.keys(e).length===0;};
  const v3=()=>{const e={};if(!form.email.trim())e.email="Required";else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))e.email="Invalid email";if(!form.phone.trim())e.phone="Required";else if(!/^[6-9]\d{9}$/.test(form.phone.trim()))e.phone="Valid 10-digit number required";if(!form.password)e.password="Required";else if(form.password.length<8)e.password="Min 8 characters";if(form.password!==form.confirmPassword)e.confirmPassword="Don't match";setErrors(e);return Object.keys(e).length===0;};

  const submit=async()=>{
    if(!v3())return;
    setLoading(true);
    let lat,lng;
    if(coords){lat=coords.lat;lng=coords.lng;}else{const[clat,clng]=CITIES[form.city]||[17.385,78.4867];lat=clat+(Math.random()-0.5)*0.02;lng=clng+(Math.random()-0.5)*0.02;}
    try{
      const result=await register({name:form.name.trim(),businessName:form.businessName.trim(),industry:form.industry,city:form.city,bio:form.bio.trim(),email:form.email.trim().toLowerCase(),password:form.password,phone:form.phone.trim(),verificationType:verType,dinNumber:verType==="din"?form.dinNumber.trim():undefined,dinDirectorName:verType==="din"?form.dinDirectorName.trim():undefined,linkedinUrl:verType==="linkedin"?form.linkedinUrl.trim():undefined,successionPrevDin:form.successionPrevDin.trim()||undefined,successionNewDin:form.successionNewDin.trim()||undefined,successionDocNote:verType==="succession"?form.successionDocNote.trim():undefined,lat,lng});
      if(result?.pendingReview)setSubmitted(true);
    }catch(err){
      const msg=err.response?.data?.error||"Registration failed";
      if(msg.toLowerCase().includes("din")){setStep(2);setErrors({dinNumber:msg});}
      else if(msg.toLowerCase().includes("linkedin")){setStep(2);setErrors({linkedinUrl:msg});}
      else if(msg.toLowerCase().includes("email"))setErrors({email:msg});
      else toast.error(msg);
    }finally{setLoading(false);}
  };

  const locBadge=locStatus==="granted"?{bg:"#EAF5EE",color:"#1A6B38",text:"📍 Live GPS active"}:locStatus==="requesting"?{bg:"#EEF3FC",color:"#1251A3",text:"⏳ Detecting location..."}:{bg:"#FFF8E8",color:"#8A5800",text:"⚠️ Location denied — city center used"};

  if(submitted)return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F0F4FF,#E2EBF8)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{textAlign:"center",maxWidth:420,animation:"fadeUp 0.5s ease"}}>
        <div style={{width:72,height:72,background:"#1A6B38",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:18}}>✓</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#0A1628",marginBottom:10}}>Application Submitted!</div>
        <p style={{color:"#7A90B0",fontSize:13.5,lineHeight:1.7,marginBottom:24,fontWeight:500}}>Our admin team will verify your details and approve your account within <strong style={{color:"#1251A3"}}>24 hours</strong>.</p>
        <div style={{background:"#fff",border:"1px solid #E2EBF8",borderRadius:14,padding:"1.2rem",marginBottom:22,textAlign:"left"}}>
          {[["Business",form.businessName],["Verification",verType==="din"?"DIN":verType==="linkedin"?"LinkedIn":"Succession"],["Status","Pending review"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #EEF3FC",fontSize:13}}>
              <span style={{color:"#9EB0CC",fontWeight:600}}>{k}</span>
              <span style={{fontWeight:700,color:"#0A1628"}}>{v}</span>
            </div>
          ))}
        </div>
        <Link to="/home" style={{display:"inline-block",padding:"12px 30px",background:"#1251A3",color:"#fff",borderRadius:11,textDecoration:"none",fontSize:14,fontWeight:700,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Back to Sign In →</Link>
      </div>
    </div>
  );

  const stepLabels=["Business Info","Verification","Account"];
  const BTN={width:"100%",padding:"12px",background:"#1251A3",color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Cabinet Grotesk',sans-serif",letterSpacing:"-0.2px",transition:"all 0.18s"};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F0F4FF,#E2EBF8)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1rem"}}>
      <div style={{width:"100%",maxWidth:510,animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{width:48,height:48,background:"#1251A3",borderRadius:12,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:19,fontWeight:800,letterSpacing:"-1px",marginBottom:12}}>B²</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#0A1628"}}>Create your account</div>
          <p style={{fontSize:13,color:"#7A90B0",marginTop:5,fontWeight:500}}>Verified business professionals only</p>
        </div>

        <div style={{background:locBadge.bg,color:locBadge.color,borderRadius:9,padding:"8px 13px",marginBottom:14,fontSize:12,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{locBadge.text}</span>
          {locStatus==="denied"&&<button onClick={requestLocation} style={{background:"transparent",border:`1px solid ${locBadge.color}`,borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer",color:locBadge.color,fontFamily:"inherit",fontWeight:700}}>Retry</button>}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,justifyContent:"center"}}>
          {stepLabels.map((label,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:step>i+1?"#1A6B38":step===i+1?"#1251A3":"#E2EBF8",color:step>=i+1?"#fff":"#9EB0CC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,transition:"all 0.25s"}}>
                {step>i+1?"✓":i+1}
              </div>
              <span style={{fontSize:12,color:step===i+1?"#0A1628":"#9EB0CC",fontWeight:step===i+1?700:500}}>{label}</span>
              {i<2&&<div style={{width:26,height:2,background:step>i+1?"#1A6B38":"#E2EBF8",borderRadius:2,transition:"all 0.3s"}}/>}
            </div>
          ))}
        </div>

        <div style={{background:"#fff",borderRadius:18,padding:"1.9rem",boxShadow:"0 4px 20px rgba(18,81,163,0.09)",border:"1px solid #E2EBF8"}}>

          {step===1&&<>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0A1628",marginBottom:18}}>Business Information</div>
            <div style={{marginBottom:13}}><Lbl>Your Full Name *</Lbl><input style={IS("name")} value={form.name} onChange={f("name")} placeholder="e.g. Prathik Sharma" onFocus={fo} onBlur={e=>bl(e,"name")}/>{errors.name&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.name}</p>}</div>
            <div style={{marginBottom:13}}><Lbl>Business Name *</Lbl><input style={IS("businessName")} value={form.businessName} onChange={f("businessName")} placeholder="e.g. Prathik Ventures Pvt. Ltd." onFocus={fo} onBlur={e=>bl(e,"businessName")}/>{errors.businessName&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.businessName}</p>}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13}}>
              <div><Lbl>Industry</Lbl><select value={form.industry} onChange={f("industry")} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid #C8D9F0",fontSize:13.5,background:"#F8FAFF",color:"#0A1628",fontFamily:"inherit",fontWeight:500,outline:"none",boxSizing:"border-box"}}><option value="">Select</option>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
              <div><Lbl>City *</Lbl><select value={form.city} onChange={f("city")} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:`1.5px solid ${errors.city?"#E24B4A":"#C8D9F0"}`,fontSize:13.5,background:errors.city?"#FFF5F5":"#F8FAFF",color:"#0A1628",fontFamily:"inherit",fontWeight:500,outline:"none",boxSizing:"border-box"}}><option value="">Select</option>{Object.keys(CITIES).map(c=><option key={c}>{c}</option>)}</select>{errors.city&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.city}</p>}</div>
            </div>
            <div style={{marginBottom:18}}><Lbl>Business Bio</Lbl><textarea value={form.bio} onChange={f("bio")} placeholder="What does your business do?" rows={2} style={{...IS("bio"),resize:"vertical"}} onFocus={fo} onBlur={e=>bl(e,"bio")}/></div>
            <button onClick={()=>v1()&&setStep(2)} style={BTN} onMouseEnter={e=>{e.currentTarget.style.background="#0E3F85";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.background="#1251A3";e.currentTarget.style.transform="translateY(0)";}}>Continue →</button>
          </>}

          {step===2&&<>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
              <button onClick={()=>setStep(1)} style={{background:"transparent",border:"1.5px solid #C8D9F0",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,color:"#4A6FA5",fontFamily:"inherit",fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.background="#EEF3FC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Back</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0A1628"}}>Identity Verification</div>
            </div>
            <p style={{fontSize:13,color:"#7A90B0",marginBottom:14,fontWeight:500}}>All methods require manual admin review before access is granted.</p>

            {[{type:"din",title:"DIN — Director ID Number",badge:"Manual",badgeBg:"#EEF3FC",badgeColor:"#1251A3",desc:"For MCA-registered directors. Submit your 8-digit DIN and name exactly as on the MCA portal."},
              {type:"succession",title:"Business Succession",badge:"Manual",badgeBg:"#FFF8E8",badgeColor:"#8A5800",desc:"Inherited a family business? Submit predecessor DIN and succession documents."},
              {type:"linkedin",title:"LinkedIn Profile",badge:"24hr",badgeBg:"#EAF5EE",badgeColor:"#1A6B38",desc:"For freelancers & consultants. Profile reviewed for genuine business activity."}
            ].map(opt=>(
              <div key={opt.type} onClick={()=>setVerType(opt.type)} style={{padding:"12px 14px",border:`1.5px solid ${verType===opt.type?"#1251A3":"#E2EBF8"}`,borderRadius:12,cursor:"pointer",background:verType===opt.type?"#F8FAFF":"#fff",marginBottom:9,transition:"all 0.18s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${verType===opt.type?"#1251A3":"#C8D9F0"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {verType===opt.type&&<div style={{width:7,height:7,borderRadius:"50%",background:"#1251A3"}}/>}
                    </div>
                    <span style={{fontSize:13.5,fontWeight:700,color:"#0A1628",letterSpacing:"-0.3px"}}>{opt.title}</span>
                  </div>
                  <span style={{background:opt.badgeBg,color:opt.badgeColor,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap"}}>{opt.badge}</span>
                </div>
                <p style={{fontSize:12,color:"#7A90B0",margin:"0 0 0 24px",lineHeight:1.55,fontWeight:500}}>{opt.desc}</p>
              </div>
            ))}

            {verType==="din"&&<div style={{marginTop:14}}>
              {[["DIN Number *","dinNumber","text","e.g. 00123456"],["Director Name as on MCA *","dinDirectorName","text","Full name as registered"]].map(([label,key,type,ph])=>(
                <div key={key} style={{marginBottom:12}}><Lbl>{label}</Lbl><input style={IS(key)} value={form[key]} onChange={f(key)} placeholder={ph} onFocus={fo} onBlur={e=>bl(e,key)}/>{errors[key]&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors[key]}</p>}</div>
              ))}
            </div>}

            {verType==="succession"&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:11}}>
              {[["Previous Owner's DIN","successionPrevDin","Original DIN"],["Your New DIN","successionNewDin","Leave blank if not yet applied"]].map(([label,key,ph])=>(
                <div key={key}><Lbl>{label}</Lbl><input style={IS(key)} value={form[key]} onChange={f(key)} placeholder={ph} onFocus={fo} onBlur={e=>bl(e,key)}/></div>
              ))}
              <div><Lbl>Succession Document Description *</Lbl><textarea value={form.successionDocNote} onChange={f("successionDocNote")} rows={3} placeholder="e.g. Board resolution transferring directorship..." style={{...IS("successionDocNote"),resize:"vertical"}} onFocus={fo} onBlur={e=>bl(e,"successionDocNote")}/>{errors.successionDocNote&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.successionDocNote}</p>}</div>
              <div style={{background:"#EEF3FC",borderRadius:9,padding:"9px 12px",fontSize:12,color:"#4A6FA5",fontWeight:500}}>ℹ️ No DIN yet? Apply at <strong>mca.gov.in</strong> → MCA Services → DIN Services (1–3 business days).</div>
            </div>}

            {verType==="linkedin"&&<div style={{marginTop:14}}>
              <Lbl>LinkedIn Profile URL *</Lbl>
              <input type="url" style={IS("linkedinUrl")} value={form.linkedinUrl} onChange={f("linkedinUrl")} placeholder="https://linkedin.com/in/yourprofile" onFocus={fo} onBlur={e=>bl(e,"linkedinUrl")}/>
              {errors.linkedinUrl?<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.linkedinUrl}</p>:<p style={{fontSize:12,color:"#9EB0CC",marginTop:4,fontWeight:500}}>Profiles under 50 connections or no work history won't be approved.</p>}
            </div>}

            <button onClick={()=>v2()&&setStep(3)} style={{...BTN,marginTop:16}} onMouseEnter={e=>{e.currentTarget.style.background="#0E3F85";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.background="#1251A3";e.currentTarget.style.transform="translateY(0)";}}>Continue →</button>
          </>}

          {step===3&&<>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
              <button onClick={()=>setStep(2)} style={{background:"transparent",border:"1.5px solid #C8D9F0",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,color:"#4A6FA5",fontFamily:"inherit",fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.background="#EEF3FC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>← Back</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0A1628"}}>Account Details</div>
            </div>
            {[["Email Address *","email","email","info@yourbusiness.in"],["Password *","password","password","Minimum 8 characters"],["Confirm Password *","confirmPassword","password","Re-enter password"]].map(([label,key,type,ph])=>(
              <div key={key} style={{marginBottom:13}}><Lbl>{label}</Lbl><input type={type} style={IS(key)} value={form[key]} onChange={f(key)} placeholder={ph} onFocus={fo} onBlur={e=>bl(e,key)}/>{errors[key]&&<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors[key]}</p>}</div>
            ))}
            <div style={{marginBottom:18}}><Lbl>Phone Number *</Lbl><input type="tel" style={IS("phone")} value={form.phone} onChange={f("phone")} placeholder="98xxxxxxxx (10 digits)" onFocus={fo} onBlur={e=>bl(e,"phone")}/>{errors.phone?<p style={{color:"#E24B4A",fontSize:12,marginTop:3,fontWeight:500}}>{errors.phone}</p>:<p style={{fontSize:11,color:"#9EB0CC",marginTop:3,fontWeight:500}}>Shared automatically when connection is accepted</p>}</div>
            <button onClick={submit} disabled={loading} style={{...BTN,background:loading?"#A0BDDF":"#1251A3",cursor:loading?"not-allowed":"pointer"}} onMouseEnter={e=>{if(!loading){e.currentTarget.style.background="#0E3F85";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.background=loading?"#A0BDDF":"#1251A3";e.currentTarget.style.transform="translateY(0)";}}>
              {loading?"Submitting...":"Submit for Review"}
            </button>
          </>}
        </div>

        <p style={{textAlign:"center",fontSize:13,color:"#7A90B0",marginTop:14,fontWeight:500}}>
          Already have an account? <Link to="/home" style={{color:"#1251A3",fontWeight:700,textDecoration:"none"}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
