import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/client";
import {
    Bell,
    Trash2,
    Lock,
    Mail,
    FileText,
    Chrome
} from "lucide-react";

export default function Settings({ profile }) {
    if (!profile) return null;

    const [showExtensionGuide, setShowExtensionGuide] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        weeklyDigest: false,
        appUpdates: true
    });
    const [legalView, setLegalView] = useState(null); // 'terms' | 'privacy' | null

    // --- HANDLERS ---
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            return alert("New passwords do not match");
        }
        try {
            await api.post("/api/auth/update-password", {
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            alert("Password updated successfully");
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update password");
        }
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.");
        if (!confirm) return;
        try {
            await api.delete("/api/auth/delete-account");
            localStorage.clear();
            window.location.href = "/login";
        } catch (err) {
            alert("Failed to delete account");
        }
    };

    const connectGmail = async () => {
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
        window.location.href = `${backendUrl}/api/auth/google/connect`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl mx-auto pb-20"
        >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 font-display text-white">Account Settings</h1>

            {/* INTEGRATIONS */}
            <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Chrome className="text-indigo-400" size={20} /> Integrations
                </h3>
                <div className="space-y-4">
                    {/* Gmail */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center"><Mail className="text-red-500" size={20} /></div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Gmail Synchronization</h4>
                                <p className="text-slate-400 text-xs">Sync job emails automatically</p>
                            </div>
                        </div>
                        {profile.email ? (
                            <button className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 cursor-default">Connected</button>
                        ) : (
                            <button onClick={connectGmail} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500">Connect</button>
                        )}
                    </div>

                    {/* LinkedIn Extension */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#0077b5] rounded-full flex items-center justify-center text-white font-bold text-xs">in</div>
                            <div>
                                <h4 className="text-white font-bold text-sm">LinkedIn Extension</h4>
                                <p className="text-slate-400 text-xs">Save applications with one click</p>
                            </div>
                        </div>
                        <button onClick={() => setShowExtensionGuide(true)} className="px-4 py-2 rounded-lg bg-white/5 text-white text-xs font-bold border border-white/10 hover:bg-white/10">Setup Guide</button>
                    </div>
                </div>
            </div>

            {/* PASSWORD */}
            <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Lock className="text-indigo-400" size={20} /> Password & Security
                </h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                    <InputGroup label="Current Password" type="password" value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })} />
                    <InputGroup label="New Password" type="password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} />
                    <InputGroup label="Confirm New Password" type="password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                    <div className="pt-2">
                        <button type="submit" className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all">Update Password</button>
                    </div>
                </form>
            </div>

            {/* NOTIFICATIONS */}
            <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="text-indigo-400" size={20} /> Notifications
                </h3>
                <div className="space-y-4">
                    {[
                        { id: 'emailAlerts', label: 'Email Alerts', desc: 'Get notified for new interviews' },
                        { id: 'appUpdates', label: 'App Updates', desc: 'New features and improvements' }
                    ].map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-bold text-sm">{item.label}</h4>
                                <p className="text-slate-500 text-xs">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.id] ? 'bg-indigo-600' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* LEGAL */}
            <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="text-indigo-400" size={20} /> Legal
                </h3>
                <div className="flex gap-4">
                    <button onClick={() => setLegalView('terms')} className="text-slate-400 hover:text-white text-sm underline">Terms & Conditions</button>
                    <button onClick={() => setLegalView('privacy')} className="text-slate-400 hover:text-white text-sm underline">Privacy Policy</button>
                </div>
            </div>

            {/* DANGER ZONE */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/20">
                <h3 className="text-lg font-bold text-rose-500 mb-2 flex items-center gap-2">
                    <Trash2 size={20} /> Danger Zone
                </h3>
                <p className="text-xs text-rose-200/60 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button onClick={handleDeleteAccount} className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/20">
                    Delete Account
                </button>
            </div>


            {/* EXTENSION GUIDE MODAL */}
            <AnimatePresence>
                {showExtensionGuide && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowExtensionGuide(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                🧩 Connect Extension
                            </h3>

                            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4 mb-6">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Paste this key into the <strong>Careerlyst Companion</strong> extension.
                                    <br />
                                    <span className="text-amber-500 font-bold">⚠️ Valid for 30 days.</span>
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        type="password"
                                        value={localStorage.getItem("token") || ""}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(localStorage.getItem("token"));
                                            alert("Extension Key Copied!");
                                        }}
                                        className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-indigo-500 transition-all"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <ul className="space-y-3 text-xs text-slate-400">
                                <li>1. Open <code className="text-white">chrome://extensions</code></li>
                                <li>2. Enable Developer Mode</li>
                                <li>3. Load Unpacked Extension</li>
                                <li>4. Paste the Key above</li>
                            </ul>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => setShowExtensionGuide(false)}
                                    className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all"
                                >
                                    Got it!
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence>

            {/* LEGAL MODAL */}
            <AnimatePresence>
                {legalView && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl relative max-h-[80vh] overflow-y-auto custom-scrollbar"
                        >
                            <button onClick={() => setLegalView(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">✕</button>

                            <h2 className="text-3xl font-bold text-white mb-6">
                                {legalView === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                            </h2>

                            <div className="prose prose-invert prose-sm text-slate-400 space-y-4">
                                {legalView === 'terms' ? (
                                    <>
                                        <p className="font-bold text-white">Last Updated: February 2026</p>
                                        <p>Welcome to Careerlyst! By accessing or using our website, services, or tools (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our Services.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">1. Usage of Service</h3>
                                        <p>You agree to use Careerlyst only for lawful purposes related to personal job application tracking. You must not misuse our services to harm, disable, or impair our infrastructure.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">2. User Accounts</h3>
                                        <p>You are responsible for safeguarding your account credentials. Careerlyst is not liable for any loss or damage arising from your failure to protect your password.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">3. Content Ownership</h3>
                                        <p>The job application data, resumes, and notes you upload remain your property. We claim no intellectual property rights over the material you provide to the Service.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">4. Termination</h3>
                                        <p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent or illegal activities.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">5. Limitations of Liability</h3>
                                        <p>Careerlyst provides its service "as is". We do not guarantee that the service will be uninterrupted or error-free. We are not liable for any missed job opportunities or data loss.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold text-white">Last Updated: February 2026</p>
                                        <p>Your privacy is critically important to us. This Privacy Policy explains how Careerlyst collects, uses, and protects your information.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">1. Information We Collect</h3>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><strong>Account Information:</strong> Name, email address, password, and profile details you provide.</li>
                                            <li><strong>Job Data:</strong> Information about your job applications, companies, roles, and status updates.</li>
                                            <li><strong>Gmail Data:</strong> With your permission, we access your Gmail account solely to identify job-related emails. We <strong>do not</strong> read your personal correspondence or sell your email data.</li>
                                        </ul>

                                        <h3 className="text-white font-bold text-lg mt-6">2. How We Use Your Data</h3>
                                        <p>We use your data to:</p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>Populate your dashboard with tracked applications.</li>
                                            <li>Provide analytics and insights (like Growth Trends).</li>
                                            <li>Offer personalized AI coaching tips for your resume.</li>
                                        </ul>

                                        <h3 className="text-white font-bold text-lg mt-6">3. Data Security</h3>
                                        <p>We implement industry-standard security measures (encryption, secure tokens) to protect your data. Your Google access tokens are encrypted in our database.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">4. Third-Party Sharing</h3>
                                        <p>We do not sell, trade, or rent your personal identification information to others. We share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners for analytics.</p>

                                        <h3 className="text-white font-bold text-lg mt-6">5. Your Rights</h3>
                                        <p>You have the right to access, correct, or delete your personal data at any time. You can delete your account permanently via the Settings page.</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                                <button onClick={() => setLegalView(null)} className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all">Close</button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const InputGroup = ({ label, type = "text", value, onChange, disabled }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
        <input
            type={type}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none disabled:opacity-50 transition-all"
        />
    </div>
);
