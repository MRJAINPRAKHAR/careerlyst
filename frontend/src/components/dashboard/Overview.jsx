import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

// --- MOCK DATA REMOVED ---
// Data is now derived dynamically from 'jobs' prop

// --- FUTURISTIC COMPONENTS ---

const TechCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`relative rounded-2xl bg-[#030303]/80 backdrop-blur-xl border border-white/5 overflow-hidden ${className}`}
  >
    {/* Tech Decor Corners */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />

    {/* Subtle Grid Background */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

    <div className="relative z-10 h-full flex flex-col">
      {children}
    </div>
  </motion.div>
);

const StatCard = ({ title, value, subtext, icon, color, delay }) => (
  <TechCard delay={delay} className="p-6 hover:bg-white/[0.02] transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="px-2 py-1 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-500/20">
        +2.4%
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest">{title}</h3>
      <div className="text-3xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors shadow-cyan-500/50">
        {value}
      </div>
      <p className="text-xs text-slate-500 font-medium">{subtext}</p>
    </div>
  </TechCard>
);

const MainChart = ({ jobs }) => {
  // Aggregate jobs by month
  const dataMap = jobs.reduce((acc, job) => {
    const date = new Date(job.date_applied);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, apps: 0, shortlisted: 0 };
    acc[month].apps += 1;
    if (['interview', 'offer'].includes(job.status.toLowerCase())) acc[month].shortlisted += 1;
    return acc;
  }, {});

  const chartData = Object.values(dataMap);

  return (
    <TechCard delay={0.2} className="p-6 col-span-2 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
            APPLICATION MATRIX
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">REAL-TIME TRAJECTORY ANALYSIS</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', apps: 0, shortlisted: 0 }]}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333', backdropFilter: 'blur(8px)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
            />
            <Area type="monotone" dataKey="apps" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
            <Area type="monotone" dataKey="shortlisted" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorShort)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TechCard>
  );
};

const PipelineChart = ({ jobs }) => {
  const statusCounts = jobs.reduce((acc, job) => {
    const status = job.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: "Active", value: statusCounts.applied || 0, color: "#06b6d4" },
    { name: "Interview", value: statusCounts.interview || 0, color: "#8b5cf6" },
    { name: "Rejected", value: statusCounts.rejected || 0, color: "#334155" },
    { name: "Offers", value: statusCounts.offer || 0, color: "#10b981" },
  ].filter(d => d.value > 0);

  return (
    <TechCard delay={0.3} className="p-6 h-[400px] flex flex-col relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-1 h-6 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
          SECTOR STATUS
        </h3>
      </div>

      <div className="flex-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{jobs.length}</span>
          <span className="text-[10px] text-cyan-400 font-mono mt-1 tracking-widest">TOTAL</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: d.color, color: d.color }} />
            <span className="text-[10px] text-slate-400 font-mono uppercase">{d.name}</span>
          </div>
        ))}
      </div>
    </TechCard>
  );
};

const ActivityFeed = ({ jobs }) => (
  <TechCard delay={0.4} className="col-span-1 lg:col-span-2 p-6 h-[300px]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
        <span className="w-1 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
        RECENT SIGNALS
      </h3>
      <div className="px-2 py-1 bg-emerald-950/30 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-mono animate-pulse">
        • LIVE FEED
      </div>
    </div>

    <div className="space-y-3 custom-scrollbar overflow-y-auto h-[200px] pr-2">
      {jobs.slice(0, 10).map((job, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-white group-hover:border-cyan-500/50">
            {job.company.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{job.company}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono">
                {new Date(job.date_applied).toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono tracking-wide">{job.role}</div>
          </div>
          <div className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${job.status === 'offer' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            job.status === 'interview' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
              'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
            {job.status}
          </div>
        </div>
      ))}
      {jobs.length === 0 && <p className="text-slate-500 text-center text-xs mt-10">No recent activity detected.</p>}
    </div>
  </TechCard>
);

const MeetingSchedule = () => (
  <TechCard delay={0.5} className="p-6 h-[300px] flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
        <span className="w-1 h-6 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
        UPCOMING SYNCS
      </h3>
      <div className="px-2 py-1 bg-rose-950/30 border border-rose-500/20 rounded text-[10px] text-rose-400 font-mono">
        0 PENDING
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
      No upcoming meetings scheduled.
    </div>
  </TechCard>
);

// --- MAIN OVERVIEW COMPONENT ---

export default function Overview({ jobs }) {
  const totalApplied = jobs.length || 0;

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 space-y-6">

      {/* 1. TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL TARGETS"
          value={totalApplied}
          subtext="Applications Sent"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          color="cyan"
          delay={0}
        />
        <TechCard delay={0.1} className="p-6 md:col-span-2 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 flex items-center justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-white">SYSTEM STATUS</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">ALL SYSTEMS OPERATIONAL</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">N/A</div>
                <div className="text-[10px] text-cyan-400 font-mono tracking-widest">RESUME SCORE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-[10px] text-violet-400 font-mono tracking-widest">PENDING ACTIONS</div>
              </div>
            </div>
          </div>
        </TechCard>
        <StatCard
          title="OFFERS"
          value={jobs.filter(j => j.status === 'offer').length || 0}
          subtext="Secured Positions"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="emerald"
          delay={0.2}
        />
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MainChart jobs={jobs} />
        <PipelineChart jobs={jobs} />
      </div>

      {/* 3. ACTIVITY & MEETINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed jobs={jobs} />
        </div>
        <div className="lg:col-span-1">
          <MeetingSchedule />
        </div>
      </div>

    </div>
  );
}