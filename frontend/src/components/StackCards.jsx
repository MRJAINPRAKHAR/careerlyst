import { useMemo, useState, useEffect, useRef } from "react";

const DATA = [
  {
    id: "app-manager",
    title: "Application Command Center",
    desc: "A centralized hub for every job you've applied to.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
    ),
    details: [
      "Store company, role, & HR contacts.",
      "Save direct links to job postings.",
      "Attach private notes for interviews.",
    ],
    visualColor: "from-blue-600/30 to-cyan-600/30",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
    bgSolid: "bg-blue-500",
    iconBg: "bg-blue-500/20",
  },
  {
    id: "workflow",
    title: "Kanban-Style Workflow",
    desc: "Visualize your pipeline from 'Applied' to 'Offer'.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
    ),
    details: [
      "Real-time status updates.",
      "Color-coded progress tracking.",
      "Never lose track of a follow-up.",
    ],
    visualColor: "from-amber-600/30 to-orange-600/30",
    borderColor: "border-amber-500/50",
    textColor: "text-amber-400",
    bgSolid: "bg-amber-500",
    iconBg: "bg-amber-500/20",
  },
  {
    id: "analytics",
    title: "Success Analytics",
    desc: "Data-driven insights into your job hunt.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
    ),
    details: [
      "Breakdown of offers vs rejections.",
      "Analyze which roles reply most.",
      "Identify bottlenecks in your funnel.",
    ],
    visualColor: "from-emerald-600/30 to-green-600/30",
    borderColor: "border-emerald-500/50",
    textColor: "text-emerald-400",
    bgSolid: "bg-emerald-500",
    iconBg: "bg-emerald-500/20",
  },
  {
    id: "search",
    title: "Instant Recall",
    desc: "Find that one application from months ago in ms.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    ),
    details: [
      "Lightning fast filtering.",
      "Search by company or role.",
      "Sort by date applied.",
    ],
    visualColor: "from-purple-600/30 to-pink-600/30",
    borderColor: "border-purple-500/50",
    textColor: "text-purple-400",
    bgSolid: "bg-purple-500",
    iconBg: "bg-purple-500/20",
  },
  {
    id: "future",
    title: "AI Automation",
    desc: "The future of job tracking is hands-free.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
    ),
    details: [
      "Gmail sync for auto-logging.",
      "LinkedIn one-click import.",
      "Resume scoring via AI.",
    ],
    visualColor: "from-indigo-600/30 to-violet-600/30",
    borderColor: "border-indigo-500/50",
    textColor: "text-indigo-400",
    bgSolid: "bg-indigo-500",
    iconBg: "bg-indigo-500/20",
  },
];

export default function StackCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = useMemo(() => DATA[activeIndex], [activeIndex]);
  const contentRef = useRef(null);
  
  const handleFeatureClick = (idx) => {
    setActiveIndex(idx);
    if (window.innerWidth < 1024 && contentRef.current) {
      setTimeout(() => {
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
       // Optional auto-rotate logic
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* Header */}
      <div className="mb-16 text-center md:text-left">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Everything you need to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
             dominate the job market.
          </span>
        </h2>
        <p className="text-lg max-w-2xl text-slate-400">
           We replaced the chaos of spreadsheets with a sleek, intelligent dashboard designed for speed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        
        {/* --- LEFT: NAVIGATION LIST --- */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {DATA.map((item, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={item.id}
                onClick={() => handleFeatureClick(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`
                  group relative flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300
                  ${isActive 
                    ? "bg-white/5 border-l-4 border-white/20 translate-x-2" 
                    : "hover:bg-white/5 border-l-4 border-transparent hover:translate-x-1"
                  }
                `}
              >
                {/* Dynamic Left Border Color for Active State */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300 ${isActive ? item.bgSolid : "bg-transparent"}`} />

                {/* Icon Box */}
                <div className={`
                  h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? `${item.bgSolid} text-white shadow-lg` 
                    : "bg-white/5 text-slate-500 group-hover:scale-110"
                  }
                `}>
                  {item.icon}
                </div>

                {/* Text */}
                <div>
                  <div className={`font-bold text-sm md:text-base transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {item.title}
                  </div>
                  <div className={`text-xs transition-colors mt-0.5 ${isActive ? item.textColor : "text-slate-500"}`}>
                    {isActive ? "Viewing details..." : "Click to explore"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* --- RIGHT: DISPLAY SCREEN (Glass Panel) --- */}
        {/* FIX 1: Removed fixed height on mobile (h-[400px]), replaced with min-h and h-auto */}
        <div ref={contentRef} className="lg:col-span-7 relative min-h-[400px] h-auto">
          
          {/* THE CARD */}
          {/* FIX 2: Changed to 'relative' on mobile, 'absolute' on desktop to allow content to grow */}
          <div className={`
            relative lg:absolute lg:inset-0 rounded-3xl border backdrop-blur-2xl overflow-hidden shadow-2xl transition-all duration-500
            ${active.borderColor} bg-black/60
          `}>
             
             {/* 1. Dynamic Gradient Background */}
             <div className={`absolute inset-0 bg-gradient-to-br ${active.visualColor} opacity-40 transition-colors duration-700`} />
             
             {/* 2. Grid Pattern */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
             
             {/* 3. Top Bar (Window Controls) */}
             <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2 z-20">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-auto flex gap-1">
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
             </div>

             {/* 4. Content Area */}
             {/* FIX 3: Added padding-top (pt-20) on mobile to clear the window controls and prevent overlap */}
             <div className="relative lg:absolute lg:inset-0 lg:top-12 p-8 pt-20 lg:pt-12 md:p-12 flex flex-col justify-center">
                
                {/* Floating Background Icon */}
                <div className={`absolute right-8 top-20 ${active.textColor} opacity-10 transform scale-[5] rotate-12 pointer-events-none transition-all duration-700`}>
                   {active.icon}
                </div>

                <div key={active.id} className="relative z-10 animate-fade-in-up">
                   
                   {/* Badge */}
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-black/20 text-xs font-mono font-medium mb-6 w-fit text-white ${active.borderColor}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${active.bgSolid}`} />
                      FEATURE_ID: {active.id.toUpperCase()}
                   </div>
                   
                   <h3 className="text-3xl font-bold mb-4 text-white transition-colors duration-300">
                     {active.title}
                   </h3>
                   <p className="text-lg mb-8 leading-relaxed max-w-md text-slate-200 transition-colors duration-300">
                     {active.desc}
                   </p>

                   {/* Details List */}
                   <ul className="space-y-4">
                     {active.details.map((detail, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                          {/* Number Badge uses Theme Color */}
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${active.borderColor} ${active.iconBg} ${active.textColor} text-[10px] font-bold shadow-sm shrink-0`}>
                            {i + 1}
                          </div>
                          {detail}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}