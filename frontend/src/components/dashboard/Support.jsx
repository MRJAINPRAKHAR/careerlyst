import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Mail,
    MessageSquare,
    AlertTriangle,
    Send,
    Bug,
    Sparkles,
    LifeBuoy
} from "lucide-react";
import { api } from "../../api/client";

export default function Support() {
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [feedbackType, setFeedbackType] = useState("feedback"); // 'feedback' | 'bug'
    const [feedback, setFeedback] = useState({ subject: "", message: "" });
    const [sent, setSent] = useState(false);

    // AI-Generated FAQ Content
    const faqs = [
        {
            question: "How does the Automatic Email Sync work?",
            answer: "Our system detects job-related emails (like 'Application Received', 'Interview Invitation', or 'Offer') in your connected Gmail account. It strictly reads only relevant emails using secure, read-only access to populate your dashboard automatically."
        },
        {
            question: "What is the difference between 'Hirings' and 'Sent Applications'?",
            answer: "'Hirings' are potential leads or applications discovered from your email that you haven't explicitly tracked yet. Once you click 'Apply' or fill in the details for a Hiring lead, it moves to 'Sent Applications', which tracks your active, confirmed applications."
        },
        {
            question: "My application status is wrong. How do I fix it?",
            answer: "You can manually update any application's status by clicking on the company name in the list. This opens the edit form where you can change the status (e.g., from 'Applied' to 'Interview')."
        },
        {
            question: "How is the 'Growth Trend' calculated?",
            answer: "The Growth Trend graph shows the number of applications you've made over time. It combines both automatically synced applications and manually added ones to give you a complete picture of your job search activity."
        },
        {
            question: "Is my data shared with recruiters?",
            answer: "No. Your data is private and used solely for your personal tracking dashboard. We do not share your application history or personal details with third parties."
        },
        {
            question: "Can I delete an application?",
            answer: "Yes, you can delete any application from the Dashboard or Hirings list by clicking the Trash icon. Please note that this action is permanent."
        },
        {
            question: "What happens if I reset my data?",
            answer: "Clicking 'Reset Data' will permanently wipe all your tracked applications and history from the database. This is useful if you want to start fresh or re-sync everything from scratch. You will need to click 'Email Sync' again to repopulate your dashboard."
        },
        {
            question: "How do I edit my profile?",
            answer: "Go to the 'Settings' tab in the sidebar or click on your profile picture in the top right corner. From there, you can update your personal details, resume, and preferences."
        },
        {
            question: "How often does the sync run?",
            answer: "Our email sync runs periodically throughout the day to catch new job-related emails. You can also manually trigger a sync from the dashboard if you need an immediate update."
        },
        {
            question: "Why are some emails not being picked up?",
            answer: "Our AI looks for specific keywords in emails (e.g., 'Thank you for applying', 'Interview'). If an email doesn't match these patterns, it might be skipped. You can always manually add a missing application using the 'Add Application' button on the dashboard."
        }
    ];

    const handleSendFeedback = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/support/feedback", {
                type: feedbackType,
                subject: feedback.subject,
                message: feedback.message
            });
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setFeedback({ subject: "", message: "" });
            }, 3000);
        } catch (err) {
            console.error("Failed to send feedback", err);
            alert("Failed to send message. Please try again.");
        }
    };

    const isBug = feedbackType === 'bug';
    const themeColor = isBug ? 'rose' : 'indigo';

    // Tailwind won't parse dynamic template strings fully for colors sometimes if not safelisted, 
    // but standard palette usually works if full class names are constructed or standard.
    // We'll use style objects or specific conditional classes for safety.

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 md:px-0">

            {/* HEADER SECTION */}
            <div className="mb-12 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4 backdrop-blur-md">
                    <LifeBuoy size={14} />
                    <span>Help Center & Support</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-display text-white">
                    How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">help you?</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                    Explore our guides, find answers to common questions, or get in touch with our engineering team directly for help or bug reports.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: FAQ & INFO (7 cols) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* OVERVIEW CARD */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                            <Sparkles className="text-amber-400" size={24} />
                            <span>Getting Started with Careerlyst</span>
                        </h2>

                        <div className="space-y-6 relative z-10">
                            <p className="text-slate-300 leading-relaxed text-base">
                                Careerlyst is designed to be your autonomous job search companion. Here is the optimal workflow:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Sync", desc: "Connect Gmail to auto-discover job updates.", icon: "🔄" },
                                    { title: "Review", desc: "Check 'Hirings' for new leads found.", icon: "👀" },
                                    { title: "Track", desc: "Use 'Sent Applications' for active pipelines.", icon: "📈" },
                                    { title: "Optimize", desc: "Use AI Coach to refine your resume.", icon: "🧠" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ ACCORDION */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 px-2">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="group bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
                                >
                                    <button
                                        onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                                        className="w-full flex items-center justify-between p-5 text-left"
                                    >
                                        <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors pr-4">
                                            {faq.question}
                                        </span>
                                        <div className={`p-2 rounded-full bg-white/5 text-slate-400 transition-all duration-300 ${activeAccordion === index ? 'rotate-180 bg-indigo-500/20 text-indigo-400' : ''}`}>
                                            <ChevronDown size={16} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {activeAccordion === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5">
                                                    <div className="pt-2">{faq.answer}</div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: CONTACT & FORM (5 cols) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* EMERGENCY CARD */}
                    <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <AlertTriangle className="text-indigo-500/30 w-24 h-24 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                Emergency Support
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Something broken?</h3>
                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                If you're facing a critical issue or data loss, contact our dedicated dev team immediately.
                            </p>

                            <a
                                href="mailto:obtracker.dev.test01@gmail.com"
                                className="group/btn flex items-center justify-between bg-white text-black p-1 pl-4 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                            >
                                <span className="truncate mr-4">obtracker.dev.test01@gmail.com</span>
                                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                    <Mail size={14} />
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* FEEDBACK WIDGET */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Dynamic Accent Line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-500 ${isBug ? 'from-rose-500 to-orange-500' : 'from-indigo-500 to-cyan-500'}`} />

                        <div className="p-6 md:p-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                Send Feedback
                            </h3>

                            {/* SEGMENTED CONTROL */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl mb-6">
                                <button
                                    onClick={() => setFeedbackType('feedback')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${!isBug ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <MessageSquare size={14} />
                                    Suggestion
                                </button>
                                <button
                                    onClick={() => setFeedbackType('bug')}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${isBug ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Bug size={14} />
                                    Report Bug
                                </button>
                            </div>

                            {sent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isBug ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                                        <Send className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                    <p className="text-sm text-slate-400 max-w-[200px]">
                                        Thanks for reaching out. We'll review your {isBug ? 'report' : 'feedback'} shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSendFeedback} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Subject</label>
                                        <input
                                            required
                                            type="text"
                                            value={feedback.subject}
                                            onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                                            placeholder={isBug ? "What's broken?" : "What's on your mind?"}
                                            className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600 ${isBug ? 'border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50' : 'border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Details</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={feedback.message}
                                            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                                            placeholder={isBug ? "Please describe the steps to reproduce the issue..." : "Tell us how we can improve..."}
                                            className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600 resize-none ${isBug ? 'border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50' : 'border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'}`}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${isBug ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
                                    >
                                        <Send size={16} />
                                        {isBug ? 'Submit Bug Report' : 'Send Feedback'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
