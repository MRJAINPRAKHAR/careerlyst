import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Briefcase,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2
} from "lucide-react";

const STATUS_STYLES = {
  applied: { color: "cyan", icon: Clock, label: "Applied" },
  interview: { color: "violet", icon: Briefcase, label: "Interview" },
  offer: { color: "emerald", icon: CheckCircle2, label: "Offer" },
  rejected: { color: "rose", icon: XCircle, label: "Rejected" },
  hiring: { color: "indigo", icon: Building2, label: "Hiring" },
  default: { color: "slate", icon: AlertCircle, label: "Unknown" }
};

const StatusBadge = ({ status }) => {
  const normStatus = status?.toLowerCase() || "default";
  const style = STATUS_STYLES[normStatus] || STATUS_STYLES.default;
  const Icon = style.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-${style.color}-500/10 border-${style.color}-500/20 text-${style.color}-400`}>
      <Icon size={12} />
      <span>{style.label}</span>
    </div>
  );
};

const TableHeader = ({ label, className = "" }) => (
  <th className={`px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest ${className}`}>
    {label}
  </th>
);

export default function Pipeline({ jobs, setIsModalOpen, onDelete, onJobClick, hideHiring = true, showStatusFilter = true, showAddButton = true }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (hideHiring) {
      result = result.filter(job => job.status.toLowerCase() !== 'hiring');
    }

    result.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(lowerTerm) ||
          job.role.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterStatus !== "all" && showStatusFilter) {
      result = result.filter((job) => job.status.toLowerCase() === filterStatus);
    }

    return result;
  }, [jobs, searchTerm, filterStatus, hideHiring, showStatusFilter]);

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Search */}
        <div className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          {showStatusFilter && (
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-[#0A0A0A] border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-indigo-500/50 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="interview">Interviewing</option>
                <option value="offer">Offers</option>
                <option value="rejected">Rejected</option>
                {!hideHiring && <option value="hiring">Hiring</option>}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Add Button */}
          {showAddButton && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
            >
              <Briefcase size={14} />
              <span>New Application</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-[#030303]/50 backdrop-blur-xl shadow-2xl relative">
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/5 pointer-events-none" />

        <div className="h-full overflow-y-auto custom-scrollbar overflow-x-auto pb-20 md:pb-0">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-[#0A0A0A]">
              <tr>
                <TableHeader label="Company" />
                <TableHeader label="Role" />
                <TableHeader label="Date" />
                <TableHeader label="Status" />
                <TableHeader label="AI Probability" />
                <TableHeader label="" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300 transition-all shadow-lg ${onJobClick ? 'cursor-pointer hover:border-indigo-500 hover:text-white' : 'group-hover:text-white group-hover:border-indigo-500/30'}`}
                            onClick={(e) => {
                              if (onJobClick) {
                                e.stopPropagation();
                                onJobClick(job);
                              }
                            }}
                          >
                            {job.company.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div
                              className={`text-sm font-bold text-white transition-colors ${onJobClick ? 'cursor-pointer hover:text-indigo-400 hover:underline' : 'group-hover:text-indigo-400'}`}
                              onClick={(e) => {
                                if (onJobClick) {
                                  e.stopPropagation();
                                  onJobClick(job);
                                }
                              }}
                            >
                              {job.company}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono hidden md:block">
                              ID: {job.id.toString().padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Building2 size={14} className="text-slate-600" />
                          <span className="text-sm font-medium">{job.role}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={14} className="text-slate-600" />
                          <span className="text-xs font-mono">
                            {new Date(job.date_applied).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>

                      {/* AI Probability */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${job.ai_chance > 70 ? 'from-emerald-600 to-emerald-400' :
                                job.ai_chance > 40 ? 'from-indigo-600 to-indigo-400' :
                                  'from-rose-600 to-rose-400'
                                }`}
                              style={{ width: `${job.ai_chance || 0}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold font-mono ${job.ai_chance > 70 ? 'text-emerald-400' :
                            job.ai_chance > 40 ? 'text-indigo-400' :
                              'text-rose-400'
                            }`}>
                            {job.ai_chance || 0}%
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status.toLowerCase() === 'hiring' && onJobClick && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onJobClick(job);
                              }}
                              className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 transition-colors"
                              title="Fill & Apply"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Are you sure you want to delete this application?")) {
                                onDelete(job.id);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors"
                            title="Delete Application"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40 space-y-3">
                        <Briefcase size={48} className="text-slate-600" />
                        <p className="text-slate-400 font-mono text-sm">NO APPLICATIONS FOUND</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}