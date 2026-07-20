import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Login } from "./views/Login";
import { SupabaseHelpModal } from "./components/SupabaseHelpModal";
import { Database, Lock, Delete } from "lucide-react";

// Views import
import { DashboardGuru } from "./views/DashboardGuru";
import { DashboardSiswa } from "./views/DashboardSiswa";
import { ProfileGuru } from "./views/ProfileGuru";
import { ProfileSiswa } from "./views/ProfileSiswa";
import { SubjectsModule, ClassesModule, StudentsModule } from "./views/MasterModules";
import { GradesModule, AttendanceModule, TeachingJournalModule } from "./views/AcademicModules";
import { MaterialsModule, AssignmentsModule } from "./views/LearningModules";
import { SchedulesModule } from "./views/SchedulesModule";
import { ReportsView } from "./views/Laporan";
import { StudentModules } from "./views/StudentModules";
import { BackupRestoreView } from "./views/BackupRestore";

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

  // Custom Background State
  const [customBg, setCustomBg] = useState<string>(() => localStorage.getItem("simaq_custom_bg") || "green-original");

  // Security PIN Lockscreen States
  const savedPin = localStorage.getItem("simaq_security_pin");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => !savedPin);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);

  // Logo Customization State
  const [logoEmoji, setLogoEmoji] = useState<string>(() => localStorage.getItem("simaq_app_logo_emoji") || "🌙");
  const [logoName, setLogoName] = useState<string>(() => localStorage.getItem("simaq_app_logo_name") || "SIMAQ");
  const [logoSub, setLogoSub] = useState<string>(() => localStorage.getItem("simaq_app_logo_sub") || "Aliyah Al-Qamar");

  const handleLogoUpdate = (emoji: string, name: string, sub: string) => {
    localStorage.setItem("simaq_app_logo_emoji", emoji);
    localStorage.setItem("simaq_app_logo_name", name);
    localStorage.setItem("simaq_app_logo_sub", sub);
    setLogoEmoji(emoji);
    setLogoName(name);
    setLogoSub(sub);
  };

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

  const getBackgroundStyle = () => {
    switch (customBg) {
      case "slate-dark":
        return {
          backgroundImage: darkMode
            ? "linear-gradient(135deg, #12131c 0%, #0d0e15 100%)"
            : "linear-gradient(135deg, #f0f2f5 0%, #e4e7eb 100%)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        };
      case "blue-aurora":
        return {
          backgroundImage: darkMode
            ? "linear-gradient(135deg, #0b1528 0%, #1a0b2e 100%)"
            : "linear-gradient(135deg, #e0e8f9 0%, #f1eefb 100%)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        };
      case "sunset-glow":
        return {
          backgroundImage: darkMode
            ? "linear-gradient(135deg, #1c0f0a 0%, #2e100c 100%)"
            : "linear-gradient(135deg, #fdf4f0 0%, #fbe8df 100%)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        };
      case "ocean-breeze":
        return {
          backgroundImage: darkMode
            ? "linear-gradient(135deg, #06181b 0%, #061c24 100%)"
            : "linear-gradient(135deg, #e4f5f8 0%, #d4eff4 100%)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        };
      case "green-original":
      default:
        return {
          backgroundImage: darkMode 
            ? "linear-gradient(rgba(11, 22, 18, 0.94), rgba(11, 22, 18, 0.94)), url('/src/assets/images/clean_green_abstract_bg_1783343724360.jpg')"
            : "linear-gradient(rgba(225, 238, 230, 0.82), rgba(225, 238, 230, 0.82)), url('/src/assets/images/clean_green_abstract_bg_1783343724360.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        };
    }
  };

  const handlePinSubmit = (enteredPin: string) => {
    if (enteredPin === savedPin) {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      setPinInput("");
      setTimeout(() => setPinError(false), 1000);
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextInput = pinInput + num;
      setPinInput(nextInput);
      if (nextInput.length === 4) {
        setTimeout(() => handlePinSubmit(nextInput), 250);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const bgStyle = getBackgroundStyle();

  // If PIN is configured and not yet unlocked in session, show security overlay
  if (savedPin && !isUnlocked) {
    return (
      <div 
        style={bgStyle}
        className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-200 ${darkMode ? "dark" : ""}`}
      >
        <div className="w-full max-w-sm bg-white dark:bg-[#1f202e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#696cff]" />
          
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center text-[#696cff] mx-auto mb-4 border border-indigo-100/50 dark:border-indigo-900/40">
            <Lock size={30} className={pinError ? "animate-bounce text-red-500" : ""} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kunci PIN Keamanan</h2>
          <p className="text-xs text-gray-400 mt-1">Masukkan 4 digit PIN Anda untuk mengakses SIMAQ</p>

          <div className="flex justify-center gap-4 my-8">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pinError 
                    ? "border-red-500 bg-red-500 animate-pulse" 
                    : index < pinInput.length
                    ? "border-[#696cff] bg-[#696cff] scale-110" 
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleKeypadPress(num)}
                className="w-14 h-14 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-[#696cff]/10 dark:hover:bg-[#696cff]/20 text-gray-800 dark:text-gray-200 font-bold text-lg border border-gray-100 dark:border-gray-700/60 active:scale-95 transition-all cursor-pointer flex items-center justify-center mx-auto"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                setPinInput("");
                setPinError(false);
              }}
              className="w-14 h-14 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center mx-auto"
            >
              Clear
            </button>
            <button
              onClick={() => handleKeypadPress("0")}
              className="w-14 h-14 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-[#696cff]/10 dark:hover:bg-[#696cff]/20 text-gray-800 dark:text-gray-200 font-bold text-lg border border-gray-100 dark:border-gray-700/60 active:scale-95 transition-all cursor-pointer flex items-center justify-center mx-auto"
            >
              0
            </button>
            <button
              onClick={handleKeypadBackspace}
              className="w-14 h-14 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 active:scale-95 transition-all cursor-pointer flex items-center justify-center mx-auto"
            >
              <Delete size={18} />
            </button>
          </div>

          {pinError && (
            <p className="text-xs font-bold text-red-500 mt-4 animate-pulse">PIN salah! Silakan coba lagi.</p>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
            <button 
              onClick={() => {
                if (window.confirm("Lupa PIN? Untuk memulihkan akses, database akan direset penuh ke setelan pabrik. Seluruh data modifikasi Anda akan terhapus secara permanen. Lanjutkan?")) {
                  db.factoryReset();
                  window.location.reload();
                }
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all cursor-pointer uppercase tracking-wider"
            >
              Lupa PIN? Reset Aplikasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div 
        style={bgStyle}
        className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark" : ""}`}
      >
        <Login 
          onLoginSuccess={(user) => {
            setSessionUser(user);
            localStorage.setItem("simaq_active_session", JSON.stringify(user));
            localStorage.setItem("simaq_current_user", JSON.stringify(user));
          }} 
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(prev => !prev)}
          logoEmoji={logoEmoji}
          logoName={logoName}
          logoSub={logoSub}
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
          return <DashboardGuru isDarkMode={darkMode} onViewChange={(view) => setCurrentView(view)} />;
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
        case "schedules":
          return <SchedulesModule />;
        case "journals":
        case "journal":
          return <TeachingJournalModule />;
        case "materials":
          return <MaterialsModule />;
        case "assignments":
          return <AssignmentsModule />;
        case "reports":
          return <ReportsView />;
        case "backup-restore":
          return <BackupRestoreView />;
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
          return <StudentModules currentStudent={currentStudentEntity!} initialTab="attendance" />;
        case "student-materials":
        case "materials":
          return <StudentModules currentStudent={currentStudentEntity!} initialTab="materials" />;
        case "student-assignments":
        case "assignments":
          return <StudentModules currentStudent={currentStudentEntity!} initialTab="assignments" />;
        case "student-grades":
        case "grades":
          return <StudentModules currentStudent={currentStudentEntity!} initialTab="grades" />;
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
    <div 
      style={bgStyle}
      className={`min-h-screen flex text-slate-800 dark:text-slate-100 transition-colors duration-200 ${
        darkMode ? "dark" : ""
      }`}
    >
      
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
        logoEmoji={logoEmoji}
        logoName={logoName}
        logoSub={logoSub}
        onLogoUpdate={handleLogoUpdate}
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
          onViewChange={(view) => setCurrentView(view)}
          logoName={logoName}
        />

        {/* MAIN VIEWS INJECTOR PORT */}
        <main className="flex-1 p-4 md:p-6 space-y-6 w-full">
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
