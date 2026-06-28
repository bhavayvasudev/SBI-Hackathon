import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Zap, LogOut, Bell, TrendingUp, TrendingDown, Wallet,
  CreditCard, Shield, ChevronRight, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, RefreshCw, User, CheckCircle,
  Clock, Landmark, Star, Copy, Sparkles,
  Target, Plus, X as XIcon, AlertCircle, Gift,
  FileText, Banknote, LayoutDashboard, Search,
  Award, ArrowLeftRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import { getMyProfile, logoutCustomer } from '../lib/api.js';
import CopilotPanel from '../components/CopilotPanel.jsx';

/* ─── Deterministic mock data ────────────────────────────── */
function hashNum(str, salt = 0) {
  let h = 5381 + salt;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h);
}
function seeded(str, salt, min, max) {
  return min + (hashNum(str, salt) % (max - min + 1));
}
function generateFinancialData(customerId, category) {
  const seed = customerId || 'DEMO';
  const baseValues = {
    student:  { invested: seeded(seed,1,45000,85000),  balance: seeded(seed,2,8000,25000),  credit: 0 },
    salaried: { invested: seeded(seed,1,180000,650000), balance: seeded(seed,2,45000,120000), credit: seeded(seed,3,100000,300000) },
    business: { invested: seeded(seed,1,500000,2000000), balance: seeded(seed,2,150000,500000), credit: seeded(seed,3,500000,2000000) },
  };
  const base = baseValues[category] || baseValues.salaried;
  const returnPct = seeded(seed,4,800,2400) / 100;
  const currentValue = Math.round(base.invested * (1 + returnPct / 100));
  const todayChangePct = (seeded(seed,5,0,200) - 100) / 100;
  const todayChange = Math.round(currentValue * todayChangePct / 100);
  const now = new Date();
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (23 - i) * 7);
    const jitter = seeded(seed, 100 + i, -5, 8) / 100;
    const val = Math.round(base.invested * (1 + (returnPct / 100) * (i / 23)) * (1 + jitter));
    return { date: `${d.toLocaleString('default',{month:'short'})} ${d.getDate()}`, value: val };
  });
  const sipAmount = category === 'student' ? 2000 : category === 'salaried' ? 8000 : 25000;
  const sipMonths = seeded(seed,10,6,24);
  const investments = [
    { id:'mf1', type:'Mutual Fund', name:'SBI Blue Chip Fund', subLabel:'Large Cap · Growth', icon:'📈',
      invested: Math.round(base.invested*0.32), currentValue: Math.round(base.invested*0.32*(1+seeded(seed,20,12,28)/100)),
      units: seeded(seed,21,800,2000), nav: seeded(seed,22,85,130) },
    { id:'sip1', type:'SIP', name:'SBI Small Cap Fund', subLabel:`₹${sipAmount.toLocaleString('en-IN')}/mo · Active`, icon:'🔄',
      invested: sipAmount*sipMonths, currentValue: Math.round(sipAmount*sipMonths*(1+seeded(seed,30,10,22)/100)),
      months: sipMonths, monthly: sipAmount },
    { id:'fd1', type:'Fixed Deposit', name:'SBI Term Deposit', subLabel:`${(seeded(seed,40,65,75)/10).toFixed(1)}% p.a. · ${seeded(seed,41,12,36)} months`, icon:'🏦',
      invested: Math.round(base.invested*0.28), currentValue: Math.round(base.invested*0.28*1.0735),
      maturity:'2026-12-15', rate: seeded(seed,40,65,75)/10 },
    { id:'ins1', type:'Insurance', name:'SBI Life Smart Wealth Builder', subLabel:'Life + Investment · Active', icon:'🛡️',
      premium: seeded(seed,50,20000,80000), coverage: seeded(seed,51,2000000,10000000),
      invested: seeded(seed,50,20000,80000), currentValue: seeded(seed,50,20000,80000), nextDue:'2026-07-01' },
  ];
  if (category==='salaried'||category==='business') {
    investments.push({ id:'mf2', type:'Mutual Fund', name:'SBI Flexicap Fund', subLabel:'Flexicap · IDCW', icon:'📊',
      invested: Math.round(base.invested*0.15), currentValue: Math.round(base.invested*0.15*(1+seeded(seed,60,8,20)/100)),
      units: seeded(seed,61,500,1500), nav: seeded(seed,62,55,95) });
  }
  const totalInvested = investments.reduce((s,i)=>s+i.invested,0);
  const totalCurrent  = investments.reduce((s,i)=>s+i.currentValue,0);
  const typeMap = {};
  investments.forEach(inv => { typeMap[inv.type]=(typeMap[inv.type]||0)+inv.currentValue; });
  const allocation = Object.entries(typeMap).map(([name,value])=>({name,value}));
  const txTypes = [
    { label:'UPI Payment',    sign:-1, Icon:ArrowUpRight,  color:'#ef4444' },
    { label:'Salary Credit',  sign:+1, Icon:ArrowDownLeft, color:'#10b981' },
    { label:'SIP Debit',      sign:-1, Icon:RefreshCw,     color:'#f59e0b' },
    { label:'ATM Withdrawal', sign:-1, Icon:CreditCard,    color:'#ef4444' },
    { label:'Interest Credit',sign:+1, Icon:TrendingUp,    color:'#10b981' },
    { label:'Bill Payment',   sign:-1, Icon:Wallet,        color:'#ef4444' },
    { label:'NEFT Transfer',  sign:-1, Icon:ArrowUpRight,  color:'#ef4444' },
  ];
  const transactions = Array.from({length:8},(_,i)=>{
    const tx = txTypes[seeded(seed,200+i,0,txTypes.length-1)];
    const d = new Date(); d.setDate(d.getDate()-seeded(seed,210+i,0,14));
    const amount = seeded(seed,220+i,500,15000);
    return { id:`tx${i}`, label:tx.label, amount:amount*tx.sign,
      date:d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}), color:tx.color, Icon:tx.Icon };
  });
  return {
    portfolio: { totalInvested, totalCurrent, todayChange, todayChangePct, chartData,
      returns: totalCurrent-totalInvested, returnsPct:((totalCurrent-totalInvested)/totalInvested)*100 },
    banking: { balance:base.balance, availableCredit:base.credit, insuranceActive:true,
      activeLoans: category==='business'?seeded(seed,70,1,3):category==='salaried'?seeded(seed,70,0,1):0,
      emiAmount: category==='salaried'?seeded(seed,71,5000,25000):category==='business'?seeded(seed,71,20000,80000):0 },
    investments, allocation, transactions,
  };
}

const MOCK_NOTIFICATIONS = [
  { id:'n1', title:'KYC Verified', body:'Your PAN and Aadhaar have been successfully verified.', time:'2 hours ago', icon:CheckCircle, color:'#10b981', bg:'rgba(16,185,129,0.1)', read:false },
  { id:'n2', title:'SIP Reminder', body:'Your monthly SIP debit is due in 3 days.', time:'1 day ago', icon:RefreshCw, color:'#f59e0b', bg:'rgba(245,158,11,0.1)', read:false },
  { id:'n3', title:'Portfolio Alert', body:'Your portfolio is up 2.4% today — your best week this quarter!', time:'1 day ago', icon:TrendingUp, color:'#1A56DB', bg:'rgba(26,86,219,0.1)', read:true },
  { id:'n4', title:'Loan Pre-Approval', body:'You are pre-approved for SBI Personal Loan up to ₹5 Lakh.', time:'3 days ago', icon:Gift, color:'#06b6d4', bg:'rgba(6,182,212,0.1)', read:true },
  { id:'n5', title:'EMI Reminder', body:'Home loan EMI is due on 5th of this month.', time:'5 days ago', icon:AlertCircle, color:'#ef4444', bg:'rgba(239,68,68,0.1)', read:true },
];

function computeHealthScore(fin, banking, category) {
  const monthlyIncome = { student:15000, salaried:50000, business:150000 }[category]||50000;
  let score = 0;
  score += Math.round(Math.min(banking.balance/(monthlyIncome*6),1)*25);
  const sipRate = (fin.investments?.find(i=>i.type==='SIP')?.monthly||0)/monthlyIncome;
  score += Math.round(Math.min(sipRate/0.20,1)*30);
  if (banking.insuranceActive) score += 20;
  score += banking.emiAmount ? Math.round(Math.max(0,1-(banking.emiAmount/monthlyIncome)/0.40)*25) : 25;
  return Math.min(100,Math.max(0,score));
}

const GOAL_TEMPLATES = [
  { id:'home',      title:'Buy a House',     emoji:'🏠', defaultTarget:5000000,  color:'#1A56DB' },
  { id:'retire',    title:'Retirement Fund', emoji:'🌅', defaultTarget:10000000, color:'#10b981' },
  { id:'education', title:'Education Fund',  emoji:'🎓', defaultTarget:2000000,  color:'#f59e0b' },
  { id:'emergency', title:'Emergency Fund',  emoji:'🛡️', defaultTarget:500000,   color:'#06b6d4' },
  { id:'car',       title:'Buy a Car',       emoji:'🚗', defaultTarget:1500000,  color:'#0891b2' },
  { id:'travel',    title:'Dream Vacation',  emoji:'✈️', defaultTarget:300000,   color:'#059669' },
];
function loadGoals(cid) {
  try { const s=localStorage.getItem(`hyperone_goals_${cid}`); if(s) return JSON.parse(s); } catch {}
  return [
    { id:'g1', templateId:'emergency', title:'Emergency Fund', emoji:'🛡️', target:500000,  current:80000,  color:'#06b6d4', deadline:'2026-12-31' },
    { id:'g2', templateId:'home',      title:'Buy a House',    emoji:'🏠', target:5000000, current:350000, color:'#1A56DB', deadline:'2029-06-30' },
  ];
}
function saveGoals(cid, goals) {
  try { localStorage.setItem(`hyperone_goals_${cid}`,JSON.stringify(goals)); } catch {}
}

const PIE_COLORS = ['#1A56DB','#10b981','#f59e0b','#ef4444','#06b6d4'];
function formatINR(n) {
  if (Math.abs(n)>=1e7) return `₹${(n/1e7).toFixed(2)}Cr`;
  if (Math.abs(n)>=1e5) return `₹${(n/1e5).toFixed(2)}L`;
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}
function formatFull(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN');
}

/* ─── Visual helpers ─────────────────────────────────────── */
const GLASS = {
  background: '#FFFFFF',
  border: '1px solid rgba(15,23,42,0.07)',
  boxShadow: '0 4px 24px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
};

function RadialScore({ score }) {
  const size=160, sw=12, r=(size-sw)/2, circ=2*Math.PI*r;
  const color = score>=75?'#10b981':score>=50?'#f59e0b':'#ef4444';
  const label = score>=75?'Excellent':score>=50?'Good':'Fair';
  return (
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={sw}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          initial={{strokeDashoffset:circ}}
          animate={{strokeDashoffset:circ-(score/100)*circ}}
          transition={{duration:1.4,ease:'easeOut',delay:0.3}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[2.2rem] font-bold leading-none" style={{color}}>{score}</p>
        <p className="text-[10px] mt-1 font-bold uppercase tracking-[0.18em]" style={{color:color+'bb'}}>{label}</p>
      </div>
    </div>
  );
}

function GoalRing({ pct, color, size=76 }) {
  const sw=7, r=(size-sw)/2, circ=2*Math.PI*r;
  return (
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={sw}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          initial={{strokeDashoffset:circ}}
          animate={{strokeDashoffset:circ-(pct/100)*circ}}
          transition={{duration:1.1,ease:'easeOut',delay:0.2}}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[12px] font-bold" style={{color}}>{pct}%</p>
      </div>
    </div>
  );
}

function Delta({ value, pct, size='sm' }) {
  const pos=value>=0; const color=pos?'#10b981':'#ef4444'; const bg=pos?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)';
  const Icon=pos?TrendingUp:TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${size==='lg'?'text-sm':'text-[11px]'}`}
      style={{background:bg,color,border:`1px solid ${color}22`}}>
      <Icon className="w-3 h-3"/>
      {pos?'+':'-'}{formatINR(Math.abs(value))}
      {pct!==undefined && ` (${pos?'+':''}${pct.toFixed(2)}%)`}
    </span>
  );
}

function TiltCard({ children, style, className, intensity=7 }) {
  const ref=useRef(null);
  const [tilt,setTilt]=useState({x:0,y:0});
  const onMove=useCallback(e=>{
    if(!ref.current) return;
    const rect=ref.current.getBoundingClientRect();
    const x=((e.clientX-rect.left)/rect.width-0.5)*intensity;
    const y=((e.clientY-rect.top)/rect.height-0.5)*-intensity;
    setTilt({x,y});
  },[intensity]);
  const onLeave=useCallback(()=>setTilt({x:0,y:0}),[]);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}
      style={{...style,
        transform:`perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition:tilt.x===0&&tilt.y===0?'transform 0.55s ease':'transform 0.06s ease',
        willChange:'transform'}}>
      {children}
    </div>
  );
}

const CustomTooltip = ({active,payload})=>{
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:'#FFFFFF',border:'1px solid rgba(15,23,42,0.1)',borderRadius:12,padding:'10px 14px',boxShadow:'0 8px 24px rgba(15,23,42,0.12)'}}>
      <p style={{color:'#94A3B8',fontSize:11,marginBottom:4}}>{payload[0]?.payload?.date}</p>
      <p style={{color:'#0F172A',fontWeight:700,fontSize:13}}>{formatINR(payload[0]?.value)}</p>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { customer, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState(customer);
  const [activeTab, setActiveTab] = useState('overview');
  const [hideBalance, setHideBalance] = useState(false);
  const [loading, setLoading] = useState(!customer);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [goals, setGoals] = useState([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const unreadCount = notifications.filter(n=>!n.read).length;

  useEffect(()=>{
    if(!customer) {
      getMyProfile().then(res=>{ if(res.success) setProfile(res.data); })
        .catch(()=>{ clearAuth(); navigate('/'); })
        .finally(()=>setLoading(false));
    }
  },[]);

  const data = useMemo(()=>{
    if(!profile) return null;
    return generateFinancialData(profile.customerId, profile.profile?.category||'salaried');
  },[profile]);

  useEffect(()=>{ if(profile?.customerId) setGoals(loadGoals(profile.customerId)); },[profile?.customerId]);

  const handleSignOut = async () => {
    // Invalidate the JWT server-side first (best-effort — client clears regardless)
    try { await logoutCustomer(); } catch { /* server unreachable — still clear locally */ }
    clearAuth(); // wipes localStorage tokens + all sessionStorage auth keys
    navigate('/');
  };
  const addGoal = template=>{
    const g={ id:'g'+Date.now(), templateId:template.id, title:template.title, emoji:template.emoji,
      target:template.defaultTarget, current:0, color:template.color,
      deadline:new Date(Date.now()+365*24*60*60*1000).toISOString().split('T')[0] };
    const updated=[...goals,g]; setGoals(updated); saveGoals(profile.customerId,updated);
    setShowGoalDialog(false); toast.success('Goal added!');
  };
  const markAllRead = ()=>setNotifications(ns=>ns.map(n=>({...n,read:true})));

  const aiRec = useMemo(()=>{
    const inv = data?.investments||[];
    const sip = inv.find(i=>i.type==='SIP');
    if(sip) {
      const inc = Math.round(sip.monthly*0.25/500)*500;
      return { title:'Increase your SIP', body:`Boost your ${sip.name} SIP by ₹${inc.toLocaleString('en-IN')}/month to hit your goals 2 years earlier.`, gain:`+${formatINR(inc*12*5)} est. in 5yr`, confidence:94 };
    }
    return { title:'Start a SIP today', body:'A ₹5,000/month SIP in SBI Bluechip Fund could grow to ₹8.2L in 10 years.', gain:'+₹3.2L est. gain', confidence:89 };
  },[data]);

  const upcomingBills = useMemo(()=>{
    if(!data) return [];
    const { investments:inv, banking:b } = data;
    const items=[];
    const sip=inv.find(i=>i.type==='SIP');
    if(sip) items.push({ label:sip.name+' SIP', amount:sip.monthly, due:'Due in 3 days', color:'#f59e0b', icon:RefreshCw });
    if(b.emiAmount>0) items.push({ label:'Home Loan EMI', amount:b.emiAmount, due:'Due on 5th', color:'#ef4444', icon:Banknote });
    items.push({ label:'SBI Life Premium', amount:3200, due:'Due Jul 1', color:'#06b6d4', icon:Shield });
    return items.slice(0,3);
  },[data]);

  if(loading||!profile||!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#F7F8FC'}}>
      <div className="text-center space-y-5">
        <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}}
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',boxShadow:'0 8px 32px rgba(26,86,219,0.3)'}}>
          <Zap className="w-6 h-6 text-white"/>
        </motion.div>
        <div>
          <p className="text-sm font-semibold" style={{color:'#334155'}}>Loading your dashboard</p>
          <p className="text-xs mt-1" style={{color:'#94A3B8'}}>Fetching your financial data…</p>
        </div>
      </div>
    </div>
  );

  const { portfolio, banking, investments, allocation, transactions } = data;
  const name = profile.profile?.name||'Customer';
  const firstName = name.split(' ')[0];
  const category = profile.profile?.category||'salaried';
  const kycVerified = profile.kycDocuments?.panVerified && profile.kycDocuments?.aadhaarVerified;
  const netWorth = portfolio.totalCurrent + banking.balance;
  const healthScore = computeHealthScore({ investments }, banking, category);
  const creditScore = Math.min(900, Math.max(650, 650 + Math.floor(healthScore * 2.5)));
  const hour = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';

  const navItems = [
    { id:'overview',     label:'Dashboard',    icon:LayoutDashboard },
    { id:'investments',  label:'Investments',  icon:TrendingUp },
    { id:'transactions', label:'Transactions', icon:ArrowLeftRight },
    { id:'goals',        label:'Goals',        icon:Target },
    null,
    { id:'copilot',      label:'AI Copilot',   icon:Sparkles, highlight:true },
    null,
    { id:'profile',      label:'Profile',      icon:User },
  ];

  const decorativeNavItems = [
    { label:'Cards',      icon:CreditCard },
    { label:'Loans',      icon:Banknote },
    { label:'Insurance',  icon:Shield },
    { label:'Rewards',    icon:Award },
  ];

  const quickActions = [
    { label:'Transfer',  icon:ArrowLeftRight, color:'#1A56DB', bg:'rgba(26,86,219,0.08)', action:()=>setActiveTab('transactions') },
    { label:'Open FD',   icon:Landmark,       color:'#f59e0b', bg:'rgba(245,158,11,0.08)', action:()=>toast.success('Opening FD options…') },
    { label:'Start SIP', icon:RefreshCw,      color:'#10b981', bg:'rgba(16,185,129,0.08)', action:()=>setActiveTab('investments') },
    { label:'Pay Bills', icon:Zap,            color:'#ef4444', bg:'rgba(239,68,68,0.07)',  action:()=>toast.success('Bill pay coming soon') },
    { label:'Apply Loan',icon:Banknote,       color:'#a855f7', bg:'rgba(168,85,247,0.07)', action:()=>toast.success('Checking eligibility…') },
    { label:'Statement', icon:FileText,       color:'#06b6d4', bg:'rgba(6,182,212,0.07)',  action:()=>setActiveTab('transactions') },
    { label:'AI Copilot',icon:Sparkles,       color:'#6366f1', bg:'rgba(99,102,241,0.07)',action:()=>setActiveTab('copilot') },
    { label:'Rewards',   icon:Award,          color:'#fb923c', bg:'rgba(251,146,60,0.07)', action:()=>toast.success('Rewards coming soon') },
  ];

  const accountCards = [
    { title:'Savings Account', subtitle:`A/C •••• ${(profile.accountNumber||'').slice(-4)||'1234'}`,
      balance:banking.balance, icon:Landmark, status:'Active',
      accent:'#1A56DB', iconBg:'rgba(26,86,219,0.1)', borderColor:'rgba(26,86,219,0.12)',
      shadow:'0 8px 32px rgba(26,86,219,0.08), 0 2px 6px rgba(15,23,42,0.05)' },
    { title:'Fixed Deposit', subtitle:`7.35% p.a. · Matures Dec 2026`,
      balance:investments.find(i=>i.type==='Fixed Deposit')?.currentValue||0,
      icon:Star, status:'Active',
      accent:'#f59e0b', iconBg:'rgba(245,158,11,0.1)', borderColor:'rgba(245,158,11,0.2)',
      shadow:'0 8px 32px rgba(245,158,11,0.08), 0 2px 6px rgba(15,23,42,0.05)' },
    { title:'Digital Wallet', subtitle:'Instant transfers · UPI linked',
      balance:Math.round(banking.balance*0.08), icon:Wallet, status:'Active',
      accent:'#a855f7', iconBg:'rgba(168,85,247,0.1)', borderColor:'rgba(168,85,247,0.2)',
      shadow:'0 8px 32px rgba(168,85,247,0.08), 0 2px 6px rgba(15,23,42,0.05)' },
  ];

  /* ─────────────── JSX ─────────────── */
  return (
    <div style={{background:'#F7F8FC',fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif"}}>

      {/* ── Subtle background glows ── */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-8%',left:'-4%',width:700,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,86,219,0.05) 0%,transparent 65%)',filter:'blur(80px)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'-4%',width:500,height:450,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.04) 0%,transparent 65%)',filter:'blur(70px)'}}/>
      </div>

      {/* ── 3-column wrapper ── */}
      <div style={{position:'relative',zIndex:1,display:'flex',height:'100vh',overflow:'hidden'}}>

        {/* ════════════ LEFT SIDEBAR ════════════ */}
        <aside style={{width:228,flexShrink:0,height:'100%',overflowY:'auto',display:'flex',flexDirection:'column',
          background:'rgba(255,255,255,0.92)',borderRight:'1px solid rgba(15,23,42,0.08)',
          boxShadow:'2px 0 20px rgba(15,23,42,0.05)',scrollbarWidth:'none',
          backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>

          {/* Logo */}
          <div style={{padding:'20px 20px 16px',borderBottom:'1px solid rgba(15,23,42,0.07)'}}>
            <div className="flex items-center gap-2.5">
              <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(26,86,219,0.35)'}}>
                <Zap style={{width:16,height:16,color:'#fff'}}/>
              </div>
              <div>
                <p style={{color:'#0F172A',fontWeight:700,fontSize:15,letterSpacing:'-0.02em',lineHeight:1}}>HyperOne</p>
                <p style={{color:'#1A56DB',fontSize:9,fontWeight:600,letterSpacing:'0.12em',marginTop:2}}>BANKING</p>
              </div>
            </div>
          </div>

          {/* User profile mini-card */}
          <div style={{margin:'14px 12px',padding:'12px',borderRadius:14,background:'rgba(26,86,219,0.05)',border:'1px solid rgba(26,86,219,0.1)'}}>
            <div className="flex items-center gap-2.5">
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:14,flexShrink:0,boxShadow:'0 2px 8px rgba(26,86,219,0.3)'}}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div style={{minWidth:0}}>
                <p style={{color:'#0F172A',fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</p>
                <p style={{color:'#94A3B8',fontSize:10,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile.customerId}</p>
              </div>
            </div>
            {kycVerified && (
              <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4,fontSize:10,fontWeight:600,color:'#10b981'}}>
                <CheckCircle style={{width:10,height:10}}/> KYC Verified
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav style={{flex:1,padding:'0 10px'}}>
            {navItems.map((item,i)=>{
              if(!item) return <div key={i} style={{height:1,background:'rgba(15,23,42,0.07)',margin:'8px 10px'}}/>;
              const Icon=item.icon;
              const active=activeTab===item.id;
              return (
                <motion.button key={item.id} onClick={()=>setActiveTab(item.id)} whileHover={{x:2}}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',
                    borderRadius:11,marginBottom:2,border:'none',cursor:'pointer',textAlign:'left',
                    background:active?(item.highlight?'rgba(99,102,241,0.08)':'rgba(26,86,219,0.07)'):'transparent',
                    position:'relative',transition:'background 0.15s ease'}}>
                  {active && <div style={{position:'absolute',left:0,top:'20%',bottom:'20%',width:3,borderRadius:4,background:item.highlight?'#6366f1':'#1A56DB'}}/>}
                  <div style={{width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                    background:active?(item.highlight?'rgba(99,102,241,0.12)':'rgba(26,86,219,0.1)'):'rgba(15,23,42,0.04)',
                    transition:'background 0.15s ease'}}>
                    <Icon style={{width:15,height:15,color:active?(item.highlight?'#6366f1':'#1A56DB'):'#94A3B8'}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:active?600:400,color:active?(item.highlight?'#4f46e5':'#1A56DB'):'#475569',transition:'color 0.15s ease'}}>
                    {item.label}
                  </span>
                  {item.highlight && !active && (
                    <span style={{marginLeft:'auto',fontSize:9,fontWeight:700,color:'#6366f1',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:4,padding:'1px 5px',letterSpacing:'0.06em'}}>AI</span>
                  )}
                </motion.button>
              );
            })}

            <div style={{height:1,background:'rgba(15,23,42,0.07)',margin:'8px 10px 10px'}}/>
            <p style={{fontSize:9,fontWeight:700,color:'#CBD5E1',letterSpacing:'0.18em',padding:'0 12px',marginBottom:6,textTransform:'uppercase'}}>Coming Soon</p>
            {decorativeNavItems.map(item=>{
              const Icon=item.icon;
              return (
                <button key={item.label} onClick={()=>toast(`${item.label} — launching soon!`)}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:11,marginBottom:2,border:'none',cursor:'pointer',background:'transparent',opacity:0.5}}>
                  <div style={{width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.04)'}}>
                    <Icon style={{width:14,height:14,color:'#94A3B8'}}/>
                  </div>
                  <span style={{fontSize:13,color:'#94A3B8'}}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sign out */}
          <div style={{padding:'12px 10px 20px',borderTop:'1px solid rgba(15,23,42,0.07)'}}>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={handleSignOut}
              style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:11,
                background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.1)',cursor:'pointer'}}>
              <LogOut style={{width:15,height:15,color:'#ef4444'}}/>
              <span style={{fontSize:13,color:'#ef4444',fontWeight:500}}>Sign Out</span>
            </motion.button>
          </div>
        </aside>

        {/* ════════════ SCROLLABLE AREA ════════════ */}
        <div style={{flex:1,height:'100%',overflowY:'auto',display:'flex',flexDirection:'column',scrollbarWidth:'thin',scrollbarColor:'rgba(15,23,42,0.1) transparent'}}>

          {/* ── Sticky Header ── */}
          <header style={{position:'sticky',top:0,zIndex:40,height:68,display:'flex',alignItems:'center',
            padding:'0 24px',gap:16,background:'rgba(247,248,252,0.95)',
            backdropFilter:'blur(20px) saturate(180%)',WebkitBackdropFilter:'blur(20px) saturate(180%)',
            borderBottom:'1px solid rgba(15,23,42,0.07)',boxShadow:'0 1px 12px rgba(15,23,42,0.04)',flexShrink:0}}>

            {/* Greeting */}
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:'#0F172A',fontWeight:700,fontSize:16,letterSpacing:'-0.02em',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {greeting}, {firstName}
              </p>
              <p style={{color:'#94A3B8',fontSize:11,marginTop:2}}>Here's your financial snapshot.</p>
            </div>

            {/* Search */}
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',borderRadius:12,
              background:'rgba(15,23,42,0.04)',border:'1px solid rgba(15,23,42,0.08)',width:220,flexShrink:0}}>
              <Search style={{width:14,height:14,color:'#94A3B8',flexShrink:0}}/>
              <input placeholder="Search transactions…" style={{background:'none',border:'none',outline:'none',fontSize:12,color:'#334155',width:'100%'}}/>
            </div>

            {/* Notifications */}
            <div style={{position:'relative'}}>
              <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
                onClick={()=>setNotifOpen(o=>!o)}
                style={{width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                  background:notifOpen?'rgba(26,86,219,0.08)':'rgba(15,23,42,0.04)',border:'1px solid rgba(15,23,42,0.08)'}}>
                <Bell style={{width:15,height:15,color:notifOpen?'#1A56DB':'#64748B'}}/>
                {unreadCount>0 && (
                  <span style={{position:'absolute',top:-2,right:-2,width:16,height:16,borderRadius:'50%',background:'#ef4444',
                    color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{opacity:0,y:-8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.96}}
                    transition={{duration:0.15}}
                    style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:316,borderRadius:18,overflow:'hidden',zIndex:50,
                      background:'#FFFFFF',border:'1px solid rgba(15,23,42,0.08)',boxShadow:'0 24px 60px rgba(15,23,42,0.14)',backdropFilter:'blur(20px)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid rgba(15,23,42,0.07)'}}>
                      <p style={{color:'#0F172A',fontWeight:600,fontSize:13}}>Notifications</p>
                      <button onClick={markAllRead} style={{color:'#1A56DB',fontSize:11,fontWeight:500,background:'none',border:'none',cursor:'pointer'}}>Mark all read</button>
                    </div>
                    <div style={{maxHeight:320,overflowY:'auto'}}>
                      {notifications.map(n=>{
                        const NIcon=n.icon;
                        return (
                          <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 16px',
                            background:n.read?'transparent':'rgba(26,86,219,0.03)',borderBottom:'1px solid rgba(15,23,42,0.05)'}}>
                            <div style={{width:32,height:32,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:n.bg}}>
                              <NIcon style={{width:14,height:14,color:n.color}}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <p style={{fontSize:12,fontWeight:600,color:'#0F172A'}}>{n.title}</p>
                                {!n.read && <div style={{width:6,height:6,borderRadius:'50%',background:'#1A56DB',flexShrink:0}}/>}
                              </div>
                              <p style={{fontSize:11,color:'#64748B',marginTop:2,lineHeight:1.4}}>{n.body}</p>
                              <p style={{fontSize:10,color:'#CBD5E1',marginTop:4}}>{n.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',
              display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:14,
              boxShadow:'0 2px 10px rgba(26,86,219,0.3)',flexShrink:0}}>
              {firstName.charAt(0).toUpperCase()}
            </div>
          </header>

          {/* ── Content Row ── */}
          <div style={{flex:1,display:'flex',gap:20,padding:'20px 20px 40px 20px',alignItems:'flex-start',maxWidth:1480,margin:'0 auto',width:'100%',boxSizing:'border-box'}}>

            {/* ════════ MAIN CONTENT ════════ */}
            <main style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:16}}>
              <AnimatePresence mode="wait">

                {/* ══ OVERVIEW ══ */}
                {activeTab==='overview' && (
                  <motion.div key="overview" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={{display:'flex',flexDirection:'column',gap:16}}>

                    {/* Hero Net Worth Card */}
                    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.5,ease:[0.22,1,0.36,1]}}
                      style={{borderRadius:28,overflow:'hidden',position:'relative',
                        background:'linear-gradient(150deg,#1556CB 0%,#1A56DB 55%,#2563EB 100%)',
                        boxShadow:'0 20px 60px rgba(26,86,219,0.25), 0 4px 16px rgba(26,86,219,0.15)'}}>

                      {/* Subtle decorative circle */}
                      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
                        <div style={{position:'absolute',top:-100,right:-100,width:380,height:380,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
                        <div style={{position:'absolute',bottom:-80,left:-80,width:260,height:260,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
                      </div>

                      <div style={{position:'relative',padding:'28px 32px 24px'}}>
                        <div style={{display:'flex',flexDirection:'row',gap:32,alignItems:'flex-start'}}>

                          {/* Left: numbers */}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                              <p style={{color:'rgba(255,255,255,0.55)',fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase'}}>Total Net Worth</p>
                              <div style={{display:'flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,background:'rgba(255,255,255,0.12)'}}>
                                <div style={{width:5,height:5,borderRadius:'50%',background:'#a7f3d0'}}/>
                                <span style={{fontSize:9,fontWeight:700,color:'#a7f3d0',letterSpacing:'0.06em'}}>LIVE</span>
                              </div>
                            </div>

                            <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:12}}>
                              <motion.p style={{fontWeight:800,letterSpacing:'-0.03em',lineHeight:1,color:'#fff',fontSize:'clamp(2.2rem,4.5vw,3.8rem)'}}
                                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.4}}>
                                {hideBalance ? '₹ ••••••' : formatFull(netWorth)}
                              </motion.p>
                              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={()=>setHideBalance(b=>!b)}
                                style={{paddingBottom:6,color:'rgba(255,255,255,0.4)',background:'none',border:'none',cursor:'pointer'}}
                                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'}
                                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
                                {hideBalance ? <Eye style={{width:18,height:18}}/> : <EyeOff style={{width:18,height:18}}/>}
                              </motion.button>
                            </div>

                            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                              <Delta value={portfolio.todayChange} pct={portfolio.todayChangePct} size="lg"/>
                              <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>today's change</span>
                            </div>

                            {/* Stat pills */}
                            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                              {[
                                { label:'Invested',   val:formatINR(portfolio.totalInvested) },
                                { label:'Returns',    val:`${portfolio.returns>=0?'+':''}${formatINR(portfolio.returns)}`, highlight:true, pos:portfolio.returns>=0 },
                                { label:'Balance',    val:hideBalance?'••••':formatINR(banking.balance) },
                              ].map((s,i)=>(
                                <div key={i} style={{paddingRight:16,borderRight:i<2?'1px solid rgba(255,255,255,0.15)':'none'}}>
                                  <p style={{fontSize:10,color:'rgba(255,255,255,0.4)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:3}}>{s.label}</p>
                                  <p style={{fontSize:15,fontWeight:700,color:s.highlight?(s.pos?'#a7f3d0':'#fca5a5'):'rgba(255,255,255,0.9)'}}>{s.val}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: chart */}
                          <div style={{width:'42%',flexShrink:0,height:170}}>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={portfolio.chartData} margin={{top:4,right:4,left:-32,bottom:0}}>
                                <defs>
                                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{fill:'rgba(255,255,255,0.3)',fontSize:9}} axisLine={false} tickLine={false} interval={7}/>
                                <YAxis hide/>
                                <Tooltip content={<CustomTooltip/>} cursor={{stroke:'rgba(255,255,255,0.2)',strokeWidth:1}}/>
                                <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" strokeWidth={2.5} fill="url(#heroGrad)" dot={false}
                                  activeDot={{r:5,fill:'#fff',stroke:'rgba(255,255,255,0.3)',strokeWidth:6}}/>
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Bottom: XIRR badge */}
                        <div style={{marginTop:8,display:'flex',alignItems:'center',gap:8,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.12)'}}>
                          <span style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>Overall XIRR</span>
                          <span style={{fontSize:13,fontWeight:700,color:portfolio.returnsPct>=0?'#a7f3d0':'#fca5a5'}}>
                            {portfolio.returnsPct>=0?'+':''}{portfolio.returnsPct.toFixed(2)}%
                          </span>
                          <span style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,0.3)'}}>
                            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Account Cards */}
                    <div style={{display:'flex',gap:14,overflow:'auto',paddingBottom:2}}>
                      {accountCards.map((card,i)=>{
                        const Icon=card.icon;
                        return (
                          <TiltCard key={i} intensity={5}
                            style={{flex:'0 0 220px',borderRadius:20,overflow:'hidden',cursor:'default',
                              background:'#FFFFFF',
                              border:`1px solid ${card.borderColor}`,
                              boxShadow:card.shadow}}>
                            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15+i*0.08,type:'spring',stiffness:280,damping:24}}>
                              {/* Colored top strip */}
                              <div style={{height:3,background:card.accent,opacity:0.7}}/>
                              <div style={{padding:'14px 18px 16px'}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                                  <div style={{width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:card.iconBg}}>
                                    <Icon style={{width:15,height:15,color:card.accent}}/>
                                  </div>
                                  <span style={{fontSize:9,fontWeight:700,color:card.accent,background:`${card.accent}12`,border:`1px solid ${card.accent}25`,borderRadius:20,padding:'2px 8px',letterSpacing:'0.08em'}}>{card.status}</span>
                                </div>
                                <p style={{color:'#94A3B8',fontSize:10,marginBottom:4,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase'}}>{card.title}</p>
                                <p style={{color:'#0F172A',fontWeight:800,fontSize:20,letterSpacing:'-0.02em',lineHeight:1}}>
                                  {hideBalance?'••••':formatINR(card.balance)}
                                </p>
                                <p style={{color:'#CBD5E1',fontSize:10,marginTop:8}}>{card.subtitle}</p>
                              </div>
                            </motion.div>
                          </TiltCard>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                      style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <p style={{color:'#94A3B8',fontSize:11,fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:14}}>Quick Actions</p>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                        {quickActions.map((qa,i)=>{
                          const Icon=qa.icon;
                          return (
                            <motion.button key={i} onClick={qa.action}
                              whileHover={{y:-3,scale:1.02}} whileTap={{scale:0.96}}
                              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.22+i*0.04}}
                              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'14px 8px',borderRadius:16,cursor:'pointer',
                                background:'rgba(15,23,42,0.02)',border:'1px solid rgba(15,23,42,0.07)',
                                transition:'all 0.15s ease'}}
                              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(15,23,42,0.04)'; e.currentTarget.style.borderColor='rgba(15,23,42,0.12)'; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(15,23,42,0.02)'; e.currentTarget.style.borderColor='rgba(15,23,42,0.07)'; }}>
                              <div style={{width:38,height:38,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:qa.bg,flexShrink:0}}>
                                <Icon style={{width:16,height:16,color:qa.color}}/>
                              </div>
                              <span style={{fontSize:11,fontWeight:500,color:'#64748B',textAlign:'center',lineHeight:1.2}}>{qa.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Investment Holdings Preview */}
                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.28}}
                      style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                        <div>
                          <p style={{color:'#0F172A',fontWeight:700,fontSize:15}}>Investments</p>
                          <p style={{color:'#94A3B8',fontSize:11,marginTop:2}}>{investments.length} holdings · {formatINR(portfolio.totalCurrent)} current value</p>
                        </div>
                        <motion.button whileHover={{x:2}} onClick={()=>setActiveTab('investments')}
                          style={{display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:500,color:'#1A56DB',background:'none',border:'none',cursor:'pointer'}}>
                          View all <ChevronRight style={{width:14,height:14}}/>
                        </motion.button>
                      </div>
                      {investments.slice(0,3).map((inv,i)=>{
                        const ret=inv.currentValue-inv.invested;
                        const retPct=(ret/inv.invested)*100;
                        const typeColor={'Mutual Fund':'#1A56DB','SIP':'#10b981','Fixed Deposit':'#f59e0b','Insurance':'#ef4444'}[inv.type]||'#6b7280';
                        return (
                          <motion.div key={inv.id}
                            initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.06}}
                            style={{display:'flex',alignItems:'center',gap:14,padding:'12px',borderRadius:14,marginBottom:4,cursor:'default'}}
                            whileHover={{background:'rgba(15,23,42,0.02)'}}>
                            <div style={{width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20,background:`${typeColor}10`,border:`1px solid ${typeColor}20`}}>{inv.icon}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{color:'#0F172A',fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.name}</p>
                              <p style={{color:'#94A3B8',fontSize:11,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.subLabel}</p>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0}}>
                              <p style={{color:'#0F172A',fontWeight:600,fontSize:13}}>{formatINR(inv.currentValue)}</p>
                              <p style={{fontSize:11,fontWeight:600,marginTop:2,color:ret>=0?'#10b981':'#ef4444'}}>{ret>=0?'+':''}{retPct.toFixed(1)}%</p>
                            </div>
                            <span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:20,flexShrink:0,
                              background:`${typeColor}10`,color:typeColor,border:`1px solid ${typeColor}20`}}>{inv.type}</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Recent Transactions */}
                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.34}}
                      style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                        <div>
                          <p style={{color:'#0F172A',fontWeight:700,fontSize:15}}>Recent Activity</p>
                          <p style={{color:'#94A3B8',fontSize:11,marginTop:2}}>Latest transactions</p>
                        </div>
                        <motion.button whileHover={{x:2}} onClick={()=>setActiveTab('transactions')}
                          style={{display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:500,color:'#1A56DB',background:'none',border:'none',cursor:'pointer'}}>
                          View all <ChevronRight style={{width:14,height:14}}/>
                        </motion.button>
                      </div>
                      {transactions.slice(0,5).map((tx,i)=>{
                        const Icon=tx.Icon;
                        return (
                          <motion.div key={tx.id}
                            initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.36+i*0.05}}
                            whileHover={{background:'rgba(15,23,42,0.02)'}}
                            style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:14,marginBottom:3,cursor:'default'}}>
                            <div style={{width:38,height:38,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                              background:tx.amount>=0?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.07)',
                              border:`1px solid ${tx.amount>=0?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.12)'}`}}>
                              <Icon style={{width:15,height:15,color:tx.color}}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:500,color:'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.label}</p>
                              <p style={{fontSize:11,color:'#94A3B8',marginTop:2}}>{tx.date}</p>
                            </div>
                            <p style={{fontSize:13,fontWeight:700,flexShrink:0,color:tx.amount>=0?'#10b981':'#0F172A'}}>
                              {tx.amount>=0?'+':'-'}{formatINR(Math.abs(tx.amount))}
                            </p>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}

                {/* ══ INVESTMENTS ══ */}
                {activeTab==='investments' && (
                  <motion.div key="investments" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                      {[
                        { title:'Total Invested',  val:formatINR(portfolio.totalInvested),  sub:'Your cost basis',   icon:Wallet,       accent:'#1A56DB' },
                        { title:'Current Value',   val:formatINR(portfolio.totalCurrent),   sub:'Market value',      icon:TrendingUp,   accent:'#10b981' },
                        { title:'P&L',             val:`${portfolio.returns>=0?'+':''}${formatINR(portfolio.returns)}`, sub:`${portfolio.returnsPct.toFixed(2)}% returns`, icon:Star, accent:portfolio.returns>=0?'#10b981':'#ef4444' },
                        { title:'Active SIPs',     val:`${investments.filter(i=>i.type==='SIP').length}`,             sub:'Monthly auto-invest', icon:RefreshCw, accent:'#f59e0b' },
                      ].map((c,i)=>{
                        const Icon=c.icon;
                        return (
                          <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07,type:'spring',stiffness:280,damping:26}}
                            whileHover={{y:-2}} style={{...GLASS,borderRadius:20,padding:'18px 20px',position:'relative',overflow:'hidden'}}>
                            <div style={{position:'absolute',top:0,right:0,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${c.accent}12 0%,transparent 70%)`,transform:'translate(30%,-30%)'}}/>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                              <p style={{color:'#94A3B8',fontSize:10,fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase'}}>{c.title}</p>
                              <div style={{width:30,height:30,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:`${c.accent}10`,border:`1px solid ${c.accent}20`}}>
                                <Icon style={{width:13,height:13,color:c.accent}}/>
                              </div>
                            </div>
                            <p style={{color:'#0F172A',fontWeight:800,fontSize:22,letterSpacing:'-0.02em',lineHeight:1,marginBottom:4}}>{c.val}</p>
                            <p style={{color:'#94A3B8',fontSize:11}}>{c.sub}</p>
                          </motion.div>
                        );
                      })}
                    </div>

                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.12}} style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <p style={{color:'#0F172A',fontWeight:700,fontSize:15,marginBottom:16}}>All Holdings</p>
                      {investments.map((inv,i)=>{
                        const ret=inv.currentValue-inv.invested;
                        const retPct=(ret/inv.invested)*100;
                        const typeColor={'Mutual Fund':'#1A56DB','SIP':'#10b981','Fixed Deposit':'#f59e0b','Insurance':'#ef4444'}[inv.type]||'#6b7280';
                        return (
                          <motion.div key={inv.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.14+i*0.06}}
                            whileHover={{background:'rgba(15,23,42,0.02)'}}
                            style={{display:'flex',alignItems:'center',gap:14,padding:'14px 12px',borderRadius:14,marginBottom:4,cursor:'default',borderBottom:'1px solid rgba(15,23,42,0.06)'}}>
                            <div style={{width:42,height:42,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20,background:`${typeColor}10`,border:`1px solid ${typeColor}18`}}>{inv.icon}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{color:'#0F172A',fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.name}</p>
                              <p style={{color:'#94A3B8',fontSize:11,marginTop:2}}>{inv.subLabel}</p>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0,marginRight:12}}>
                              <p style={{color:'#0F172A',fontWeight:700,fontSize:14}}>{formatINR(inv.currentValue)}</p>
                              <p style={{fontSize:11,fontWeight:600,marginTop:2,color:ret>=0?'#10b981':'#ef4444'}}>{ret>=0?'+':''}{retPct.toFixed(1)}%</p>
                            </div>
                            <span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:20,flexShrink:0,background:`${typeColor}10`,color:typeColor,border:`1px solid ${typeColor}20`}}>{inv.type}</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.2}} style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <p style={{color:'#0F172A',fontWeight:700,fontSize:15,marginBottom:4}}>Portfolio Allocation</p>
                      <p style={{color:'#94A3B8',fontSize:11,marginBottom:18}}>Distribution across asset classes</p>
                      <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
                        <div style={{flexShrink:0}}>
                          <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                              <Pie data={allocation} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                {allocation.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                              </Pie>
                              <Tooltip formatter={(val,name)=>[formatINR(val),name]}
                                contentStyle={{background:'#FFFFFF',border:'1px solid rgba(15,23,42,0.08)',borderRadius:10,fontSize:12,color:'#0F172A',boxShadow:'0 4px 16px rgba(15,23,42,0.1)'}}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{flex:1,minWidth:200}}>
                          {allocation.map((a,i)=>{
                            const pct=((a.value/portfolio.totalCurrent)*100).toFixed(1);
                            return (
                              <div key={a.name} style={{marginBottom:14}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                                    <div style={{width:9,height:9,borderRadius:'50%',background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                                    <span style={{fontSize:13,color:'#334155'}}>{a.name}</span>
                                  </div>
                                  <div style={{display:'flex',gap:12}}>
                                    <span style={{fontSize:12,color:'#94A3B8'}}>{formatINR(a.value)}</span>
                                    <span style={{fontSize:12,fontWeight:700,color:'#0F172A',minWidth:36,textAlign:'right'}}>{pct}%</span>
                                  </div>
                                </div>
                                <div style={{height:4,borderRadius:4,background:'rgba(15,23,42,0.07)',overflow:'hidden'}}>
                                  <motion.div style={{height:'100%',borderRadius:4,background:PIE_COLORS[i%PIE_COLORS.length]}}
                                    initial={{width:'0%'}} animate={{width:`${pct}%`}} transition={{duration:0.8,delay:i*0.1,ease:'easeOut'}}/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* ══ TRANSACTIONS ══ */}
                {activeTab==='transactions' && (
                  <motion.div key="transactions" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                      <p style={{color:'#0F172A',fontWeight:700,fontSize:15,marginBottom:16}}>Transaction History</p>
                      {transactions.map((tx,i)=>{
                        const Icon=tx.Icon;
                        return (
                          <motion.div key={tx.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                            whileHover={{background:'rgba(15,23,42,0.02)'}}
                            style={{display:'flex',alignItems:'center',gap:14,padding:'13px 12px',borderRadius:14,marginBottom:4,cursor:'default',borderBottom:'1px solid rgba(15,23,42,0.06)'}}>
                            <div style={{width:42,height:42,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                              background:tx.amount>=0?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.07)',
                              border:`1px solid ${tx.amount>=0?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.12)'}`}}>
                              <Icon style={{width:17,height:17,color:tx.color}}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:14,fontWeight:500,color:'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.label}</p>
                              <p style={{fontSize:11,color:'#94A3B8',marginTop:3}}>{tx.date} · {profile.accountNumber?.slice(-4)?'A/C •••• '+profile.accountNumber.slice(-4):'HyperOne'}</p>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0}}>
                              <p style={{fontSize:15,fontWeight:700,color:tx.amount>=0?'#10b981':'#0F172A'}}>
                                {tx.amount>=0?'+':'-'}{formatINR(Math.abs(tx.amount))}
                              </p>
                              <span style={{fontSize:10,fontWeight:600,color:tx.amount>=0?'#10b981':'#94A3B8',marginTop:3,display:'block'}}>
                                {tx.amount>=0?'Credit':'Debit'}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                        <p style={{color:'#0F172A',fontWeight:700,fontSize:15,marginBottom:16}}>Banking Summary</p>
                        {[
                          { label:'Account Balance',  val:formatINR(banking.balance),         color:'#0F172A' },
                          ...(banking.availableCredit>0?[{ label:'Credit Available', val:formatINR(banking.availableCredit), color:'#10b981' }]:[]),
                          ...(banking.activeLoans>0?[{ label:'Active Loans', val:`${banking.activeLoans} loan${banking.activeLoans>1?'s':''}`, color:'#f59e0b' }]:[]),
                          ...(banking.emiAmount>0?[{ label:'Monthly EMI', val:formatINR(banking.emiAmount), color:'#ef4444' }]:[]),
                          { label:'Insurance',        val:'Active',                            color:'#10b981' },
                        ].map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid rgba(15,23,42,0.06)'}}>
                            <p style={{fontSize:13,color:'#64748B'}}>{item.label}</p>
                            <p style={{fontSize:13,fontWeight:600,color:item.color}}>{item.val}</p>
                          </div>
                        ))}
                      </motion.div>

                      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.15}} style={{...GLASS,borderRadius:22,padding:'20px 22px'}}>
                        <p style={{color:'#0F172A',fontWeight:700,fontSize:15,marginBottom:16}}>Account Info</p>
                        {[
                          { label:'Account Number', val:profile.accountNumber },
                          { label:'Customer ID',    val:profile.customerId },
                          { label:'IFSC Code',      val:profile.ifscCode||'SBIN0001234' },
                          { label:'Branch',         val:profile.branchName||'HyperOne Digital' },
                        ].map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid rgba(15,23,42,0.06)'}}>
                            <p style={{fontSize:12,color:'#64748B'}}>{item.label}</p>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <p style={{fontSize:12,fontFamily:'monospace',fontWeight:500,color:'#334155'}}>{item.val}</p>
                              <button onClick={()=>{ navigator.clipboard.writeText(item.val||''); toast.success(`${item.label} copied!`); }}
                                style={{color:'#CBD5E1',background:'none',border:'none',cursor:'pointer',lineHeight:1}}
                                onMouseEnter={e=>e.currentTarget.style.color='#1A56DB'}
                                onMouseLeave={e=>e.currentTarget.style.color='#CBD5E1'}>
                                <Copy style={{width:12,height:12}}/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* ══ GOALS ══ */}
                {activeTab==='goals' && (
                  <motion.div key="goals" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <p style={{color:'#0F172A',fontWeight:800,fontSize:20,letterSpacing:'-0.02em'}}>Goals & Planning</p>
                        <p style={{color:'#94A3B8',fontSize:12,marginTop:4}}>Track your financial milestones</p>
                      </div>
                      <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setShowGoalDialog(true)}
                        style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:14,fontWeight:600,fontSize:13,color:'#fff',cursor:'pointer',
                          background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',boxShadow:'0 4px 16px rgba(26,86,219,0.3)',border:'none'}}>
                        <Plus style={{width:14,height:14}}/> Add Goal
                      </motion.button>
                    </div>

                    {goals.length===0 ? (
                      <div style={{...GLASS,borderRadius:22,padding:'60px 20px',textAlign:'center'}}>
                        <Target style={{width:40,height:40,color:'#1A56DB',margin:'0 auto 12px'}}/>
                        <p style={{fontSize:14,fontWeight:500,color:'#334155'}}>No goals yet</p>
                        <p style={{fontSize:12,color:'#94A3B8',marginTop:4}}>Add your first financial goal to start tracking progress.</p>
                      </div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                        {goals.map((goal,i)=>{
                          const pct=Math.min(100,Math.round((goal.current/goal.target)*100));
                          const daysLeft=Math.ceil((new Date(goal.deadline)-new Date())/(1000*60*60*24));
                          return (
                            <motion.div key={goal.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07,type:'spring',stiffness:280,damping:26}}
                              whileHover={{y:-3}} style={{...GLASS,borderRadius:20,padding:'20px',cursor:'default',
                                boxShadow:`0 4px 24px ${goal.color}10, 0 1px 4px rgba(15,23,42,0.05)`}}>
                              <div style={{display:'flex',alignItems:'center',gap:14}}>
                                <GoalRing pct={pct} color={goal.color} size={72}/>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                                    <span style={{fontSize:18}}>{goal.emoji}</span>
                                    <p style={{fontSize:14,fontWeight:600,color:'#0F172A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{goal.title}</p>
                                  </div>
                                  <p style={{fontSize:11,color:'#94A3B8',marginBottom:6}}>{daysLeft>0?`${daysLeft} days left`:'Deadline passed'} · Target {new Date(goal.deadline).getFullYear()}</p>
                                  <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                                    <p style={{fontSize:13,fontWeight:700,color:goal.color}}>{formatINR(goal.current)}</p>
                                    <p style={{fontSize:11,color:'#94A3B8'}}>of {formatINR(goal.target)}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    <AnimatePresence>
                      {showGoalDialog && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                          style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(15,23,42,0.4)',backdropFilter:'blur(8px)'}}
                          onClick={()=>setShowGoalDialog(false)}>
                          <motion.div initial={{scale:0.93,y:16}} animate={{scale:1,y:0}} exit={{scale:0.93,y:16}} transition={{type:'spring',stiffness:320,damping:28}}
                            onClick={e=>e.stopPropagation()}
                            style={{width:'100%',maxWidth:400,borderRadius:24,padding:'24px',background:'#FFFFFF',border:'1px solid rgba(15,23,42,0.08)',boxShadow:'0 32px 80px rgba(15,23,42,0.18)'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                              <p style={{color:'#0F172A',fontWeight:700,fontSize:16}}>Choose a Goal</p>
                              <button onClick={()=>setShowGoalDialog(false)} style={{color:'#94A3B8',background:'none',border:'none',cursor:'pointer',lineHeight:1}}>
                                <XIcon style={{width:16,height:16}}/>
                              </button>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                              {GOAL_TEMPLATES.filter(t=>!goals.some(g=>g.templateId===t.id)).map(template=>(
                                <button key={template.id} onClick={()=>addGoal(template)}
                                  style={{display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:14,textAlign:'left',cursor:'pointer',
                                    background:'transparent',border:'1px solid rgba(15,23,42,0.08)',transition:'all 0.15s ease'}}
                                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(26,86,219,0.03)'; e.currentTarget.style.borderColor='rgba(26,86,219,0.2)'; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(15,23,42,0.08)'; }}>
                                  <div style={{width:38,height:38,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:`${template.color}10`}}>
                                    {template.emoji}
                                  </div>
                                  <div style={{flex:1}}>
                                    <p style={{fontSize:13,fontWeight:600,color:'#0F172A'}}>{template.title}</p>
                                    <p style={{fontSize:11,color:'#94A3B8',marginTop:2}}>Target: {formatINR(template.defaultTarget)}</p>
                                  </div>
                                  <ChevronRight style={{width:15,height:15,color:'#CBD5E1',flexShrink:0}}/>
                                </button>
                              ))}
                              {GOAL_TEMPLATES.every(t=>goals.some(g=>g.templateId===t.id)) && (
                                <p style={{textAlign:'center',fontSize:13,color:'#94A3B8',padding:'16px 0'}}>All goal templates added!</p>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ══ PROFILE ══ */}
                {activeTab==='profile' && (
                  <motion.div key="profile" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} style={{...GLASS,borderRadius:22,padding:'22px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                          <div style={{width:52,height:52,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',
                            background:'linear-gradient(135deg,#1E3A8A,#1A56DB)',boxShadow:'0 4px 16px rgba(26,86,219,0.3)',flexShrink:0}}>
                            {firstName.charAt(0)}
                          </div>
                          <div>
                            <p style={{fontSize:16,fontWeight:700,color:'#0F172A'}}>{name}</p>
                            <p style={{fontSize:12,color:'#94A3B8',marginTop:2,textTransform:'capitalize'}}>{category} customer</p>
                          </div>
                        </div>
                        {[
                          { label:'Customer ID',   val:profile.customerId },
                          { label:'Account No.',   val:profile.accountNumber },
                          { label:'Occupation',    val:profile.profile?.occupation||'—' },
                          { label:'Income',        val:profile.profile?.income||'—' },
                          { label:'Goals',         val:profile.profile?.goals||'—' },
                        ].map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(15,23,42,0.06)'}}>
                            <p style={{fontSize:12,color:'#94A3B8'}}>{item.label}</p>
                            <p style={{fontSize:12,fontWeight:500,color:'#334155',textAlign:'right',maxWidth:'55%'}}>{item.val}</p>
                          </div>
                        ))}
                      </motion.div>

                      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.07}} style={{...GLASS,borderRadius:22,padding:'22px'}}>
                        <p style={{color:'#0F172A',fontWeight:700,fontSize:14,marginBottom:16}}>KYC Documents</p>
                        {[
                          { key:'pan',    label:'PAN Card',    verified:profile.kycDocuments?.panVerified,    number:profile.kycDocuments?.panNumber,    name:profile.kycDocuments?.panName, dob:profile.kycDocuments?.panDob },
                          { key:'aadh',   label:'Aadhaar Card',verified:profile.kycDocuments?.aadhaarVerified,number:profile.kycDocuments?.aadhaarNumber?.replace(/^(\w{4})-(\w{4})-(\w{4})$/,'$1 $2 $3'), name:profile.kycDocuments?.aadhaarName, dob:profile.kycDocuments?.aadhaarDob },
                        ].map(doc=>(
                          <div key={doc.key} style={{borderRadius:14,padding:'14px',marginBottom:10,
                            background:doc.verified?'rgba(16,185,129,0.05)':'rgba(245,158,11,0.05)',
                            border:`1px solid ${doc.verified?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)'}`}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                              <p style={{fontSize:13,fontWeight:600,color:'#0F172A'}}>{doc.label}</p>
                              {doc.verified
                                ? <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'#10b981'}}><CheckCircle style={{width:12,height:12}}/> Verified</div>
                                : <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'#f59e0b'}}><Clock style={{width:12,height:12}}/> Pending</div>}
                            </div>
                            <p style={{fontSize:12,fontFamily:'monospace',fontWeight:600,color:'#64748B'}}>{doc.number||'Not uploaded'}</p>
                            {doc.name && <p style={{fontSize:11,color:'#94A3B8',marginTop:3}}>{doc.name}</p>}
                            {doc.dob  && <p style={{fontSize:11,color:'#CBD5E1',marginTop:2}}>DOB: {doc.dob}</p>}
                          </div>
                        ))}
                        {profile.recommendedProducts?.length>0 && (
                          <div style={{marginTop:12}}>
                            <p style={{fontSize:10,fontWeight:700,color:'#CBD5E1',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:8}}>Active Products</p>
                            {profile.recommendedProducts.map((p,i)=>(
                              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                                <CheckCircle style={{width:12,height:12,color:'#10b981',flexShrink:0}}/>
                                <p style={{fontSize:12,color:'#64748B'}}>{p}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Document Vault — kept dark to simulate physical cards */}
                    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.12}} style={{...GLASS,borderRadius:22,padding:'22px'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                        <div>
                          <p style={{color:'#0F172A',fontWeight:700,fontSize:14}}>Document Vault</p>
                          <p style={{color:'#94A3B8',fontSize:11,marginTop:3}}>Your verified identity documents</p>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600,color:'#10b981',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.15)'}}>
                          <Shield style={{width:11,height:11}}/> Encrypted
                        </div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                        {[
                          { label:'PAN Card', subtitle:'Income Tax Dept · Govt. of India', number:profile.kycDocuments?.panNumber||'•••• •••••• ••••', name:(profile.kycDocuments?.panName||name).toUpperCase(), dob:profile.kycDocuments?.panDob, verified:profile.kycDocuments?.panVerified, gradient:'linear-gradient(135deg,#0c1a4e 0%,#1a3a8a 55%,#0a1236 100%)', glow:'rgba(26,86,219,0.3)', onCopy:()=>{ navigator.clipboard.writeText(profile.kycDocuments?.panNumber||''); toast.success('PAN copied!'); } },
                          { label:'Aadhaar Card', subtitle:'UIDAI · Unique Identification Authority', number:profile.kycDocuments?.aadhaarNumber?.replace(/^(\w{4})-(\w{4})-(\w{4})$/,'$1 $2 $3')||'XXXX XXXX XXXX', name:(profile.kycDocuments?.aadhaarName||name).toUpperCase(), dob:profile.kycDocuments?.aadhaarDob, verified:profile.kycDocuments?.aadhaarVerified, gradient:'linear-gradient(135deg,#032e1e 0%,#065f46 55%,#041f14 100%)', glow:'rgba(6,95,70,0.35)' },
                        ].map((doc,i)=>(
                          <TiltCard key={i} intensity={4} style={{borderRadius:20,overflow:'hidden',boxShadow:`0 8px 32px ${doc.glow}, 0 2px 8px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`,background:doc.gradient}}>
                            <div style={{padding:'18px 20px 14px'}}>
                              <p style={{color:'rgba(255,255,255,0.4)',fontSize:8,letterSpacing:'0.2em',fontWeight:700,textTransform:'uppercase',marginBottom:3}}>{doc.subtitle}</p>
                              <p style={{color:'#fff',fontWeight:700,fontSize:12}}>{doc.label}</p>
                              <div style={{width:38,height:24,borderRadius:6,background:'linear-gradient(135deg,#d4a843,#f0cc6e)',margin:'14px 0',boxShadow:'inset 0 1px 2px rgba(0,0,0,0.3)'}}/>
                              <p style={{color:'#fff',fontFamily:'monospace',fontSize:17,fontWeight:700,letterSpacing:'0.12em',marginBottom:12}}>{doc.number}</p>
                              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                                <div>
                                  <p style={{color:'rgba(255,255,255,0.35)',fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:2}}>Name</p>
                                  <p style={{color:'#fff',fontSize:12,fontWeight:600}}>{doc.name}</p>
                                  {doc.dob && <p style={{color:'rgba(255,255,255,0.4)',fontSize:10,marginTop:2}}>DOB: {doc.dob}</p>}
                                </div>
                                {doc.verified
                                  ? <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:20,fontSize:10,fontWeight:700,background:'rgba(16,185,129,0.2)',color:'#6ee7b7'}}><CheckCircle style={{width:10,height:10}}/> Verified</div>
                                  : <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:20,fontSize:10,fontWeight:700,background:'rgba(245,158,11,0.2)',color:'#fcd34d'}}><Clock style={{width:10,height:10}}/> Pending</div>}
                              </div>
                            </div>
                            <div style={{padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(0,0,0,0.18)',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                              <span style={{color:'rgba(255,255,255,0.3)',fontSize:11}}>{doc.label}</span>
                              {doc.onCopy ? (
                                <button onClick={doc.onCopy} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.42)',background:'none',border:'none',cursor:'pointer'}}
                                  onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.42)'}>
                                  <Copy style={{width:11,height:11}}/> Copy
                                </button>
                              ) : (
                                <span style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>Secured & Encrypted</span>
                              )}
                            </div>
                          </TiltCard>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* ══ AI COPILOT ══ */}
                {activeTab==='copilot' && (
                  <motion.div key="copilot" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                    <CopilotPanel customerName={name} userInitial={firstName.charAt(0).toUpperCase()}/>
                  </motion.div>
                )}

              </AnimatePresence>
            </main>

            {/* ════════ RIGHT INSIGHTS PANEL ════════ */}
            {activeTab!=='copilot' && (
              <aside style={{width:288,flexShrink:0,position:'sticky',top:76,display:'flex',flexDirection:'column',gap:14,alignSelf:'flex-start'}}>

                {/* AI Recommendation Card — Apple Intelligence aesthetic */}
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.15,type:'spring',stiffness:260,damping:28}}
                  style={{borderRadius:22,overflow:'hidden',position:'relative',
                    background:'linear-gradient(150deg,#f0f4ff 0%,#eef0fe 50%,#f5f0ff 100%)',
                    border:'1px solid rgba(99,102,241,0.18)',
                    boxShadow:'0 8px 32px rgba(99,102,241,0.1), 0 2px 6px rgba(15,23,42,0.05)'}}>
                  <div style={{position:'absolute',top:-30,right:-30,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%)',pointerEvents:'none'}}/>
                  <div style={{padding:'18px 18px 16px',position:'relative'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <div style={{width:28,height:28,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(99,102,241,0.15)'}}>
                        <Sparkles style={{width:13,height:13,color:'#6366f1'}}/>
                      </div>
                      <p style={{fontSize:11,fontWeight:700,color:'#6366f1',letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Recommendation</p>
                    </div>
                    <p style={{fontSize:14,fontWeight:700,color:'#0F172A',marginBottom:8,lineHeight:1.35}}>{aiRec.title}</p>
                    <p style={{fontSize:12,color:'#64748B',lineHeight:1.55,marginBottom:14}}>{aiRec.body}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                      <span style={{fontSize:11,fontWeight:600,color:'#10b981',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:20,padding:'2px 8px'}}>{aiRec.gain}</span>
                      <span style={{fontSize:11,fontWeight:600,color:'#6366f1',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:20,padding:'2px 8px'}}>{aiRec.confidence}% confidence</span>
                    </div>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>setActiveTab('copilot')}
                      style={{width:'100%',padding:'10px',borderRadius:13,fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer',
                        background:'linear-gradient(135deg,#1A56DB,#6366f1)',
                        border:'none',boxShadow:'0 4px 14px rgba(26,86,219,0.25)'}}>
                      Ask AI Copilot →
                    </motion.button>
                  </div>
                </motion.div>

                {/* Financial Health */}
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.22,type:'spring',stiffness:260,damping:28}}
                  style={{...GLASS,borderRadius:22,padding:'18px'}}>
                  <p style={{color:'#94A3B8',fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:14}}>Financial Health</p>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <RadialScore score={healthScore}/>
                    <div style={{flex:1,minWidth:0}}>
                      {[
                        { label:'Emergency Fund',  done:banking.balance>=200000 },
                        { label:'Investments',     done:portfolio.totalInvested>0 },
                        { label:'Insurance',       done:banking.insuranceActive },
                        { label:'Managed Debt',    done:!banking.emiAmount||banking.emiAmount<25000 },
                      ].map((f,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7,padding:'6px 8px',borderRadius:9,
                          background:f.done?'rgba(16,185,129,0.05)':'rgba(245,158,11,0.05)',
                          border:`1px solid ${f.done?'rgba(16,185,129,0.12)':'rgba(245,158,11,0.1)'}`}}>
                          {f.done
                            ? <CheckCircle style={{width:11,height:11,color:'#10b981',flexShrink:0}}/>
                            : <AlertCircle style={{width:11,height:11,color:'#f59e0b',flexShrink:0}}/>}
                          <p style={{fontSize:11,color:f.done?'#64748B':'#94A3B8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Credit Score */}
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.28,type:'spring',stiffness:260,damping:28}}
                  style={{...GLASS,borderRadius:22,padding:'18px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                    <p style={{color:'#94A3B8',fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase'}}>Credit Score</p>
                    <span style={{fontSize:10,fontWeight:600,color:'#10b981',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:20,padding:'2px 7px'}}>
                      {creditScore>=750?'Excellent':creditScore>=700?'Good':'Fair'}
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{fontSize:'2rem',fontWeight:800,color:'#0F172A',letterSpacing:'-0.03em'}}>{creditScore}</div>
                    <div style={{flex:1}}>
                      <div style={{height:6,borderRadius:6,background:'rgba(15,23,42,0.08)',overflow:'hidden',marginBottom:4}}>
                        <motion.div style={{height:'100%',borderRadius:6,background:`linear-gradient(90deg,#ef4444,#f59e0b,#10b981)`}}
                          initial={{width:'0%'}} animate={{width:`${((creditScore-300)/(900-300))*100}%`}} transition={{duration:1,ease:'easeOut',delay:0.5}}/>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#CBD5E1'}}>
                        <span>300</span><span>550</span><span>750</span><span>900</span>
                      </div>
                    </div>
                  </div>
                  <p style={{fontSize:11,color:'#94A3B8',marginTop:10}}>Based on SBI credit history & account activity.</p>
                </motion.div>

                {/* Upcoming Bills */}
                <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.34,type:'spring',stiffness:260,damping:28}}
                  style={{...GLASS,borderRadius:22,padding:'18px'}}>
                  <p style={{color:'#94A3B8',fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:14}}>Upcoming</p>
                  {upcomingBills.map((bill,i)=>{
                    const Icon=bill.icon;
                    return (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<upcomingBills.length-1?10:0,padding:'9px 10px',borderRadius:12,background:'rgba(15,23,42,0.02)',border:'1px solid rgba(15,23,42,0.06)'}}>
                        <div style={{width:30,height:30,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:`${bill.color}10`,border:`1px solid ${bill.color}20`}}>
                          <Icon style={{width:13,height:13,color:bill.color}}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:12,fontWeight:500,color:'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bill.label}</p>
                          <p style={{fontSize:10,color:'#94A3B8',marginTop:2}}>{bill.due}</p>
                        </div>
                        <p style={{fontSize:12,fontWeight:700,color:bill.color,flexShrink:0}}>{formatINR(bill.amount)}</p>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Goals Preview */}
                {goals.length>0 && (
                  <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.40,type:'spring',stiffness:260,damping:28}}
                    style={{...GLASS,borderRadius:22,padding:'18px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                      <p style={{color:'#94A3B8',fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase'}}>Goals</p>
                      <button onClick={()=>setActiveTab('goals')} style={{fontSize:11,color:'#1A56DB',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>View all</button>
                    </div>
                    {goals.slice(0,2).map((goal,i)=>{
                      const pct=Math.min(100,Math.round((goal.current/goal.target)*100));
                      return (
                        <div key={goal.id} style={{marginBottom:i<Math.min(goals.length,2)-1?12:0}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <span style={{fontSize:14}}>{goal.emoji}</span>
                              <p style={{fontSize:12,fontWeight:500,color:'#334155'}}>{goal.title}</p>
                            </div>
                            <p style={{fontSize:11,fontWeight:700,color:goal.color}}>{pct}%</p>
                          </div>
                          <div style={{height:4,borderRadius:4,background:'rgba(15,23,42,0.07)',overflow:'hidden'}}>
                            <motion.div style={{height:'100%',borderRadius:4,background:goal.color}}
                              initial={{width:'0%'}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:'easeOut',delay:0.5+i*0.1}}/>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

              </aside>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
