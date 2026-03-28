"use client";

import { useState, useEffect, useRef, memo, useCallback, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { saveCurrentWorkspaceId } from "@/utils/invitationStorage";

// Lazy load the modal since it's not always needed
const InviteModal = lazy(() => import("./InviteModal"));

// --- Minimal Icon Components ---
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  papers: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  members: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 0a3 3 0 11-6 0 3 3 0 016 0zM22 21v-2a4 4 0 00-3-3.87",
  folders: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  ai: "M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2zM12 16a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2v-2a2 2 0 012-2zM4.929 4.929a2 2 0 012.828 0l1.414 1.414A2 2 0 017.757 9.17a2 2 0 01-2.828-2.828L3.515 4.929zM16.243 16.243a2 2 0 012.828 0l1.414 1.414a2 2 0 01-2.828 2.828l-1.414-1.414a2 2 0 010-2.828zM4.929 19.071l1.414-1.414A2 2 0 019.17 20.485a2 2 0 01-2.828 0L4.929 19.07zM16.243 7.757l1.414-1.414a2 2 0 012.828 2.828l-1.414 1.414a2 2 0 01-2.828-2.828zM2 12a2 2 0 012-2h2a2 2 0 010 4H4a2 2 0 01-2-2zM16 12a2 2 0 012-2h2a2 2 0 010 4h-2a2 2 0 01-2-2z",
  arrow: "M5 12h14M12 5l7 7-7 7",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  invite: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M18 8v6M21 11h-6M9 7a4 4 0 100 8 4 4 0 000-8",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm7.97-3a7.97 7.97 0 01-.13 1.45l1.57 1.22a.4.4 0 01.09.5l-1.49 2.58a.4.4 0 01-.48.17l-1.84-.74a7.86 7.86 0 01-1.25.72l-.28 1.96a.4.4 0 01-.39.34h-2.98a.4.4 0 01-.39-.34l-.28-1.96a7.86 7.86 0 01-1.25-.72l-1.84.74a.4.4 0 01-.48-.17L4.1 15.17a.39.39 0 01.09-.5l1.57-1.22A8.13 8.13 0 015.63 12a8 8 0 01.13-1.45L4.19 9.33a.4.4 0 01-.09-.5l1.49-2.58a.4.4 0 01.48-.17l1.84.74A7.86 7.86 0 019.16 6.1l.28-1.96A.4.4 0 019.83 3.8h2.98a.4.4 0 01.39.34l.28 1.96a7.86 7.86 0 011.25.72l1.84-.74a.4.4 0 01.48.17l1.49 2.58a.39.39 0 01-.09.5l-1.57 1.22c.08.47.13.96.13 1.45z",
};

// --- Smooth Animated Counter ---
function AnimatedNumber({ target, duration = 1500, suffix = "" }: any) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start: number | null = null;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// --- Mini Sparkline SVG ---
function Sparkline({ data, color = "#10b981", height = 40 }: any) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = height;
  const pts = data.map((v: number, i: number) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const area = `M0,${h} L${data.map((v: number, i: number) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" L")} L${w},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Bar Chart ---
function BarChart({ data, labels, color = "#10b981" }: any) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[6px] h-20 px-1">
      {data.map((v: number, i: number) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm origin-bottom"
            style={{
              height: `${(v / max) * 68}px`,
              background: `linear-gradient(to top, ${color}cc, ${color}55)`,
              animation: `barGrow 0.8s ease ${i * 0.1}s both`,
            }}
          />
          <span className="text-[9px] text-gray-500 font-mono">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// --- Donut Chart ---
function DonutChart({ segments }: any) {
  const total = segments.reduce((s: number, x: any) => s + x.value, 0);
  let offset = 0;
  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  const arcs = segments.map((seg: any) => {
    const dash = (seg.value / total) * circ;
    const gap = circ - dash;
    const arc = { ...seg, dashoffset: -offset * circ / total, dash, gap };
    offset += seg.value;
    return arc;
  });

  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-gray-800" strokeWidth="14" />
      {arcs.map((arc: any, i: number) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={arc.color} strokeWidth="14"
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.dashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-1000 ease-in-out"
        />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="monospace">
        {total}
      </text>
    </svg>
  );
}

// --- Activity Feed Item ---
function ActivityItem({ avatar, name, action, paper, time, color }: any) {
  return (
    <div className="flex gap-2.5 items-start py-2.5 border-b border-gray-900">
      <div
        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="m-0 text-xs text-gray-300">
          <span className="text-white font-semibold">{name}</span> {action}{" "}
          <span className="text-emerald-500">{paper}</span>
        </p>
        <p className="m-0 mt-0.5 text-[10px] text-gray-600">{time}</p>
      </div>
    </div>
  );
}

// === MAIN COMPONENT ===
const WorkSpace = memo(function WorkSpace() {
  const [mounted, setMounted] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // get the workspace id from params
  const { id } = useParams();

  // Use useEffect to set workspaceId only once when component mounts or id changes
  useEffect(() => {
    if (id) {
      setWorkspaceId(id as string);
      // Save to localStorage for sidebar navigation
      saveCurrentWorkspaceId(id as string);
    }
  }, [id]);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const papersByMonth = [8, 12, 7, 15, 11, 18, 14, 22, 19, 25, 21, 28];
  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const weekActivity = [3, 7, 5, 12, 8, 15, 11];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const donutData = [
    { value: 42, color: "#10b981", label: "CS" },
    { value: 28, color: "#6366f1", label: "Physics" },
    { value: 18, color: "#f59e0b", label: "Math" },
    { value: 12, color: "#ec4899", label: "Other" },
  ];

  const activities = [
    { avatar: "Z", name: "Zeeshan", action: "saved", paper: "Attention Is All You Need", time: "2 min ago", color: "#6366f1" },
    { avatar: "A", name: "Ali", action: "commented on", paper: "GPT-4 Technical Report", time: "18 min ago", color: "#10b981" },
    { avatar: "S", name: "Sara", action: "added to folder", paper: "Neural Scaling Laws", time: "1 hr ago", color: "#f59e0b" },
    { avatar: "Z", name: "Zeeshan", action: "started chat with", paper: "RLHF Paper", time: "3 hr ago", color: "#6366f1" },
    { avatar: "A", name: "Ali", action: "invited", paper: "new member", time: "Yesterday", color: "#10b981" },
  ];

  const quickLinks = [
    { label: "Saved Papers", sub: "12 papers", icon: icons.papers, color: "#10b981", bg: "#10b98118" },
    { label: "Search Papers", sub: "arXiv & more", icon: icons.search, color: "#6366f1", bg: "#6366f118" },
    { label: "Team Chat", sub: "3 members", icon: icons.chat, color: "#f59e0b", bg: "#f59e0b18" },
    { label: "Paper Chat", sub: "AI assistant", icon: icons.ai, color: "#ec4899", bg: "#ec489918" },
  ];

  const statCards = [
    { label: "Saved Papers", value: 12, sub: "+3 this week", icon: icons.papers, color: "#10b981", spark: [5, 7, 6, 9, 8, 11, 12], sparkColor: "#10b981" },
    { label: "Team Members", value: 3, sub: "Active now", icon: icons.members, color: "#6366f1", spark: [1, 1, 2, 2, 3, 3, 3], sparkColor: "#6366f1" },
    { label: "Folders", value: 5, sub: "2 nested", icon: icons.folders, color: "#f59e0b", spark: [1, 2, 2, 3, 4, 4, 5], sparkColor: "#f59e0b" },
    { label: "Chats", value: 24, sub: "This month", icon: icons.chat, color: "#ec4899", spark: [4, 6, 3, 8, 5, 9, 7], sparkColor: "#ec4899" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans py-7 px-8 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes barGrow { from { transform:scaleY(0); } to { transform:scaleY(1); } }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:.5; } }
      `}</style>

      {/* Header */}
      <div
        className={`flex items-center justify-between mb-7 transition-all duration-500 ease-in-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: "pulseDot 2s infinite" }} />
            <span className="text-xs text-emerald-500 font-medium tracking-[0.08em] uppercase font-mono">Workspace Overview</span>
          </div>
          <h1 className="m-0 text-[26px] font-bold tracking-tight">
            Research Workspace
          </h1>
          <p className="m-0 mt-1 text-gray-600 text-[13px]">Last activity 2 minutes ago</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-transparent border border-gray-800 rounded-[10px] px-4 py-2 text-gray-400 cursor-pointer text-[13px] font-inherit hover:bg-gray-800 transition-colors"
        >
          <Icon d={icons.invite} size={15} /> Invite Member
        </button>
      </div>

      {/* Members Row */}
      <div
        className="bg-gray-900 rounded-[14px] py-4 px-[22px] border border-gray-800 mb-4 flex items-center justify-between transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
        style={{ animation: "fadeUp 0.6s ease 0.7s both" }}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex">
            {["Z", "A", "S"].map((a, i) => (
              <div
                key={i}
                className="w-[34px] h-[34px] rounded-full border-2 border-gray-900 flex items-center justify-center text-[13px] font-bold text-white relative"
                style={{
                  background: ["#6366f1", "#10b981", "#f59e0b"][i],
                  marginLeft: i > 0 ? "-10px" : "0",
                  zIndex: 3 - i,
                }}
              >
                {a}
              </div>
            ))}
          </div>
          <div>
            <p className="m-0 text-[13px] font-semibold">3 Team Members</p>
            <p className="m-0 mt-0.5 text-[11px] text-gray-600">Zeeshan · Ali · Sara</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="text-center px-4 py-1.5 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <p className="m-0 text-[17px] font-bold font-mono text-emerald-500"><AnimatedNumber target={3} /></p>
            <p className="m-0 mt-0.5 text-[10px] text-gray-600">Online</p>
          </div>
          <div className="text-center px-4 py-1.5 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <p className="m-0 text-[17px] font-bold font-mono text-indigo-500"><AnimatedNumber target={24} /></p>
            <p className="m-0 mt-0.5 text-[10px] text-gray-600">Messages</p>
          </div>
          <div className="text-center px-4 py-1.5 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <p className="m-0 text-[17px] font-bold font-mono text-amber-500"><AnimatedNumber target={12} /></p>
            <p className="m-0 mt-0.5 text-[10px] text-gray-600">Papers</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="bg-emerald-500 border-none rounded-[10px] px-[18px] py-[9px] text-white font-semibold text-[13px] cursor-pointer flex items-center gap-[7px] hover:bg-emerald-600 transition-colors"
        >
          <Icon d={icons.invite} size={14} color="white" /> Invite Member
        </button>
      </div>

      {/* Stat Cards */}
      <div
        className="grid grid-cols-4 gap-4 mb-6"
        style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-[14px] px-5 py-[18px] border border-gray-800 flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
            style={{ animation: `fadeUp 0.6s ease ${0.1 + i * 0.08}s both` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="m-0 text-xs text-gray-500 font-medium">{card.label}</p>
                <p className="m-0 mt-1.5 text-[30px] font-bold font-mono text-white leading-none">
                  <AnimatedNumber target={card.value} />
                </p>
                <p className="m-0 mt-1.5 text-[11px]" style={{ color: card.color }}>{card.sub}</p>
              </div>
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ background: card.color + "22" }}
              >
                <Icon d={card.icon} size={17} color={card.color} />
              </div>
            </div>
            <Sparkline data={card.spark} color={card.sparkColor} height={36} />
          </div>
        ))}
      </div>

      {/* Main Grid: Charts + Activity */}
      <div className="grid grid-cols-[1fr_1fr_320px] gap-4 mb-5">

        {/* Papers Over Time */}
        <div
          className="bg-gray-900 rounded-[14px] py-5 px-[22px] border border-gray-800 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{ animation: "fadeUp 0.6s ease 0.35s both" }}
        >
          <div className="flex justify-between items-start mb-[18px]">
            <div>
              <p className="m-0 text-[13px] font-semibold">Papers Saved</p>
              <p className="m-0 mt-[3px] text-[11px] text-gray-600">Monthly trend</p>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-500 rounded-md px-2 py-[3px] font-mono">+31% YoY</span>
          </div>
          <BarChart data={papersByMonth} labels={monthLabels} color="#10b981" />
        </div>

        {/* Weekly Activity */}
        <div
          className="bg-gray-900 rounded-[14px] py-5 px-[22px] border border-gray-800 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{ animation: "fadeUp 0.6s ease 0.43s both" }}
        >
          <div className="flex justify-between items-start mb-[18px]">
            <div>
              <p className="m-0 text-[13px] font-semibold">Team Activity</p>
              <p className="m-0 mt-[3px] text-[11px] text-gray-600">Actions this week</p>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-500 rounded-md px-2 py-[3px] font-mono">51 total</span>
          </div>
          <BarChart data={weekActivity} labels={weekLabels} color="#6366f1" />
        </div>

        {/* Category Donut */}
        <div
          className="bg-gray-900 rounded-[14px] py-5 px-[22px] border border-gray-800 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{ animation: "fadeUp 0.6s ease 0.5s both" }}
        >
          <p className="m-0 mb-3.5 text-[13px] font-semibold">By Category</p>
          <div className="flex gap-[18px] items-center">
            <DonutChart segments={donutData} />
            <div className="flex flex-col gap-2">
              {donutData.map((s, i) => (
                <div key={i} className="flex items-center gap-[7px]">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px] text-gray-400">{s.label}</span>
                  <span className="text-[11px] text-white font-semibold ml-auto font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Links + Activity */}
      <div className="grid grid-cols-[1fr_340px] gap-4">

        {/* Quick Links */}
        <div
          className="bg-gray-900 rounded-[14px] py-5 px-[22px] border border-gray-800 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{ animation: "fadeUp 0.6s ease 0.55s both" }}
        >
          <p className="m-0 mb-4 text-[13px] font-semibold">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, i) => (
              <div
                key={i}
                className="rounded-xl px-[18px] py-4 flex items-center gap-[14px] cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                style={{ background: link.bg, border: `1px solid ${link.color}30` }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: link.color + "25" }}
                >
                  <Icon d={link.icon} size={18} color={link.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[13px] font-semibold text-white">{link.label}</p>
                  <p className="m-0 mt-[3px] text-[11px] text-gray-500">{link.sub}</p>
                </div>
                <Icon d={icons.arrow} size={14} color={link.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="bg-gray-900 rounded-[14px] py-5 px-[22px] border border-gray-800 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{ animation: "fadeUp 0.6s ease 0.62s both" }}
        >
          <div className="flex justify-between items-center mb-1">
            <p className="m-0 text-[13px] font-semibold">Recent Activity</p>
            <span className="text-[10px] text-emerald-500 cursor-pointer hover:underline">View all →</span>
          </div>
          <div>
            {activities.map((act, i) => (
              <ActivityItem key={i} {...act} />
            ))}
          </div>
        </div>
      </div>



      {/* Invite Modal */}
      {workspaceId && isModalOpen && (
        <Suspense fallback={null}>
          <InviteModal
            isOpen={isModalOpen}
            onClose={closeModal}
            workspaceId={workspaceId}
          />
        </Suspense>
      )}
    </div>
  );
});

export default WorkSpace;
