import React from "react";
import { BookOpenText, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Download, UploadCloud } from "lucide-react";
import { db } from "../utils/db";

interface DashboardSiswaProps {
  onViewChange: (view: string) => void;
}

export const DashboardSiswa: React.FC<DashboardSiswaProps> = ({ onViewChange }) => {
  const currentUser = db.getCurrentUser();
  const students = db.getStudents();
  
  // Find current student record by NIP_NISN (which is NIS in students table)
  const student = students.find(s => s.nis === currentUser?.nip_nisn);
  
  const attendance = db.getAttendance().filter(a => a.siswa_id === student?.id);
  const assignments = db.getAssignments().filter(a => a.kelas_id === student?.kelas_id);
  const submissions = db.getSubmissions().filter(s => s.siswa_id === student?.id);
  const materials = db.getMaterials().filter(m => m.kelas_id === student?.kelas_id);

  // Attendance metrics
  const totalDays = attendance.length;
  const hadirCount = attendance.filter(a => a.status === "Hadir").length;
  const sakitCount = attendance.filter(a => a.status === "Sakit").length;
  const izinCount = attendance.filter(a => a.status === "Izin").length;
  const alfaCount = attendance.filter(a => a.status === "Alfa").length;
  const attendanceRate = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 100;

  // Assignment metrics
  const pendingAssignments = submissions.filter(s => s.status === "Belum Dikerjakan").length;
  const completedAssignments = submissions.filter(s => s.status === "Selesai").length;

  const todayStr = new Date().toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#1f202e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center overflow-hidden relative min-h-[140px]">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-indigo-50 dark:bg-indigo-950/20 -z-0" />
        
        <div className="space-y-3 z-10 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            Portal Siswa Al-Qamar
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Semangat Belajar, <span className="text-[#696cff]">{currentUser?.nama}</span>! 🎓
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
            Periksa tugas terbaru dari guru hari ini. Pastikan Anda menyelesaikan tugas tepat waktu untuk menjaga performa akademik terbaik.
          </p>
          <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-gray-500 font-mono">
            <Calendar size={14} />
            <span>{todayStr}</span>
          </div>
        </div>
        
        <div className="hidden md:block z-10 flex-shrink-0">
          <img 
            src="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/illustrations/man-with-laptop-light.png" 
            alt="Welcome" 
            className="h-28 object-contain scale-x-[-1]"
          />
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Ring Summary */}
        <div className="bg-white dark:bg-[#1f202e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Persentase Kehadiran</span>
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white font-mono">{attendanceRate}%</h3>
            <div className="flex gap-2 text-[10px] text-gray-400 font-mono pt-1">
              <span>Hadir: {hadirCount}</span>
              <span>Sakit: {sakitCount}</span>
              <span>Izin: {izinCount}</span>
              <span>Alfa: {alfaCount}</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-50 dark:border-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm shadow-inner">
            {hadirCount}/{totalDays || 3}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white dark:bg-[#1f202e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tugas Belum Selesai</span>
            <h3 className="text-3xl font-extrabold text-red-500 font-mono">{pendingAssignments}</h3>
            <p className="text-xs text-gray-400">Harap kerjakan sebelum tenggat waktu berakhir.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Completed Assignments */}
        <div className="bg-white dark:bg-[#1f202e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tugas Telah Dikumpul</span>
            <h3 className="text-3xl font-extrabold text-emerald-500 font-mono">{completedAssignments}</h3>
            <p className="text-xs text-gray-400">Nilai & catatan guru dapat dilihat di rincian.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <CheckCircle size={24} />
          </div>
        </div>

      </div>

      {/* Main split: Pending assignments & Latest Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Assignments Table/List */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Daftar Tugas Berjalan</h3>
              <button 
                onClick={() => onViewChange("student-assignments")} 
                className="text-xs text-[#696cff] font-semibold hover:underline"
              >
                Lihat Semua ({assignments.length})
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">Belum ada tugas dari guru.</div>
            ) : (
              <div className="space-y-3.5">
                {assignments.slice(0, 3).map((asg) => {
                  const subm = submissions.find(s => s.assignment_id === asg.id);
                  const isDone = subm?.status === "Selesai";

                  return (
                    <div 
                      key={asg.id} 
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:border-gray-200 bg-gray-50/50 dark:bg-slate-900/10 flex items-start justify-between"
                    >
                      <div className="space-y-1 overflow-hidden pr-3">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
                          {db.getSubjects().find(s => s.id === asg.subject_id)?.nama || "Mata Pelajaran"}
                        </span>
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{asg.materi_pelajaran}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{asg.deskripsi}</p>
                        <span className="text-[9px] text-red-500 font-mono block">
                          Tenggat: {asg.deadline ? new Date(asg.deadline).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "Tidak ada"}
                        </span>
                      </div>

                      <div className="flex-shrink-0">
                        {isDone ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                            Terkumpul
                          </span>
                        ) : (
                          <button
                            onClick={() => onViewChange("student-assignments")}
                            className="text-[10px] font-bold text-white bg-[#696cff] hover:bg-[#5f61e6] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            Kerjakan <UploadCloud size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Latest materials */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Materi Pembelajaran Terbaru</h3>
          
          {materials.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">Belum ada materi ajar yang diupload.</div>
          ) : (
            <div className="space-y-3">
              {materials.slice(0, 3).map((mat) => (
                <div 
                  key={mat.id}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-slate-900/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                      <FileText size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{mat.materi_pembelajaran}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {db.getSubjects().find(s => s.id === mat.subject_id)?.nama} • {mat.jam_pelajaran}
                      </p>
                    </div>
                  </div>

                  <a
                    href={mat.file_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                    title={`Download ${mat.file_name}`}
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
