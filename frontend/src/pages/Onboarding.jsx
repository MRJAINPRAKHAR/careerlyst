import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Spline from '@splinetool/react-spline';
import { api } from "../api/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.5 }
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setOpacity(1);
    divRef.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.1), transparent 40%)`
        }}
      />
      {children}
    </div>
  );
};

const PremiumLoader = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + (Math.random() * 5) : 90));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-2xl">
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-800" />
            <motion.circle
              cx="80" cy="80" r="70"
              stroke="currentColor" strokeWidth="4"
              fill="transparent"
              className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        <p className="mt-8 text-indigo-300 font-mono tracking-[0.2em] text-sm animate-pulse">AI ANALYZING RESUME...</p>
      </div>
    </div>
  );
};

const VerticalStepper = ({ current, steps, onStepClick }) => {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [current]);

  return (
    <div className="space-y-0 relative pl-4 border-l border-white/5">
      <motion.div
        className="absolute -left-[1px] top-0 w-[2px] bg-indigo-500"
        initial={false}
        animate={{ height: "40px", top: `${current * 72 + 20}px` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {steps.map((step, i) => {
        const isActive = i === current;
        const isCompleted = i < current;

        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => isCompleted && onStepClick(i)}
            className={`relative z-10 flex items-center gap-4 py-5 cursor-pointer group transition-all duration-300 ${isActive ? "opacity-100 translate-x-2" : "opacity-30 hover:opacity-100 hover:translate-x-1"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isActive ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : isCompleted ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-white/20 text-slate-400"}`}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <div>
              <h4 className={`text-sm font-bold tracking-wide ${isActive ? "text-white" : "text-slate-400"}`}>{step.title}</h4>
            </div>
          </div>
        )
      })}
    </div>
  );
};

const Input = ({ label, className, icon, required, error, ...props }) => (
  <div className={`space-y-2 ${className}`}>
    <label className={`text-xs font-bold uppercase tracking-[0.2em] ml-1 transition-colors duration-300 ${error ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-slate-400 group-focus-within:text-cyan-400"}`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300">{icon}</div>}
      <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-indigo-500/50 opacity-0 group-focus-within:opacity-100 blur transition duration-500 ${error ? "from-rose-500/50 via-red-500/50 to-orange-500/50 opacity-100" : ""}`} />
      <input
        className={`relative w-full bg-black/60 backdrop-blur-xl border rounded-xl ${icon ? 'pl-11' : 'px-4'} py-4 text-white placeholder-slate-600 focus:outline-none focus:bg-black/80 transition-all duration-300 ${error ? "border-rose-500/50" : "border-white/10 group-hover:border-white/20 focus:border-transparent"}`}
        {...props}
      />
    </div>
  </div>
);

const Select = ({ label, options, className, required, error, ...props }) => (
  <div className={`space-y-2 ${className}`}>
    <label className={`text-xs font-bold uppercase tracking-[0.2em] ml-1 transition-colors duration-300 ${error ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-slate-400 group-focus-within:text-cyan-400"}`}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-indigo-500/50 opacity-0 group-focus-within:opacity-100 blur transition duration-500 ${error ? "from-rose-500/50 via-red-500/50 to-orange-500/50 opacity-100" : ""}`} />
      <select
        className={`relative w-full bg-black/60 backdrop-blur-xl border rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:bg-black/80 transition-all cursor-pointer ${error ? "border-rose-500/50" : "border-white/10 group-hover:border-white/20 focus:border-transparent"}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-slate-300">{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-cyan-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  // States
  const [formData, setFormData] = useState({
    fullName: "", mobileNo: "", countryCode: "+91", city: "", state: "", country: "India",
    jobTitle: "", experienceRange: "0-1", bio: "", linkedin: "", github: "",
    education: [{ school: "", degree: "", start: "", end: "" }],
    workHistory: [{ company: "", role: "", start: "", end: "", description: "" }],
    skills: [],
    certifications: [{ name: "", issuer: "", date: "", url: "" }],
    achievements: []
  });

  // Check scroll dimensions on step or data change (dynamic content)
  useEffect(() => {
    // Scroll to top on step change
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const STEPS = [
    { title: "Start", description: "Upload Resume" },
    { title: "Personal", description: "Basic Info" },
    { title: "Education", description: "Academic History" },
    { title: "Skills", description: "Your Expertise" },
    { title: "Experience", description: "Work History" },
    { title: "Certifications", description: "Credentials" },
    { title: "Achievements", description: "Awards & Honors" },
    { title: "Review", description: "Final Profile" }
  ];

  // Helper Functions
  const updateList = (field, i, key, val) => {
    const list = [...formData[field]]; list[i][key] = val; setFormData({ ...formData, [field]: list });
  };
  const addList = (field, tmpl) => setFormData({ ...formData, [field]: [...formData[field], tmpl] });
  const remList = (field, i) => { const l = [...formData[field]]; l.splice(i, 1); setFormData({ ...formData, [field]: l }); };

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const data = new FormData();
    data.append("resume", file);
    try {
      const res = await api.post("/api/auth/parse", data);
      const parsed = res.data;
      setFormData(prev => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        mobileNo: parsed.mobileNo || prev.mobileNo,
        city: parsed.city || prev.city,
        state: parsed.state || prev.state,
        country: parsed.country || (prev.countryCode === "+91" ? "India" : prev.country),
        jobTitle: parsed.jobTitle || prev.jobTitle,
        education: parsed.education?.length ? parsed.education : prev.education,
        workHistory: parsed.workHistory?.length ? parsed.workHistory : prev.workHistory,
        skills: parsed.skills?.length ? parsed.skills : prev.skills,
        linkedin: parsed.linkedin || prev.linkedin,
        github: parsed.github || prev.github,
        bio: parsed.summary || prev.bio
      }));
      setStep(1);
    } catch (err) {
      console.error("Resume Parse Error:", err);
      // Extract specific message from backend if available (e.g. "Quota exceeded")
      const specificMsg = err.response?.data?.error || err.message;
      setError(`Auto-Parsing Failed: ${specificMsg}. Please enter details manually.`);
      // Do NOT advance step so user can see error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, achievements: formData.achievements || [] };
      await api.post("/api/auth/complete-onboarding", payload);
      localStorage.setItem("isOnboarded", "true");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please verify your internet connection.");
      setSaving(false);
    }
  };

  const validateStep = () => {
    setError(null);
    setFieldErrors({});
    let errors = {};
    let isValid = true;

    if (step === 1) { // Personal Details
      if (!formData.fullName?.trim()) errors.fullName = true;
      if (!formData.mobileNo?.trim()) errors.mobileNo = true;
      if (!formData.city?.trim()) errors.city = true;
      if (!formData.state?.trim()) errors.state = true;

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError("Please fill in all required fields marked with *");
        isValid = false;
      } else if (formData.mobileNo.length !== 10) {
        setFieldErrors({ mobileNo: true });
        setError("Mobile Number must be exactly 10 digits.");
        isValid = false;
      }
    }

    if (step === 2) { // Education
      // Check if at least one education is valid, OR specific fields in the current list
      const hasValidEdu = formData.education.some(edu => edu.school?.trim() && edu.degree?.trim());
      if (!hasValidEdu) {
        // Mark all empty fields as error to prompt user
        const eduErrors = {}; // You might need a more complex structure for arrays, but for now specific indexing or global warning
        // For array fields, simplistic "fieldErrors" map might not work directly without index. 
        // Let's stick to global error for arrays or implement indexed errors if needed.
        // For now, highlighting the first entry if empty is a reasonable fallback or just global error.
        setError("Required: At least one education entry (School & Degree).");
        isValid = false;
      }
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      setStep(p => p + 1);
    }
  };
  const prevStep = () => setStep(p => p - 1);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
          <div className="space-y-6">
            <motion.h1 variants={itemVariants} initial="hidden" animate="visible" className="text-5xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              Welcome.
            </motion.h1>
            <motion.p variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
              Let's build your professional profile. Upload your resume to let our AI do the heavy lifting.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            <motion.label variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="relative group cursor-pointer overflow-hidden rounded-[2rem] bg-indigo-900/10 border border-indigo-500/20 hover:border-cyan-400/50 transition-all p-10 flex flex-col items-center justify-center gap-6 h-72 hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-500">
                <svg className="w-10 h-10 text-indigo-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div className="text-center relative z-10">
                <h3 className="font-bold text-2xl text-white group-hover:text-cyan-300 transition-colors tracking-tight">Upload Resume</h3>
                <p className="text-sm text-slate-400 mt-2 font-mono">PDF / DOCX • AI AUTO-FILL</p>
              </div>
            </motion.label>

            <motion.button variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} onClick={() => setStep(1)} className="group relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/30 transition-all p-10 flex flex-col items-center justify-center gap-6 h-72 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <div className="relative w-24 h-24 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <div className="text-center relative z-10">
                <h3 className="font-bold text-2xl text-white tracking-tight">Enter Manually</h3>
                <p className="text-sm text-slate-500 mt-2 font-mono">START FROM SCRATCH</p>
              </div>
            </motion.button>
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-8 max-w-2xl mx-auto py-10">
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="border-b border-white/10 pb-6 mb-6">
            <h2 className="text-3xl font-bold">Personal Details</h2>
            <p className="text-slate-400 mt-2">Tell us a bit about yourself.</p>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Input label="Full Name" value={formData.fullName} onChange={e => { setFieldErrors({ ...fieldErrors, fullName: false }); setFormData({ ...formData, fullName: e.target.value }); }} placeholder="e.g. John Doe" required error={fieldErrors.fullName} />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <Select label="Code" options={[{ label: "🇮🇳 +91", value: "+91" }, { label: "🇺🇸 +1", value: "+1" }, { label: "🇬🇧 +44", value: "+44" }]} value={formData.countryCode} onChange={e => setFormData({ ...formData, countryCode: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Input
                label="Phone Number"
                value={formData.mobileNo}
                onChange={e => {
                  setFieldErrors({ ...fieldErrors, mobileNo: false });
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, mobileNo: val });
                }}
                placeholder="9876543210"
                maxLength={10}
                type="tel"
                required
                error={fieldErrors.mobileNo}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Input label="City" value={formData.city} onChange={e => { setFieldErrors({ ...fieldErrors, city: false }); setFormData({ ...formData, city: e.target.value }); }} required error={fieldErrors.city} />
            <Input label="State" value={formData.state} onChange={e => { setFieldErrors({ ...fieldErrors, state: false }); setFormData({ ...formData, state: e.target.value }); }} required error={fieldErrors.state} />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Select label="Country" options={[{ label: "India", value: "India" }, { label: "United States", value: "United States" }, { label: "Other", value: "Other" }]} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
          </motion.div>
        </div>
      );

      case 2: return (
        <div className="space-y-8 max-w-3xl mx-auto py-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-bold">Education</h2>
              <p className="text-slate-400 mt-2">Your academic background.</p>
            </div>
            <button onClick={() => addList("education", { school: "", degree: "", start: "", end: "" })} className="text-indigo-400 text-sm font-bold bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-all">+ ADD</button>
          </div>

          {formData.education.map((edu, i) => (
            <motion.div key={i} variants={itemVariants} initial="hidden" animate="visible" className="bg-[#151515] p-6 rounded-2xl border border-white/5 space-y-6 relative group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Institution" value={edu.school} onChange={e => updateList("education", i, "school", e.target.value)} placeholder="University Name" required />
                <Input label="Degree" value={edu.degree} onChange={e => updateList("education", i, "degree", e.target.value)} placeholder="B.Tech, MBA..." required />
                <Input label="Start Year" value={edu.start} onChange={e => updateList("education", i, "start", e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" maxLength={4} />
                <Input label="End Year" value={edu.end} onChange={e => updateList("education", i, "end", e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" maxLength={4} />
              </div>
              {i > 0 && <button onClick={() => remList("education", i)} className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors">×</button>}
            </motion.div>
          ))}
        </div>
      );

      // (Reusing patterns for other sections for brevity, but with premium styling)
      case 3: return (
        <div className="space-y-8 max-w-2xl mx-auto py-10">
          <h2 className="text-3xl font-bold">Skills & Expertise</h2>
          <Input label="Add Skills (Press Enter)" placeholder="e.g. React, Python..." onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              if (!formData.skills.includes(e.target.value)) setFormData({ ...formData, skills: [...formData.skills, e.target.value] });
              e.target.value = "";
            }
          }} />
          <div className="flex flex-wrap gap-3">
            {formData.skills.map((s, i) => (
              <motion.span key={i} layout initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-4 py-2 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-medium flex items-center gap-2 group">
                {s} <button onClick={() => { const ns = formData.skills.filter((_, idx) => idx !== i); setFormData({ ...formData, skills: ns }); }} className="group-hover:text-white transition-colors">×</button>
              </motion.span>
            ))}
          </div>
        </div>
      );

      case 4: return (
        <div className="space-y-8 max-w-3xl mx-auto py-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div><h2 className="text-3xl font-bold">Experience</h2><p className="text-slate-400 mt-2">Where have you worked?</p></div>
            <button onClick={() => addList("workHistory", { company: "", role: "", start: "", end: "", description: "" })} className="text-indigo-400 text-sm font-bold bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20">+ ADD</button>
          </div>
          {formData.workHistory.map((work, i) => (
            <motion.div key={i} variants={itemVariants} initial="hidden" animate="visible" className="bg-[#151515] p-6 rounded-2xl border border-white/5 space-y-6 relative">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Company" value={work.company} onChange={e => updateList("workHistory", i, "company", e.target.value)} />
                <Input label="Job Title" value={work.role} onChange={e => updateList("workHistory", i, "role", e.target.value)} />
                <Input label="Start Year" value={work.start} onChange={e => updateList("workHistory", i, "start", e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" maxLength={4} />
                <Input label="End Year" value={work.end} onChange={e => updateList("workHistory", i, "end", e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" maxLength={4} />
              </div>
              <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                <textarea className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500/50 h-24 resize-none" value={work.description} onChange={e => updateList("workHistory", i, "description", e.target.value)} /></div>
            </motion.div>
          ))}
        </div>
      );

      case 5: return (
        <div className="space-y-8 max-w-3xl mx-auto py-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div><h2 className="text-3xl font-bold">Certifications</h2><p className="text-slate-400 mt-2">Licenses & Certificates.</p></div>
            <button onClick={() => addList("certifications", { name: "", issuer: "", date: "", url: "" })} className="text-indigo-400 text-sm font-bold bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-all">+ ADD</button>
          </div>
          {formData.certifications.map((cert, i) => (
            <motion.div key={i} variants={itemVariants} initial="hidden" animate="visible" className="bg-[#151515] p-6 rounded-2xl border border-white/5 space-y-6 relative group">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Name" value={cert.name} onChange={e => updateList("certifications", i, "name", e.target.value)} placeholder="AWS Certified..." />
                <Input label="Issuer" value={cert.issuer} onChange={e => updateList("certifications", i, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                <Input label="Date" value={cert.date} onChange={e => updateList("certifications", i, "date", e.target.value)} placeholder="Dec 2024" />
                <Input label="URL (Optional)" value={cert.url} onChange={e => updateList("certifications", i, "url", e.target.value)} />
              </div>
              {i > 0 && <button onClick={() => remList("certifications", i)} className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors">×</button>}
            </motion.div>
          ))}
        </div>
      );

      case 6: return (
        <div className="space-y-8 max-w-2xl mx-auto py-10">
          <h2 className="text-3xl font-bold">Key Achievements</h2>
          <Input label="Add Achievement (Press Enter)" placeholder="e.g. Led team of 5 developers..." onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              setFormData({ ...formData, achievements: [...formData.achievements, e.target.value] });
              e.target.value = "";
            }
          }} />
          <div className="space-y-3">
            {formData.achievements.map((ach, i) => (
              <motion.div key={i} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-[#151515] border border-white/5 rounded-xl flex items-start gap-4">
                <span className="text-indigo-500 mt-1">🏆</span>
                <p className="flex-1 text-slate-300">{ach}</p>
                <button onClick={() => { const na = formData.achievements.filter((_, idx) => idx !== i); setFormData({ ...formData, achievements: na }); }} className="text-slate-600 hover:text-rose-500 transition-colors">×</button>
              </motion.div>
            ))}
          </div>
        </div>
      );

      case 7: return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto py-6">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Identity Verification</h2>
            <p className="text-slate-400 mt-2 tracking-wide font-light">Review your digital profile before initialization.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* LEFT: VISUAL ID CARD */}
            <motion.div variants={itemVariants} className="md:col-span-5 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative h-full bg-[#0F0F0F]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden">
                {/* ID Badge Header */}
                <div className="w-full flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">SYSTEM ONLINE</span>
                  </div>
                  <div className="text-[10px] font-mono text-indigo-400">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>

                {/* Avatar */}
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 relative">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                      <Spline scene="https://prod.spline.design/4LuU7piWuQJ1UmLD/scene.splinecode" />
                    </div>
                    <span className="text-5xl font-bold text-white relative z-10">{formData.fullName?.[0] || "?"}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-500 w-8 h-8 rounded-full border-4 border-[#0F0F0F] flex items-center justify-center" title="Verified">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>

                {/* Details */}
                <h3 className="text-2xl font-bold text-white mb-1">{formData.fullName || "Unknown User"}</h3>
                <p className="text-indigo-400 font-medium mb-4">{formData.jobTitle || "No Title Set"}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-1">
                    📍 {formData.city}, {formData.country}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-1">
                    💼 {formData.experienceRange} Exp
                  </span>
                </div>

                {/* Social Links (Inputs) */}
                <div className="w-full space-y-3 mt-auto">
                  <div className="relative group/link">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </div>
                    <input
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn Profile URL"
                      className="block w-full pl-10 pr-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="relative group/link">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </div>
                    <input
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      placeholder="GitHub Profile URL"
                      className="block w-full pl-10 pr-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: DATA SUMMARY */}
            <motion.div variants={itemVariants} className="md:col-span-7 space-y-6">
              {/* Bio Section */}
              <div className="bg-[#151515] p-6 rounded-3xl border border-white/5 relative group">
                <div className="absolute top-0 right-0 px-4 py-2 bg-white/5 rounded-bl-2xl text-[10px] uppercase font-bold text-slate-500 tracking-wider">Professional Bio</div>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your professional journey..."
                  className="w-full bg-transparent border-none text-slate-300 focus:text-white focus:outline-none resize-none h-32 leading-relaxed text-sm p-0 mt-4 placeholder:text-slate-600"
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-600">{formData.bio.length} chars</div>
              </div>

              {/* Skills Matrix */}
              <div className="bg-[#151515] p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skill Matrix</h4>
                  <button onClick={() => setStep(3)} className="text-[10px] text-indigo-400 hover:text-indigo-300">EDIT</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? formData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg text-xs font-mono text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                      {skill}
                    </span>
                  )) : <span className="text-slate-600 text-sm italic">No skills added yet.</span>}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                  <span className="text-3xl font-bold text-white">{formData.workHistory.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Positions</span>
                </div>
                <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                  <span className="text-3xl font-bold text-white">{formData.education.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Qualifications</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-full"><h2 className="text-3xl">Coming Soon (Step {step})</h2> <button onClick={nextStep} className="mt-4 px-6 py-2 bg-indigo-600 rounded">Skip</button></div>
      )
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative p-4 md:p-8">
      {/* --- 3D SPLINE BACKGROUND --- */}
      {/* --- 3D SPLINE BACKGROUND --- */}
      {/* 3D SPLINE BACKGROUND REMOVED FOR PERFORMANCE */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[#000000]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
      </div>

      {/* LOADER */}
      {loading && <PremiumLoader />}

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-[#050505] border-r border-white/10 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <span className="font-bold text-xl tracking-tight text-white">Careerlyst.ai</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Your Progress</h3>
                <VerticalStepper current={step} steps={STEPS} onStepClick={(i) => { setStep(i); setIsMobileMenuOpen(false); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN FLOATING CARD --- */}
      <SpotlightCard className="relative z-10 w-full max-w-7xl h-[85vh] bg-[#0A0A0A] border border-white/5 rounded-3xl shadow-2xl flex overflow-hidden ring-1 ring-white/5">

        {/* --- LEFT SIDEBAR (FIXED WIDTH) --- */}
        <div className="w-1/3 min-w-[320px] h-full border-r border-white/5 bg-[#050505] flex flex-col justify-between relative hidden lg:flex overflow-hidden">
          {/* Sidebar Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Header - Fixed */}
          <div className="relative z-10 p-10 pb-0 shrink-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
                <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Careerlyst.ai</span>
            </div>
          </div>

          {/* Stepper - Scrollable */}
          <div className="relative z-10 flex-1 overflow-y-auto px-10 py-6 custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 sticky top-0 bg-[#050505] py-4 z-50 shadow-[#050505]">Setup Progress</h3>
            <VerticalStepper current={step} steps={STEPS} onStepClick={setStep} />
          </div>

          {/* Footer - Fixed */}
          <div className="relative z-10 p-10 pt-0 shrink-0">
            <div className="text-[10px] text-slate-600 font-mono">
              © 2025 CAREERLYST INC.
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT (SCROLLABLE) --- */}
        <div className="flex-1 h-full relative flex flex-col bg-[#0A0A0A]">

          {/* PREMIUM TOP HEADER */}
          <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30">
            {/* Mobile / Left Content of Header */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>

              <span className="lg:hidden font-bold">Step {step + 1}/{STEPS.length}</span>
              <div className="hidden lg:block">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step {step + 1}: <span className="text-white">{STEPS[step].title}</span></h3>
              </div>
            </div>

            {/* Right Side Options */}
            <div className="flex items-center gap-6">
              <a
                href="mailto:obtracker.dev.test01@gmail.com"
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="hidden sm:block">Need Help?</span>
              </a>

              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group"
              >
                <span className="hidden sm:block">Logout</span>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto w-full relative scroll-smooth"
            ref={scrollRef}
          >
            <div className="max-w-3xl mx-auto px-8 py-12 pb-32 min-h-full flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {renderContent()}

                  {/* NAVIGATION BUTTONS (Embedded at bottom of content) */}
                  {step > 0 && (
                    <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                      <button
                        onClick={prevStep}
                        className="px-6 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        Back
                      </button>

                      {step < STEPS.length - 1 ? (
                        <button
                          onClick={nextStep}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
                        >
                          Continue
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={saving}
                          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 group"
                        >
                          {saving ? "Saving..." : "Finish Setup"}
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </SpotlightCard>
    </div >
  );
}