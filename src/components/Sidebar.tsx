import React, { useState } from "react";
import { 
  LayoutDashboard, BookOpen, School, Users, 
  Award, CheckSquare, BookOpenCheck, BarChart3, 
  User, LogOut, FileText, ClipboardList, BookOpenText,
  Settings, X, Edit3, Sparkles, Database, CalendarDays
} from "lucide-react";
import { Profile } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: Profile;
  onLogout: () => void;
  isDarkMode: boolean;
  logoEmoji: string;
  logoName: string;
  logoSub: string;
  onLogoUpdate: (emoji: string, name: string, sub: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onLogout,
  isDarkMode,
  logoEmoji,
  logoName,
  logoSub,
  onLogoUpdate
}) => {
  const isGuru = currentUser.role === "guru";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputEmoji, setInputEmoji] = useState(logoEmoji);
  const [inputName, setInputName] = useState(logoName);
  const [inputSub, setInputSub] = useState(logoSub);

  const sidebarStyle = localStorage.getItem("simaq_sidebar_style") || "default";
  const isCompact = sidebarStyle === "compact";

  const presets = ["🌙", "🏫", "📚", "🕌", "📖", "🎓", "⭐", "📝", "💡", "🕌", "🕌"];

  const handleOpenModal = () => {
    if (isCompact) return; // Disable customizer on compact to avoid layout breaking
    setInputEmoji(logoEmoji);
    setInputName(logoName);
    setInputSub(logoSub);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onLogoUpdate(inputEmoji.trim() || "🌙", inputName.trim() || "SIMAQ", inputSub.trim() || "Aliyah Al-Qamar");
    setIsModalOpen(false);
  };

  const handleReset = () => {
    setInputEmoji("🌙");
    setInputName("SIMAQ");
    setInputSub("Aliyah Al-Qamar");
  };

  const renderMenuItem = (id: string, label: string, icon: React.ReactNode) => {
    const isActive = currentView === id;
    return (
      <button
        key={id}
        onClick={() => onViewChange(id)}
        className={`w-full flex items-center ${isCompact ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5"} rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive 
            ? "bg-[#696cff] text-white shadow-md shadow-[#696cff]/40" 
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        }`}
        title={isCompact ? label : undefined}
      >
        <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"}`}>
          {icon}
        </div>
        {!isCompact && <span className="truncate">{label}</span>}
      </button>
    );
  };

  const renderSectionHeader = (title: string) => {
    if (isCompact) {
      return <div className="border-t border-gray-100 dark:border-gray-800 my-4" />;
    }
    return (
      <div className="px-4 py-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {title}
      </div>
    );
  };

  return (
    <aside className={`${isCompact ? "w-20" : "w-64"} flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f202e] flex flex-col h-screen overflow-y-auto relative transition-all duration-300`}>
      {/* Brand Header */}
      <div 
        onClick={handleOpenModal}
        className={`flex items-center ${isCompact ? "justify-center py-5" : "justify-between px-5 py-4"} border-b border-gray-100 dark:border-gray-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer group transition-colors`}
        title="Klik untuk mengubah logo & nama aplikasi"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0">
            {logoEmoji}
          </div>
          {!isCompact && (
            <div>
              <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-none tracking-tight flex items-center gap-1 group-hover:text-[#696cff] transition-colors">
                {logoName}
              </h1>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-0.5 truncate max-w-[130px]">
                {logoSub}
              </span>
            </div>
          )}
        </div>
        {!isCompact && <Settings size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-[#696cff] group-hover:rotate-45 transition-all" />}
      </div>

      {/* Profile summary */}
      <div className={`px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center ${isCompact ? "justify-center" : "gap-3"}`}>
        <img
          src={currentUser.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
          alt={currentUser.nama}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover shrink-0"
        />
        {!isCompact && (
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-white">{currentUser.nama}</h4>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              {currentUser.role}
            </span>
          </div>
        )}
      </div>

      {/* Menu scroll area */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {renderMenuItem("dashboard", "Dashboard", <LayoutDashboard size={18} />)}

        {isGuru ? (
          <>
            {renderSectionHeader("Data Master Guru")}
            {renderMenuItem("subjects", "Mata Pelajaran", <BookOpen size={18} />)}
            {renderMenuItem("classes", "Kelas", <School size={18} />)}
            {renderMenuItem("students", "Siswa", <Users size={18} />)}

            {renderSectionHeader("Akademik")}
            {renderMenuItem("grades", "Nilai Siswa", <Award size={18} />)}
            {renderMenuItem("attendance", "Absensi Siswa", <CheckSquare size={18} />)}
            {renderMenuItem("schedules", "Jadwal Mengajar", <CalendarDays size={18} />)}
            {renderMenuItem("materials", "Materi Ajar", <FileText size={18} />)}
            {renderMenuItem("assignments", "Penugasan", <ClipboardList size={18} />)}
            {renderMenuItem("journals", "Jurnal Mengajar", <BookOpenCheck size={18} />)}

            {renderSectionHeader("Laporan")}
            {renderMenuItem("reports", "Rekap Laporan", <BarChart3 size={18} />)}

            {renderSectionHeader("Pengaturan")}
            {renderMenuItem("profile", "Profil Guru", <User size={18} />)}
            {renderMenuItem("backup-restore", "Pengaturan Sistem", <Settings size={18} />)}
          </>
        ) : (
          <>
            {renderSectionHeader("Data Siswa")}
            {renderMenuItem("student-attendance", "Absensi Siswa", <CheckSquare size={18} />)}
            {renderMenuItem("student-materials", "Materi Belajar", <BookOpenText size={18} />)}
            {renderMenuItem("student-assignments", "Tugas Siswa", <ClipboardList size={18} />)}
            {renderMenuItem("student-grades", "Hasil Penilaian", <Award size={18} />)}

            {renderSectionHeader("Pengaturan Siswa")}
            {renderMenuItem("student-profile", "Profil Siswa", <User size={18} />)}
          </>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-8 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>

      {/* Sidebar Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 font-mono text-center">
        {logoName} v1.0.0
      </div>

      {/* Brand Logo Customizer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#696cff]" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/60 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#696cff]" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider font-sans">
                  Kustomisasi Logo & Brand
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preset Emojis */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
                  Pilih Preset Emoji Logo
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setInputEmoji(preset)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                        inputEmoji === preset 
                          ? "bg-[#696cff] text-white scale-110 shadow-md shadow-[#696cff]/20" 
                          : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Emoji Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                  Atau Custom Emoji / Huruf Logo (Max 5 Karakter)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={inputEmoji}
                  onChange={(e) => setInputEmoji(e.target.value)}
                  placeholder="Contoh: 🌙 atau SMQ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                />
              </div>

              {/* App Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                  Nama Aplikasi (Logo Text)
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Nama aplikasi (contoh: SIMAQ)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                  Nama Lembaga / Subtitle
                </label>
                <input
                  type="text"
                  value={inputSub}
                  onChange={(e) => setInputSub(e.target.value)}
                  placeholder="Nama sekolah (contoh: Madrasah Aliyah Al-Qamar)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-md shadow-[#696cff]/10 hover:shadow-[#696cff]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
