import React, { useState, useEffect } from "react";
import { Award, CheckSquare, BookOpenCheck, ChevronRight, Save, Calendar, FileDown, Printer, AlertCircle, Plus, Eye, CheckCircle2, Clock, Heart, XCircle, FileText, Activity } from "lucide-react";
import { db } from "../utils/db";
import { Subject, ClassRoom, Student, Grade, Attendance, TeachingJournal } from "../types";

// Helper for Grade calculation
const calculateFinalGradeAndPredicate = (tugas: number, harian: number, pts: number, pas: number) => {
  // Let's do a standard weighted average: 20% Tugas, 30% Harian, 25% PTS, 25% PAS
  const final = Math.round((tugas * 0.2 + harian * 0.3 + pts * 0.25 + pas * 0.25) * 10) / 10;
  
  let predicate = "E";
  if (final >= 88) predicate = "A";
  else if (final >= 78) predicate = "B";
  else if (final >= 68) predicate = "C";
  else if (final >= 55) predicate = "D";

  return { final, predicate };
};

// =========================================================================
// 1. MANAJEMEN NILAI MODULE (GRADES)
// =========================================================================
export const GradesModule: React.FC = () => {
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // Selection states
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { tugas: string; harian: string; pts: string; pas: string }>>({});

  const [statusMsg, setStatusMsg] = useState("");

  // Load students and grades when subject/class changes
  useEffect(() => {
    if (selectedClass) {
      const classStudents = db.getStudents().filter(s => s.kelas_id === selectedClass);
      setStudents(classStudents);

      const allGrades = db.getGrades();
      const inputs: typeof gradeInputs = {};

      classStudents.forEach(s => {
        const existingGrade = allGrades.find(g => g.siswa_id === s.id && g.subject_id === selectedSubject);
        inputs[s.id] = {
          tugas: existingGrade?.nilai_tugas?.toString() || "0",
          harian: existingGrade?.nilai_harian?.toString() || "0",
          pts: existingGrade?.nilai_pts?.toString() || "0",
          pas: existingGrade?.nilai_pas?.toString() || "0"
        };
      });

      setGradeInputs(inputs);
    }
  }, [selectedClass, selectedSubject]);

  const handleInputChange = (studentId: string, field: "tugas" | "harian" | "pts" | "pas", val: string) => {
    // Sanitizing
    const numVal = parseInt(val) || 0;
    const cleanVal = Math.min(Math.max(numVal, 0), 100).toString();

    setGradeInputs(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val === "" ? "" : cleanVal
      }
    }));
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");

    const gradesToSave: Grade[] = students.map(s => {
      const input = gradeInputs[s.id] || { tugas: "0", harian: "0", pts: "0", pas: "0" };
      const t = parseFloat(input.tugas) || 0;
      const h = parseFloat(input.harian) || 0;
      const ptsVal = parseFloat(input.pts) || 0;
      const pasVal = parseFloat(input.pas) || 0;

      const { final, predicate } = calculateFinalGradeAndPredicate(t, h, ptsVal, pasVal);

      return {
        id: `grd-${selectedSubject}-${selectedClass}-${s.id}`,
        siswa_id: s.id,
        kelas_id: selectedClass,
        subject_id: selectedSubject,
        nilai_tugas: t,
        nilai_harian: h,
        nilai_pts: ptsVal,
        nilai_pas: pasVal,
        nilai_akhir: final,
        predikat: predicate,
        updated_at: new Date().toISOString()
      };
    });

    db.saveGradesBulk(gradesToSave);
    setStatusMsg("Semua nilai siswa berhasil disimpan dan dikalkulasi secara otomatis!");
    setTimeout(() => setStatusMsg(""), 4000);
  };

  // Export to Excel simulation (CSV generation)
  const handleExportCSV = () => {
    const activeSubj = subjects.find(s => s.id === selectedSubject)?.nama || "Mapel";
    const activeClass = classes.find(c => c.id === selectedClass)?.nama || "Kelas";

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `REKAP NILAI SISWA - ALIYAH AL-QAMAR\n`;
    csvContent += `Mata Pelajaran: ${activeSubj}\n`;
    csvContent += `Kelas: ${activeClass}\n\n`;
    csvContent += "Nama Siswa,NIS,Nilai Tugas,Nilai Harian,Nilai PTS,Nilai PAS,Nilai Akhir,Predikat\n";

    students.forEach(s => {
      const inp = gradeInputs[s.id] || { tugas: "0", harian: "0", pts: "0", pas: "0" };
      const t = parseFloat(inp.tugas) || 0;
      const h = parseFloat(inp.harian) || 0;
      const ptsVal = parseFloat(inp.pts) || 0;
      const pasVal = parseFloat(inp.pas) || 0;
      const { final, predicate } = calculateFinalGradeAndPredicate(t, h, ptsVal, pasVal);

      csvContent += `"${s.nama_lengkap}",${s.nis},${t},${h},${ptsVal},${pasVal},${final},"${predicate}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_${activeSubj.replace(/\s+/g, "_")}_${activeClass.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF simulation (Trigger native browser print setup)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Selector banner */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manajemen Nilai Akademik</h2>
          <p className="text-xs text-gray-400">Penginputan, kalkulasi rata-rata otomatis, dan cetak lembar nilai siswa.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Mapel Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 md:w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.nama}</option>
            ))}
          </select>

          {/* Kelas Selector */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 md:w-36 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs flex items-center gap-2">
          <CheckSquare size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main grades table sheet */}
      <form onSubmit={handleSaveGrades} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/10">
          <span className="text-xs font-semibold text-gray-500">Lembar Input Nilai ({students.length} Siswa)</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileDown size={14} />
              <span>Ekspor Excel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-150 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="p-4">Nama Siswa</th>
                <th className="p-4 w-20">NIS</th>
                <th className="p-4 w-24">Nilai Tugas (20%)</th>
                <th className="p-4 w-24">Nilai Harian (30%)</th>
                <th className="p-4 w-24">Nilai PTS (25%)</th>
                <th className="p-4 w-24">Nilai PAS (25%)</th>
                <th className="p-4 w-28 text-center bg-indigo-50/20 dark:bg-indigo-950/10">Nilai Akhir (100%)</th>
                <th className="p-4 w-20 text-center bg-indigo-50/20 dark:bg-indigo-950/10">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">Pilih kelas yang memiliki siswa aktif.</td>
                </tr>
              ) : (
                students.map(s => {
                  const input = gradeInputs[s.id] || { tugas: "0", harian: "0", pts: "0", pas: "0" };
                  const t = parseFloat(input.tugas) || 0;
                  const h = parseFloat(input.harian) || 0;
                  const ptsVal = parseFloat(input.pts) || 0;
                  const pasVal = parseFloat(input.pas) || 0;
                  
                  const { final, predicate } = calculateFinalGradeAndPredicate(t, h, ptsVal, pasVal);

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{s.nama_lengkap}</td>
                      <td className="p-4 font-mono text-gray-400">{s.nis}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={input.tugas}
                          onChange={(e) => handleInputChange(s.id, "tugas", e.target.value)}
                          className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#696cff] font-mono text-xs"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={input.harian}
                          onChange={(e) => handleInputChange(s.id, "harian", e.target.value)}
                          className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#696cff] font-mono text-xs"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={input.pts}
                          onChange={(e) => handleInputChange(s.id, "pts", e.target.value)}
                          className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#696cff] font-mono text-xs"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={input.pas}
                          onChange={(e) => handleInputChange(s.id, "pas", e.target.value)}
                          className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-[#696cff] font-mono text-xs"
                        />
                      </td>
                      <td className="p-4 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10">
                        {final}
                      </td>
                      <td className="p-4 text-center bg-indigo-50/20 dark:bg-indigo-950/10">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                          predicate === "A" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" :
                          predicate === "B" ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600" :
                          predicate === "C" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600" :
                          "bg-red-50 dark:bg-red-950/20 text-red-600"
                        }`}>
                          {predicate}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#696cff]20"
            >
              <Save size={14} />
              Simpan Semua Nilai
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// =========================================================================
// 2. ABSENSI SISWA MODULE (ATTENDANCE)
// =========================================================================
export const AttendanceModule: React.FC = () => {
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // Selection states
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, "Hadir" | "Izin" | "Sakit" | "Alfa">>({});
  const [statusMsg, setStatusMsg] = useState("");

  // Load students & existing attendance
  useEffect(() => {
    if (selectedClass) {
      const classStudents = db.getStudents().filter(s => s.kelas_id === selectedClass);
      setStudents(classStudents);

      const allAttendance = db.getAttendance();
      const statuses: typeof attendanceStatuses = {};

      classStudents.forEach(s => {
        const record = allAttendance.find(a => 
          a.siswa_id === s.id && 
          a.subject_id === selectedSubject && 
          a.tanggal === tanggal
        );
        statuses[s.id] = record?.status || "Hadir";
      });

      setAttendanceStatuses(statuses);
    }
  }, [selectedClass, selectedSubject, tanggal]);

  const handleStatusChange = (studentId: string, status: "Hadir" | "Izin" | "Sakit" | "Alfa") => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");

    const payload: Attendance[] = students.map(s => ({
      id: `att-${selectedSubject}-${selectedClass}-${tanggal}-${s.id}`,
      siswa_id: s.id,
      kelas_id: selectedClass,
      subject_id: selectedSubject,
      tanggal: tanggal,
      status: attendanceStatuses[s.id] || "Hadir"
    }));

    db.saveAttendanceBulk(payload);
    setStatusMsg(`Laporan presensi tanggal ${new Date(tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} berhasil dicatat ke pangkalan data!`);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const handleMarkAll = (status: "Hadir" | "Izin" | "Sakit" | "Alfa") => {
    const updated: typeof attendanceStatuses = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceStatuses(updated);
  };

  // Stats helper
  const countStatus = (status: "Hadir" | "Izin" | "Sakit" | "Alfa") => {
    return students.filter(s => (attendanceStatuses[s.id] || "Hadir") === status).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Selector controls */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            <CheckSquare className="text-[#696cff]" size={20} />
            Pencatatan Presensi Siswa
          </h2>
          <p className="text-xs text-gray-400">Input presensi harian secara intuitif per kelas dan mata pelajaran.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
          {/* Tanggal */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-750">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="text-xs bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-mono outline-none"
            />
          </div>

          {/* Mapel Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-750 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.nama}</option>
            ))}
          </select>

          {/* Kelas Selector */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-750 rounded-xl text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500 animate-bounce" />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      {/* Dynamic Statistics Panel - live updates */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Total Siswa</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-gray-800 dark:text-white font-mono">{students.length}</span>
              <span className="text-xs text-gray-400">anak</span>
            </div>
          </div>
          {/* Hadir */}
          <div className="bg-white dark:bg-[#1f202e] border border-emerald-100/50 dark:border-emerald-950/20 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-bl-full" />
            <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hadir
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-500 font-mono">{countStatus("Hadir")}</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                {students.length > 0 ? Math.round((countStatus("Hadir") / students.length) * 100) : 0}%
              </span>
            </div>
          </div>
          {/* Izin */}
          <div className="bg-white dark:bg-[#1f202e] border border-blue-100/50 dark:border-blue-950/20 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 dark:bg-blue-950/10 rounded-bl-full" />
            <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Izin
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-blue-500 font-mono">{countStatus("Izin")}</span>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                {students.length > 0 ? Math.round((countStatus("Izin") / students.length) * 100) : 0}%
              </span>
            </div>
          </div>
          {/* Sakit */}
          <div className="bg-white dark:bg-[#1f202e] border border-amber-100/50 dark:border-amber-950/20 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 dark:bg-amber-950/10 rounded-bl-full" />
            <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sakit
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-amber-500 font-mono">{countStatus("Sakit")}</span>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                {students.length > 0 ? Math.round((countStatus("Sakit") / students.length) * 100) : 0}%
              </span>
            </div>
          </div>
          {/* Alfa */}
          <div className="bg-white dark:bg-[#1f202e] border border-red-100/50 dark:border-red-950/20 p-4 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50/50 dark:bg-red-950/10 rounded-bl-full" />
            <span className="text-[10px] uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Alfa
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-red-500 font-mono">{countStatus("Alfa")}</span>
              <span className="text-xs text-red-600 font-bold bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                {students.length > 0 ? Math.round((countStatus("Alfa") / students.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid view of student attendance list */}
      <form onSubmit={handleSaveAttendance} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table header with mark all button */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 dark:bg-slate-900/10 gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lembar Absensi Harian ({students.length} Siswa)</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mr-1">Setel Semua:</span>
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border border-gray-200/40 dark:border-gray-800">
              <button 
                type="button" 
                onClick={() => handleMarkAll("Hadir")} 
                className="px-2.5 py-1.5 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 hover:shadow-sm text-[10px] font-bold rounded-lg transition-all"
              >
                Hadir
              </button>
              <button 
                type="button" 
                onClick={() => handleMarkAll("Izin")} 
                className="px-2.5 py-1.5 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 hover:shadow-sm text-[10px] font-bold rounded-lg transition-all"
              >
                Izin
              </button>
              <button 
                type="button" 
                onClick={() => handleMarkAll("Sakit")} 
                className="px-2.5 py-1.5 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 hover:shadow-sm text-[10px] font-bold rounded-lg transition-all"
              >
                Sakit
              </button>
              <button 
                type="button" 
                onClick={() => handleMarkAll("Alfa")} 
                className="px-2.5 py-1.5 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 hover:shadow-sm text-[10px] font-bold rounded-lg transition-all"
              >
                Alfa
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-150 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="p-4 pl-6">Siswa / NIS</th>
                <th className="p-4 text-center w-36">Gender</th>
                <th className="p-4 text-right pr-6">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">Pilih kelas yang memiliki siswa aktif.</td>
                </tr>
              ) : (
                students.map(s => {
                  const currentStatus = attendanceStatuses[s.id] || "Hadir";
                  const initialName = s.nama_lengkap.split(" ").map(w => w[0]).slice(0, 2).join("");
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/10 border-b border-gray-100 dark:border-gray-850">
                      {/* Name & NIS with visual Avatar */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-transform hover:scale-105 shadow-sm ${
                            s.jenis_kelamin === "Perempuan" 
                              ? "bg-pink-50 dark:bg-pink-950/20 text-pink-500 border border-pink-100 dark:border-pink-900/30" 
                              : "bg-[#e7e7ff] dark:bg-indigo-950/40 text-[#696cff] border border-indigo-100/50 dark:border-indigo-900/30"
                          }`}>
                            {initialName}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{s.nama_lengkap}</h4>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">NISN: {s.nis}</p>
                          </div>
                        </div>
                      </td>

                      {/* Gender Badge */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          s.jenis_kelamin === "Perempuan" 
                            ? "bg-pink-50 dark:bg-pink-950/10 text-pink-500 border-pink-100 dark:border-pink-900/20" 
                            : "bg-blue-50 dark:bg-blue-950/10 text-blue-500 border-blue-100 dark:border-blue-900/20"
                        }`}>
                          {s.jenis_kelamin === "Perempuan" ? "Putri" : "Putra"}
                        </span>
                      </td>
                      
                      {/* Interactive Segmented Selection Buttons */}
                      <td className="p-4 pr-6">
                        <div className="flex justify-end gap-1.5">
                          {/* Hadir Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, "Hadir")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 ${
                              currentStatus === "Hadir"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.04]"
                                : "bg-gray-50/50 dark:bg-slate-900/40 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === "Hadir" ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
                            Hadir
                          </button>

                          {/* Izin Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, "Izin")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 ${
                              currentStatus === "Izin"
                                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-[1.04]"
                                : "bg-gray-50/50 dark:bg-slate-900/40 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === "Izin" ? "bg-white animate-pulse" : "bg-blue-500"}`} />
                            Izin
                          </button>

                          {/* Sakit Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, "Sakit")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 ${
                              currentStatus === "Sakit"
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.04]"
                                : "bg-gray-50/50 dark:bg-slate-900/40 text-gray-400 hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/10"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === "Sakit" ? "bg-white animate-pulse" : "bg-amber-500"}`} />
                            Sakit
                          </button>

                          {/* Alfa Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, "Alfa")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 ${
                              currentStatus === "Alfa"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/20 scale-[1.04]"
                                : "bg-gray-50/50 dark:bg-slate-900/40 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === "Alfa" ? "bg-white animate-pulse" : "bg-red-500"}`} />
                            Alfa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Save size={14} />
              Simpan Presensi Kelas
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// =========================================================================
// 3. JURNAL MENGAJAR MODULE (TEACHING JOURNALS)
// =========================================================================
export const TeachingJournalModule: React.FC = () => {
  const [journals, setJournals] = useState<TeachingJournal[]>(db.getJournals());
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // Modal / Form trigger
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [jamPelajaran, setJamPelajaran] = useState("I & II (07:30 - 09:00)");
  const [materiPembelajaran, setMateriPembelajaran] = useState("");
  const [metodePembelajaran, setMetodePembelajaran] = useState("Ceramah & Diskusi Interaktif");
  const [jumlahHadir, setJumlahHadir] = useState("");
  const [catatanGuru, setCatatanGuru] = useState("");
  const [lampiranName, setLampiranName] = useState("");
  const [lampiranUrl, setLampiranUrl] = useState("");

  const handleOpenAdd = () => {
    setTanggal(new Date().toISOString().split("T")[0]);
    setSelectedSubject(subjects[0]?.id || "");
    setSelectedClass(classes[0]?.id || "");
    setJamPelajaran("I & II (07:30 - 09:00)");
    setMateriPembelajaran("");
    setMetodePembelajaran("Ceramah & Diskusi Interaktif");
    setJumlahHadir("");
    setCatatanGuru("");
    setLampiranName("");
    setLampiranUrl("");
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!materiPembelajaran.trim() || !jumlahHadir || !catatanGuru.trim()) {
      setError("Materi, jumlah siswa hadir, dan catatan perkembangan kelas harus dilengkapi.");
      return;
    }

    const payload: TeachingJournal = {
      id: `jrnl-${Date.now()}`,
      tanggal,
      subject_id: selectedSubject,
      kelas_id: selectedClass,
      jam_pelajaran: jamPelajaran,
      materi_pembelajaran: materiPembelajaran.trim(),
      metode_pembelajaran: metodePembelajaran,
      jumlah_hadir: parseInt(jumlahHadir) || 0,
      catatan_guru: catatanGuru.trim(),
      lampiran_name: lampiranName.trim() || undefined,
      lampiran_url: lampiranUrl.trim() || undefined,
      created_at: new Date().toISOString()
    };

    db.saveJournal(payload);
    setJournals(db.getJournals());
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan jurnal mengajar ini?")) {
      await db.deleteJournal(id);
      setJournals(db.getJournals());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jurnal Harian Mengajar</h2>
          <p className="text-xs text-gray-400">Pencatatan materi ajar harian, metode, presensi kumulatif, dan evaluasi kelas.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus size={16} />
          Buat Jurnal Mengajar
        </button>
      </div>

      {/* Adding Form Block */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Catat Agenda Jurnal Pembelajaran Baru
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Tanggal Pembelajaran</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Mata Pelajaran</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Kelas Sasaran</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Jam Pelajaran Ke-</label>
              <input
                type="text"
                required
                value={jamPelajaran}
                onChange={(e) => setJamPelajaran(e.target.value)}
                placeholder="Misal: I & II (07:30 - 09:00)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Metode Pembelajaran</label>
              <input
                type="text"
                required
                value={metodePembelajaran}
                onChange={(e) => setMetodePembelajaran(e.target.value)}
                placeholder="Misal: Ceramah, Diskusi, PBL"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Siswa Hadir Fisik (Jumlah)</label>
              <input
                type="number"
                required
                value={jumlahHadir}
                onChange={(e) => setJumlahHadir(e.target.value)}
                placeholder="Jumlah siswa hadir"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Rangkuman Materi Pembelajaran</label>
              <input
                type="text"
                required
                value={materiPembelajaran}
                onChange={(e) => setMateriPembelajaran(e.target.value)}
                placeholder="Pokok bahasan, KD, atau bab yang disampaikan"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Catatan Evaluasi Guru / Hambatan</label>
              <textarea
                required
                rows={3}
                value={catatanGuru}
                onChange={(e) => setCatatanGuru(e.target.value)}
                placeholder="Catat siswa bermasalah, kesimpulan materi, atau tindak lanjut agenda kelas..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Nama Lampiran File (Opsional)</label>
              <input
                type="text"
                value={lampiranName}
                onChange={(e) => setLampiranName(e.target.value)}
                placeholder="RPP_Limit_Mtk.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Link Lampiran File (Opsional)</label>
              <input
                type="text"
                value={lampiranUrl}
                onChange={(e) => setLampiranUrl(e.target.value)}
                placeholder="https://drive.google.com/your-file-link"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#696cff] text-white text-xs font-bold rounded-xl"
            >
              Simpan Jurnal Mengajar
            </button>
          </div>
        </form>
      )}

      {/* History log timeline view */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Riwayat Jurnal Mengajar Hari Ini & Sebelumnya</h3>
        
        {journals.length === 0 ? (
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
            Belum ada jurnal mengajar yang dicatat.
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((j) => {
              const jSubj = subjects.find(s => s.id === j.subject_id);
              const jClass = classes.find(c => c.id === j.kelas_id);

              return (
                <div key={j.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl flex flex-col items-center justify-center font-mono text-center flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold leading-none">
                        {new Date(j.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                      <span className="text-xl font-black leading-none mt-1">
                        {new Date(j.tanggal).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-[#696cff] bg-[#696cff]/10 px-2 py-0.5 rounded-md">
                          {jSubj?.nama || "Mata Pelajaran"}
                        </span>
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded-md">
                          Kelas {jClass?.nama || "Kelas"}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {j.jam_pelajaran}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-normal">
                        Materi: "{j.materi_pembelajaran}"
                      </h4>

                      <p className="text-xs text-gray-500 leading-relaxed max-w-2xl bg-gray-50/50 dark:bg-slate-900/10 p-2.5 rounded-xl border border-gray-50 dark:border-gray-850">
                        <b>Catatan Guru:</b> {j.catatan_guru}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-mono">
                        <span>Metode: {j.metode_pembelajaran}</span>
                        <span>•</span>
                        <span>Siswa Hadir: {j.jumlah_hadir} orang</span>
                        {j.lampiran_name && (
                          <>
                            <span>•</span>
                            <a href={j.lampiran_url || "#"} target="_blank" rel="noopener noreferrer" className="text-[#696cff] hover:underline font-bold truncate max-w-[150px]">
                              📎 {j.lampiran_name}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-end md:self-auto">
                    <button 
                      onClick={() => handleDelete(j.id)}
                      className="px-2.5 py-1.5 border border-red-100 dark:border-red-950/30 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/15 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      Hapus Log
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
