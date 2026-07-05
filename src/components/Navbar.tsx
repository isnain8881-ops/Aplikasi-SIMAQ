import React, { useState, useEffect } from "react";
import { Sun, Moon, Database, HelpCircle, Bell, RefreshCw, Check, AlertCircle } from "lucide-react";
import { Profile } from "../types";
import { isSupabaseConfigured } from "../utils/db";

interface NavbarProps {
  currentUser: Profile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onShowSupabaseHelp: () => void;
  syncStatus?: "idle" | "syncing" | "success" | "error";
  onTriggerSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  onShowSupabaseHelp,
  syncStatus = "idle",
  onTriggerSync
}) => {
  const [timeStr, setTimeStr] = useState("");

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
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">SIMAQ</h2>
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

        {/* Notifications mock */}
        <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

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
