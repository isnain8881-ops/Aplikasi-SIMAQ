import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Login } from "./views/Login";
import { SupabaseHelpModal } from "./components/SupabaseHelpModal";
import { Database } from "lucide-react";

// Views import
import { DashboardGuru } from "./views/DashboardGuru";
import { DashboardSiswa } from "./views/DashboardSiswa";
import { ProfileGuru } from "./views/ProfileGuru";
import { ProfileSiswa } from "./views/ProfileSiswa";
import { SubjectsModule, ClassesModule, StudentsModule } from "./views/MasterModules";
import { GradesModule, AttendanceModule, TeachingJournalModule } from "./views/AcademicModules";
import { MaterialsModule, AssignmentsModule } from "./views/LearningModules";
import { ReportsView } from "./views/Laporan";
import { StudentModules } from "./views/StudentModules";

import { db } from "./utils/db";
import { Profile, Student } from "./types";

export default function App() {
  // 1. Dark Mode / Visual theme synchronization
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("simaq_dark_mode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("simaq_dark_mode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 2. Auth State (Guru vs Siswa session)
  const [sessionUser, setSessionUser] = useState<Profile | null>(() => {
    const cached = localStorage.getItem("simaq_current_user") || localStorage.getItem("simaq_active_session");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Current subview route
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [supabaseHelpOpen, setSupabaseHelpOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [activeError, setActiveError] = useState<string | null>(null);

  // Subscribe to global database error listeners
  useEffect(() => {
    const unsubscribe = db.addErrorListener((msg) => {
      setActiveError(msg);
    });
    return unsubscribe;
  }, []);

  // Auto handle reset view on session log
  useEffect(() => {
    setCurrentView("dashboard");
  }, [sessionUser?.role]);

  // Synchronize with Supabase automatically on mount/login
  const handleTriggerSync = async () => {
    if (!db.isSupabaseConfigured()) return;
    setSyncStatus("syncing");
    const res = await db.syncBidirectional();
    if (res.success) {
      setSyncStatus("success");
      // Briefly show success status then refresh to load new local state
      setTimeout(() => {
        setSyncStatus("idle");
      }, 2500);
    } else {
      setSyncStatus("error");
      setTimeout(() => {
        setSyncStatus("idle");
      }, 3000);
    }
  };

  useEffect(() => {
    if (sessionUser && db.isSupabaseConfigured()) {
      handleTriggerSync();
    }
  }, [sessionUser?.id]);

  // Handle Log out action
  const handleLogout = () => {
    localStorage.removeItem("simaq_active_session");
    localStorage.removeItem("simaq_current_user");
    db.logout();
    setSessionUser(null);
  };

  // Profile update reload trigger
  const handleProfileUpdated = (updatedProfile: Profile) => {
    setSessionUser(updatedProfile);
    localStorage.setItem("simaq_active_session", JSON.stringify(updatedProfile));
    localStorage.setItem("simaq_current_user", JSON.stringify(updatedProfile));
    db.updateCurrentUser(updatedProfile);
  };

  if (!sessionUser) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-[#11121d]" : "bg-[#f5f5f9]"}`}>
        <Login 
          onLoginSuccess={(user) => {
            setSessionUser(user);
            localStorage.setItem("simaq_active_session", JSON.stringify(user));
            localStorage.setItem("simaq_current_user", JSON.stringify(user));
          }} 
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
        />
      </div>
    );
  }

  // Retrieve current student profile if role is 'siswa'
  let currentStudentEntity: Student | undefined = undefined;
  if (sessionUser.role === "siswa") {
    // Lookup student profile matching the email or name
    currentStudentEntity = db.getStudents().find(s => s.nis === sessionUser.nip_nisn) || {
      id: "std-demo",
      nis: sessionUser.nip_nisn,
      nama_lengkap: sessionUser.nama,
      jenis_kelamin: "Laki-laki",
      tempat_lahir: "Makassar",
      tanggal_lahir: "2007-08-08",
      alamat: "Gowa, Sulawesi Selatan",
      hp_ortu: sessionUser.hp,
      kelas_id: "cls-1" // default fallback
    };
  }

  // Routing render switcher based on role and active tab select
  const renderMainViewContent = () => {
    if (sessionUser.role === "guru") {
      switch (currentView) {
        case "dashboard":
          return <DashboardGuru isDarkMode={darkMode} />;
        case "subjects":
          return <SubjectsModule />;
        case "classes":
          return <ClassesModule />;
        case "students":
          return <StudentsModule />;
        case "grades":
          return <GradesModule />;
        case "attendance":
          return <AttendanceModule />;
        case "journals":
        case "journal":
          return <TeachingJournalModule />;
        case "materials":
          return <MaterialsModule />;
        case "assignments":
          return <AssignmentsModule />;
        case "reports":
          return <ReportsView />;
        case "profile":
          return (
            <ProfileGuru 
              currentGuru={sessionUser} 
              onProfileUpdated={handleProfileUpdated} 
            />
          );
        default:
          return <DashboardGuru isDarkMode={darkMode} />;
      }
    } else {
      // Siswa role view routing
      switch (currentView) {
        case "dashboard":
          return (
            <DashboardSiswa 
              onViewChange={(view) => setCurrentView(view)} 
            />
          );
        case "student-attendance":
        case "attendance":
          return <StudentModules currentStudent={currentStudentEntity!} />;
        case "student-assignments":
        case "assignments":
          return <StudentModules currentStudent={currentStudentEntity!} />;
        case "student-profile":
        case "profile":
          return (
            <ProfileSiswa 
              currentStudent={currentStudentEntity!} 
              onProfileUpdated={(updated) => {
                // Update profile session wrapper
                handleProfileUpdated({
                  ...sessionUser,
                  nama: updated.nama_lengkap,
                  nip_nisn: updated.nis,
                  hp: updated.hp_ortu
                });
              }} 
            />
          );
        default:
          return (
            <DashboardSiswa 
              onViewChange={(view) => setCurrentView(view)} 
            />
          );
      }
    }
  };

  return (
    <div className={`min-h-screen flex text-slate-800 dark:text-slate-100 transition-colors duration-200 ${
      darkMode ? "dark bg-[#11121d]" : "bg-[#f5f5f9]"
    }`}>
      
      {/* 1. SIDEBAR */}
      <Sidebar
        currentUser={sessionUser}
        currentView={currentView}
        onViewChange={(view) => {
          if (view === "logout") {
            handleLogout();
          } else {
            setCurrentView(view);
          }
        }}
        onLogout={handleLogout}
        isDarkMode={darkMode}
      />

      {/* 2. MAIN SHELL SECTION (NAVBAR + CONTENT AREA + FOOTER) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP SYSTEM NAVBAR */}
        <Navbar
          currentUser={sessionUser}
          isDarkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          onShowSupabaseHelp={() => setSupabaseHelpOpen(true)}
          syncStatus={syncStatus}
          onTriggerSync={handleTriggerSync}
        />

        {/* MAIN VIEWS INJECTOR PORT */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {renderMainViewContent()}
        </main>

        {/* REUSABLE SNEAT FOOTER */}
        <Footer />
      </div>

      <SupabaseHelpModal 
        isOpen={supabaseHelpOpen} 
        onClose={() => setSupabaseHelpOpen(false)} 
      />

      {/* Supabase Error Toast Alert */}
      {activeError && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-md w-full bg-white dark:bg-[#1f202e] border-l-4 border-amber-500 shadow-2xl rounded-xl p-4 flex gap-3 border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="text-amber-500 mt-1 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Pemberitahuan Sinkronisasi Supabase</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{activeError}</p>
            <div className="flex gap-2 mt-3">
              <button
                id="btn-toast-supabase-help"
                onClick={() => {
                  setSupabaseHelpOpen(true);
                  setActiveError(null);
                }}
                className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Database size={12} />
                Bantuan Supabase
              </button>
              <button
                id="btn-toast-dismiss"
                onClick={() => setActiveError(null)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Sembunyikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
