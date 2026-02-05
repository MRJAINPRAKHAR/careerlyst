import { useNavigate } from "react-router-dom";
import { useState } from "react";
import InteractiveRobotSpline from "../components/InteractiveRobotSpline";
import CursorGlow from "../components/CursorGlow";
import ScrollProgress from "../components/ScrollProgress";
import StackCards from "../components/StackCards";
import LandingNavbar from "../components/LandingNavbar";
import Spotlight from "../components/Spotlight";

const ROBOT_SCENE_URL =
  "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

export default function Landing() {
  const navigate = useNavigate();
  const [activeTech, setActiveTech] = useState(null);

  return (
    <div className="min-h-screen bg-black text-slate-100 relative overflow-x-hidden selection:bg-indigo-500/30 font-sans">

      <CursorGlow />
      <ScrollProgress />
      <LandingNavbar />

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <section id="home" className="relative w-full pt-28 pb-10 lg:pt-32 lg:pb-20 overflow-visible">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 hidden md:block" fill="white" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-6 lg:pt-0">

              {/* Premium Animated Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                v1.0 Resume Ready
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gradient-premium">
                Job tracking, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                  Reimagined.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg">
                Stop using messy spreadsheets. Careerlyst builds a structured, intelligent pipeline for your applications, helping you land your dream role faster.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/signup")}
                  className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
                >
                  Start Tracking Free
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>

                <button
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  View Features
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[10px] text-white">
                      U{i}
                    </div>
                  ))}
                </div>
                <div>Trusted by students from <br /> <span className="text-slate-300">IITs, NITs, and Top Universities</span></div>
              </div>
            </div>

            {/* --- Right Content (Robot) --- */}
            {/* Added max-height for mobile to prevent layout shift */}
            <div className="relative h-[350px] md:h-[520px] lg:h-[600px] w-full overflow-hidden">
              <InteractiveRobotSpline
                scene={ROBOT_SCENE_URL}
                className="absolute inset-0 scale-[0.9] md:scale-[1.35] translate-y-4 md:translate-y-24"
              />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>

          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      {/* Updated scroll-mt-28 to allow space for navbar on mobile click */}
      <section id="features" className="relative z-10 scroll-mt-28 py-20 border-t border-white/5 bg-black/50 backdrop-blur-sm">
        <StackCards />
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="relative z-10 min-h-screen max-w-6xl mx-auto px-6 py-24 scroll-mt-28"
      >
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Workflow & Roadmap
          </h2>
          <p className="text-slate-400 mt-6 text-lg">
            A structured approach to consistency, evolving into an AI powerhouse.
          </p>
        </div>

        {/* Current Workflow - Bento Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Secure Account", desc: "JWT-Auth protected dashboard for complete privacy." },
            { step: "02", title: "Smart Logging", desc: "Store role, company, link, and notes in seconds." },
            { step: "03", title: "Visual Analytics", desc: "Real-time charts to identify weak points in your funnel." },
          ].map((item, i) => (
            <div key={i} className="group glass-card rounded-3xl p-8 relative overflow-hidden bg-white/5 border border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:opacity-20 transition-opacity">{item.step}</div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-24 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap">Future Roadmap</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        </div>

        {/* Future Roadmap - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Gmail Sync", desc: "Auto-detect application emails.", icon: "📧" },
            { title: "LinkedIn Sync", desc: "One-click import from LinkedIn Jobs.", icon: "💼" },
            { title: "AI Resume Review", desc: "Get scoring based on JD relevance.", icon: "🤖" },
            { title: "Auto Follow-ups", desc: "Smart reminders to email HR.", icon: "⏰" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl border border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-900/40 transition-all">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center text-xl border border-slate-800">
                {item.icon}
              </div>
              <div>
                <h4 className="text-white font-medium">{item.title}</h4>
                <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= DETAILED TECH STACK ================= */}
      <section
        id="tech-stack"
        className="relative z-10 max-w-6xl mx-auto px-6 py-24 scroll-mt-28"
      >
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Under the hood.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto md:mx-0">
            Careerlyst is built on a high-performance architecture designed for speed, scalability, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Column 1: Frontend */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="h-px w-8 bg-indigo-500/50"></span>
              Frontend
            </div>

            {/* React */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">React + Vite</h3>
                  <p className="text-slate-400 text-xs mt-1">Component-based UI with lightning-fast HMR.</p>
                </div>
                <div className="h-8 w-8 rounded bg-[#61DAFB]/20 flex items-center justify-center text-[#61DAFB]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                </div>
              </div>
            </div>

            {/* Tailwind */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">Tailwind CSS</h3>
                  <p className="text-slate-400 text-xs mt-1">Utility-first styling for pixel-perfect design.</p>
                </div>
                <div className="h-8 w-8 rounded bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" /></svg>
                </div>
              </div>
            </div>

            {/* Framer Motion */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">Framer Motion</h3>
                  <p className="text-slate-400 text-xs mt-1">Physics-based animations and gestures.</p>
                </div>
                <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0h16v8h-8zM4 8h8l8 8h-16zM4 16h8v8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Backend */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="h-px w-8 bg-green-500/50"></span>
              Backend API
            </div>

            {/* Node + Express */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">Node.js + Express</h3>
                  <p className="text-slate-400 text-xs mt-1">Scalable REST API architecture.</p>
                </div>
                <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center text-green-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
              </div>
            </div>

            {/* JWT Auth */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">JWT Authentication</h3>
                  <p className="text-slate-400 text-xs mt-1">Stateless, secure user sessions.</p>
                </div>
                <div className="h-8 w-8 rounded bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Data & Viz */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-widest mb-2">
              <span className="h-px w-8 bg-orange-500/50"></span>
              Data & Visuals
            </div>

            {/* MySQL */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">MySQL</h3>
                  <p className="text-slate-400 text-xs mt-1">Robust relational database structure.</p>
                </div>
                <div className="h-8 w-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.74 3.32a1 1 0 0 1 .5.87v9.42a1 1 0 0 1-.5.87L12 20.5l-5.74-3.32a1 1 0 0 1-.5-.87V6.88a1 1 0 0 1 .5-.87L12 2.69zM12 17v-6" /></svg>
                </div>
              </div>
            </div>

            {/* Recharts */}
            <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">Recharts</h3>
                  <p className="text-slate-400 text-xs mt-1">Data visualization library for React.</p>
                </div>
                <div className="h-8 w-8 rounded bg-red-500/20 flex items-center justify-center text-red-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= PREMIUM CONTACT HUB ================= */}
      <section
        id="contact"
        className="relative z-10 max-w-5xl mx-auto px-6 py-24 scroll-mt-28"
      >
        {/* Ambient Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden p-8 md:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

          {/* Internal Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

          {/* LEFT SIDE: Context & Status */}
          <div className="relative z-10 max-w-lg space-y-6">

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-medium tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Available for Internships
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Let’s build something <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                world-class.
              </span>
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed">
              Careerlyst is just the beginning. I'm actively looking for opportunities to apply my Full Stack skills in a challenging environment.
            </p>

            {/* Discussion Topics */}
            <div className="flex flex-wrap gap-2">
              {["React Architecture", "UI/UX Design", "Backend Scalability", "Open Source"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-md border border-white/5 bg-white/5 text-slate-400 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Location Info */}
            <div className="flex items-center gap-6 text-sm text-slate-500 pt-2 font-medium">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                India (IST)
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Replies within 24h
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Actions & Socials */}
          <div className="relative z-10 w-full lg:w-auto flex flex-col gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 shadow-2xl">

            {/* The Email Copy Box */}
            <div className="w-full">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Direct Email</label>
              {/* Updated Component Call */}
              <CopyEmailBox email="mrprakhar0808@gmail.com" />
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Social Links */}
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 block">Connect Platforms</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.linkedin.com/in/prakhar-jain-0ba411290/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/50 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white text-sm font-medium transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:text-[#0077b5] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/MrJainPrakhar"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/50 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white text-sm font-medium transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  GitHub
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/5 bg-black pt-20 pb-10">

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">

            {/* Branding with Matching Logo */}
            <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
                  <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Careerlyst.ai</span>
              </div>
              <p className="text-slate-500 text-sm ml-1">
                Empowering students to land their dream careers.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {/* Icons remain same as previous code... */}
              <a href="https://x.com/Mr_Jain_Piyush" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
              <a href="https://github.com/MRJAINPRAKHAR" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
              <a href="https://www.linkedin.com/in/prakhar-jain-0ba411290/" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-[#0077b5] hover:text-white hover:shadow-[0_0_15px_rgba(0,119,181,0.5)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} Prakhar Jain. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= HELPER COMPONENT (FIXED MOBILE & DESKTOP) ================= */

function CopyEmailBox({ email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col md:flex-row items-center gap-3 p-4 md:p-1.5 md:pr-2 rounded-2xl md:rounded-full border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-black/60 w-full md:w-auto">

      {/* Icon Container */}
      <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      </div>

      {/* Email Text */}
      {/* Mobile: break-all (prevent overflow), Center. Desktop: nowrap (one line), Left. */}
      <div className="flex-1 px-2 text-sm font-medium text-slate-300 font-mono tracking-wide text-center md:text-left break-all md:whitespace-nowrap">
        {email}
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`
          w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-4 py-3 md:py-2 rounded-xl md:rounded-full text-xs font-bold uppercase tracking-wider transition-all
          ${copied
            ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            : "bg-white text-black hover:bg-slate-200"
          }
        `}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Copied</span>
          </>
        ) : (
          <span>Copy</span>
        )}
      </button>
    </div>
  );
}