
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Building2, Link, Calendar, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";

export default function AddApplicationModal({ isOpen, onClose, onRefresh, initialData = null }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        status: "Applied",
        date_applied: new Date().toISOString().split('T')[0],
        jobLink: "",
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                company: initialData.company || "",
                role: initialData.role || "",
                status: "Applied",
                date_applied: initialData.date_applied ? new Date(initialData.date_applied).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                jobLink: initialData.jobLink || "",
            });
        } else {
            setFormData({
                company: "",
                role: "",
                status: "Applied",
                date_applied: new Date().toISOString().split('T')[0],
                jobLink: "",
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData && initialData.id) {
                await api.put(`/api/applications/${initialData.id}`, {
                    ...formData,
                    appliedDate: formData.date_applied,
                    status: formData.status // Ensure status is updated
                });
            } else {
                await api.post("/api/applications", {
                    ...formData,
                    appliedDate: formData.date_applied
                });
            }

            if (onRefresh) await onRefresh();
            onClose();
        } catch (err) {
            console.error("Failed to save application", err);
            alert("Failed to save application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Briefcase className="text-indigo-400" size={20} />
                            Manual Entry
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        {/* Company Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Google"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Role / Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Date Applied</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date_applied}
                                        onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Job Link (Optional)</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-3 text-slate-500" size={16} />
                                <input
                                    type="url"
                                    value={formData.jobLink}
                                    onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span>Save Application</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
