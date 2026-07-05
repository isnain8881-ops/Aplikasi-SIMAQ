import React from "react";
import { 
  LayoutDashboard, BookOpen, School, Users, 
  Award, CheckSquare, BookOpenCheck, BarChart3, 
  User, LogOut, FileText, ClipboardList, BookOpenText 
} from "lucide-react";
import { Profile } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: Profile;
  onLogout: () => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onLogout,
  isDarkMode
}) => {
  const isGuru = currentUser.role === "guru";

  const renderMenuItem = (id: string, label: string, icon: React.ReactNode) => {
    const isActive = currentView === id;
    return (
      <button
        key={id}
        onClick={() => onViewChange(id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive 
            ? "bg-[#696cff] text-white shadow-md shadow-[#696cff]40" 
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        }`}
      >
        <div className={`w-5 h-5 flex items-center justify-center ${isActive ? "text-white" : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"}`}>
          {icon}
        </div>
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const renderSectionHeader = (title: string) => (
    <div className="px-4 py-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      {title}
    </div>
  );

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f202e] flex flex-col h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          🌙
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">SIMAQ</h1>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Aliyah Al-Qamar</span>
        </div>
      </div>

      {/* Profile summary */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <img
          src={currentUser.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
          alt={currentUser.nama}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-white">{currentUser.nama}</h4>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
            {currentUser.role}
          </span>
        </div>
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
            {renderMenuItem("materials", "Materi Ajar", <FileText size={18} />)}
            {renderMenuItem("assignments", "Penugasan", <ClipboardList size={18} />)}
            {renderMenuItem("journals", "Jurnal Mengajar", <BookOpenCheck size={18} />)}

            {renderSectionHeader("Laporan")}
            {renderMenuItem("reports", "Rekap Laporan", <BarChart3 size={18} />)}

            {renderSectionHeader("Pengaturan")}
            {renderMenuItem("profile", "Profil Guru", <User size={18} />)}
          </>
        ) : (
          <>
            {renderSectionHeader("Data Siswa")}
            {renderMenuItem("student-attendance", "Absensi Siswa", <CheckSquare size={18} />)}
            {renderMenuItem("student-assignments", "Tugas & Materi", <ClipboardList size={18} />)}

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
        SIMAQ v1.0.0
      </div>
    </aside>
  );
};
