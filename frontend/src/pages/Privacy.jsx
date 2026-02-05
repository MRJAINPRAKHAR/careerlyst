import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden py-20 px-6">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">Privacy Policy</h1>
                    <p className="text-slate-400 mb-8">Last updated: February 05, 2026</p>

                    <section className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="leading-relaxed">
                                Welcome to Careerlyst (https://careerlyst.in). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our job tracking platform.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">2. Data Collection</h2>
                            <p className="leading-relaxed">
                                We collect information you provide directly to us, such as when you create an account, sync your email, or manually add job applications. This may include your name, email address, job application details, and professional information.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">3. Use of Information</h2>
                            <p className="leading-relaxed">
                                We use the information we collect to provide and improve our services, personalize your experience, and provide you with insights into your career journey. We do not sell your personal information to third parties.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
                            <p className="leading-relaxed">
                                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">5. Your Rights</h2>
                            <p className="leading-relaxed">
                                You have the right to access, update, or delete your personal information at any time through your account settings.
                            </p>
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
