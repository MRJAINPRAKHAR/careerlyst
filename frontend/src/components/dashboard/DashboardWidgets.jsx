import React, { useState, useRef, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { MoreVertical, Filter, ArrowUpRight, TrendingUp, Trash2, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import CalendarWidget from './CalendarWidget';

const Card = ({ title, children, action, className = "", menu }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`
        group relative overflow-visible
        bg-black/40 backdrop-blur-xl border border-white/10 
        rounded-3xl p-6 flex flex-col h-full 
        transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]
        ${className}
    `}>
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-white tracking-wide uppercase opacity-90">{title}</h3>
                    <div className="flex gap-2">
                        {action}
                        {menu ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl flex flex-col gap-1">
                                        {React.cloneElement(menu, { closeMenu: () => setIsMenuOpen(false) })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 w-full min-h-[180px] flex flex-col justify-center relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Trend Menu Component
const TrendMenu = ({ groupBy, setGroupBy, setDateRange, closeMenu }) => {
    const [subView, setSubView] = useState('main'); // main, year_select, month_select

    // DEFAULTS
    const handleDefault = () => {
        setGroupBy('month');
        setDateRange({ start: '', end: '' }); // All time / Default backend logic
        closeMenu();
    };

    const handleYearBasis = () => {
        setGroupBy('year');
        setDateRange({ start: '', end: '' }); // All time
        closeMenu();
    };

    const handleMonthBasis = (year) => {
        setGroupBy('month');
        setDateRange({ start: `${year}-01-01`, end: `${year}-12-31` });
        closeMenu();
    };

    if (subView === 'year_select') {
        return (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <button onClick={() => setSubView('main')} className="hover:text-white"><ChevronLeft size={14} /></button>
                    <span className="font-bold">Select Year</span>
                    <div className="w-3" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(offset => {
                        const y = new Date().getFullYear() - offset;
                        return (
                            <button
                                key={y}
                                onClick={() => handleMonthBasis(y)}
                                className="px-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5"
                            >
                                {y}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (subView === 'month_select') {
        return (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <button onClick={() => setSubView('main')} className="hover:text-white"><ChevronLeft size={14} /></button>
                    <span className="font-bold">Select Month</span>
                    <div className="w-3" />
                </div>
                {/* Month selection logic here determines the YEAR for monthly basis, simplified for now to just re-use year logic or could be a specific Month Text Picker */}
                {/* For simplicity in restoration without Date Wise, we keep Year Select as the main driver for "Monthly Basis" view of a specific year */}
                <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(offset => {
                        const y = new Date().getFullYear() - offset;
                        return (
                            <button
                                key={y}
                                onClick={() => handleMonthBasis(y)}
                                className="px-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5"
                            >
                                {y}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">View Mode</div>

            <button
                onClick={handleDefault}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-left group transition-colors ${groupBy === 'month' && !subView.includes('select') ? 'text-zinc-300' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
            >
                <span className="font-bold text-cyan-400">Default View</span>
            </button>

            <button
                onClick={handleYearBasis}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-left group transition-colors ${groupBy === 'year' ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
            >
                <span>Yearly Basis</span>
                {groupBy === 'year' && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.5)]" />}
            </button>

            <button
                onClick={() => setSubView('month_select')}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-left group transition-colors ${groupBy === 'month' ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
            >
                <span>Monthly Basis (12 mo)</span>
                <ChevronRight size={14} className="opacity-50" />
            </button>
        </div>
    );
};

export default function DashboardWidgets({ stats, onDelete, groupBy, setGroupBy, setDateRange }) {
    const sentCount = (stats.statusCounts?.Applied || 0) + (stats.statusCounts?.Interview || 0);
    const newReqCount = (stats.statusCounts?.Hiring || 0) + (stats.statusCounts?.Viewed || 0) + (stats.statusCounts?.Offer || 0);
    const rejectedCount = (stats.statusCounts?.Rejected || 0);

    const statusData = [
        { name: 'Sent', value: sentCount, color: '#818cf8' }, // Indigo-400
        { name: 'New Request', value: newReqCount, color: '#34d399' }, // Emerald-400
        { name: 'Rejected', value: rejectedCount, color: '#f87171' }, // Red-400
    ];

    const trendData = stats.trendData || [];

    const funnelData = [
        { name: 'Applied', value: stats.total || 0, fill: '#60a5fa' }, // Blue-400
        { name: 'Interview', value: stats.statusCounts?.Interview || 0, fill: '#a78bfa' }, // Violet-400
        { name: 'Offer', value: stats.statusCounts?.Offer || 0, fill: '#34d399' }, // Emerald-400
        { name: 'Rejected', value: stats.statusCounts?.Rejected || 0, fill: '#f87171' }, // Red-400
    ];

    const recentActivity = stats.recentActivity || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'text-blue-300 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            case 'Viewed': return 'text-purple-300 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            case 'Hiring': return 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20 shadow-[0_0_10px_rgba(232,121,249,0.2)]';
            case 'Offer': return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            case 'Interview': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            case 'Rejected': return 'text-red-300 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            default: return 'text-zinc-400 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 w-full max-w-7xl pb-8">

            {/* 1. TREND: GROWTH (HERO) */}
            <Card
                title="Growth Trend"
                className="col-span-1 md:col-span-2 lg:col-span-4 h-[400px]"
                menu={<TrendMenu groupBy={groupBy || 'month'} setGroupBy={setGroupBy} setDateRange={setDateRange} />}
                action={
                    <div className="flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <TrendingUp size={14} className="mr-2" />
                        <span>
                            {trendData.length > 1 && trendData[trendData.length - 2].applications > 0
                                ? ((trendData[trendData.length - 1].applications - trendData[trendData.length - 2].applications) / trendData[trendData.length - 2].applications * 100).toFixed(0)
                                : 0}% Growth
                        </span>
                    </div>
                }
            >
                <div className="mt-4 w-full h-full pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                            <defs>
                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCurve" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#22d3ee" />
                                    <stop offset="50%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                </pattern>
                            </defs>

                            {/* Custom Grid Texture */}
                            <rect width="100%" height="100%" fill="url(#gridPattern)" opacity={0.5} />

                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 13, fontWeight: 500 }}
                                dy={15}
                                interval="preserveStartEnd"
                                minTickGap={30}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 20px 80px -10px rgba(0,0,0,0.8)' }}
                                itemStyle={{ color: '#fff', fontWeight: 600 }}
                                labelStyle={{ color: '#a1a1aa', marginBottom: '0.25rem', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                cursor={{ stroke: '#22d3ee', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="applications"
                                stroke="url(#colorCurve)"
                                strokeWidth={trendData.length > 60 ? 2 : 4}
                                fillOpacity={1}
                                fill="url(#colorApps)"
                                isAnimationActive={trendData.length < 100}
                                dot={({ cx, cy, payload, index }) => {
                                    if (trendData.length > 60) return <circle cx={cx} cy={cy} r={0} />;

                                    // Only show pulse for points with value > 0 or the last point
                                    const isLast = index === trendData.length - 1;
                                    if (payload.applications > 0 || isLast) {
                                        return (
                                            <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20" overflow="visible">
                                                {/* Core Dot */}
                                                <circle cx="10" cy="10" r="4" fill="#fff" stroke="none" />
                                                {/* Pulse Effect */}
                                                <circle cx="10" cy="10" r="4" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.8">
                                                    <animate attributeName="r" from="4" to="20" dur="1.5s" repeatCount="indefinite" />
                                                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                                                </circle>
                                            </svg>
                                        )
                                    }
                                    return <circle cx={cx} cy={cy} r={0} /> // Invisible dot for zero values
                                }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', style: { filter: 'drop-shadow(0 0 10px rgba(255,255,255,1))' } }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 2. GAUGE: STATUS (Small) */}
            <Card title="Application Status" className="h-[400px]">
                <div className="w-full h-full relative flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={6}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)` }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total Label */}
                    <div className="absolute top-[45%] flex flex-col items-center">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-white to-white/60 tracking-tighter drop-shadow-xl">
                            {stats.total}
                        </div>
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Apps</div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-3 pb-8">
                    {statusData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 group cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full ring-1 ring-white/5" style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}66` }} />
                            <span className="text-zinc-500 text-[10px] font-medium group-hover:text-zinc-300 transition-colors">{d.name}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 3. ACTIVITY: RECENT (Small) */}
            <Card title="Recent Activity" className="h-[400px]">
                <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((item, idx) => (
                            <div key={idx} className="group relative flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                        {item.company[0]}
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-white font-bold text-xs group-hover:text-violet-300 transition-colors truncate">{item.company}</span>
                                        <span className="text-zinc-500 text-[10px] font-medium truncate">{item.role}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 relative z-10 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-md ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onDelete) onDelete(item.id);
                                            }}
                                            className="text-zinc-600 hover:text-red-400 p-0.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Application"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <span className="text-zinc-600 text-[8px] font-medium">
                                        {item.time}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-1">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <ArrowUpRight className="opacity-20 w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium">No recent activity</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* 4. CALENDAR WIDGET (Large) */}
            <CalendarWidget className="col-span-1 md:col-span-2 lg:col-span-2 h-[400px]" />

        </div>
    );
}
