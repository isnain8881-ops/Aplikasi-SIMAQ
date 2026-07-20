import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, Plus, Trash2, Edit, Filter, 
  Search, Building2, BookOpen, School, X, Check,
  AlertCircle, Printer, FileDown, ArrowUpDown, CalendarDays
} from "lucide-react";
import { db } from "../utils/db";
import { TeachingSchedule, Subject, ClassRoom } from "../types";

export const SchedulesModule: React.FC = () => {
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // Storage and lists state
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  
  // View mode switcher: "grid" (Weekly board) or "list" (CRUD table list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDay, setFilterDay] = useState("all");

  // Modal / Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TeachingSchedule | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form inputs
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [hari, setHari] = useState<"Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu">("Senin");
  const [jamMulai, setJamMulai] = useState("07:30");
  const [jamSelesai, setJamSelesai] = useState("09:00");
  const [ruangan, setRuangan] = useState("");

  const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Fetch schedules on load
  useEffect(() => {
    setSchedules(db.getSchedules());
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    if (classes.length > 0) setClassId(classes[0].id);
  }, []);

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setSubjectId(subjects[0]?.id || "");
    setClassId(classes[0]?.id || "");
    setHari("Senin");
    setJamMulai("07:30");
    setJamSelesai("09:00");
    setRuangan("");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sch: TeachingSchedule) => {
    setEditingSchedule(sch);
    setSubjectId(sch.subject_id);
    setClassId(sch.kelas_id);
    setHari(sch.hari);
    setJamMulai(sch.jam_mulai);
    setJamSelesai(sch.jam_selesai);
    setRuangan(sch.ruangan || "");
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  // Helper function to check if times overlap
  const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = start1.split(":").map(Number);
    const e1 = end1.split(":").map(Number);
    const s2 = start2.split(":").map(Number);
    const e2 = end2.split(":").map(Number);

    const minutesStart1 = s1[0] * 60 + s1[1];
    const minutesEnd1 = e1[0] * 60 + e1[1];
    const minutesStart2 = s2[0] * 60 + s2[1];
    const minutesEnd2 = e2[0] * 60 + e2[1];

    // Returns true if there is an overlap
    return minutesStart1 < minutesEnd2 && minutesStart2 < minutesEnd1;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subjectId || !classId || !hari || !jamMulai || !jamSelesai) {
      setError("Silakan isi semua bidang wajib.");
      return;
    }

    if (jamMulai >= jamSelesai) {
      setError("Jam selesai harus lebih lambat dari jam mulai.");
      return;
    }

    // Check scheduling conflicts
    const conflict = schedules.find((s) => {
      // Ignore current editing item itself
      if (editingSchedule && s.id === editingSchedule.id) return false;
      
      // Conflict if same day and time overlaps
      const isSameDay = s.hari === hari;
      const overlaps = isTimeOverlap(s.jam_mulai, s.jam_selesai, jamMulai, jamSelesai);
      
      return isSameDay && overlaps;
    });

    if (conflict) {
      const conflictSubj = subjects.find(sub => sub.id === conflict.subject_id)?.nama || "Mapel Lain";
      const conflictCls = classes.find(c => c.id === conflict.kelas_id)?.nama || "Kelas Lain";
      setError(
        `Jadwal bentrok! Di hari ${hari} jam ${conflict.jam_mulai}-${conflict.jam_selesai} Anda sudah memiliki jadwal mengajar mata pelajaran ${conflictSubj} di ${conflictCls}.`
      );
      return;
    }

    const payload: TeachingSchedule = {
      id: editingSchedule?.id || `sch-${Date.now()}`,
      subject_id: subjectId,
      kelas_id: classId,
      hari,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      ruangan: ruangan.trim() || undefined,
      created_at: editingSchedule?.created_at || new Date().toISOString()
    };

    db.saveSchedule(payload);
    setSchedules(db.getSchedules());
    setSuccess(editingSchedule ? "Jadwal berhasil diperbarui!" : "Jadwal mengajar baru berhasil ditambahkan!");
    
    setTimeout(() => {
      setIsFormOpen(false);
      setSuccess("");
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal mengajar ini?")) {
      await db.deleteSchedule(id);
      setSchedules(db.getSchedules());
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA jadwal mengajar? Tindakan ini akan mengosongkan seluruh kalender roster.")) {
      await db.deleteAllSchedules();
      setSchedules(db.getSchedules());
    }
  };

  // Get subject and class object safely
  const getSubjectName = (subId: string) => {
    return subjects.find((s) => s.id === subId)?.nama || "Mata Pelajaran Tidak Diketahui";
  };

  const getSubjectCode = (subId: string) => {
    return subjects.find((s) => s.id === subId)?.kode || "-";
  };

  const getClassName = (clsId: string) => {
    return classes.find((c) => c.id === clsId)?.nama || "Kelas Tidak Diketahui";
  };

  // Filtered schedules for presentation
  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch = getSubjectName(s.subject_id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          getSubjectCode(s.subject_id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.ruangan && s.ruangan.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = filterClass === "all" || s.kelas_id === filterClass;
    const matchesSubject = filterSubject === "all" || s.subject_id === filterSubject;
    const matchesDay = filterDay === "all" || s.hari === filterDay;

    return matchesSearch && matchesClass && matchesSubject && matchesDay;
  });

  // Sort schedules by: 1. Day of week index, 2. Starting hour
  const sortSchedules = (list: TeachingSchedule[]) => {
    return [...list].sort((a, b) => {
      const idxA = DAYS_OF_WEEK.indexOf(a.hari);
      const idxB = DAYS_OF_WEEK.indexOf(b.hari);
      if (idxA !== idxB) return idxA - idxB;

      // compare times
      return a.jam_mulai.localeCompare(b.jam_mulai);
    });
  };

  const sortedFilteredSchedules = sortSchedules(filteredSchedules);

  // Export to Excel simulation (CSV generation)
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `JADWAL MENGAJAR GURU - ALIYAH AL-QAMAR\n\n`;
    csvContent += "Hari,Jam Mulai,Jam Selesai,Kode Mapel,Mata Pelajaran,Kelas,Ruangan\n";

    sortedFilteredSchedules.forEach((s) => {
      const mapelName = getSubjectName(s.subject_id);
      const mapelKode = getSubjectCode(s.subject_id);
      const kelasName = getClassName(s.kelas_id);
      const room = s.ruangan || "-";
      csvContent += `"${s.hari}","${s.jam_mulai}","${s.jam_selesai}","${mapelKode}","${mapelName}","${kelasName}","${room}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Jadwal_Mengajar_Aliyah_Al_Qamar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Color mapper based on subjects to make calendar colorful and beautiful
  const getSubjectColor = (subjectId: string) => {
    const colors = [
      "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
      "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
      "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
      "border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300",
      "border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300",
      "border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
    ];
    // Hash based on subjectId characters code
    let hash = 0;
    for (let i = 0; i < subjectId.length; i++) {
      hash += subjectId.charCodeAt(i);
    }
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#696cff]/10 rounded-xl text-[#696cff]">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Mengajar Guru</h2>
          </div>
          <p className="text-xs text-gray-400">Atur kalender roster, waktu kelas mengajar harian, dan hindari konflik waktu jadwal secara dinamis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* View Mode Toggle Switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-[#696cff] dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
              }`}
            >
              Kalender Roster
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-[#696cff] dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
              }`}
            >
              Atur & Edit Daftar
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Ekspor ke CSV/Excel"
          >
            <FileDown size={15} />
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Cetak Jadwal"
          >
            <Printer size={15} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            Tambah Jam Jadwal
          </button>

          {schedules.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Hapus semua jadwal mengajar"
            >
              <Trash2 size={15} />
              Kosongkan Jadwal
            </button>
          )}
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Cari mapel, kode, ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] text-slate-800 dark:text-white"
            />
          </div>

          {/* Filter Day */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs shrink-0"><Calendar size={14} /></span>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
            >
              <option value="all">Semua Hari</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Filter Class */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs shrink-0"><School size={14} /></span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.nama}</option>
              ))}
            </select>
          </div>

          {/* Filter Subject */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs shrink-0"><BookOpen size={14} /></span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
            >
              <option value="all">Semua Mapel</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>{subj.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters banner */}
        {(searchQuery || filterClass !== "all" || filterSubject !== "all" || filterDay !== "all") && (
          <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-2 rounded-xl text-xs text-indigo-700 dark:text-indigo-400">
            <span className="font-medium">Menampilkan {sortedFilteredSchedules.length} hasil filter jadwal</span>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterClass("all");
                setFilterSubject("all");
                setFilterDay("all");
              }}
              className="text-[10px] font-bold uppercase hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Views Container */}
      {viewMode === "grid" ? (
        /* ========================================================== */
        /* GRID VIEW (Weekly calendar roster)                         */
        /* ========================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-5">
          {DAYS_OF_WEEK.map((day) => {
            const schedulesForDay = sortedFilteredSchedules.filter((s) => s.hari === day);
            
            return (
              <div 
                key={day}
                className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm flex flex-col overflow-hidden"
              >
                {/* Header of Day */}
                <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                  <h3 className="font-bold text-xs text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#696cff]" />
                    {day}
                  </h3>
                  <span className="text-[10px] bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-gray-500">
                    {schedulesForDay.length} Kelas
                  </span>
                </div>

                {/* Schedules List for that Day */}
                <div className="p-3.5 flex-1 space-y-3 min-h-[220px]">
                  {schedulesForDay.length > 0 ? (
                    schedulesForDay.map((sch) => (
                      <div
                        key={sch.id}
                        className={`p-3 rounded-xl transition-all duration-150 relative group ${getSubjectColor(sch.subject_id)}`}
                      >
                        {/* Quick hover control buttons */}
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-slate-800 px-1 py-0.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            className="p-1 hover:text-[#696cff] rounded transition-colors text-gray-400 cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id)}
                            className="p-1 hover:text-red-500 rounded transition-colors text-gray-400 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Schedule Content */}
                        <div className="text-[10px] font-bold tracking-wide flex items-center gap-1 opacity-75 uppercase mb-1">
                          <Clock size={11} />
                          <span>{sch.jam_mulai} - {sch.jam_selesai}</span>
                        </div>

                        <h4 className="font-bold text-xs leading-snug line-clamp-2">
                          {getSubjectName(sch.subject_id)}
                        </h4>
                        
                        <div className="mt-2 pt-1.5 border-t border-gray-200/40 dark:border-gray-700/30 flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
                          <span className="font-bold bg-white/60 dark:bg-slate-900/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <School size={9} />
                            {getClassName(sch.kelas_id)}
                          </span>
                          {sch.ruangan && (
                            <span className="font-medium opacity-90 flex items-center gap-0.5 truncate max-w-[100px]" title={sch.ruangan}>
                              <Building2 size={9} />
                              {sch.ruangan}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                      <Calendar size={24} className="text-gray-400 mb-2 stroke-1" />
                      <span className="text-[10px] font-medium text-gray-400 font-sans">Tidak ada jadwal</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================== */
        /* LIST VIEW (Table list with details & actions)             */
        /* ========================================================== */
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-gray-800/80 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Hari</th>
                  <th className="px-6 py-4">Waktu Mengajar</th>
                  <th className="px-6 py-4">Mata Pelajaran</th>
                  <th className="px-6 py-4">Kode Mapel</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Ruangan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {sortedFilteredSchedules.length > 0 ? (
                  sortedFilteredSchedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#696cff] bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide">
                          {sch.hari}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>{sch.jam_mulai} - {sch.jam_selesai}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {getSubjectName(sch.subject_id)}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                        {getSubjectCode(sch.subject_id)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {getClassName(sch.kelas_id)}
                      </td>
                      <td className="px-6 py-4">
                        {sch.ruangan ? (
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Building2 size={13} className="text-gray-400" />
                            {sch.ruangan}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Default Kelas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            className="p-2 hover:bg-[#696cff]/10 hover:text-[#696cff] text-gray-400 dark:text-gray-500 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 text-gray-400 dark:text-gray-500 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center space-y-2 opacity-50">
                        <Calendar size={32} className="text-[#696cff]" />
                        <p className="font-bold text-sm text-gray-900 dark:text-white">Jadwal Kosong</p>
                        <p className="text-[10px]">Tidak ditemukan jadwal mengajar yang cocok dengan filter atau kata kunci Anda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable Form Drawer / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Design header bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#696cff]" />

            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/60 mb-5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={16} className="text-[#696cff]" />
                {editingSchedule ? "Ubah Jadwal Mengajar" : "Tambah Jadwal Mengajar Baru"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-snug">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-snug font-bold">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Mata Pelajaran *
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                    required
                  >
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        [{subj.kode}] {subj.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Kelas Roster *
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                    required
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nama} ({cls.tingkat})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Hari Mengajar *
                </label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                  required
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Start */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Jam Mulai *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Clock size={15} />
                    </span>
                    <input
                      type="time"
                      value={jamMulai}
                      onChange={(e) => setJamMulai(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Time End */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Jam Selesai *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Clock size={15} />
                    </span>
                    <input
                      type="time"
                      value={jamSelesai}
                      onChange={(e) => setJamSelesai(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Room details */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ruangan / Lokasi (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Building2 size={15} />
                  </span>
                  <input
                    type="text"
                    value={ruangan}
                    onChange={(e) => setRuangan(e.target.value)}
                    placeholder="Contoh: Ruang XII IPA 1, Lab Komputer, Masjid"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#11121d] text-sm focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 focus:border-[#696cff] dark:text-white"
                  />
                </div>
                <span className="text-[10px] text-gray-400 block">Kosongkan jika ingin memakai ruangan default kelas.</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {editingSchedule ? "Simpan Perubahan" : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
