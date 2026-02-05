import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden py-20 px-6">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">Terms & Conditions</h1>
                    <p className="text-slate-400 mb-8">Last updated: February 05, 2026</p>

                    <section className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using Careerlyst, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use our services.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">2. User Accounts</h2>
                            <p className="leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">3. Service Availability</h2>
                            <p className="leading-relaxed">
                                We strive to keep Careerlyst available at all times, but we cannot guarantee uninterrupted access. We reserve the right to modify or discontinue the service at any time without notice.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">4. Prohibited Use</h2>
                            <p className="leading-relaxed">
                                You agree not to use Careerlyst for any unlawful purpose or in any way that could damage, disable, or impair the service.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                Careerlyst shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
                            </p>
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
