import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import { api } from "../api/client";
import ProfileComponent from "../components/dashboard/Profile";
import {
    Linkedin,
    Mail,
    Search,
    Hexagon,
    LayoutGrid,
    CheckSquare,
    Send,
    Clock,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    User
} from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/auth/me");
                const safeParse = (data) => {
                    if (!data) return [];
                    if (Array.isArray(data)) return data;
                    if (typeof data === 'string') {
                        try { return JSON.parse(data); } catch (e) { return []; }
                    }
                    return [];
                };

                setProfile({
                    name: res.data.fullName,
                    email: res.data.email,
                    username: res.data.username || "user",
                    avatar: res.data.profilePic,
                    jobTitle: res.data.jobTitle || "Software Developer | SRE | React | Python | Devops | FastAPI | Django | PostgreSQL | Bash Scripting | Dynatrace | Grafana | Ansible",
                    bio: res.data.bio,
                    dob: res.data.dob,
                    resumeUrl: res.data.resumeUrl,
                    links: typeof res.data.links === 'string' ? JSON.parse(res.data.links || '{}') : (res.data.links || {}),
                    mobileNo: res.data.mobileNo,
                    city: res.data.city,
                    state: res.data.state,
                    country: res.data.country,
                    skills: safeParse(res.data.skills),
                    education: safeParse(res.data.education),
                    workHistory: safeParse(res.data.work_history),
                    certificates: safeParse(res.data.certificates),
                    achievements: safeParse(res.data.achievements),
                    bannerUrl: res.data.bannerUrl,
                    initials: res.data.fullName ? res.data.fullName.split(" ").map(n => n[0]).join("").slice(0, 2) : "U"
                });
            } catch (err) {
                console.error("Failed to load profile", err);
                if (err.response && err.response.status === 401) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-[#020202] overflow-hidden relative font-sans flex text-white">

            <div className="fixed inset-0 z-0 opacity-60">
                <Spline scene="https://prod.spline.design/4LuU7piWuQJ1UmLD/scene.splinecode" />
                <div className="absolute inset-0 z-[1] pointer-events-none shadow-[inset_0_0_160px_rgba(0,0,0,0.95)]" />
            </div>

            {/* Watermark Cover-up */}
            <div className="fixed bottom-0 right-0 w-40 h-14 bg-[#020202] z-40 pointer-events-none" />

            <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 shadow-2xl pointer-events-auto">

                {/* LEFT SIDE: BRAND */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Hexagon className="text-white fill-white/20" size={24} />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-white tracking-tight font-display">Nova<span className="text-white/40 font-light">Track</span></h1>
                    </div>
                </div>

                {/* RIGHT: USER PROFILE */}
                <div className="flex items-center gap-6">
                    {/* TIME DISPLAY */}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-lg font-bold text-white tracking-tight font-display leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-0.5">
                            {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                    {/* PROFILE DROPDOWN WRAPPER */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 group outline-none"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white leading-none group-hover:text-indigo-400 transition-colors">{profile?.name}</p>
                                <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-1">@{profile?.username}</p>
                            </div>
                            <div className="relative">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} className="w-10 h-10 rounded-full border border-white/10 shadow-lg object-cover group-hover:border-indigo-500/50 transition-colors" alt="User" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center shadow-lg text-xs font-bold text-white group-hover:border-indigo-500/50 transition-colors">
                                        {profile?.initials || "U"}
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1a1a1a] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </button>

                        {/* DROPDOWN MENU */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-[40]" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 top-full mt-4 w-56 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl p-2 z-[50] backdrop-blur-xl flex flex-col gap-1 transition-all animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-sm font-bold text-white">{profile?.name}</p>
                                        <p className="text-xs text-zinc-500">{profile?.email}</p>
                                    </div>
                                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                                        <LayoutGrid size={16} />
                                        <span>Dashboard</span>
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <aside className={`fixed left-0 top-20 bottom-0 z-40 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out px-3 ${isExpanded ? 'w-64' : 'w-20'}`}>
                {/* TOGGLE BUTTON */}
                <div className="h-20 flex items-center justify-center border-b border-white/5 mx-[-12px] px-3 mb-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="group flex items-center w-full h-11 rounded-xl transition-all duration-300 hover:bg-white/10 text-white pl-3 hover:scale-[1.02] active:scale-95">
                        <div className="shrink-0 flex items-center justify-center w-8 h-8">
                            {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </div>
                        <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-cols-[1fr] opacity-100 ml-3' : 'grid-cols-[0fr] opacity-0 ml-0'}`}>
                            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Collapse View</span>
                        </div>
                    </button>
                </div>

                {/* MENU ITEMS */}
                <nav className="flex-1 flex flex-col gap-2 mt-4">
                    {[
                        { icon: LayoutGrid, label: "Dashboard", path: '/dashboard' },
                        { icon: User, label: "My Profile", active: true },
                        { icon: Mail, label: "Messages" },
                        { icon: CheckSquare, label: "Tasks" },
                        { icon: Send, label: "Sent" },
                        { icon: Clock, label: "History" },
                        { icon: Settings, label: "Settings" },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => item.path && navigate(item.path)}
                            className={`group flex items-center w-full h-11 rounded-lg cursor-pointer transition-all duration-300 pl-3 hover:scale-[1.02] active:scale-95 ${item.active ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <item.icon size={18} />
                            </div>
                            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-cols-[1fr] opacity-100 ml-3' : 'grid-cols-[0fr] opacity-0 ml-0'}`}>
                                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* BOTTOM ACTIONS */}
                <div className="py-4 border-t border-white/5 mx-[-12px] px-3">
                    <button onClick={handleLogout} className="flex items-center w-full h-11 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 pl-3 hover:scale-[1.02] active:scale-95">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <LogOut size={18} />
                        </div>
                        <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-cols-[1fr] opacity-100 ml-3' : 'grid-cols-[0fr] opacity-0 ml-0'}`}>
                            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Log Out</span>
                        </div>
                    </button>
                </div>
            </aside>

            <main
                className={`flex-1 relative z-10 flex flex-col p-6 md:p-8 overflow-y-auto custom-scrollbar transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}
                style={{ paddingTop: '100px', height: '100vh' }}
            >
                {/* Profile Editor Component */}
                {profile ? (
                    <ProfileComponent profile={profile} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                        <p className="text-lg mb-4">Failed to load profile data.</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
                            Retry
                        </button>
                    </div>
                )}
            </main>
            <style>{`
                #spline - watermark,
                [style *= "fixed; bottom: 16px; right: 16px;"],
                a[href *= "spline.design"] {
                display: none!important;
                opacity: 0!important;
                visibility: hidden!important;
                }
                canvas { outline: none; }
                .font - display { font - family: 'Outfit', 'Inter', system - ui, sans - serif; }
            `}</style>
        </div>
    );
}
