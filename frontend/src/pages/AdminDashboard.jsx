import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { Users, Bug, MessageSquare, CheckCircle, Clock, Search, ExternalLink, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [activeTab, setActiveTab] = useState("overview"); // overview, users, feedback
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            await fetchStats();
            setIsAdmin(true);
        } catch (err) {
            console.error("Not admin check failed:", err);
            navigate("/dashboard"); // Redirect if not admin
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("/api/admin/stats");
            setStats(res.data);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users");
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedback = async (filter = 'all') => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/feedback?filter=${filter}`);
            setFeedback(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/api/admin/feedback/${id}`, { status });
            fetchFeedback(activeTab === 'feedback' ? 'all' : 'all');
            fetchStats();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    useEffect(() => {
        if (!isAdmin) return;
        if (activeTab === "overview") fetchStats();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "feedback") fetchFeedback();
    }, [activeTab, isAdmin]);

    if (!isAdmin && loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verifying Access...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <ShieldAlert size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                            <p className="text-xs text-slate-500 font-mono">Careerlyst Security Level 5</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Exit to Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-white/5 w-fit p-1 rounded-xl">
                    {['overview', 'users', 'feedback'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && stats && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <StatCard icon={<Users />} title="Total Users" value={stats.stats.totalUsers} color="indigo" />
                                    <StatCard icon={<Bug />} title="Active Bugs" value={stats.stats.totalBugs} color="rose" />
                                    <StatCard icon={<MessageSquare />} title="Feedback" value={stats.stats.totalFeedback} color="emerald" />
                                    <StatCard icon={<Clock />} title="Pending Review" value={stats.stats.pendingItems} color="amber" />
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold mb-4">Newest Users</h2>
                                    <div className="space-y-4">
                                        {stats.recentUsers.map(u => (
                                            <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold">
                                                        {u.full_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{u.full_name}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === "users" && (
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Verified</th>
                                            <th className="p-4">Reports</th>
                                            <th className="p-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300 divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-bold text-white">{u.full_name}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-300'}`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {u.is_verified ? <CheckCircle size={16} className="text-emerald-500" /> : <span className="text-rose-500 text-xs">No</span>}
                                                </td>
                                                <td className="p-4">{u.feedback_count}</td>
                                                <td className="p-4 font-mono text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* FEEDBACK TAB */}
                        {activeTab === "feedback" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {feedback.map(item => (
                                    <div key={item.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'bug' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">{new Date(item.created_at).toLocaleString()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{item.subject}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                                {item.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                                    {item.full_name ? item.full_name[0] : '?'}
                                                </div>
                                                <span className="text-slate-400">by {item.full_name || item.email || 'Unknown'}</span>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 border-l border-white/10 pl-0 md:pl-6 pt-4 md:pt-0">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                            <StatusButton
                                                current={item.status}
                                                target="pending"
                                                label="Mark Pending"
                                                onClick={() => handleUpdateStatus(item.id, 'pending')}
                                            />
                                            <StatusButton
                                                current={item.status}
                                                target="reviewed"
                                                label="Mark Reviewed"
                                                onClick={() => handleUpdateStatus(item.id, 'reviewed')}
                                            />
                                            <StatusButton
                                                current={item.status}
                                                target="resolved"
                                                label="Mark Resolved"
                                                onClick={() => handleUpdateStatus(item.id, 'resolved')}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {feedback.length === 0 && <p className="text-center text-slate-500 py-10">No records found.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Subcomponents
function StatCard({ icon, title, value, color }) {
    const colors = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-black/20`}>{icon}</div>
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <h3 className="text-sm font-medium opacity-80">{title}</h3>
        </div>
    );
}

function StatusButton({ current, target, label, onClick }) {
    const isActive = current === target;
    return (
        <button
            onClick={onClick}
            disabled={isActive}
            className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${isActive ? 'bg-white text-black opacity-100 cursor-default' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
        >
            {isActive && <CheckCircle size={12} className="inline mr-1 text-emerald-600" />}
            {label}
        </button>
    );
}
