import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import { api } from "../api/client";
import { saveToken } from "../utils/auth";
import { signInWithGoogle } from "../utils/firebase";

const getPasswordStrength = (pass) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[@$!%*?&]/.test(pass)) score++;
  return score;
};

const StrengthMeter = ({ password }) => {
  const score = getPasswordStrength(password);
  const colors = ["bg-slate-700", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-400"];
  const labels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-xs text-right font-medium ${score < 3 ? "text-slate-400" : "text-green-400"}`}>
        {labels[score] || "Enter password"}
      </p>
    </div>
  );
};

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";
  const [step, setStep] = useState(isVerify ? 2 : 1); // 1 = Signup, 2 = OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(searchParams.get("email") || ""); // Email to verify

  const [captchaVal, setCaptchaVal] = useState(null);
  const recaptchaRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");

    if (getPasswordStrength(formData.password) < 5) {
      setErr("Password relies on uppercase, lowercase, number, and special char.");
      return;
    }

    if (!captchaVal) {
      setErr("Please verify you are not a robot.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/auth/register", { ...formData, captchaToken: captchaVal });
      setVerifyEmail(formData.email);
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaVal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && !verifyEmail) {
      console.warn("Missing verification email. Redirecting to Step 1.");
      setStep(1);
    }
  }, [step, verifyEmail]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    console.log("Verifying OTP...", { email: verifyEmail, otp });

    // Validate Input Locally
    if (!otp || otp.length < 6) {
      setErr("Please enter the 6-digit code.");
      return;
    }

    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-email", { email: verifyEmail, otp });
      console.log("Verification Success:", res.data);
      saveToken(res.data.token, false);
      navigate("/onboarding");
    } catch (error) {
      console.error("Verification Failed:", error);
      setErr(error.response?.data?.message || "Invalid OTP");
    } finally {
      console.log("Stopping Loading");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post("/api/auth/resend-otp", { email: verifyEmail });
      alert("New OTP sent!");
    } catch (error) {
      setErr("Failed to resend OTP");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const googleUser = await signInWithGoogle();

      const res = await api.post("/api/auth/google-login", {
        email: googleUser.email,
        fullName: googleUser.displayName,
        googleUid: googleUser.uid
      });

      saveToken(res.data.token, res.data.isOnboarded);

      if (res.data.isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }

    } catch (error) {
      console.error(error);
      setErr("Google Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: min-h-[100dvh] for mobile browsers
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col lg:flex-row relative font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* LEFT SIDE: BRANDING (Hidden on Mobile) */}
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
            Start your <br />
            <span className="text-indigo-400">new journey</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Create an account today to unlock powerful tracking tools.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
          <p>© 2025 Careerlyst Inc.</p>
          <div className="h-1 w-1 rounded-full bg-slate-700"></div>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </motion.div>

      {/* RIGHT SIDE: FORM */}
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
          <div className="bg-black/40 lg:bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70" />

            {step === 1 ? (
              // --- STEP 1: SIGNUP FORM ---
              <>
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
                  <p className="text-slate-400 text-sm sm:text-base">Join us and start tracking.</p>
                </div>

                {err && (
                  <div className="mb-6 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs sm:text-sm flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shrink-0"></div>
                    {err}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 outline-none text-base sm:text-sm text-white focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 outline-none text-base sm:text-sm text-white focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                        placeholder="Create a strong password"
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
                    <StrengthMeter password={formData.password} />
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                        placeholder="Repeat your password"
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

                  {/* CAPTCHA */}
                  <div className="flex justify-center overflow-hidden rounded-md border border-white/5 my-2 w-full">
                    <div className="transform scale-[0.85] sm:scale-100 origin-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Le-llgsAAAAAHbMWFDo6hAmiZ3wT2Xvur-7-0pA"}
                        onChange={setCaptchaVal}
                        theme="dark"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold rounded-xl py-3.5 sm:py-4 hover:bg-indigo-50 transition-all shadow-lg shadow-white/10 disabled:opacity-70 text-sm sm:text-base"
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </motion.button>
                </form>

                <div className="relative my-6 sm:my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-xs uppercase font-medium"><span className="bg-[#0f0f11] px-3 text-slate-500">Or continue with</span></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl py-3.5 transition-all hover:bg-white/10 text-sm sm:text-base">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Sign up with Google
                </button>

                <div className="mt-6 sm:mt-8 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/login")} className="text-white hover:text-indigo-400 font-medium transition-colors">Log In</button>
                </div>
              </>
            ) : (
              // --- STEP 2: OTP VERIFICATION ---
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 text-center">
                  <div className="mx-auto h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Check your email</h2>
                  <p className="text-slate-400 mt-2 text-sm">We sent a verification code to <br /><span className="text-white font-medium">{verifyEmail}</span></p>
                </div>

                {err && (
                  <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">{err}</div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 text-center text-3xl tracking-[1rem] font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-bold rounded-xl py-4 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">Didn't receive the email? <button onClick={handleResendOtp} className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">Click to resend</button></p>
                  <button onClick={() => setStep(1)} className="mt-4 text-xs text-slate-600 hover:text-white transition-colors">Change email address</button>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
}