import { useState, useEffect } from "react";
import { adminAPI } from "../api";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const initials=n=>n?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";

export default function Admin() {
  const { user } = useAuth();
  const [tab,setTab]=useState("pending");
  const [stats,setStats]=useState(null);
  const [pending,setPending]=useState([]);
  const [allUsers,setAllUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [rejectModal,setRejectModal]=useState(null);
  const [rejectReason,setRejectReason]=useState("");
  const [actionLoading,setActionLoading]=useState(null);

  useEffect(()=>{if(user?.is_admin)loadData();},[user]);

  const loadData=async()=>{
    setLoading(true);
    try{const[s,p,a]=await Promise.all([adminAPI.stats(),adminAPI.pending(),adminAPI.users()]);setStats(s.data);setPending(p.data.users);setAllUsers(a.data.users);}
    catch{toast.error("Failed to load admin data");}
    finally{setLoading(false);}
  };

  const approve=async(userId,name)=>{
    setActionLoading(userId);
    try{await adminAPI.approve(userId);toast.success(`${name} approved!`);setPending(p=>p.filter(u=>u.id!==userId));loadData();}
    catch(err){toast.error(err.response?.data?.error||"Failed");}
    finally{setActionLoading(null);}
  };

  const reject=async()=>{
    if(!rejectReason.trim()){toast.error("Please provide a reason");return;}
    setActionLoading(rejectModal.id);
    try{await adminAPI.reject(rejectModal.id,rejectReason);toast.success(`${rejectModal.name} rejected`);setPending(p=>p.filter(u=>u.id!==rejectModal.id));setRejectModal(null);setRejectReason("");loadData();}
    catch(err){toast.error(err.response?.data?.error||"Failed");}
    finally{setActionLoading(null);}
  };

  if(!user?.is_admin)return(<div style={{paddingTop:40,textAlign:"center"}}><div style={{fontSize:44,marginBottom:10}}>🔒</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0A1628"}}>Admin access required</div></div>);

  const VB=({type})=>{const map={din:["#EEF3FC","#1251A3","DIN"],linkedin:["#EAF5EE","#1A6B38","LinkedIn"],succession:["#FFF8E8","#8A5800","Succession"],admin:["#F0F4FF","#4A6FA5","Admin"]};const[bg,color,label]=map[type]||map.admin;return<span style={{background:bg,color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{label}</span>;};
  const SB=({status})=>{const map={approved:["#EAF5EE","#1A6B38"],rejected:["#FFF0F0","#D44"],pending:["#FFF8E8","#8A5800"]};const[bg,color]=map[status]||map.pending;return<span style={{background:bg,color,fontSize:11,fontWeight:700,padding:"4px 11px",borderRadius:20}}>{status}</span>;};

  const UserCard=({u,showActions})=>(
    <div style={{background:"#fff",border:"1.5px solid #E2EBF8",borderRadius:14,padding:"13px 16px",marginBottom:10,transition:"all 0.18s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="#A0BDDF";e.currentTarget.style.boxShadow="0 3px 12px rgba(18,81,163,0.07)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2EBF8";e.currentTarget.style.boxShadow="none";}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
        <div style={{width:40,height:40,borderRadius:11,background:"#1251A3",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{initials(u.name)}</div>
        <div style={{flex:1,minWidth:180}}>
          <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#0A1628",letterSpacing:"-0.3px"}}>{u.name}</span>
            <VB type={u.verification_type}/>
          </div>
          <p style={{fontSize:12,color:"#7A90B0",margin:"0 0 6px",fontWeight:500}}>{u.email} · {u.phone} · {u.industry||"—"} · {u.city}</p>
          {u.verification_type==="din"&&<div style={{background:"#F8FAFF",borderRadius:8,padding:"6px 11px",fontSize:12,color:"#1251A3",fontWeight:500,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span><strong>DIN:</strong> {u.din_number}</span><span>·</span><span><strong>Director:</strong> {u.din_director_name}</span><a href="https://www.mca.gov.in/mcafoportal/viewDirectorMasterData.do" target="_blank" rel="noreferrer" style={{color:"#1251A3",fontWeight:700,textDecoration:"none",border:"1px solid #C8D9F0",borderRadius:6,padding:"2px 8px",fontSize:11}}>Verify ↗</a></div>}
          {u.verification_type==="succession"&&<div style={{background:"#FFF8E8",borderRadius:8,padding:"6px 11px",fontSize:12,color:"#8A5800",fontWeight:500}}><strong>Prev DIN:</strong> {u.succession_prev_din||"—"} · <strong>New DIN:</strong> {u.succession_new_din||"not yet"}{u.succession_doc_note&&<><br/><strong>Doc:</strong> {u.succession_doc_note}</>}</div>}
          {u.verification_type==="linkedin"&&u.linkedin_url&&<div style={{background:"#EAF5EE",borderRadius:8,padding:"6px 11px",fontSize:12}}><a href={u.linkedin_url} target="_blank" rel="noreferrer" style={{color:"#1A6B38",fontWeight:700}}>{u.linkedin_url} ↗</a></div>}
          <p style={{fontSize:11,color:"#9EB0CC",marginTop:6,fontWeight:500}}>Submitted {new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"flex-start",flexShrink:0,flexWrap:"wrap"}}>
          {showActions?(
            <>
              <button onClick={()=>approve(u.id,u.name)} disabled={actionLoading===u.id}
                style={{padding:"7px 16px",background:"#1A6B38",color:"#fff",border:"none",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700,transition:"all 0.15s"}}
                onMouseEnter={e=>{if(actionLoading!==u.id){e.currentTarget.style.background="#135228";e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{e.currentTarget.style.background="#1A6B38";e.currentTarget.style.transform="translateY(0)";}}>
                {actionLoading===u.id?"...":"Approve"}
              </button>
              <button onClick={()=>{setRejectModal(u);setRejectReason("");}}
                style={{padding:"7px 14px",background:"transparent",color:"#D44",border:"1.5px solid #F0A0A0",borderRadius:8,fontSize:12,cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit",fontWeight:700}}
                onMouseEnter={e=>e.currentTarget.style.background="#FFF0F0"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                Reject
              </button>
            </>
          ):<SB status={u.verification_status}/>}
        </div>
      </div>
    </div>
  );

  return(
    <div style={{paddingTop:24,animation:"fadeUp 0.4s ease"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#0A1628",marginBottom:4,letterSpacing:"-0.5px"}}>Admin Panel</div>
      <p style={{color:"#7A90B0",fontSize:13,marginBottom:22,fontWeight:500}}>Review and approve member verification requests</p>

      {stats&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:26}}>
          {[["Pending",stats.pending,"#FFF8E8","#8A5800"],["Approved Today",stats.approved_today,"#EAF5EE","#1A6B38"],["Approved",stats.approved,"#EEF3FC","#1251A3"],["Rejected",stats.rejected,"#FFF0F0","#D44"],["Total",stats.total_users,"#F8FAFF","#4A6FA5"]].map(([label,val,bg,color])=>(
            <div key={label} style={{background:bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${color}25`}}>
              <p style={{fontSize:11,color,marginBottom:4,fontWeight:700,letterSpacing:"0.2px"}}>{label}</p>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color,margin:0}}>{val||0}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["pending",`Pending (${pending.length})`],["all","All Users"]].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{padding:"8px 18px",borderRadius:9,border:`1.5px solid ${tab===key?"#1251A3":"#C8D9F0"}`,background:tab===key?"#1251A3":"transparent",color:tab===key?"#fff":"#4A6FA5",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Cabinet Grotesk',sans-serif",transition:"all 0.15s",letterSpacing:"-0.2px"}}>
            {label}
          </button>
        ))}
      </div>

      {loading?<p style={{color:"#7A90B0",fontSize:13,fontWeight:500}}>Loading...</p>:(
        <>
          {tab==="pending"&&(pending.length===0?<div style={{background:"#fff",border:"1.5px solid #E2EBF8",borderRadius:18,padding:"3rem",textAlign:"center",boxShadow:"0 2px 10px rgba(18,81,163,0.04)"}}><div style={{fontSize:36,marginBottom:10}}>✅</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0A1628"}}>All caught up!</div></div>:pending.map(u=><UserCard key={u.id} u={u} showActions/>))}
          {tab==="all"&&allUsers.map(u=><UserCard key={u.id} u={u}/>)}
        </>
      )}

      {rejectModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,22,40,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1rem",animation:"fadeIn 0.2s ease"}}
          onClick={e=>{if(e.target===e.currentTarget){setRejectModal(null);setRejectReason("");}}}><div style={{background:"#fff",borderRadius:18,padding:"2rem",width:"100%",maxWidth:420,boxShadow:"0 24px 60px rgba(10,22,40,0.25)",animation:"fadeUp 0.25s ease"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#0A1628",marginBottom:8}}>Reject {rejectModal.name}</div>
          <p style={{fontSize:13,color:"#7A90B0",marginBottom:14,fontWeight:500}}>Reason is shown to the user on login.</p>
          <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="e.g. DIN not found on MCA portal..." style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid #C8D9F0",fontSize:13.5,boxSizing:"border-box",resize:"vertical",fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:500,outline:"none",background:"#F8FAFF"}}/>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={reject} disabled={actionLoading===rejectModal.id} style={{flex:1,padding:"11px",background:"#D44",color:"#fff",border:"none",borderRadius:11,fontSize:13,cursor:"pointer",fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700}}>
              {actionLoading===rejectModal.id?"Rejecting...":"Confirm Reject"}
            </button>
            <button onClick={()=>{setRejectModal(null);setRejectReason("");}} style={{padding:"11px 18px",background:"transparent",color:"#7A90B0",border:"1.5px solid #C8D9F0",borderRadius:11,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Cancel</button>
          </div>
        </div></div>
      )}
    </div>
  );
}
