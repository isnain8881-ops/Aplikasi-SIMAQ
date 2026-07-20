import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, Clock, Eye, Send, Download, FileText, Calendar, ShieldCheck, HelpCircle, BookOpen, Award, Star, TrendingUp } from "lucide-react";
import { db } from "../utils/db";
import { Student, Assignment, AssignmentSubmission, Subject, Material } from "../types";

interface StudentProps {
  currentStudent: Student;
  initialTab?: "attendance" | "assignments" | "materials" | "grades";
}

export const StudentModules: React.FC<StudentProps> = ({ currentStudent, initialTab }) => {
  const [activeTab, setActiveTab] = useState<"attendance" | "assignments" | "materials" | "grades">(initialTab || "assignments");
  const [materials, setMaterials] = useState<Material[]>([]);
  const subjects = db.getSubjects();

  // 0. Grades computed state
  const studentGrades = db.getGrades().filter(g => g.siswa_id === currentStudent.id);
  const gradedSubjectsCount = studentGrades.length;
  const averageGrade = gradedSubjectsCount > 0
    ? Math.round((studentGrades.reduce((sum, g) => sum + g.nilai_akhir, 0) / gradedSubjectsCount) * 10) / 10
    : 0;
  const highestGrade = gradedSubjectsCount > 0
    ? Math.max(...studentGrades.map(g => g.nilai_akhir))
    : 0;

  const getOverallPredicate = (avg: number): string => {
    if (avg >= 85) return "Sangat Baik (A)";
    if (avg >= 75) return "Baik (B)";
    if (avg >= 60) return "Cukup (C)";
    return "Perlu Bimbingan (D)";
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 1. Attendance state
  const attendanceRecords = db.getAttendance().filter(a => a.siswa_id === currentStudent.id);
  const totalHadir = attendanceRecords.filter(r => r.status === "Hadir").length;
  const totalIzin = attendanceRecords.filter(r => r.status === "Izin").length;
  const totalSakit = attendanceRecords.filter(r => r.status === "Sakit").length;
  const totalAlfa = attendanceRecords.filter(r => r.status === "Alfa").length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((totalHadir / attendanceRecords.length) * 100) : 100;

  // 2. Assignment state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Form states for submission
  const [activeSubmitAssignment, setActiveSubmitAssignment] = useState<Assignment | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const loadAssignmentsAndSubmissions = () => {
    // Load assignments targetting the student's class
    const classAssignments = db.getAssignments().filter(a => a.kelas_id === currentStudent.kelas_id);
    setAssignments(classAssignments);

    // Initialize/sync submissions for this student
    const allSubs = db.getSubmissions();
    let currentStudentSubs = allSubs.filter(sub => sub.siswa_id === currentStudent.id);

    // If an assignment doesn't have a submission slot for this student, initialize a mock pending slot
    let updatedNeeded = false;
    classAssignments.forEach(asg => {
      const hasSlot = currentStudentSubs.some(s => s.assignment_id === asg.id);
      if (!hasSlot) {
        const newSlot: AssignmentSubmission = {
          id: `subm-${asg.id}-${currentStudent.id}`,
          assignment_id: asg.id,
          siswa_id: currentStudent.id,
          status: "Belum Dikerjakan",
          tanggal_submit: "",
          file_name: "",
          file_url: ""
        };
        allSubs.push(newSlot);
        updatedNeeded = true;
      }
    });

    if (updatedNeeded) {
      localStorage.setItem("simaq_submissions", JSON.stringify(allSubs));
      currentStudentSubs = allSubs.filter(sub => sub.siswa_id === currentStudent.id);
    }

    setSubmissions(currentStudentSubs);

    // Load learning materials for class
    const classMaterials = db.getMaterials().filter(m => m.kelas_id === currentStudent.kelas_id);
    setMaterials(classMaterials);
  };

  useEffect(() => {
    loadAssignmentsAndSubmissions();
  }, [currentStudent]);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAssignment) return;

    if (!fileName.trim()) {
      alert("Nama berkas pengerjaan Anda harus dimasukkan.");
      return;
    }

    const allSubs = db.getSubmissions();
    const idx = allSubs.findIndex(s => s.assignment_id === activeSubmitAssignment.id && s.siswa_id === currentStudent.id);

    const baseSub = idx >= 0 ? allSubs[idx] : {
      id: `subm-${activeSubmitAssignment.id}-${currentStudent.id}`,
      assignment_id: activeSubmitAssignment.id,
      siswa_id: currentStudent.id,
      status: "Belum Dikerjakan" as const,
      tanggal_submit: "",
      file_name: "",
      file_url: ""
    };

    const updatedSub: AssignmentSubmission = {
      ...baseSub,
      status: "Selesai",
      tanggal_submit: new Date().toISOString(),
      file_name: fileName.trim(),
      file_url: fileUrl.trim() || "https://example.com/mock-student-answer"
    };

    await db.saveSubmission(updatedSub);
    setStatusMsg("Selamat! Jawaban tugas Anda berhasil dikirim ke guru.");
    setTimeout(() => setStatusMsg(""), 5000);

    setActiveSubmitAssignment(null);
    loadAssignmentsAndSubmissions();
  };

  return (
    <div className="space-y-6">
      
      {/* Selector tab header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Portal Akademik Siswa</h2>
          <p className="text-xs text-gray-400">Halo {currentStudent.nama_lengkap}, Anda berada di ruang belajar Kelas {db.getClasses().find(c => c.id === currentStudent.kelas_id)?.nama}.</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 text-xs gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-3 py-2 font-bold rounded-lg transition-all flex-shrink-0 ${
              activeTab === "materials" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500"
            }`}
          >
            Materi Belajar
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-2 font-bold rounded-lg transition-all flex-shrink-0 ${
              activeTab === "assignments" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500"
            }`}
          >
            Tugas & Homework
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`px-3 py-2 font-bold rounded-lg transition-all flex-shrink-0 ${
              activeTab === "grades" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500"
            }`}
          >
            Hasil Penilaian
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-3 py-2 font-bold rounded-lg transition-all flex-shrink-0 ${
              activeTab === "attendance" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500"
            }`}
          >
            Presensi & Kehadiran
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* TABS CONTENT */}
      {activeTab === "attendance" ? (
        <div className="space-y-6">
          {/* Statistics summary circles with progress bars and dynamic indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">Persentase Hadir</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f202e] border border-emerald-100/40 dark:border-emerald-950/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hadir
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-emerald-500 font-mono">{totalHadir}</span>
                <span className="text-[10px] text-gray-400">kali</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRecords.length > 0 ? Math.round((totalHadir / attendanceRecords.length) * 100) : 100}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f202e] border border-blue-100/40 dark:border-blue-950/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 dark:bg-blue-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">Izin</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-blue-500 font-mono">{totalIzin}</span>
                <span className="text-[10px] text-gray-400">kali</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRecords.length > 0 ? Math.round((totalIzin / attendanceRecords.length) * 100) : 0}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f202e] border border-amber-100/40 dark:border-amber-950/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 dark:bg-amber-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">Sakit</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-amber-500 font-mono">{totalSakit}</span>
                <span className="text-[10px] text-gray-400">kali</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRecords.length > 0 ? Math.round((totalSakit / attendanceRecords.length) * 100) : 0}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f202e] border border-red-100/40 dark:border-red-950/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50/50 dark:bg-red-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-red-600 dark:text-red-400 tracking-wider">Alfa</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-red-500 font-mono">{totalAlfa}</span>
                <span className="text-[10px] text-gray-400">kali</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRecords.length > 0 ? Math.round((totalAlfa / attendanceRecords.length) * 100) : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#696cff]" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Riwayat Daftar Presensi Lengkap Mata Pelajaran</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-150 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4 pl-6">Tanggal Pembelajaran</th>
                  <th className="p-4">Mata Pelajaran</th>
                  <th className="p-4 text-center">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">Belum ada riwayat presensi tercatat di sistem oleh guru.</td>
                  </tr>
                ) : (
                  attendanceRecords.map(r => {
                    const subj = subjects.find(s => s.id === r.subject_id);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-bold text-gray-900 dark:text-white font-mono">
                              {new Date(r.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {subj?.nama || "Mata Pelajaran"}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${
                            r.status === "Hadir" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/55 dark:border-emerald-800/30" :
                            r.status === "Izin" ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200/55 dark:border-blue-800/30" :
                            r.status === "Sakit" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/55 dark:border-amber-800/30" :
                            "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200/55 dark:border-red-800/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              r.status === "Hadir" ? "bg-emerald-500" :
                              r.status === "Izin" ? "bg-blue-500" :
                              r.status === "Sakit" ? "bg-amber-500" :
                              "bg-red-500"
                            }`} />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "assignments" ? (
        /* HOMEWORK / ASSIGNMENTS TABS */
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Modul Daftar Tugas Akademik Aktif</h3>
          
          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
              Tidak ada modul tugas untuk kelas Anda saat ini. Nikmati waktu istirahat Anda!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(a => {
                const sub = submissions.find(s => s.assignment_id === a.id);
                const isCompleted = sub?.status === "Selesai";
                const mapel = subjects.find(s => s.id === a.subject_id);

                return (
                  <div key={a.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-[#696cff] bg-[#696cff]/10 px-2.5 py-0.5 rounded">
                          {mapel?.nama || "Mata Pelajaran"}
                        </span>
                        
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-red-50 dark:bg-red-950/20 text-red-500"
                        }`}>
                          {isCompleted ? "Selesai Dikirim" : "Belum Dikirim"}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-red-50 dark:bg-red-950/20 text-red-500"}`}>
                          <ClipboardList size={22} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-snug">{a.materi_pelajaran}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-3">{a.deskripsi}</p>
                        </div>
                      </div>
                    </div>

                    {/* Submissions feedback or grading logs */}
                    {sub?.nilai !== undefined && sub.nilai > 0 && (
                      <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/30 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">Hasil Penilaian Guru:</span>
                          <span className="font-mono font-extrabold text-xs bg-[#696cff] text-white px-2 py-0.5 rounded-md">
                            NILAI: {sub.nilai}
                          </span>
                        </div>
                        {sub.catatan_guru && (
                          <p className="text-[10px] text-gray-500 italic">"Catatan: {sub.catatan_guru}"</p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[10px]">
                      <div className="flex flex-col font-mono text-gray-400">
                        <span className="flex items-center gap-1 text-[9px]">
                          <Clock size={10} />
                          Tenggat: {a.deadline ? new Date(a.deadline).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "Tidak ada"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {a.file_name && (
                          <a
                            href={a.file_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Download size={11} />
                            <span>Unduh Soal</span>
                          </a>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setActiveSubmitAssignment(a);
                              setFileName("");
                              setFileUrl("");
                            }}
                            className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Send size={11} />
                            <span>Kirim Jawaban</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "materials" ? (
        /* LEARNING MATERIALS TAB */
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Modul Materi Pembelajaran Kelas</h3>
          
          {materials.length === 0 ? (
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
              Belum ada materi pembelajaran yang diunggah untuk kelas Anda saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(m => {
                const mapel = subjects.find(s => s.id === m.subject_id);

                return (
                  <div key={m.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-[#696cff] bg-[#696cff]/10 px-2.5 py-0.5 rounded">
                          {mapel?.nama || "Mata Pelajaran"}
                        </span>
                        
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-500">
                          {m.file_type || "PDF"}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl flex-shrink-0 bg-blue-50 dark:bg-blue-950/20 text-blue-500">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-snug">{m.materi_pembelajaran}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-3">Metode: {m.metode_pembelajaran}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[10px]">
                      <div className="flex flex-col font-mono text-gray-400">
                        <span className="flex items-center gap-1 text-[9px]">
                          <Clock size={10} />
                          {m.jam_pelajaran}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] mt-0.5">
                          <Calendar size={10} />
                          {new Date(m.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {m.file_name && (
                          <a
                            href={m.file_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Download size={11} />
                            <span>Unduh Materi</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* GRADES TAB (Hasil Penilaian) */
        <div className="space-y-6 animate-fade-in">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Rata-Rata Nilai */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#696cff]/5 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-[#696cff] tracking-wider">Rata-Rata Nilai</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-[#696cff] font-mono">
                  {averageGrade > 0 ? averageGrade : "-"}
                </span>
                {averageGrade > 0 && (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp size={12} /> Sangat Baik
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#696cff] h-full rounded-full transition-all duration-500" style={{ width: `${averageGrade}%` }} />
              </div>
            </div>

            {/* Predikat Umum */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">Predikat Akhir</span>
              <div className="mt-2">
                <span className="text-lg font-black text-emerald-500 block leading-tight">
                  {averageGrade > 0 ? getOverallPredicate(averageGrade) : "Belum Tersedia"}
                </span>
                <span className="text-[9px] text-gray-400 mt-1 block">Berdasarkan akumulasi nilai akhir</span>
              </div>
            </div>

            {/* Mapel Terisi */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 dark:bg-blue-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">Mata Pelajaran Dinilai</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-blue-500 font-mono">{gradedSubjectsCount}</span>
                <span className="text-xs text-gray-400 font-semibold">/ {subjects.length} Mapel</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2">Nilai laporan hasil belajar resmi</p>
            </div>

            {/* Nilai Tertinggi */}
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 dark:bg-amber-950/10 rounded-bl-full" />
              <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">Nilai Akhir Tertinggi</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500">
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="text-3xl font-black text-amber-500 font-mono">
                  {highestGrade > 0 ? highestGrade : "-"}
                </span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2">Pencapaian akademis terbaik Anda</p>
            </div>

          </div>

          {/* Academic Report Card Table */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#696cff]" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Laporan Hasil Belajar (Rapor Semester)</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">Tahun Ajaran: {db.getClasses().find(c => c.id === currentStudent.kelas_id)?.tahun_ajaran || "-"}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-slate-900 border-b border-gray-150 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-black">
                    <th className="p-4 pl-6">Mata Pelajaran</th>
                    <th className="p-4 text-center">Tugas</th>
                    <th className="p-4 text-center">Harian</th>
                    <th className="p-4 text-center">PTS</th>
                    <th className="p-4 text-center">PAS</th>
                    <th className="p-4 text-center">Nilai Akhir</th>
                    <th className="p-4 text-center">Predikat</th>
                    <th className="p-4 text-center">Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">Belum ada mata pelajaran terdaftar.</td>
                    </tr>
                  ) : (
                    subjects.map(subj => {
                      const g = studentGrades.find(grade => grade.subject_id === subj.id);
                      const hasGrade = !!g;

                      // Determine KKM status (let's say KKM is 75)
                      const isPassed = hasGrade ? g.nilai_akhir >= 75 : false;

                      return (
                        <tr key={subj.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 pl-6">
                            <div>
                              <span className="font-bold text-gray-800 dark:text-white block">{subj.nama}</span>
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{subj.kode}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-gray-600 dark:text-gray-300">
                            {hasGrade ? g.nilai_tugas : "-"}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-gray-600 dark:text-gray-300">
                            {hasGrade ? g.nilai_harian : "-"}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-gray-600 dark:text-gray-300">
                            {hasGrade ? g.nilai_pts : "-"}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-gray-600 dark:text-gray-300">
                            {hasGrade ? g.nilai_pas : "-"}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-lg ${
                              !hasGrade ? "text-gray-400 bg-gray-50 dark:bg-slate-800/40" :
                              g.nilai_akhir >= 85 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                              g.nilai_akhir >= 75 ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" :
                              g.nilai_akhir >= 60 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                              "text-red-600 bg-red-50 dark:bg-red-950/20"
                            }`}>
                              {hasGrade ? g.nilai_akhir : "Belum Diinput"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full ${
                              !hasGrade ? "text-gray-400 bg-gray-50 dark:bg-slate-800/40" :
                              g.predikat === "A" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                              g.predikat === "B" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" :
                              g.predikat === "C" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                              "text-red-600 bg-red-50 dark:bg-red-950/20"
                            }`}>
                              {hasGrade ? g.predikat : "-"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {hasGrade ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                isPassed ? "text-emerald-500" : "text-amber-500"
                              }`}>
                                <ShieldCheck size={13} />
                                {isPassed ? "Tuntas (>=75)" : "Remedial (<75)"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Menunggu Guru</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assignment Feedback List */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-gray-800/40">
              <ClipboardList size={18} className="text-[#696cff]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Catatan & Evaluasi Tugas Harian Guru</h3>
            </div>

            {submissions.filter(sub => sub.status === "Selesai" && typeof sub.nilai === "number").length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada tugas terkumpul yang dinilai dan diberi evaluasi catatan oleh guru.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submissions
                  .filter(sub => sub.status === "Selesai" && typeof sub.nilai === "number")
                  .map(sub => {
                    const asg = assignments.find(a => a.id === sub.assignment_id);
                    const mapel = asg ? subjects.find(s => s.id === asg.subject_id) : null;

                    return (
                      <div key={sub.id} className="p-4 rounded-xl border border-gray-150 dark:border-gray-800/80 bg-gray-50/50 dark:bg-slate-900/10 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-[#696cff] bg-[#696cff]/10 px-2.5 py-0.5 rounded">
                              {mapel?.nama || "Mata Pelajaran"}
                            </span>
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-500 text-xs font-black font-mono px-2 py-0.5 rounded-lg border border-amber-200/50">
                              <Star size={12} fill="currentColor" />
                              <span>Nilai: {sub.nilai}</span>
                            </div>
                          </div>

                          <h4 className="text-xs font-black text-gray-900 dark:text-white leading-snug">
                            {asg?.materi_pelajaran || "Tugas Akademik"}
                          </h4>
                        </div>

                        {sub.catatan_guru ? (
                          <div className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800/50 rounded-xl relative">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic leading-relaxed">
                              &ldquo;{sub.catatan_guru}&rdquo;
                            </p>
                            <span className="absolute -top-1.5 left-4 text-[8px] bg-[#696cff]/10 text-[#696cff] font-bold px-1 rounded">Feedback Guru</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">Tidak ada catatan evaluasi dari guru.</p>
                        )}

                        <div className="text-[9px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                          <Clock size={11} />
                          <span>Diserahkan: {sub.tanggal_submit ? new Date(sub.tanggal_submit).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Answer Submission Drawer Overlay */}
      {activeSubmitAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitTask} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Kirim Jawaban Tugas
            </h3>
            
            <div className="space-y-1 bg-indigo-50/25 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-50 dark:border-indigo-900/10">
              <span className="text-[10px] text-indigo-600 font-bold block uppercase">Nama Tugas</span>
              <p className="text-xs font-bold text-gray-950 dark:text-white">{activeSubmitAssignment.materi_pelajaran}</p>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-bold">Nama Berkas Jawaban Anda (Simulasi)</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Jawaban_Limit_Trigonometri_Isnain.pdf"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-bold">Tautan File Cloud / Google Drive (Opsional)</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-answer-file"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActiveSubmitAssignment(null)}
                className="px-4 py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Kirim Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
