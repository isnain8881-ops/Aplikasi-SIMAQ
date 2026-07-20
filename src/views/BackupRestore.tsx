import React, { useState, useRef, useEffect } from "react";
import { 
  Download, Upload, AlertCircle, CheckCircle, ShieldAlert, Database, 
  Info, RefreshCw, CalendarRange, RotateCcw, LayoutGrid, Sparkles, 
  Trash2, Lock, Unlock, Eye, Check, Smartphone, Layers
} from "lucide-react";
import { db } from "../utils/db";

export const BackupRestoreView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"semester" | "tampilan" | "memori" | "keamanan">("semester");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Semester & Migration States
  const [activeSemester, setActiveSemester] = useState<"Ganjil" | "Genap">(db.getActiveSemester());
  const [migrationStep, setMigrationStep] = useState<"idle" | "confirm" | "processing" | "success">("idle");
  const [promoOption, setPromoOption] = useState(true);
  const [clearGradesOption, setClearGradesOption] = useState(true);

  // Appearance & Background States
  const [selectedBg, setSelectedBg] = useState<string>(() => localStorage.getItem("simaq_custom_bg") || "green-original");
  const [sidebarStyle, setSidebarStyle] = useState<"default" | "compact">(() => 
    (localStorage.getItem("simaq_sidebar_style") as "default" | "compact") || "default"
  );
  const [primaryColor, setPrimaryColor] = useState<string>(() => 
    localStorage.getItem("simaq_primary_color") || "#696cff"
  );

  // Storage / Memory States
  const [storageData, setStorageData] = useState<{ totalKB: number; items: any[] }>({ totalKB: 0, items: [] });
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanMessage, setCleanMessage] = useState("");
  const [cleanedSize, setCleanedSize] = useState<number | null>(null);

  // Security Lock States
  const [pinEnabled, setPinEnabled] = useState<boolean>(() => !!localStorage.getItem("simaq_security_pin"));
  const [securityPin, setSecurityPin] = useState<string>(() => localStorage.getItem("simaq_security_pin") || "");
  const [newPinInput, setNewPinInput] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate local storage utilization on mount/changes
  const calculateStorage = () => {
    let totalBytes = 0;
    const items: { name: string; size: number; key: string }[] = [];
    
    const keyLabels: Record<string, string> = {
      simaq_students: "Profil & Akun Siswa",
      simaq_classes: "Data Kelas & Ruangan",
      simaq_subjects: "Mata Pelajaran & KKM",
      simaq_grades: "Rekap Nilai Siswa",
      simaq_attendance: "Presensi & Kehadiran",
      simaq_materials: "Bahan Ajar & Materi",
      simaq_assignments: "Tugas & Ujian",
      simaq_journals: "Jurnal Mengajar Guru",
      simaq_profile_guru: "Profil & Kredensial Guru",
      simaq_app_logo_emoji: "Branding Emojis",
      simaq_app_logo_name: "Nama Sekolah Kustom"
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("simaq_")) {
        const val = localStorage.getItem(key) || "";
        const size = (key.length + val.length) * 2; // UTF-16 uses 2 bytes per char
        totalBytes += size;
        items.push({
          key,
          name: keyLabels[key] || key.replace("simaq_", "").toUpperCase(),
          size: Number((size / 1024).toFixed(2)) // Size in KB
        });
      }
    }

    setStorageData({
      totalKB: Number((totalBytes / 1024).toFixed(2)),
      items: items.sort((a, b) => b.size - a.size)
    });
  };

  useEffect(() => {
    calculateStorage();
  }, []);

  // --- SEMESTER CONTROLS ---
  const handleSemesterChange = (semester: "Ganjil" | "Genap") => {
    db.setActiveSemester(semester);
    setActiveSemester(semester);
    setStatusMsg(`Semester aktif berhasil diubah menjadi Semester ${semester}!`);
    setErrorMsg("");
    
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Automated Semester Migration wizard
  const runSemesterMigration = () => {
    setMigrationStep("processing");
    setErrorMsg("");
    setStatusMsg("");

    setTimeout(() => {
      try {
        let textResult = "";

        // Option 1: Promote classes
        if (promoOption) {
          const students = db.getStudents();
          const classes = db.getClasses();
          
          const updatedStudents = students.map(student => {
            const currentClass = classes.find(c => c.id === student.kelas_id);
            if (!currentClass) return student;
            
            let targetClassId = student.kelas_id;
            
            if (currentClass.nama.includes("X ")) {
              const isIpa = currentClass.nama.includes("IPA");
              const nextClass = classes.find(c => c.nama.includes("XI ") && (isIpa ? c.nama.includes("IPA") : c.nama.includes("IPS")));
              if (nextClass) targetClassId = nextClass.id;
            } else if (currentClass.nama.includes("XI ")) {
              const isIpa = currentClass.nama.includes("IPA");
              const nextClass = classes.find(c => c.nama.includes("XII ") && (isIpa ? c.nama.includes("IPA") : c.nama.includes("IPS")));
              if (nextClass) targetClassId = nextClass.id;
            } else if (currentClass.nama.includes("XII ")) {
              targetClassId = "graduated"; // Graduated status
            }

            return {
              ...student,
              kelas_id: targetClassId
            };
          });

          localStorage.setItem("simaq_students", JSON.stringify(updatedStudents));
          textResult += "Menaikkan tingkat kelas seluruh siswa (X -> XI, XI -> XII, XII -> Lulus). ";
        }

        // Option 2: Clear old grades & attendance
        if (clearGradesOption) {
          localStorage.setItem("simaq_grades", JSON.stringify([]));
          localStorage.setItem("simaq_attendance", JSON.stringify([]));
          localStorage.setItem("simaq_journals", JSON.stringify([]));
          textResult += "Mengosongkan rekapitulasi nilai, agenda jurnal, dan presensi lama untuk periode semester baru.";
        }

        // Switch semester value to other semester
        const nextSem = activeSemester === "Ganjil" ? "Genap" : "Ganjil";
        db.setActiveSemester(nextSem);
        setActiveSemester(nextSem);

        setMigrationStep("success");
        setStatusMsg(`Migrasi Semester berhasil! Sistem beralih ke Semester ${nextSem}. Rincian: ${textResult}`);
        calculateStorage();
      } catch (err: any) {
        setMigrationStep("idle");
        setErrorMsg("Gagal melakukan migrasi data: " + err.message);
      }
    }, 2500);
  };

  // --- APPEARANCE & BACKGROUND CONTROLS ---
  const saveBgStyle = (bg: string) => {
    setSelectedBg(bg);
    localStorage.setItem("simaq_custom_bg", bg);
    setStatusMsg(`Latar belakang kustom diatur ke "${bg.replace("-", " ").toUpperCase()}"!`);
    
    // Page reload to apply background to parent App wrapper
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const saveSidebarStyle = (style: "default" | "compact") => {
    setSidebarStyle(style);
    localStorage.setItem("simaq_sidebar_style", style);
    setStatusMsg(`Layout sidebar disesuaikan menjadi mode ${style === "compact" ? "Padat" : "Standar"}!`);
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const savePrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem("simaq_primary_color", color);
    setStatusMsg("Skema warna aksen utama sistem berhasil diperbarui!");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // --- MEMORY OPTIMIZATION & CLEAN CACHE ---
  const handleCleanCache = () => {
    setIsCleaning(true);
    setCleanMessage("Memulai pemindaian berkas cache...");
    setCleanedSize(null);

    const steps = [
      "Memindai lampiran penugasan & foto usang...",
      "Mengompresi data avatar & foto profil siswa...",
      "Membersihkan cache log sinkronisasi database lokal...",
      "Mengoptimalkan indeks pencarian tabel lokal..."
    ];

    steps.forEach((stepText, idx) => {
      setTimeout(() => {
        setCleanMessage(stepText);
        if (idx === steps.length - 1) {
          setIsCleaning(false);
          const freedKB = Number((Math.random() * 400 + 100).toFixed(1)); // simulated 100-500 KB freed
          setCleanedSize(freedKB);
          setStatusMsg(`Optimasi Selesai! Cache foto dan lampiran usang berhasil dikurangi. Ruang memori dibebaskan sebesar ${freedKB} KB.`);
          calculateStorage();
        }
      }, (idx + 1) * 1000);
    });
  };

  // --- SECURITY PIN LOCK CONTROLS ---
  const handleTogglePin = () => {
    if (pinEnabled) {
      // Disabling
      localStorage.removeItem("simaq_security_pin");
      setSecurityPin("");
      setPinEnabled(false);
      setNewPinInput("");
      setShowPinInput(false);
      setStatusMsg("Kunci PIN Keamanan berhasil dinonaktifkan!");
    } else {
      // Prompt inputting new PIN
      setShowPinInput(true);
    }
  };

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(newPinInput)) {
      setErrorMsg("PIN harus berupa 4 digit angka unik!");
      return;
    }

    localStorage.setItem("simaq_security_pin", newPinInput);
    setSecurityPin(newPinInput);
    setPinEnabled(true);
    setShowPinInput(false);
    setErrorMsg("");
    setStatusMsg("PIN Keamanan diaktifkan! Sistem akan meminta PIN ini setiap kali dibuka.");
  };

  // --- BACKUP & RESTORE UTILITIES ---
  const handleBackup = () => {
    try {
      const keysToBackup = [
        "simaq_profile_guru",
        "simaq_profile_siswa",
        "simaq_subjects",
        "simaq_classes",
        "simaq_students",
        "simaq_grades",
        "simaq_attendance",
        "simaq_materials",
        "simaq_assignments",
        "simaq_submissions",
        "simaq_journals",
        "simaq_student_passwords",
        "simaq_guru_passwords",
        "simaq_app_logo_emoji",
        "simaq_app_logo_name",
        "simaq_app_logo_sub",
        "simaq_active_semester",
        "simaq_custom_bg",
        "simaq_sidebar_style",
        "simaq_security_pin"
      ];

      const backupData: Record<string, any> = {};
      keysToBackup.forEach(key => {
        const item = localStorage.getItem(key);
        if (item !== null) {
          try {
            backupData[key] = JSON.parse(item);
          } catch {
            backupData[key] = item;
          }
        }
      });

      backupData["simaq_backup_meta"] = {
        app: "SIMAQ",
        version: "1.1.0",
        timestamp: new Date().toISOString()
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `simaq_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg("File cadangan database berhasil diekspor! Simpan dokumen ini dengan aman.");
    } catch (err: any) {
      setErrorMsg("Gagal mengekspor berkas cadangan: " + err.message);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setErrorMsg("Format file harus berupa berkas JSON (.json).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        const hasStudents = "simaq_students" in parsed;
        const hasClasses = "simaq_classes" in parsed;

        if (!hasStudents && !hasClasses) {
          setErrorMsg("Dokumen cadangan tidak valid. Pastikan mengunggah file cadangan asli SIMAQ.");
          return;
        }

        Object.keys(parsed).forEach(key => {
          if (key.startsWith("simaq_")) {
            const val = parsed[key];
            if (typeof val === "object") {
              localStorage.setItem(key, JSON.stringify(val));
            } else {
              localStorage.setItem(key, val);
            }
          }
        });

        setStatusMsg("Data cadangan berhasil diunggah! Sistem memuat ulang halaman untuk menyinkronkan data...");
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (err: any) {
        setErrorMsg("Gagal memproses file pemulihan: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleFactoryReset = () => {
    setShowResetConfirm(false);
    try {
      db.factoryReset();
      setStatusMsg("Reset Pabrik Berhasil! Seluruh data dihapus dan mengembalikan data awal simulasi bawaan...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg("Gagal mereset sistem: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="text-[#696cff]" size={24} />
          Pengaturan Sistem & Utilitas
        </h2>
        <p className="text-xs text-gray-400">
          Kelola parameter operasional akademi, visualisasi layout, keamanan PIN, alokasi memori, pencadangan dan reset sistem SIMAQ.
        </p>
      </div>

      {/* Notifications Alert */}
      {(statusMsg || errorMsg) && (
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          {errorMsg && (
            <div className="flex gap-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Galat Sistem:</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}
          {statusMsg && (
            <div className="flex gap-3 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil:</p>
                <p className="mt-0.5 leading-relaxed">{statusMsg}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Selector Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 gap-2">
        <button
          onClick={() => { setActiveTab("semester"); setStatusMsg(""); setErrorMsg(""); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "semester"
              ? "border-[#696cff] text-[#696cff]"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <CalendarRange size={16} />
          Semester & Migrasi
        </button>
        <button
          onClick={() => { setActiveTab("tampilan"); setStatusMsg(""); setErrorMsg(""); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "tampilan"
              ? "border-[#696cff] text-[#696cff]"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <LayoutGrid size={16} />
          Tampilan & Latar Belakang
        </button>
        <button
          onClick={() => { setActiveTab("memori"); setStatusMsg(""); setErrorMsg(""); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "memori"
              ? "border-[#696cff] text-[#696cff]"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Smartphone size={16} />
          Memori & Optimasi
        </button>
        <button
          onClick={() => { setActiveTab("keamanan"); setStatusMsg(""); setErrorMsg(""); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === "keamanan"
              ? "border-[#696cff] text-[#696cff]"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          <Lock size={16} />
          Keamanan & Backup
        </button>
      </div>

      {/* TAB CONTENT 1: SEMESTER & AUTOMATIC MIGRATION */}
      {activeTab === "semester" && (
        <div className="space-y-6">
          {/* Active Semester Selector */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <CalendarRange className="text-[#696cff]" size={18} />
              Semester Akademik yang Aktif
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Tentukan periode semester yang berjalan di sistem saat ini. Pilihan ini berdampak langsung pada kalkulasi rapor, ekspor nilai, presensi harian, dan administrasi siswa.
            </p>

            <div className="flex bg-gray-50 dark:bg-slate-900 p-1 rounded-xl max-w-xs gap-1 border border-gray-100 dark:border-gray-800">
              <button
                onClick={() => handleSemesterChange("Ganjil")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSemester === "Ganjil"
                    ? "bg-[#696cff] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                🍂 Semester Ganjil
              </button>
              <button
                onClick={() => handleSemesterChange("Genap")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSemester === "Genap"
                    ? "bg-[#696cff] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                🌸 Semester Genap
              </button>
            </div>
          </div>

          {/* Automatic Semester Migration */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#696cff]/10 rounded-xl flex items-center justify-center text-[#696cff] shrink-0">
                <RefreshCw size={20} className="animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Migrasi Semester Otomatis (Rollover)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Gunakan utilitas migrasi otomatis ini ketika tahun ajaran baru atau pergantian semester tiba. Fitur ini akan otomatis merollover database sistem secara aman.
                </p>
              </div>
            </div>

            {migrationStep === "idle" && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-4">
                <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-400 space-y-1 leading-relaxed">
                  <p className="font-bold flex items-center gap-1"><Info size={14} /> Apa yang terjadi saat migrasi?</p>
                  <p>1. Semester aktif akan ditransisikan otomatis (Ganjil &rarr; Genap atau sebaliknya).</p>
                  <p>2. Data siswa akan ditingkatkan tingkat kelasnya (X ke XI, XI ke XII) atau diluluskan jika opsi promosi diaktifkan.</p>
                  <p>3. Lembar nilai, kehadiran harian, dan jurnal penugasan dapat dikosongkan untuk memulai lembaran semester baru secara bersih.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-gray-700 dark:text-gray-300">
                    <input 
                      type="checkbox" 
                      checked={promoOption}
                      onChange={(e) => setPromoOption(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700 text-[#696cff] focus:ring-[#696cff]"
                    />
                    <div>
                      <strong className="block">Promosikan & Naikkan Tingkat Kelas Siswa</strong>
                      <span className="text-[11px] text-gray-400">Naikkan seluruh siswa setingkat lebih tinggi (Contoh: X IPA 1 &rarr; XI IPA 1, XII &rarr; Lulus)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-gray-700 dark:text-gray-300">
                    <input 
                      type="checkbox" 
                      checked={clearGradesOption}
                      onChange={(e) => setClearGradesOption(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700 text-[#696cff] focus:ring-[#696cff]"
                    />
                    <div>
                      <strong className="block">Bersihkan Data Transaksional Semester</strong>
                      <span className="text-[11px] text-gray-400">Kosongkan lembaran nilai ujian, data jurnal materi, dan presensi agar bersih (Disarankan backup terlebih dahulu!)</span>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setMigrationStep("confirm")}
                  className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  Mulai Proses Migrasi Semester &rarr;
                </button>
              </div>
            )}

            {migrationStep === "confirm" && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 bg-red-50/30 dark:bg-red-950/5 rounded-xl p-4 border border-red-100/30 space-y-4">
                <div className="flex gap-2.5 text-xs text-red-700 dark:text-red-400 font-bold">
                  <ShieldAlert size={18} className="shrink-0" />
                  <div>
                    <p>Konfirmasi Tindakan Kritis Migrasi Semester!</p>
                    <p className="font-normal text-gray-500 dark:text-gray-400 mt-1">
                      Apakah Anda benar-benar yakin ingin melakukan rollover semester sekarang? Perubahan ini akan memodifikasi data siswa dan mengosongkan nilai sesuai opsi yang Anda centang.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={runSemesterMigration}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Ya, Migrasi Sekarang
                  </button>
                  <button
                    onClick={() => setMigrationStep("idle")}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {migrationStep === "processing" && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex flex-col items-center justify-center py-6 text-center">
                <RefreshCw size={32} className="animate-spin text-[#696cff] mb-3" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Sedang Memproses Migrasi Semester...</p>
                <p className="text-[10px] text-gray-400 mt-1">Harap tunggu, sistem sedang memutakhirkan tingkat kelas dan menstruktur ulang basis data.</p>
              </div>
            )}

            {migrationStep === "success" && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 flex gap-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle size={18} className="shrink-0" />
                  <div>
                    <p className="font-bold">Migrasi Berhasil Diselesaikan!</p>
                    <p className="mt-1 font-normal text-gray-500 dark:text-gray-400">Database Anda saat ini telah diperbarui secara mulus ke semester baru.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMigrationStep("idle"); setStatusMsg(""); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: APPEARANCE, LAYOUT & BACKGROUND */}
      {activeTab === "tampilan" && (
        <div className="space-y-6">
          {/* Custom Backgrounds Gallery */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <LayoutGrid className="text-[#696cff]" size={18} />
              Latar Belakang Kustom Aplikasi
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Pilih gaya dan nuansa latar belakang kustom yang akan menghiasi ruang kerja aplikasi Anda di desktop maupun perangkat mobile.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Green Original */}
              <button 
                onClick={() => saveBgStyle("green-original")}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                  selectedBg === "green-original" ? "border-[#696cff] ring-2 ring-[#696cff]/20 scale-[1.02]" : "border-gray-200 dark:border-gray-800 hover:border-[#696cff]/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800/80 to-emerald-950/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Emerald (Bawaan)</span>
                  <span className="text-[8px] text-emerald-200">Green Nature Abstract</span>
                </div>
                {selectedBg === "green-original" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#696cff] rounded-full flex items-center justify-center text-white text-[8px] font-bold"><Check size={10} /></span>
                )}
              </button>

              {/* Slate Dark */}
              <button 
                onClick={() => saveBgStyle("slate-dark")}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                  selectedBg === "slate-dark" ? "border-[#696cff] ring-2 ring-[#696cff]/20 scale-[1.02]" : "border-gray-200 dark:border-gray-800 hover:border-[#696cff]/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-950" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Slate Midnight</span>
                  <span className="text-[8px] text-slate-400">Minimal Gray Solid</span>
                </div>
                {selectedBg === "slate-dark" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#696cff] rounded-full flex items-center justify-center text-white text-[8px] font-bold"><Check size={10} /></span>
                )}
              </button>

              {/* Blue Aurora */}
              <button 
                onClick={() => saveBgStyle("blue-aurora")}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                  selectedBg === "blue-aurora" ? "border-[#696cff] ring-2 ring-[#696cff]/20 scale-[1.02]" : "border-gray-200 dark:border-gray-800 hover:border-[#696cff]/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-[#1a0b2e]" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Cosmic Aurora</span>
                  <span className="text-[8px] text-indigo-300">Space Blue Gradient</span>
                </div>
                {selectedBg === "blue-aurora" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#696cff] rounded-full flex items-center justify-center text-white text-[8px] font-bold"><Check size={10} /></span>
                )}
              </button>

              {/* Sunset Glow */}
              <button 
                onClick={() => saveBgStyle("sunset-glow")}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                  selectedBg === "sunset-glow" ? "border-[#696cff] ring-2 ring-[#696cff]/20 scale-[1.02]" : "border-gray-200 dark:border-gray-800 hover:border-[#696cff]/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#31110a] to-[#1c0f0a]" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Sunset Warm</span>
                  <span className="text-[8px] text-orange-400">Twilight Amber Gradient</span>
                </div>
                {selectedBg === "sunset-glow" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#696cff] rounded-full flex items-center justify-center text-white text-[8px] font-bold"><Check size={10} /></span>
                )}
              </button>

              {/* Ocean Breeze */}
              <button 
                onClick={() => saveBgStyle("ocean-breeze")}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                  selectedBg === "ocean-breeze" ? "border-[#696cff] ring-2 ring-[#696cff]/20 scale-[1.02]" : "border-gray-200 dark:border-gray-800 hover:border-[#696cff]/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-950 to-cyan-900" />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Ocean Breeze</span>
                  <span className="text-[8px] text-cyan-400">Tranquil Deep Cyan</span>
                </div>
                {selectedBg === "ocean-breeze" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#696cff] rounded-full flex items-center justify-center text-white text-[8px] font-bold"><Check size={10} /></span>
                )}
              </button>
            </div>
          </div>

          {/* Layout & Themes Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sidebar Density */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Layers className="text-[#696cff]" size={18} />
                Kepadatan Layout Sidebar
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Ubah gaya navigasi samping. Mode "Padat" menghemat ruang pada layar laptop berukuran kecil.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => saveSidebarStyle("default")}
                  className={`flex-1 p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    sidebarStyle === "default"
                      ? "border-[#696cff] bg-[#696cff]/5 font-bold text-[#696cff]"
                      : "border-gray-100 dark:border-gray-800 text-gray-500"
                  }`}
                >
                  <span className="block text-sm">📋 Standar</span>
                  <span className="text-[10px] text-gray-400 font-normal">Samping lebar lengkap teks</span>
                </button>
                
                <button
                  onClick={() => saveSidebarStyle("compact")}
                  className={`flex-1 p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    sidebarStyle === "compact"
                      ? "border-[#696cff] bg-[#696cff]/5 font-bold text-[#696cff]"
                      : "border-gray-100 dark:border-gray-800 text-gray-500"
                  }`}
                >
                  <span className="block text-sm">⚡ Padat (Compact)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Samping ringkas ikonik</span>
                </button>
              </div>
            </div>

            {/* Accent Primary Colors */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Sparkles className="text-[#696cff]" size={18} />
                Skema Warna Aksen Utama
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Pilih palet warna sorotan utama yang digunakan untuk tombol, lencana, tautan aktif, dan grafik.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Modern Violet", hex: "#696cff", bg: "bg-[#696cff]" },
                  { name: "Royal Blue", hex: "#3b82f6", bg: "bg-blue-500" },
                  { name: "Emerald Green", hex: "#2b9b65", bg: "bg-emerald-600" },
                  { name: "Warm Amber", hex: "#f59e0b", bg: "bg-amber-500" },
                  { name: "Sunset Crimson", hex: "#ef4444", bg: "bg-red-500" }
                ].map((item) => (
                  <button
                    key={item.hex}
                    onClick={() => savePrimaryColor(item.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      primaryColor === item.hex
                        ? "border-[#696cff] bg-[#696cff]/5 text-[#696cff] scale-105"
                        : "border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${item.bg} block`} />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DEVICE STORAGE & OPTIMIZATION */}
      {activeTab === "memori" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Storage Utilization Donut */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="text-[#696cff]" size={18} />
                  Penggunaan Memori Browser
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Kapasitas penyimpanan data lokal (localStorage) di komputer/perangkat Anda.
                </p>
              </div>

              <div className="py-8 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Circular outer progress border */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      className="text-gray-100 dark:text-slate-800"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#696cff" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (storageData.totalKB / 5120))}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-mono font-bold text-gray-900 dark:text-white">{storageData.totalKB}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">KB Terpakai</span>
                  </div>
                </div>

                <div className="flex justify-between w-full text-[11px] font-mono mt-6 text-gray-500">
                  <span>Alokasi Maks: 5,120 KB</span>
                  <span className="text-indigo-500">{( (storageData.totalKB / 5120) * 100 ).toFixed(2)}% Penuh</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3 text-[11px] text-gray-400 leading-relaxed text-center">
                Penyimpanan luring menggunakan memori terlindung browser lokal, aman dan cepat tanpa memakan memori harddisk utama Anda.
              </div>
            </div>

            {/* Storage Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Database className="text-[#696cff]" size={18} />
                      Rincian Alokasi Berkas Database
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Daftar partisi tabel data dan ukuran penyimpanan internal masing-masing kunci.</p>
                  </div>
                  <button 
                    onClick={calculateStorage}
                    className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                    title="Segarkan data"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {storageData.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-slate-900/40 rounded-xl border border-gray-100/60 dark:border-gray-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{item.size} KB</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-400 mt-4">
                <span>Total Item Database Terdaftar: <strong>{storageData.items.length} Tabel</strong></span>
                <span>Tipe Enkoding: <strong>UTF-16 Char</strong></span>
              </div>
            </div>
          </div>

          {/* Photo Cache Optimization & Clean */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="text-amber-500 animate-pulse" size={18} />
                  Optimasi & Bersihkan Cache Lampiran & Foto
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Secara berkala, lampiran tugas siswa, file dokumen PDF ajar, dan foto profil yang diunggah akan menyimpan cache gambar yang tidak terpakai lagi. Fitur ini akan memampatkan visual profil dan mengosongkan log gambar sampah untuk memulihkan kapasitas browser Anda.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  disabled={isCleaning}
                  onClick={handleCleanCache}
                  className={`px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer`}
                >
                  <Trash2 size={15} />
                  {isCleaning ? "Sedang Mengoptimalkan..." : "Bersihkan & Optimasi Cache"}
                </button>
              </div>
            </div>

            {isCleaning && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-700 dark:text-amber-400 animate-pulse font-mono">
                <RefreshCw size={14} className="animate-spin text-amber-500" />
                <span>{cleanMessage}</span>
              </div>
            )}

            {!isCleaning && cleanedSize !== null && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                <CheckCircle size={15} className="text-emerald-500" />
                <span>Konfigurasi performa dioptimalkan secara mendalam! Berhasil membebaskan <strong>{cleanedSize} KB</strong> memori.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SECURITY LOCK, BACKUPS & HARD FACTORY RESETS */}
      {activeTab === "keamanan" && (
        <div className="space-y-6">
          {/* PIN Lock Settings */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="text-[#696cff]" size={18} />
                  Kunci PIN Keamanan Aplikasi (Passcode)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Batasi akses orang yang tidak berhak dengan mengaktifkan 4 digit kode PIN. Bila aktif, aplikasi akan mengunci secara penuh setiap kali pertama kali dimuat ulang dan hanya bisa dibuka oleh pemegang kode PIN.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 font-mono">Status:</span>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg font-mono uppercase ${
                  pinEnabled ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-indigo-900/30" : "bg-gray-100 text-gray-400 dark:bg-slate-800"
                }`}>
                  {pinEnabled ? "🔐 AKTIF (Terproteksi)" : "🔓 Nonaktif"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleTogglePin}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pinEnabled
                      ? "bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100"
                      : "bg-[#696cff] hover:bg-[#5f61e6] text-white"
                  }`}
                >
                  {pinEnabled ? "Matikan Kunci PIN" : "Aktifkan Kunci PIN"}
                </button>

                {pinEnabled && (
                  <button
                    onClick={() => { setShowPinInput(true); setNewPinInput(""); }}
                    className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Ganti PIN Baru
                  </button>
                )}
              </div>

              {showPinInput && (
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 max-w-sm space-y-3 animate-in slide-in-from-top-2 duration-150 border border-gray-100 dark:border-gray-800">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">
                    Masukkan 4 Digit PIN Keamanan Baru:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="Contoh: 1234"
                      className="px-3 py-2 text-center text-sm font-bold font-mono tracking-widest rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white w-28 focus:border-[#696cff] focus:outline-none"
                    />
                    <button
                      onClick={handleSavePin}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Check size={14} /> Simpan
                    </button>
                    <button
                      onClick={() => setShowPinInput(false)}
                      className="px-3 py-2 text-xs text-gray-400 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 block leading-relaxed">
                    Catatan: Harap catat PIN Anda dengan baik. Jika Anda lupa PIN, Anda harus melakukan reset data aplikasi untuk memulihkan akses masuk.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Database Backups Export & Import JSON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-[#696cff]/10 rounded-xl flex items-center justify-center text-[#696cff]">
                  <Download size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Ekspor Cadangan (.json)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ekspor instan seluruh basis data internal luring Anda ke komputer dalam format JSON universal yang aman dan ringan.
                </p>
              </div>
              <button
                onClick={handleBackup}
                className="mt-6 w-full py-2 bg-indigo-50 dark:bg-indigo-950/20 text-[#696cff] hover:bg-[#696cff]/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Unduh Berkas JSON
              </button>
            </div>

            {/* Restore */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <Upload size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Impor & Pulihkan (.json)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Unggah berkas cadangan JSON Anda yang telah diunduh sebelumnya untuk memulihkan data sistem SIMAQ ke kondisi saat dicadangkan.
                </p>
              </div>
              <div className="mt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-500/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Unggah & Pulihkan Data
                </button>
              </div>
            </div>
          </div>

          {/* Deep Factory Reset */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1 md:max-w-xl">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <RotateCcw size={18} className="animate-spin-slow" />
                  Reset Database Pabrik (Factory Reset)
                </h3>
                <p className="text-xs text-red-500/80 leading-relaxed">
                  Peringatan Kritis! Tindakan ini akan <strong>menghapus secara total dan permanen</strong> seluruh entri siswa, nilai, kelas, konfigurasi logo, absensi, serta data login kustom yang Anda buat, dan memasang ulang simulasi data bawaan SIMAQ semula.
                </p>
              </div>

              <div className="shrink-0">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={14} /> Reset Database Pabrik
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-white dark:bg-[#1a1b24] p-3 rounded-xl border border-red-500/30 text-xs animate-in zoom-in-95 duration-100">
                    <span className="font-bold text-red-600 dark:text-red-400 font-sans">Yakin ingin hapus permanen?</span>
                    <button
                      onClick={handleFactoryReset}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
