import React from "react";
import {
    LayoutGrid,
    Briefcase,
    Brain,
    Calendar,
    Clock,
    Send,
    Settings,
    HelpCircle
} from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: "dashboard", label: "Home", icon: LayoutGrid },
        { id: "pipeline", label: "Apps", icon: Briefcase },
        { id: "ai-coach", label: "AI", icon: Brain },
        { id: "calendar", label: "Cal", icon: Calendar },
        { id: "history", label: "Hired", icon: Clock },
        { id: "sent", label: "Sent", icon: Send },
        { id: "settings", label: "Set", icon: Settings }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 z-[60] md:hidden px-4 pb-1 pb-safe pointer-events-auto">
            <div className="flex items-center justify-between h-full max-w-md mx-auto overflow-x-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[50px] h-full transition-all ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-white text-black shadow-lg shadow-white/10" : "bg-transparent"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "stroke-[2.5px]" : ""} />
                            </div>
                            <span className="text-[9px] font-bold tracking-wide uppercase">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
