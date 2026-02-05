import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import { api } from "../api/client";
import {
  Linkedin,
  Mail,
  Search,
  Hexagon,
  LogOut,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  Send,
  Briefcase,
  LayoutGrid
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import BottomNav from "../components/dashboard/BottomNav";
import ChatBot from "../components/dashboard/ChatBot";
import DashboardWidgets from "../components/dashboard/DashboardWidgets";
import Pipeline from "../components/dashboard/Pipeline";
import AICoach from "../components/dashboard/AICoach";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import Overview from "../components/dashboard/Overview";
import ProfileComponent from "../components/dashboard/Profile";
import AddApplicationModal from "../components/dashboard/AddApplicationModal";
import Support from "../components/dashboard/Support";
import Settings from "../components/dashboard/Settings";


const FilterDropdownContent = ({ initialStart, initialEnd, onApply, onClose }) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);


  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onApply("", "")}
        className="text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
      >
        Default View
      </button>

      <div className="h-px bg-white/10 my-1" />

      <div className="px-3 pb-2 pt-1">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2 block">Custom Range</span>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Start Date</label>
            <input
              type="date"
              value={start}
              max={today}
              onChange={(e) => setStart(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-violet-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">End Date</label>
            <input
              type="date"
              value={end}
              max={today}
              onChange={(e) => setEnd(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-violet-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <button
            onClick={() => onApply(start, end)}
            disabled={!start && !end}
            className="mt-2 w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("dashboard_active_view") || "dashboard";
  });
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [groupBy, setGroupBy] = useState("month");

  const [stats, setStats] = useState({ total: 0, statusCounts: {} });
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    localStorage.setItem("dashboard_active_view", activeView);
  }, [activeView]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [error, setError] = useState(null);

  // --------------------------------------------------
  // AUTH & DATA LOAD
  // --------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const onboarded = localStorage.getItem("isOnboarded");
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        if (onboarded === "false") {
          navigate("/onboarding");
          return;
        }

        // Fetch User Profile
        const userRes = await api.get("/api/auth/me");
        if (!isMounted) return;

        const user = userRes.data;

        const safeParse = (jsonString) => {
          if (!jsonString) return [];
          try {
            return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
          } catch (e) {
            return [];
          }
        };

        setProfile({
          name: user.fullName || "User",
          email: user.email || "user@example.com",
          username: user.username || "user",
          initials: user.fullName ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2) : "U",
          avatar: user.profilePic || null,
          jobTitle: user.jobTitle,
          bio: user.bio,
          dob: user.dob,
          resumeUrl: user.resumeUrl,
          links: user.links || {},
          mobileNo: user.mobileNo,
          city: user.city,
          state: user.state,
          country: user.country,
          skills: safeParse(user.skills),
          education: safeParse(user.education),
          workHistory: safeParse(user.work_history),
          certificates: safeParse(user.certificates),
          achievements: safeParse(user.achievements),
          bannerUrl: user.bannerUrl,
          usage: user.usage
        });

        // Parallel fetch for stats and apps to avoid serial blocking
        try {
          const params = { groupBy };
          if (dateRange.start) params.startDate = dateRange.start;
          if (dateRange.end) params.endDate = dateRange.end;

          const [statsRes, appsRes] = await Promise.all([
            api.get("/api/dashboard/stats", { params }),
            api.get("/api/applications")
          ]);

          if (isMounted) {
            setStats({ ...statsRes.data, currentGroupBy: groupBy });
            setJobs(appsRes.data.applications || []);
          }
        } catch (dataErr) {
          console.warn("Non-critical data failed:", dataErr);
        }

      } catch (err) {
        console.error("Dashboard Load Error:", err);
        if (isMounted) {
          if (err.response?.status === 401) {
            localStorage.clear();
            navigate("/login");
          } else {
            const errorMsg = err.response?.data?.message || err.message || "Failed to load dashboard. Please try again.";
            setError(errorMsg);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [navigate, dateRange, groupBy]);

  const handleSync = async (type = 'email') => {
    setIsSyncing(type);
    try {
      const payload = type === 'linkedin' ? { type: 'linkedin' } : {};
      const res = await api.post("/api/automation/scan", payload);
      alert(`🚀 SYNC COMPLETE!\nFound ${res.data.count} new jobs.`);


      const statsRes = await api.get("/api/dashboard/stats");
      setStats(statsRes.data);
      const appsRes = await api.get("/api/applications");
      setJobs(appsRes.data.applications || []);

    } catch (err) {
      if (err.response && err.response.data.authUrl) {
        window.location.href = err.response.data.authUrl;
      } else {
        const errorMsg = err.response?.data?.message || err.message || "Sync failed";
        alert(`Sync Error: ${errorMsg}`);
      }
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const statsRes = await api.get("/api/dashboard/stats");
      setStats(statsRes.data);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error("Failed to delete application:", err);
      alert("Failed to delete application.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading || (!profile && !error)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm animate-pulse">Initializing your career companion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="text-red-500 rotate-180" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-400 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trendData = stats.trendData || [];
  let growthBadge = "0%";
  let isGrowthPositive = true;
  let isZeroCurrent = false;

  if (trendData.length > 1) {
    const current = trendData[trendData.length - 1].applications;
    const previous = trendData[trendData.length - 2].applications;

    if (current === 0) {
      growthBadge = "0 This Month";
      isZeroCurrent = true;
    } else if (previous > 0) {
      const growth = ((current - previous) / previous) * 100;
      growthBadge = `${growth > 0 ? '+' : ''}${growth.toFixed(0)}%`;
      isGrowthPositive = growth >= 0;
    } else {

      growthBadge = "+100%";
      isGrowthPositive = true;
    }
  }

  const rejectionRate = stats.total > 0 && stats.statusCounts?.Rejected
    ? Math.round((stats.statusCounts.Rejected / stats.total) * 100)
    : 0;


  const activeSentCount = (stats.statusCounts?.Applied || 0) + (stats.statusCounts?.Interview || 0);
  const newRequestsCount = (stats.statusCounts?.Viewed || 0) + (stats.statusCounts?.Offer || 0) + (stats.statusCounts?.Hiring || 0);
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            {/* HEADER MATCHING REFERENCE DESIGN */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">

              {/* LEFT: Title & Date */}
              <div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white font-display mb-2">Dashboard</h1>
                <div className="relative z-50">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 text-slate-400 font-medium text-sm hover:text-white transition-colors outline-none"
                  >
                    <span>{dateRange.start && dateRange.end
                      ? `${new Date(dateRange.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(dateRange.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 z-50 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl p-1 w-64 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                        <FilterDropdownContent
                          initialStart={dateRange.start}
                          initialEnd={dateRange.end}
                          onApply={(start, end) => {
                            setDateRange({ start, end });
                            setIsFilterOpen(false);

                            // Auto-set granularity based on range
                            if (start && end) {
                              const diffTime = Math.abs(new Date(end) - new Date(start));
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                              if (diffDays <= 62) { // About 2 months
                                setGroupBy("day");
                              } else {
                                setGroupBy("month");
                              }
                            } else {
                              // Reset to default
                              setGroupBy("month");
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT: Stats Container */}
              <div className="flex flex-wrap items-center gap-8 md:gap-12">

                {/* 1. Application Sent */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
                      {activeSentCount.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isZeroCurrent ? 'bg-slate-700 text-slate-300' : isGrowthPositive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {growthBadge}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium text-sm mt-1">Application Sent</span>
                </div>

                {/* 2. New Requests (Hirings) */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
                      {newRequestsCount.toLocaleString()}
                    </span>
                    {newRequestsCount > 0 && (
                      <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        +{newRequestsCount} New
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 font-medium text-sm mt-1">New Requests</span>
                </div>

                {/* 3. Rejected */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
                      {stats.statusCounts?.Rejected ? stats.statusCounts.Rejected.toLocaleString() : '0'}
                    </span>
                    <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {rejectionRate}%
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium text-sm mt-1">Rejected</span>
                </div>

              </div>
            </div>

            {/* MAIN WIDGETS (Full Width) */}
            <DashboardWidgets
              stats={stats}
              onDelete={handleDeleteApplication}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              setDateRange={setDateRange}
              dateRange={dateRange}
            />

            {/* MODALS */}
            <AddApplicationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onRefresh={async () => {
                // Re-fetch all data
                const statsRes = await api.get("/api/dashboard/stats");
                setStats(statsRes.data);
                const appsRes = await api.get("/api/applications");
                setJobs(appsRes.data.applications || []);
              }}
            />
          </>
        );
      case "pipeline":
        return (
          <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tighter mb-4 md:mb-6 font-display">Application Details</h1>
            <div className="flex-1 min-h-0">
              <Pipeline
                jobs={jobs}
                setIsModalOpen={(isOpen) => {
                  if (isOpen) setSelectedApplication(null);
                  setIsModalOpen(isOpen);
                }}
                onDelete={handleDeleteApplication}
                onJobClick={(job) => {
                  setSelectedApplication(job);
                  setIsModalOpen(true);
                }}
              />
            </div>
            <AddApplicationModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedApplication(null);
              }}
              onRefresh={async () => {
                const statsRes = await api.get("/api/dashboard/stats");
                setStats(statsRes.data);
                const appsRes = await api.get("/api/applications");
                setJobs(appsRes.data.applications || []);
              }}
              initialData={selectedApplication}
            />
          </div>
        );
      case "ai-coach":
        return <AICoach profile={profile} onUsageUpdate={(u) => setProfile({ ...profile, usage: u })} />;
      case "calendar":
        return (
          <div className="h-full">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tighter mb-4 md:mb-6 font-display">Calendar Options</h1>
            <CalendarWidget className="h-[600px]" />
          </div>
        );
      case "history":
        return (
          <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tighter mb-4 md:mb-6 font-display">Hirings</h1>
            <div className="flex-1 min-h-0">
              <Pipeline
                jobs={jobs.filter(j => j.status.toLowerCase() === 'hiring')}
                setIsModalOpen={(isOpen) => {
                  if (isOpen) setSelectedApplication(null); // Clear if manual add
                  setIsModalOpen(isOpen);
                }}
                onDelete={handleDeleteApplication}
                onJobClick={(job) => {
                  setSelectedApplication(job);
                  setIsModalOpen(true);
                }}
                hideHiring={false}
                showStatusFilter={false}
                showAddButton={false}
              />
            </div>
            <AddApplicationModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedApplication(null);
              }}
              onRefresh={async () => {
                const statsRes = await api.get("/api/dashboard/stats");
                setStats(statsRes.data);
                const appsRes = await api.get("/api/applications");
                setJobs(appsRes.data.applications || []);
              }}
              initialData={selectedApplication}
            />
          </div>
        );
      case "sent":
        return (
          <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tighter mb-4 md:mb-6 font-display">Sent Applications</h1>
            <div className="flex-1 min-h-0">
              <Pipeline
                jobs={jobs}
                setIsModalOpen={(isOpen) => {
                  if (isOpen) setSelectedApplication(null);
                  setIsModalOpen(isOpen);
                }}
                onDelete={handleDeleteApplication}
                onJobClick={(job) => {
                  setSelectedApplication(job);
                  setIsModalOpen(true);
                }}
              />
            </div>
            <AddApplicationModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedApplication(null);
              }}
              onRefresh={async () => {
                const statsRes = await api.get("/api/dashboard/stats");
                setStats(statsRes.data);
                const appsRes = await api.get("/api/applications");
                setJobs(appsRes.data.applications || []);
              }}
              initialData={selectedApplication}
            />
          </div>
        );
      case "support":
        return (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <Support />
          </div>
        );
      case "profile": // Profile
        return (
          <div className="h-full overflow-y-auto custom-scrollbar pb-20">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tighter mb-4 md:mb-6 font-display">My Profile</h1>
            <ProfileComponent profile={profile} />
          </div>
        );
      case "settings": // Settings
        return (
          <div className="h-full overflow-y-auto custom-scrollbar pb-20">
            <Settings profile={profile} />
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="h-screen w-screen bg-[#020202] overflow-hidden relative font-sans flex text-white">

      {/* ---------------- 3D BACKGROUND LAYER ---------------- */}
      <div className="fixed inset-0 z-0 opacity-60">
        <Spline scene="https://prod.spline.design/4LuU7piWuQJ1UmLD/scene.splinecode" />
        <div className="absolute inset-0 z-[1] pointer-events-none shadow-[inset_0_0_160px_rgba(0,0,0,0.95)]" />
      </div>

      {/* Watermark Cover-up */}
      <div className="hidden md:block fixed bottom-0 right-0 w-40 h-14 bg-[#020202] z-40 pointer-events-none" />

      {/* ---------------- PREMIUM TOP HEADER (RESTORED) ---------------- */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-8 shadow-2xl pointer-events-auto">

        {/* LEFT SIDE: BRAND + SYNC ACTIONS */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
              <img src="/logo.png" alt="Careerlyst" className="h-full w-full object-contain" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white tracking-tight font-display">Careerlyst<span className="text-white/40 font-light"></span></h1>
            </div>
          </div>

          {/* SYNC ACTIONS (Separated Pills) - Scrollable on mobile */}
          <div className="flex items-center gap-2 md:gap-3 ml-0 md:ml-2 overflow-x-auto no-scrollbar max-w-[250px] md:max-w-none py-2 px-1">
            <button
              onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
              className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Linkedin size={16} className="text-[#0077b5]" />
              <span className="hidden md:inline">LinkedIn Extension</span>
            </button>

            <button
              onClick={() => handleSync('email')}
              disabled={!!isSyncing}
              className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 whitespace-nowrap"
            >
              <Mail size={16} className={isSyncing === 'email' ? "animate-spin" : "text-emerald-400"} />
              <span className="hidden md:inline">Email Sync</span>
            </button>

            {/* RESET BUTTON */}
            <button
              onClick={async () => {
                if (confirm("⚠️ RESET ALL DATA?\nThis will delete all applications. You can then Resync to get clean data.")) {
                  await api.post("/api/automation/reset");
                  alert("Data cleared. Please click 'Email Sync' to rebuild your dashboard.");
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <LogOut size={16} className="rotate-180" />
              <span className="hidden md:inline">Reset Data</span>
            </button>
          </div>
        </div>

        {/* RIGHT: USER PROFILE */}
        <div className="flex items-center gap-6">
          {/* TIME DISPLAY */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-lg font-bold text-white tracking-tight font-display leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-0.5">
              {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          {/* PROFILE DROPDOWN WRAPPER */}
          <div className="relative">
            <button
              onClick={() => { setActiveView("profile"); setIsProfileOpen(!isProfileOpen); }}
              className="flex items-center gap-3 pl-2 group outline-none"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none group-hover:text-indigo-400 transition-colors">{profile.name}</p>
                <p className="text-[10px] text-white/50 font-medium tracking-wide uppercase mt-1">@{profile.username}</p>
              </div>
              <div className="relative">
                {profile.avatar ? (
                  <img src={profile.avatar} className="w-10 h-10 rounded-full border border-white/10 shadow-lg object-cover group-hover:border-indigo-500/50 transition-colors" alt="User" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center shadow-lg text-xs font-bold text-white group-hover:border-indigo-500/50 transition-colors">
                    {profile.initials}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1a1a1a] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </button>

            {/* DROPDOWN MENU */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[40]" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-4 w-56 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl p-2 z-[50] backdrop-blur-xl flex flex-col gap-1 transition-all animate-in fade-in zoom-in-95 duration-200">

                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-white">{profile.name}</p>
                    <p className="text-xs text-zinc-500">{profile.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView(activeView === "profile" ? "dashboard" : "profile");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    {activeView === "profile" ? <LayoutGrid size={16} /> : <User size={16} />}
                    <span>{activeView === "profile" ? "Dashboard" : "My Profile"}</span>
                  </button>



                  <div className="h-px bg-white/5 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="pt-20 flex w-full h-full relative z-10 pointer-events-none">

        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <div className="hidden md:flex h-full pointer-events-auto">
          <Sidebar
            activeTab={activeView}
            setActiveTab={setActiveView}
            profile={profile}
            onLogout={handleLogout}
          />
        </div>

        {/* MOBILE BOTTOM NAV (Visible on Mobile) */}
        <BottomNav
          activeTab={activeView}
          setActiveTab={setActiveView}
        />

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 overflow-hidden relative pointer-events-auto">
          <div className="h-full w-full p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto custom-scrollbar"> {/* Added bottom padding for mobile nav */}
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ---------------- CHAT BOT ---------------- */}
      <div className="pointer-events-auto">
        <ChatBot />
      </div>

      {/* ---------------- STYLES ---------------- */}
      <style>{`
        #spline-watermark,
        [style*="fixed; bottom: 16px; right: 16px;"],
        a[href*="spline.design"] {
        display: none!important;
        opacity: 0!important;
        visibility: hidden!important;
        }
        canvas { outline: none; }
        .font-display { font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}