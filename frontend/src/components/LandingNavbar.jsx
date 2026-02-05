import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // 1. Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. ScrollSpy
  useEffect(() => {
    const sections = ["home", "features", "how-it-works", "tech-stack", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.2, rootMargin: "-100px 0px 0px 0px" }
    );
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  // --- FIXED SCROLL FUNCTION ---
  const scrollTo = (id) => {
    setOpen(false); // 1. Close menu immediately

    // 2. Wait 300ms for the menu to visually close, THEN scroll
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -80; // Navbar height offset
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
        setActiveSection(id);
      }
    }, 300);
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
    { label: "Tech Stack", id: "tech-stack" },
    { label: "Contact", id: "contact" },
  ];

  return (
    // Pointer events toggle ensures clicks pass through when menu is closed
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 lg:pt-6 transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>

      <nav
        className={`
          relative flex flex-col items-center pointer-events-auto
          w-full max-w-6xl
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          border border-white/10
          bg-black/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40
          shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
          ${scrolled ? "rounded-[2rem] bg-black/80" : "rounded-[2.5rem]"}
          ${open ? "rounded-[2rem] bg-black/95" : ""} 
        `}
      >
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />

        {/* --- MAIN BAR --- */}
        <div className={`w-full flex items-center justify-between px-4 md:px-6 ${scrolled ? "py-2" : "py-3"}`}>

          {/* Logo */}
          <button onClick={() => scrollTo("home")} className="relative z-20 flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base md:text-lg font-bold tracking-tight text-white group-hover:text-slate-100 transition-colors">Careerlyst</span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-wide uppercase">AI Platform</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-3xl z-20">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive ? "text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Actions & Toggle */}
          <div className="relative z-20 flex items-center justify-end gap-2">

            {/* Desktop Drawer */}
            <div
              className={`
                    hidden lg:flex items-center justify-end gap-3 overflow-hidden
                    transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                    ${open ? "w-[210px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-8"}
                  `}
            >
              <button onClick={() => navigate("/login")} className="px-3 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">Log in</button>
              <button onClick={() => navigate("/signup")} className="relative inline-flex h-9 overflow-hidden rounded-full p-[1px] focus:outline-none shrink-0">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-bold text-white backdrop-blur-3xl transition-all hover:bg-slate-900">Sign up</span>
              </button>
            </div>

            {/* Plus Icon Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className={`
                      relative h-11 w-11 flex items-center justify-center rounded-full shrink-0 z-50 cursor-pointer
                      transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      ${open ? "bg-white text-black rotate-[135deg] scale-110 shadow-xl shadow-white/20" : "bg-white/10 text-white hover:bg-white/15 scale-100 border border-white/5"}
                    `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* --- MOBILE DROPDOWN --- */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full overflow-hidden lg:hidden relative z-30"
            >
              <div className="p-4 pt-2 flex flex-col gap-2 pb-6">
                <div className="h-px w-full bg-white/10 mb-4" />

                {/* Mobile Links */}
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollTo(item.id);
                    }}
                    className={`
                                  relative z-40 w-full text-left px-6 py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer
                                  ${activeSection === item.id ? "bg-white text-black shadow-lg shadow-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}
                                `}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="h-px w-full bg-white/10 my-4" />

                {/* Mobile Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => navigate("/login")} className="relative z-40 py-4 rounded-2xl border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/5 transition-all">Log in</button>
                  <button onClick={() => navigate("/signup")} className="relative z-40 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">Sign up</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}