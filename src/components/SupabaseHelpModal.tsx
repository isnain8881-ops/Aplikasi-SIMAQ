import React, { useState } from "react";
import { Database, Copy, Check, ExternalLink, X } from "lucide-react";
import { SUPABASE_SQL_SCHEMA } from "../utils/db";

interface SupabaseHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseHelpModal: React.FC<SupabaseHelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Konfigurasi Database Supabase</h3>
              <p className="text-xs text-gray-400">Ikuti langkah-langkah di bawah untuk menghubungkan database Supabase Anda sendiri.</p>
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
          {/* Step 1 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
              Buat Project Supabase Baru
            </h4>
            <p className="pl-7 text-xs">
              Masuk ke <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#696cff] hover:underline inline-flex items-center gap-0.5">Supabase Console <ExternalLink size={10} /></a>, buat project baru, dan salin Project URL dan Anon Key Anda.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
              Atur Environment Variables
            </h4>
            <p className="pl-7 text-xs">
              Buat file baru bernama <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400">.env</code> pada direktori root proyek ini atau gunakan panel konfigurasi secrets di AI Studio, lalu masukkan kunci berikut:
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
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
              Jalankan Script SQL di Supabase SQL Editor
            </h4>
            <p className="pl-7 text-xs">
              Buka menu <b>SQL Editor</b> di dashboard Supabase Anda, buat kueri baru (New Query), tempelkan kode skema berikut, dan klik <b>RUN</b>. Skema ini akan membuat semua tabel (profiles, subjects, classes, students, grades, dll.) yang diperlukan oleh SIMAQ.
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
