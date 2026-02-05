import React, { useState } from "react";
import { api } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";

export default function AICoach({ profile, onUsageUpdate }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState("resume"); // "resume" | "job"
  const [jobDescription, setJobDescription] = useState("");

  // Initialize result from DB (priority) or localStorage (fallback)
  const [result, setResult] = useState(() => {
    // 1. Try DB result passed via profile
    if (profile?.usage?.lastAnalysis) {
      // It might be an object already if mysql2 parsed JSON, or string
      return typeof profile.usage.lastAnalysis === 'string'
        ? JSON.parse(profile.usage.lastAnalysis)
        : profile.usage.lastAnalysis;
    }
    // 2. Fallback to localStorage
    const saved = localStorage.getItem("ai_resume_result");
    return saved ? JSON.parse(saved) : null;
  });

  const [error, setError] = useState("");

  // Persist result to localStorage whenever it changes
  React.useEffect(() => {
    if (result) {
      localStorage.setItem("ai_resume_result", JSON.stringify(result));
    }
  }, [result]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const clearAnalysis = () => {
    setResult(null);
    setFile(null);
    localStorage.removeItem("ai_resume_result");
  };

  const analyzeResume = async (useStored = false) => {
    if (!useStored && !file) return;
    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    if (useStored) {
      formData.append("useStored", "true"); // Signal to just bypass frontend validation
    } else {
      formData.append("resume", file);
    }

    if (mode === "job" && jobDescription) {
      formData.append("jobDescription", jobDescription);
    }

    try {
      const res = await api.post("/api/ai/resume-score", formData);
      // Backend returns { analysis: {...}, usage: {...} }
      const newAnalysis = res.data.analysis;
      setResult(newAnalysis);

      // Update parent state immediately with BOTH usage and the analysis result
      if (onUsageUpdate && res.data.usage) {
        onUsageUpdate({
          ...profile.usage,
          ...res.data.usage,
          lastAnalysis: newAnalysis
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "AI Analysis unavailable. Check your connection or daily limit.";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  // Calculate Effective Daily Scans (Client-side Reset Visual)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const lastScanDate = profile.usage?.lastScanDate
    ? new Date(profile.usage.lastScanDate).toLocaleDateString('en-CA')
    : null;

  const effectiveDailyScans = lastScanDate === todayStr ? (profile.usage?.dailyScans || 0) : 0;

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
            AI RESUME ANALYZER
          </h2>
          <div className="flex items-center gap-4 mt-2 ml-4">
            {/* TOGGLE PILLS */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setMode("resume")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === "resume" ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                GENERAL REVIEW
              </button>
              <button
                onClick={() => setMode("job")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === "job" ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                JOB MATCH FIT
              </button>
            </div>

            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${effectiveDailyScans >= 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {effectiveDailyScans} / 3 SCANS USED
              </span>
            </div>

            {result && effectiveDailyScans < 3 && (
              <button
                onClick={clearAnalysis}
                className="ml-auto text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 border border-white/10 px-2 py-1 rounded hover:bg-white/5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                NEW SCAN
              </button>
            )}
            {/* ERROR ALERT */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
              >
                <div className="p-1 bg-red-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Analysis Failed</h4>
                  <p className="text-[11px] text-red-300/80 leading-relaxed font-mono">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

        {/* LEFT COLUMN: UPLOAD & SCORE */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* 1. SCORE GAUGE */}
          <div className="flex-1 bg-[#050505] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Animated Rings */}
            <div className="relative w-48 h-48 flex items-center justify-center pointer-events-none">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#1e293b" strokeWidth="12" fill="none" />
                <motion.circle
                  cx="96" cy="96" r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="553"
                  strokeDashoffset={result ? 553 - (553 * result.score) / 100 : 553}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: result ? 553 - (553 * result.score) / 100 : 553 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white tracking-tighter">
                  {result ? result.score : "--"}
                </span>
                <span className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-widest">{mode === 'job' ? 'Job Match' : 'AI Score'}</span>
              </div>
            </div>

            {/* JOB DESCRIPTION INPUT */}
            {mode === 'job' && !result && !analyzing && (
              <div className="w-full relative z-20">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the Job Description here..."
                  className="w-full h-32 bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500/50 resize-none mb-2"
                />
              </div>
            )}

            {/* Upload Area */}
            <div className="mt-8 w-full space-y-4 relative z-10">
              {!result && !analyzing && (
                <>
                  {/* OPTION A: Saved Resume */}
                  {profile.resumeUrl && (
                    <button
                      onClick={() => analyzeResume(true)}
                      disabled={effectiveDailyScans >= 3}
                      className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group ${effectiveDailyScans >= 3
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                    >
                      <svg className={`w-5 h-5 ${effectiveDailyScans < 3 ? 'group-hover:animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {effectiveDailyScans >= 3 ? 'Daily Limit Reached' : (mode === 'job' ? 'Check Match with Saved Resume' : 'Analyze Saved Resume')}
                    </button>
                  )}

                  {/* OPTION B: Upload New */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={effectiveDailyScans >= 3}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className={`border-2 border-dashed ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'} rounded-xl p-4 text-center transition-all ${effectiveDailyScans >= 3 ? 'opacity-50' : ''}`}>
                      <p className="text-xs text-slate-400 font-bold mb-1">
                        {file ? file.name : (profile.resumeUrl ? "Or upload a different PDF" : "Drop Resume (PDF)")}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {file && !result && !analyzing && (
                <button
                  onClick={() => analyzeResume(false)}
                  disabled={effectiveDailyScans >= 3}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${effectiveDailyScans >= 3
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                >
                  Analyze Uploaded File
                </button>
              )}

              {analyzing && (
                <div className="text-center mt-4 space-y-2">
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-xs text-indigo-400 animate-pulse font-mono">SCANNING DOCUMENT...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REPORT */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {result ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. Summary */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h3>
                  <p className="text-slate-200 leading-relaxed">{result.summary}</p>
                </div>

                {/* 2. Action Plan */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Critical Action Plan</h3>
                  <div className="space-y-3">
                    {result.action_plan.map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl hover:bg-indigo-500/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0A0A0A] border border-emerald-500/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-emerald-500 mt-1">✔</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#0A0A0A] border border-rose-500/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-rose-500 mt-1">●</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          ) : (
            // EMPTY STATE
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <svg className="w-24 h-24 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-bold text-white">Ready for Analysis</p>
              <p className="text-sm text-slate-400">Upload your PDF to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}