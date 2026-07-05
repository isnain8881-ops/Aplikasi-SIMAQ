import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle2, Clock, Eye, Send, Download, FileText, Calendar, ShieldCheck, HelpCircle } from "lucide-react";
import { db } from "../utils/db";
import { Student, Assignment, AssignmentSubmission, Subject } from "../types";

interface StudentProps {
  currentStudent: Student;
}

export const StudentModules: React.FC<StudentProps> = ({ currentStudent }) => {
  const [activeTab, setActiveTab] = useState<"attendance" | "assignments">("assignments");
  const subjects = db.getSubjects();

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
          id: `sub-${asg.id}-${currentStudent.id}`,
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
  };

  useEffect(() => {
    loadAssignmentsAndSubmissions();
  }, [currentStudent]);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAssignment) return;

    if (!fileName.trim()) {
      alert("Nama berkas pengerjaan Anda harus dimasukkan.");
      return;
    }

    const allSubs = db.getSubmissions();
    const idx = allSubs.findIndex(s => s.assignment_id === activeSubmitAssignment.id && s.siswa_id === currentStudent.id);

    if (idx >= 0) {
      allSubs[idx] = {
        ...allSubs[idx],
        status: "Selesai",
        tanggal_submit: new Date().toISOString(),
        file_name: fileName.trim(),
        file_url: fileUrl.trim() || "https://example.com/mock-student-answer"
      };

      localStorage.setItem("simaq_submissions", JSON.stringify(allSubs));
      setStatusMsg("Selamat! Jawaban tugas Anda berhasil dikirim ke guru.");
      setTimeout(() => setStatusMsg(""), 5000);

      setActiveSubmitAssignment(null);
      loadAssignmentsAndSubmissions();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector tab header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Portal Akademik Siswa</h2>
          <p className="text-xs text-gray-400">Halo {currentStudent.nama_lengkap}, Anda berada di ruang belajar Kelas {db.getClasses().find(c => c.id === currentStudent.kelas_id)?.nama}.</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === "assignments" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500"
            }`}
          >
            Tugas & Homework
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${
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
          {/* Statistics summary circles */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Persentase Hadir</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{attendanceRate}%</p>
            </div>
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Hadir</span>
              <p className="text-2xl font-black text-emerald-500">{totalHadir}x</p>
            </div>
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Sakit</span>
              <p className="text-2xl font-black text-amber-500">{totalSakit}x</p>
            </div>
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Izin</span>
              <p className="text-2xl font-black text-blue-500">{totalIzin}x</p>
            </div>
            <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl text-center col-span-2 lg:col-span-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Alfa</span>
              <p className="text-2xl font-black text-red-500">{totalAlfa}x</p>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500 uppercase">Riwayat Daftar Presensi Mata Pelajaran</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-150 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4">Tanggal Pembelajaran</th>
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
                      <tr key={r.id}>
                        <td className="p-4 font-bold font-mono text-gray-900 dark:text-white">{r.tanggal}</td>
                        <td className="p-4 font-semibold text-gray-600 dark:text-gray-300">{subj?.nama || "Mata Pelajaran"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            r.status === "Hadir" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" :
                            r.status === "Izin" ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600" :
                            r.status === "Sakit" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600" :
                            "bg-red-50 dark:bg-red-950/20 text-red-600"
                          }`}>
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
      ) : (
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
