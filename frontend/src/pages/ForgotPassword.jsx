import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // 2. Strong Password Validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters, include an uppercase letter, a number, and a special character.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/reset-password", { email, otp, newPassword });
      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col lg:flex-row relative font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* --- BACKGROUND (Fixed z-index) --- */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* --- LEFT SIDE: BRANDING (Hidden on Mobile) --- */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-20 relative z-10 h-screen sticky top-0"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
            <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Careerlyst.ai</span>
        </div>

        <div className="max-w-xl">
          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-tight mb-6">
            Account <br />
            <span className="text-indigo-400">Recovery</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Don't worry, it happens. Verify your identity and get back to tracking your dream jobs in seconds.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
          <p>© 2025 Careerlyst Inc.</p>
        </div>
      </motion.div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 lg:p-12 relative z-10 min-h-[100dvh] lg:min-h-auto w-full">

        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
            <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-bold text-white">Careerlyst.ai</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[400px]"
        >
          {/* Card Container */}
          <div className="bg-black/40 lg:bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

            {/* Top Gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 transition-all duration-500 ${step === 2 ? "bg-emerald-500" : ""}`} />

            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                {step === 1 ? "Forgot Password?" : "Reset Password"}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                {step === 1 ? "Enter your email to receive a code." : "Enter the code sent to your email."}
              </p>
            </div>

            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs sm:text-sm flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shrink-0"></div>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                {success}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleSendOtp} className="space-y-5">
                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 outline-none text-base sm:text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/[0.05] transition-all duration-300"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold rounded-xl py-3.5 sm:py-4 hover:bg-indigo-50 transition-all shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleResetPassword} className="space-y-5">
                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">One-Time Password (OTP)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 outline-none text-base sm:text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/[0.05] transition-all duration-300 font-mono tracking-widest text-center"
                      placeholder="000000"
                      required
                    />
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 pr-12 outline-none text-base sm:text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/[0.05] transition-all duration-300"
                        placeholder="Min 8 chars, 1 Upper, 1 Special"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 pr-12 outline-none text-base sm:text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/[0.05] transition-all duration-300"
                        placeholder="Re-enter password"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-bold rounded-xl py-3.5 sm:py-4 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-sm text-slate-400">
              Remembered it?{" "}
              <button onClick={() => navigate("/login")} className="text-white hover:text-indigo-400 font-medium transition-colors">Sign In</button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}