import React, { useState } from "react";
import { LogIn, Key, Mail, ShieldAlert, ArrowRight, UserCheck, Eye, EyeOff } from "lucide-react";
import { db } from "../utils/db";
import { Profile } from "../types";

interface LoginProps {
  onLoginSuccess: (user: Profile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  logoEmoji?: string;
  logoName?: string;
  logoSub?: string;
}

export const Login: React.FC<LoginProps> = ({ 
  onLoginSuccess, 
  isDarkMode, 
  onToggleDarkMode,
  logoEmoji = "🌙",
  logoName = "SIMAQ",
  logoSub = "Aliyah Al-Qamar"
}) => {
  const [role, setRole] = useState<"guru" | "siswa">("guru");
  const [email, setEmail] = useState("isnain8881@gmail.com");
  const [password, setPassword] = useState("isnain123");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Reset Password State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await db.login(email, password, role);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (!resetEmail) {
      setResetError("Email harus diisi.");
      return;
    }

    // Mock reset password success
    setResetMessage(`Tautan pengaturan ulang sandi telah dikirim ke ${resetEmail}. Silakan periksa kotak masuk Anda.`);
  };

  const handleQuickLogin = (selectedRole: "guru" | "siswa") => {
    setRole(selectedRole);
    if (selectedRole === "guru") {
      setEmail("isnain8881@gmail.com");
      setPassword("isnain123");
    } else {
      // Siswa login details (pre-seeded NISN or Email)
      setEmail("isnain8881@gmail.com"); // Using user's requested student email/profile
      setPassword("siswa123");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] dark:bg-[#11111e] flex flex-col justify-center items-center p-4 transition-colors duration-200">
      
      {/* Theme Toggler top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 transition-all shadow-sm"
        >
          {isDarkMode ? "☀️ Terang" : "🌙 Gelap"}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#1f202e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/80 p-8 relative overflow-hidden">
        {/* Sleek top backdrop line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#696cff]" />

        {/* Brand Header */}
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] font-bold text-2xl mb-3 shadow-inner">
            {logoEmoji}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{logoName}</h1>
          <p className="text-sm text-gray-400 mt-1">{logoSub}</p>
        </div>

        {!isResetMode ? (
          <>
            {/* Role Tab Selector */}
            <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setRole("guru"); setEmail("isnain8881@gmail.com"); setPassword("isnain123"); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  role === "guru"
                    ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                MASUK GURU
              </button>
              <button
                type="button"
                onClick={() => { setRole("siswa"); setEmail("isnain8881@gmail.com"); setPassword("siswa123"); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  role === "siswa"
                    ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                MASUK SISWA
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Alamat Email / NISN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                    placeholder={role === "guru" ? "isnain8881@gmail.com" : "Email atau NISN"}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-xs font-semibold text-[#696cff] hover:underline"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Key size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                    placeholder="Masukkan kata sandi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Login & Session Option */}
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#696cff] focus:ring-[#696cff] border-gray-300 dark:border-gray-700 dark:bg-slate-900"
                  />
                  <span>Ingat Saya (Remember Login)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#696cff] hover:bg-[#5f61e6] active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#696cff]30 transition-all duration-150 disabled:opacity-50"
              >
                {loading ? "Menghubungkan..." : "Masuk Aplikasi"}
                <LogIn size={16} />
              </button>
            </form>

            {/* Quick Demo Login Guides */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <span className="block text-center text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                Uji Coba Akun & Kata Sandi
              </span>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("guru")}
                  className="flex flex-col items-center p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-[#696cff] dark:hover:border-[#696cff] bg-gray-50/50 dark:bg-slate-900/30 text-center transition-all group"
                >
                  <UserCheck size={16} className="text-[#696cff] mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Guru (Isnain, S.Pd)</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1">isnain8881@gmail.com</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Sandi: isnain123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("siswa")}
                  className="flex flex-col items-center p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-[#696cff] dark:hover:border-[#696cff] bg-gray-50/50 dark:bg-slate-900/30 text-center transition-all group"
                >
                  <UserCheck size={16} className="text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Siswa (Al-Fatih)</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1">isnain8881@gmail.com</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Sandi: siswa123</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 leading-normal mt-2 px-1">
                *Klik salah satu tombol di atas untuk mengisi otomatis data login. Jika menggunakan database Supabase sendiri, pastikan akun-akun dengan email dan sandi di atas telah dibuat di Supabase Auth Anda.
              </p>
            </div>
          </>
        ) : (
          /* Reset Password Panel */
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lupa Kata Sandi?</h3>
            <p className="text-xs text-gray-400">
              Masukkan alamat email terdaftar Anda di bawah ini dan kami akan mengirimkan instruksi untuk menyetel ulang kata sandi Anda.
            </p>

            {resetError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                    placeholder="isnain8881@gmail.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Kirim Tautan Atur Ulang
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setResetMessage("");
                  setResetError("");
                }}
                className="w-full py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all"
              >
                Kembali ke Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
