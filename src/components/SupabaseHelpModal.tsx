import React, { useState } from "react";
import { Database, Copy, Check, ExternalLink, X, Wifi, WifiOff, Trash2, Save } from "lucide-react";
import { SUPABASE_SQL_SCHEMA, db } from "../utils/db";

interface SupabaseHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseHelpModal: React.FC<SupabaseHelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Custom connection state
  const [inputUrl, setInputUrl] = useState(() => localStorage.getItem("simaq_supabase_url") || "");
  const [inputKey, setInputKey] = useState(() => localStorage.getItem("simaq_supabase_anon_key") || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isConfigured = db.isSupabaseConfigured();
  const isCustomActive = !!localStorage.getItem("simaq_supabase_url");

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envText = `VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"\nVITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      alert("Harap isi URL dan Anon Key Supabase.");
      return;
    }
    db.saveCustomSupabaseKeys(inputUrl.trim(), inputKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleClearCustom = () => {
    if (window.confirm("Yakin ingin menghapus konfigurasi kustom dan kembali ke pengaturan bawaan?")) {
      db.clearCustomSupabaseKeys();
      setInputUrl("");
      setInputKey("");
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1f202e] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] rounded-xl">
              <Database size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Koneksi Database Supabase</h3>
              <p className="text-xs text-gray-400">Sinkronisasikan data SIMAQ Anda secara real-time di seluruh perangkat.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-gray-600 dark:text-gray-300">
          
          {/* Status Koneksi */}
          <div className="p-4 rounded-xl border flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-900/30 border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {isConfigured ? (
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <Wifi size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <WifiOff size={20} />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Status Database: {isConfigured ? (
                    <span className="text-emerald-500 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30">Terhubung</span>
                  ) : (
                    <span className="text-amber-500 text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30">Mode Lokal (Offline)</span>
                  )}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isConfigured 
                    ? `Aplikasi terhubung ke database online Supabase ${isCustomActive ? "(Konfigurasi Browser Ini)" : "(Konfigurasi Server)"}.` 
                    : "Data disimpan secara lokal di browser ini. Hubungkan Supabase untuk kolaborasi multi-perangkat."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Connection Config Form (Browser-Based Input) */}
          <div className="p-5 rounded-2xl border border-indigo-100/80 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                🚀 Hubungkan Cepat di Perangkat/Browser Ini
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Gunakan formulir ini untuk menghubungkan database Supabase Anda langsung dari browser ini. Sangat berguna agar data tetap tersinkronisasi di berbagai perangkat saat mengakses URL publik yang sudah dipublish tanpa kembali ke pengaturan awal!
              </p>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://YOUR_PROJECT_REF.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Supabase Anon Public Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#696cff] focus:outline-none focus:ring-1 focus:ring-[#696cff] text-gray-900 dark:text-white transition-all font-mono"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:bg-emerald-500"
                >
                  {saveSuccess ? (
                    <>
                      <Check size={14} /> Tersambung! Memuat Ulang...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Simpan & Hubungkan Database
                    </>
                  )}
                </button>

                {isCustomActive && (
                  <button
                    type="button"
                    onClick={handleClearCustom}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Trash2 size={14} /> Hapus Kustom
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Step-by-Step Manual Config Help (Accordion/Documentation style) */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-5">
            <h4 className="font-bold text-gray-900 dark:text-white">
              Aturan Awal / Langkah Migrasi Mandiri
            </h4>

            {/* Step 1 */}
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
                Buat Project Supabase Baru
              </h5>
              <p className="pl-7 text-xs">
                Masuk ke <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#696cff] hover:underline inline-flex items-center gap-0.5">Supabase Console <ExternalLink size={10} /></a>, buat project baru, dan dapatkan Project URL beserta Anon Key Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
                Atur Environment Variables (Khusus Administrator)
              </h5>
              <p className="pl-7 text-xs">
                Agar tersambung secara otomatis untuk semua pengguna, atur environment variables bawaan melalui file <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400">.env</code> atau tab Secrets di menu AI Studio dengan kunci berikut:
              </p>
              <div className="pl-7">
                <div className="relative">
                  <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl font-mono text-xs overflow-x-auto border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                    {`VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"`}
                  </pre>
                  <button
                    onClick={handleCopyEnv}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    {copiedEnv ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
                Jalankan Script SQL di Supabase SQL Editor
              </h5>
              <p className="pl-7 text-xs">
                Buka menu <b>SQL Editor</b> di dashboard Supabase Anda, buat kueri baru (New Query), tempelkan kode skema lengkap berikut, dan klik <b>RUN</b>. Skema ini wajib dijalankan agar seluruh tabel data SIMAQ terbentuk dengan tipe kolom TEXT ID yang kompatibel.
              </p>
              <div className="pl-7">
                <div className="relative">
                  <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl font-mono text-xs overflow-y-auto h-48 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    {copiedSql ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#696cff] text-white text-sm font-semibold rounded-xl hover:bg-[#5f61e6] transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
