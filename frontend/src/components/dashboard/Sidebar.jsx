import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Briefcase,
  Brain,
  Calendar,
  Clock,
  Send,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, profile, onLogout }) {
  const [hovered, setHovered] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "pipeline", label: "Application Details", icon: Briefcase },
    { id: "ai-coach", label: "AI Resume Analyser", icon: Brain },
    { id: "calendar", label: "Calendar Options", icon: Calendar },
    { id: "history", label: "Hirings", icon: Clock },
    { id: "sent", label: "Sents", icon: Send },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col px-3 py-4 relative z-20"
    >
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#0A0A0A] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* NAVIGATION */}
      <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar mt-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} h-11 rounded-lg transition-all duration-200 group ${isActive
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className={`relative z-10 ${isActive ? "text-black" : "text-slate-500 group-hover:text-white"}`}>
                <item.icon size={20} className={isActive ? "stroke-[2.5px]" : ""} />
              </div>

              {!isCollapsed && (
                <span className="relative z-10 text-sm font-bold tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SUPPORT & PROFILE */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-2">

        {/* Support Button */}
        <button
          onClick={() => setActiveTab('support')}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} h-11 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group`}
        >
          <HelpCircle size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Support</span>}
        </button>

        {/* Profile Card */}
        <div className={`relative group p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer overflow-hidden ${isCollapsed ? "flex justify-center" : ""}`}>
          <div className={`relative z-10 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="relative shrink-0">
              <img src={profile.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-white/10" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-hidden whitespace-nowrap">
                <p className="text-sm font-medium text-white truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{profile.jobTitle}</p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={(e) => { e.stopPropagation(); onLogout(); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}