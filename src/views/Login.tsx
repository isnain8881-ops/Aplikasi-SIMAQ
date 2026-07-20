import React, { useState } from "react";
import { LogIn, Key, Mail, ShieldAlert, ArrowRight, UserCheck, Eye, EyeOff, GraduationCap } from "lucide-react";
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
  // Guru login & reset states
  const [guruEmail, setGuruEmail] = useState("");
  const [guruPassword, setGuruPassword] = useState("");
  const [showGuruPassword, setShowGuruPassword] = useState(false);
  const [guruLoading, setGuruLoading] = useState(false);
  const [guruError, setGuruError] = useState("");
  const [isGuruResetMode, setIsGuruResetMode] = useState(false);
  const [guruResetEmail, setGuruResetEmail] = useState("");
  const [guruResetMessage, setGuruResetMessage] = useState("");
  const [guruResetError, setGuruResetError] = useState("");

  // Siswa login & reset states
  const [siswaEmail, setSiswaEmail] = useState("");
  const [siswaPassword, setSiswaPassword] = useState("");
  const [showSiswaPassword, setShowSiswaPassword] = useState(false);
  const [siswaLoading, setSiswaLoading] = useState(false);
  const [siswaError, setSiswaError] = useState("");
  const [isSiswaResetMode, setIsSiswaResetMode] = useState(false);
  const [siswaResetEmail, setSiswaResetEmail] = useState("");
  const [siswaResetMessage, setSiswaResetMessage] = useState("");
  const [siswaResetError, setSiswaResetError] = useState("");

  const [rememberMe, setRememberMe] = useState(true);

  const handleGuruLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuruError("");
    setGuruLoading(true);

    try {
      const res = await db.login(guruEmail, guruPassword, "guru");
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setGuruError(res.error || "Gagal masuk. Periksa kembali email dan kata sandi Guru.");
      }
    } catch (err: any) {
      setGuruError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setGuruLoading(false);
    }
  };

  const handleSiswaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiswaError("");
    setSiswaLoading(true);

    try {
      const res = await db.login(siswaEmail, siswaPassword, "siswa");
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setSiswaError(res.error || "Gagal masuk. Periksa kembali email/NISN dan kata sandi Siswa.");
      }
    } catch (err: any) {
      setSiswaError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setSiswaLoading(false);
    }
  };

  const handleGuruResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setGuruResetError("");
    setGuruResetMessage("");

    if (!guruResetEmail) {
      setGuruResetError("Email harus diisi.");
      return;
    }

    setGuruResetMessage(`Tautan pengaturan ulang sandi telah dikirim ke ${guruResetEmail}. Silakan periksa kotak masuk Guru.`);
  };

  const handleSiswaResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSiswaResetError("");
    setSiswaResetMessage("");

    if (!siswaResetEmail) {
      setSiswaResetError("Email harus diisi.");
      return;
    }

    setSiswaResetMessage(`Tautan pengaturan ulang sandi telah dikirim ke ${siswaResetEmail}. Silakan periksa kotak masuk Siswa.`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] dark:bg-[#11111e] flex flex-col justify-center items-center p-4 transition-colors duration-200">
      
      {/* Theme Toggler top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
        >
          {isDarkMode ? "☀️ Terang" : "🌙 Gelap"}
        </button>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8 mt-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] font-bold text-2xl mb-3 shadow-inner">
          {logoEmoji}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{logoName}</h1>
        <p className="text-sm text-gray-400 mt-1">{logoSub}</p>
        <p className="text-xs text-gray-400/80 mt-1 max-w-md mx-auto">
          Silakan masukkan kredensial Anda pada kotak masuk yang sesuai dengan peran Anda di Madrasah.
        </p>
      </div>

      {/* Grid of Two Distinct Login Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 pb-16">
        
        {/* ==================== BOX 1: GURU PORTAL ==================== */}
        <div className="bg-white dark:bg-[#1f202e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/80 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#696cff]" />
          
          {!isGuruResetMode ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Portal Guru</h3>
                  <p className="text-xs text-gray-400">Kelola nilai, presensi, & akademik</p>
                </div>
              </div>

              {guruError && (
                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2.5">
                  <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{guruError}</span>
                </div>
              )}

              <form onSubmit={handleGuruLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email Guru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={guruEmail}
                      onChange={(e) => setGuruEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                      placeholder="contoh: isnain8881@gmail.com"
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
                      onClick={() => setIsGuruResetMode(true)}
                      className="text-xs font-semibold text-[#696cff] hover:underline cursor-pointer"
                    >
                      Lupa Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Key size={16} />
                    </div>
                    <input
                      type={showGuruPassword ? "text" : "password"}
                      required
                      value={guruPassword}
                      onChange={(e) => setGuruPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                      placeholder="Masukkan kata sandi guru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuruPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      title={showGuruPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showGuruPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#696cff] focus:ring-[#696cff] border-gray-300 dark:border-gray-700 dark:bg-slate-900"
                    />
                    <span>Ingat Saya</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={guruLoading}
                  className="w-full py-3 bg-[#696cff] hover:bg-[#5f61e6] active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#696cff]/30 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {guruLoading ? "Menghubungkan..." : "Masuk Sebagai Guru"}
                  <LogIn size={16} />
                </button>
              </form>
            </div>
          ) : (
            /* Reset Password Guru */
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lupa Sandi Guru?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Masukkan alamat email Guru terdaftar untuk mengirimkan instruksi penyetelan ulang kata sandi.
              </p>

              {guruResetError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                  {guruResetError}
                </div>
              )}

              {guruResetMessage && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
                  {guruResetMessage}
                </div>
              )}

              <form onSubmit={handleGuruResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Alamat Email Guru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={guruResetEmail}
                      onChange={(e) => setGuruResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                      placeholder="contoh: isnain8881@gmail.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  Kirim Tautan Atur Ulang
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGuruResetMode(false);
                    setGuruResetMessage("");
                    setGuruResetError("");
                  }}
                  className="w-full py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Kembali ke Portal Guru
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ==================== BOX 2: SISWA PORTAL ==================== */}
        <div className="bg-white dark:bg-[#1f202e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/80 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#03c3ec]" />
          
          {!isSiswaResetMode ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Portal Siswa</h3>
                  <p className="text-xs text-gray-400">Laporan belajar, materi, & tugas siswa</p>
                </div>
              </div>

              {siswaError && (
                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2.5">
                  <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{siswaError}</span>
                </div>
              )}

              <form onSubmit={handleSiswaLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    NISN atau Email Siswa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={siswaEmail}
                      onChange={(e) => setSiswaEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#03c3ec] focus:outline-none focus:ring-1 focus:ring-[#03c3ec] text-gray-900 dark:text-white transition-all"
                      placeholder="contoh: NISN (misal: 0041234567) atau Email"
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
                      onClick={() => setIsSiswaResetMode(true)}
                      className="text-xs font-semibold text-[#03c3ec] hover:underline cursor-pointer"
                    >
                      Lupa Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Key size={16} />
                    </div>
                    <input
                      type={showSiswaPassword ? "text" : "password"}
                      required
                      value={siswaPassword}
                      onChange={(e) => setSiswaPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#03c3ec] focus:outline-none focus:ring-1 focus:ring-[#03c3ec] text-gray-900 dark:text-white transition-all"
                      placeholder="Masukkan kata sandi siswa"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSiswaPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      title={showSiswaPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showSiswaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#03c3ec] focus:ring-[#03c3ec] border-gray-300 dark:border-gray-700 dark:bg-slate-900"
                    />
                    <span>Ingat Saya</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={siswaLoading}
                  className="w-full py-3 bg-[#03c3ec] hover:bg-[#02afd4] active:scale-[0.98] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#03c3ec]/30 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {siswaLoading ? "Menghubungkan..." : "Masuk Sebagai Siswa"}
                  <LogIn size={16} />
                </button>
              </form>
            </div>
          ) : (
            /* Reset Password Siswa */
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lupa Sandi Siswa?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Masukkan alamat email atau NISN Siswa terdaftar untuk mengirimkan instruksi penyetelan ulang kata sandi.
              </p>

              {siswaResetError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                  {siswaResetError}
                </div>
              )}

              {siswaResetMessage && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
                  {siswaResetMessage}
                </div>
              )}

              <form onSubmit={handleSiswaResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Alamat Email / NISN Siswa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={siswaResetEmail}
                      onChange={(e) => setSiswaResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#03c3ec] focus:outline-none focus:ring-1 focus:ring-[#03c3ec] text-gray-900 dark:text-white transition-all"
                      placeholder="contoh: NISN atau Email terdaftar"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#03c3ec] hover:bg-[#02afd4] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  Kirim Tautan Atur Ulang
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSiswaResetMode(false);
                    setSiswaResetMessage("");
                    setSiswaResetError("");
                  }}
                  className="w-full py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Kembali ke Portal Siswa
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

