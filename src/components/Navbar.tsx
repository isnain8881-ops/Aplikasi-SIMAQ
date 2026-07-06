import React, { useState, useEffect, useMemo } from "react";
import { Sun, Moon, Database, HelpCircle, Bell, RefreshCw, Check, AlertCircle, BookOpen, FileText, Star, Award, Megaphone, CheckCheck, Trash2 } from "lucide-react";
import { Profile, Student } from "../types";
import { db, isSupabaseConfigured } from "../utils/db";

interface NavbarProps {
  currentUser: Profile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onShowSupabaseHelp: () => void;
  syncStatus?: "idle" | "syncing" | "success" | "error";
  onTriggerSync?: () => void;
  onViewChange?: (view: string) => void;
  logoName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  onShowSupabaseHelp,
  syncStatus = "idle",
  onTriggerSync,
  onViewChange,
  logoName = "SIMAQ"
}) => {
  const [timeStr, setTimeStr] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Load read notification IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("simaq_read_notification_ids");
      if (saved) {
        setReadNotifIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading read notifications", e);
    }
  }, []);

  // Save read notification IDs to localStorage when updated
  const saveReadNotifs = (updatedIds: string[]) => {
    setReadNotifIds(updatedIds);
    try {
      localStorage.setItem("simaq_read_notification_ids", JSON.stringify(updatedIds));
    } catch (e) {
      console.error("Error saving read notifications", e);
    }
  };

  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      type: "assignment" | "material" | "grade" | "submission" | "system";
      targetView?: string;
      read: boolean;
    }> = [];

    // 1. Always add system welcome message
    list.push({
      id: "notif-welcome-simaq",
      title: `Selamat Datang di ${logoName} 🎉`,
      message: `Sistem Informasi Akademik & Qira'at siap mempermudah kegiatan belajar mengajar Anda.`,
      time: "2026-07-01",
      type: "system",
      targetView: "dashboard",
      read: readNotifIds.includes("notif-welcome-simaq")
    });

    try {
      if (currentUser.role === "siswa") {
        const student = db.getStudents().find(s => s.nis === currentUser.nip_nisn);
        const classId = student ? student.kelas_id : "class-1";

        // A. Learning Materials notifications
        const studentMaterials = db.getMaterials().filter(m => m.kelas_id === classId);
        studentMaterials.forEach(m => {
          const subj = db.getSubjects().find(s => s.id === m.subject_id);
          const subjName = subj ? subj.nama : "Mata Pelajaran";
          const id = `notif-material-${m.id}`;
          list.push({
            id,
            title: "Materi Ajar Baru 📚",
            message: `Materi "${m.materi_pembelajaran}" telah diunggah untuk pelajaran ${subjName}.`,
            time: m.tanggal,
            type: "material",
            targetView: "student-assignments",
            read: readNotifIds.includes(id)
          });
        });

        // B. Assignments notifications
        const studentAssignments = db.getAssignments().filter(a => a.kelas_id === classId);
        studentAssignments.forEach(a => {
          const subj = db.getSubjects().find(s => s.id === a.subject_id);
          const subjName = subj ? subj.nama : "Mata Pelajaran";
          const id = `notif-assignment-${a.id}`;
          list.push({
            id,
            title: "Penugasan Baru 📝",
            message: `Ada tugas baru "${a.materi_pelajaran}" dengan batas pengumpulan: ${a.deadline || "-"}.`,
            time: a.tanggal,
            type: "assignment",
            targetView: "student-assignments",
            read: readNotifIds.includes(id)
          });
        });

        // C. Graded assignment notifications
        const studentSubmissions = db.getSubmissions().filter(s => s.siswa_id === student?.id && s.nilai !== null && s.nilai !== undefined);
        studentSubmissions.forEach(s => {
          const asg = db.getAssignments().find(a => a.id === s.assignment_id);
          const subj = asg ? db.getSubjects().find(sub => sub.id === asg.subject_id) : null;
          const subjName = subj ? subj.nama : "Pelajaran";
          const id = `notif-graded-${s.id}-${s.nilai}`;
          list.push({
            id,
            title: "Tugas Selesai Dinilai ⭐",
            message: `Tugas "${asg?.materi_pelajaran || "Tugas"}" (${subjName}) Anda telah dinilai: ${s.nilai}/100.`,
            time: s.tanggal_submit || "2026-07-06",
            type: "grade",
            targetView: "student-assignments",
            read: readNotifIds.includes(id)
          });
        });

      } else if (currentUser.role === "guru") {
        const allSubmissions = db.getSubmissions().filter(s => s.status === "Selesai");
        allSubmissions.forEach(s => {
          const stud = db.getStudents().find(st => st.id === s.siswa_id);
          const cls = stud ? db.getClasses().find(c => c.id === stud.kelas_id) : null;
          const asg = db.getAssignments().find(a => a.id === s.assignment_id);
          const subj = asg ? db.getSubjects().find(sub => sub.id === asg.subject_id) : null;
          
          const studName = stud ? stud.nama_lengkap : "Siswa";
          const className = cls ? cls.nama : "";
          const asgTitle = asg ? asg.materi_pelajaran : "Tugas";
          const subjName = subj ? subj.nama : "Pelajaran";
          const isGraded = s.nilai !== null && s.nilai !== undefined;
          
          const id = `notif-subm-${s.id}-${s.nilai}`;
          list.push({
            id,
            title: isGraded ? "Tugas Selesai Dinilai ✅" : "Tugas Baru Dikumpulkan 📥",
            message: `${studName} (${className}) mengumpulkan tugas "${asgTitle}" (${subjName}).${isGraded ? ` Nilai: ${s.nilai}` : " Belum dinilai."}`,
            time: s.tanggal_submit || "2026-07-06",
            type: "submission",
            targetView: "assignments",
            read: readNotifIds.includes(id)
          });
        });
      }
    } catch (e) {
      console.error("Error generating notifications", e);
    }

    return list.sort((a, b) => b.time.localeCompare(a.time) || b.id.localeCompare(a.id));
  }, [currentUser, readNotifIds]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleNotifClick = (notif: any) => {
    if (!notif.read) {
      saveReadNotifs([...readNotifIds, notif.id]);
    }
    setIsNotifOpen(false);
    if (notif.targetView && onViewChange) {
      onViewChange(notif.targetView);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    saveReadNotifs([...readNotifIds, ...unreadIds]);
  };

  const handleClearAll = () => {
    const allIds = notifications.map(n => n.id);
    saveReadNotifs(allIds);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WITA");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasSupabase = isSupabaseConfigured();

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f202e] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Time */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Waktu Server</span>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">{timeStr}</p>
        </div>
        <div className="sm:hidden">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{logoName}</h2>
        </div>
      </div>

      {/* Center database banner */}
      <div className="flex items-center gap-2">
        {hasSupabase ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onShowSupabaseHelp}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
              title="Klik untuk membuka Bantuan Supabase & Skema SQL"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Terkoneksi</span>
              <HelpCircle size={12} className="opacity-70 ml-1" />
            </button>
            
            <button
              onClick={onTriggerSync}
              disabled={syncStatus === "syncing"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                syncStatus === "syncing"
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 cursor-not-allowed"
                  : syncStatus === "success"
                  ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
                  : syncStatus === "error"
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                  : "bg-white dark:bg-[#1f202e] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm"
              }`}
              title="Sinkronisasikan data lokal & Supabase"
            >
              {syncStatus === "syncing" ? (
                <>
                  <RefreshCw size={12} className="animate-spin text-indigo-500" />
                  <span className="hidden md:inline font-mono text-[11px]">Mensinkronkan...</span>
                </>
              ) : syncStatus === "success" ? (
                <>
                  <Check size={12} className="text-emerald-500 font-bold" />
                  <span className="hidden md:inline text-[11px]">Sinkron Selesai</span>
                </>
              ) : syncStatus === "error" ? (
                <>
                  <AlertCircle size={12} className="text-rose-500" />
                  <span className="hidden md:inline text-[11px]">Gagal Sinkron</span>
                </>
              ) : (
                <>
                  <RefreshCw size={12} className="text-gray-400" />
                  <span className="hidden md:inline text-[11px]">Sinkron Sekarang</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button 
            onClick={onShowSupabaseHelp}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 transition-colors"
          >
            <Database size={13} />
            <span>Mode Lokal (Pre-seeded)</span>
            <HelpCircle size={12} className="opacity-70" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark Mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Interactive Notifications System */}
        <div className="relative">
          <button 
            id="btn-navbar-notif"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Pemberitahuan Akademik"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              {/* Backing layer for click-away */}
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => setIsNotifOpen(false)}
              />
              
              {/* Notification Dropdown Panel */}
              <div 
                id="navbar-notif-dropdown"
                className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#1f202e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
              >
                {/* Header */}
                <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-gray-800 dark:text-white uppercase tracking-wider font-sans">
                      Notifikasi
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold font-mono">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-semibold text-[#696cff] hover:text-[#5f61e6] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={12} />
                      Tandai Semua Selesai
                    </button>
                  )}
                </div>

                {/* List Container */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/40">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <Bell size={24} className="opacity-30 mb-2" />
                      <p className="text-xs">Tidak ada notifikasi baru.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      // Determine Icon and style based on type
                      let iconEl = <Bell size={14} className="text-[#696cff]" />;
                      let bgStyle = "bg-[#696cff]/10";
                      
                      if (notif.type === "assignment") {
                        iconEl = <FileText size={14} className="text-amber-500" />;
                        bgStyle = "bg-amber-500/10";
                      } else if (notif.type === "material") {
                        iconEl = <BookOpen size={14} className="text-emerald-500" />;
                        bgStyle = "bg-emerald-500/10";
                      } else if (notif.type === "grade") {
                        iconEl = <Star size={14} className="text-violet-500" />;
                        bgStyle = "bg-violet-500/10";
                      } else if (notif.type === "submission") {
                        iconEl = <Award size={14} className="text-indigo-500" />;
                        bgStyle = "bg-indigo-500/10";
                      } else if (notif.type === "system") {
                        iconEl = <Megaphone size={14} className="text-sky-500" />;
                        bgStyle = "bg-sky-500/10";
                      }

                      return (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative ${
                            !notif.read ? "bg-slate-50/50 dark:bg-slate-800/10" : ""
                          }`}
                        >
                          {/* Unread Indicator dot */}
                          {!notif.read && (
                            <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-[#696cff]" />
                          )}

                          {/* Left Icon */}
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgStyle}`}>
                            {iconEl}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className={`text-xs truncate ${!notif.read ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-600 dark:text-gray-300"}`}>
                                {notif.title}
                              </h5>
                              <span className="text-[9px] text-gray-400 font-mono flex-shrink-0">
                                {notif.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer actions */}
                {notifications.length > 0 && (
                  <div className="px-4 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                    <button 
                      onClick={handleClearAll}
                      className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      Sembunyikan Semua
                    </button>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {notifications.length} Notifikasi
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User quick profile */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">{currentUser.nama}</p>
            <span className="text-[10px] text-gray-400 font-mono leading-none">{currentUser.nip_nisn}</span>
          </div>
          <img
            src={currentUser.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
            alt={currentUser.nama}
            className="w-9 h-9 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
