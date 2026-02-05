import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/client";
import { Briefcase, FileText } from "lucide-react";

export default function Profile({ profile }) {
  if (!profile) return null;

  const [isEditing, setIsEditing] = useState(false);

  // Refs for file uploads
  const resumeInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Local State for Form
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    jobTitle: "",
    bio: "",
    dob: "",
    links: { linkedin: "", github: "", twitter: "", leetcode: "", hackerrank: "" },
    mobileNo: "",
    city: "",
    state: "",
    country: "",
    skills: [],
    education: [],
    workHistory: [],
    certifications: [],
    achievements: [],
    bannerUrl: null,
    avatarUrl: null
  });

  // Load Initial Data
  useEffect(() => {
    setFormData({
      fullName: profile.name || "",
      username: profile.username?.replace("@", "") || "",
      jobTitle: profile.jobTitle || "",
      bio: profile.bio || "",
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
      links: {
        linkedin: profile.links?.linkedin || "",
        github: profile.links?.github || "",
        twitter: profile.links?.twitter || "",
        leetcode: profile.links?.leetcode || "",
        hackerrank: profile.links?.hackerrank || ""
      },
      mobileNo: profile.mobileNo || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      skills: profile.skills || [],
      education: profile.education || [],
      workHistory: profile.workHistory || [],
      certifications: profile.certificates || [],
      achievements: profile.achievements || [],
      bannerUrl: profile.bannerUrl || null,
      avatarUrl: profile.avatar || null
    });
  }, [profile]);

  // --- HANDLERS ---

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    try {
      const res = await api.post("/api/auth/upload-avatar", data);
      setFormData(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
    } catch (err) {
      alert("Failed to upload avatar: " + (err.response?.data?.message || err.message));
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("resume", file);
    try {
      await api.post("/api/auth/update-resume", data);
      alert("Resume updated!");
      window.location.reload();
    } catch (err) {
      alert("Failed to upload resume: " + (err.response?.data?.message || err.message));
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("banner", file);
    try {
      const res = await api.post("/api/auth/upload-banner", data);
      setFormData(prev => ({ ...prev, bannerUrl: res.data.bannerUrl }));
    } catch (err) {
      alert("Failed to upload banner: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async () => {
    try {
      await api.post("/api/auth/update-profile", formData);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-5xl mx-auto pb-20"
    >
      {/* --- PROFILE CONTENT --- */}
      <MotionSection delay={0} className="relative rounded-[2.5rem] overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl group/banner">
        {/* Background Banner */}
        <div className="h-48 relative">
          {formData.bannerUrl ? (
            <img src={formData.bannerUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-black/50" />
          )}

          {/* Banner Edit Button */}
          <button
            onClick={() => bannerInputRef.current.click()}
            className="absolute top-6 right-6 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover/banner:opacity-100 transition-all hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} className="hidden" accept="image/*" />
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 relative z-10">

          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#0A0A0A] overflow-hidden bg-black shadow-lg">
              <img src={formData.avatarUrl || profile.initials} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${formData.fullName}&background=6366f1&color=fff`; }} />
            </div>
            <button
              onClick={() => avatarInputRef.current.click()}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer border-4 border-transparent"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          </div>

          {/* Name & Title */}
          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{formData.fullName}</h1>
            <p className="text-indigo-400 font-medium">{formData.jobTitle || "No Title Set"}</p>
          </div>

          {/* Edit / Save Actions */}
          <div className="mb-4 flex gap-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all">Save Changes</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all shadow-lg">Edit Profile</button>
            )}
          </div>
        </div>
      </MotionSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <MotionSection delay={0.1} className="p-8 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" value={formData.fullName} disabled={!isEditing} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              <InputGroup label="Job Title" value={formData.jobTitle} disabled={!isEditing} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
              <InputGroup label="Username" value={formData.username} disabled={!isEditing} onChange={e => setFormData({ ...formData, username: e.target.value })} />
              <InputGroup label="Date of Birth" type="date" value={formData.dob} disabled={!isEditing} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
              <InputGroup label="Mobile No" value={formData.mobileNo} disabled={!isEditing} onChange={e => setFormData({ ...formData, mobileNo: e.target.value })} />
              <InputGroup label="City" value={formData.city} disabled={!isEditing} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              <InputGroup label="State" value={formData.state} disabled={!isEditing} onChange={e => setFormData({ ...formData, state: e.target.value })} />
              <InputGroup label="Country" value={formData.country} disabled={!isEditing} onChange={e => setFormData({ ...formData, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">About Me (Bio)</label>
              <textarea
                disabled={!isEditing}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-24 resize-none focus:border-indigo-500 outline-none disabled:opacity-50 transition-all"
              />
            </div>
          </MotionSection>

          <MotionSection delay={0.2} className="p-8 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Social & Coding Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialInput icon="linkedin" label="LinkedIn" value={formData.links.linkedin} disabled={!isEditing} onChange={e => setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })} />
              <SocialInput icon="github" label="GitHub" value={formData.links.github} disabled={!isEditing} onChange={e => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })} />
              <SocialInput icon="twitter" label="X (Twitter)" value={formData.links.twitter} disabled={!isEditing} onChange={e => setFormData({ ...formData, links: { ...formData.links, twitter: e.target.value } })} />
            </div>
          </MotionSection>
          {/* 1. SKILLS */}
          <MotionSection delay={0.3} className="p-8 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Skills & Expertise</h3>
            </div>
            {isEditing && (
              <input
                placeholder="Type a skill and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    if (!formData.skills.includes(e.target.value.trim())) {
                      setFormData({ ...formData, skills: [...formData.skills, e.target.value.trim()] });
                    }
                    e.target.value = "";
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none mb-4"
              />
            )}
            <div className="flex flex-wrap gap-2">
              {formData.skills?.map((skill, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center gap-2">
                  {skill}
                  {isEditing && (
                    <button onClick={() => {
                      const newSkills = formData.skills.filter((_, idx) => idx !== i);
                      setFormData({ ...formData, skills: newSkills });
                    }} className="hover:text-white">×</button>
                  )}
                </span>
              ))}
            </div>
          </MotionSection>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <MotionSection delay={0.15} className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">Resume</h3>
            <div className="p-1 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
              <div
                onClick={() => profile.resumeUrl && window.open(profile.resumeUrl, "_blank")}
                className={`relative w-full aspect-[1/1.4] bg-white rounded-xl overflow-hidden cursor-pointer group shadow-xl transition-all hover:scale-[1.02] ${!profile.resumeUrl ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              >
                {profile.resumeUrl ? (
                  <div className="w-full h-full relative group">
                    <img
                      src={profile.resumeUrl.includes('cloudinary')
                        ? profile.resumeUrl.replace(/\/upload\//, '/upload/w_800,f_auto,q_auto,pg_1/').replace(/\.pdf$/i, '.jpg')
                        : `https://docs.google.com/gview?url=${encodeURIComponent(profile.resumeUrl)}&embedded=true`
                      }
                      className="w-full h-full object-cover rounded-xl transition-opacity group-hover:opacity-60"
                      alt="Resume Preview"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl flex-col gap-2 transition-all">
                      <FileText size={40} className="text-white opacity-80" />
                      <span className="text-[10px] text-white opacity-80 font-bold uppercase tracking-wider">Expand Preview</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600 bg-zinc-900/50 rounded-xl flex-col gap-2">
                    <FileText size={40} className="text-zinc-700" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No PDF Found</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => profile.resumeUrl && window.open(profile.resumeUrl, "_blank")} className="py-2.5 rounded-lg bg-white/5 text-xs font-bold border border-white/10 text-white">Open</button>
              <button onClick={() => resumeInputRef.current.click()} className="py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500">Update</button>
            </div>
            <input type="file" ref={resumeInputRef} onChange={handleResumeChange} className="hidden" accept=".pdf" />
          </MotionSection>
        </div>
      </div>
    </motion.div>
  );
}


// --- HELPER COMPONENTS ---

const MotionSection = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const InputGroup = ({ label, type = "text", value, onChange, disabled }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <input
      type={type}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none disabled:opacity-50 transition-all"
    />
  </div>
);

const SocialInput = ({ icon, label, value, onChange, disabled }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
      {/* (Icons similar to before) */}
      <span className="text-xs font-bold">{label === 'X (Twitter)' ? 'X' : (label === 'LinkedIn' ? 'In' : 'Git')}</span>
    </div>
    <input
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none disabled:opacity-50 transition-all placeholder:text-slate-600"
      placeholder={`Link...`}
    />
  </div>
);