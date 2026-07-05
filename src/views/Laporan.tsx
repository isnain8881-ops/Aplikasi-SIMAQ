import React, { useState } from "react";
import { BarChart3, FileDown, Printer, Filter, Calendar, Award, CheckSquare, BookOpenCheck } from "lucide-react";
import { db } from "../utils/db";
import { Subject, ClassRoom, Student } from "../types";

export const ReportsView: React.FC = () => {
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  const [activeReport, setActiveReport] = useState<"nilai" | "absensi" | "jurnal">("nilai");

  // Filter States
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");

  const students = db.getStudents().filter(s => selectedClass === "all" || s.kelas_id === selectedClass);
  const grades = db.getGrades();
  const attendance = db.getAttendance();
  const journals = db.getJournals();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeReport === "nilai") {
      const activeSubj = subjects.find(s => s.id === selectedSubject)?.nama || "Semua Mapel";
      const activeClass = classes.find(c => c.id === selectedClass)?.nama || "Semua Kelas";
      csvContent += `LAPORAN NILAI SISWA - ALIYAH AL-QAMAR\n`;
      csvContent += `Mata Pelajaran: ${activeSubj} | Kelas: ${activeClass}\n\n`;
      csvContent += "Nama Siswa,NIS,Nilai Tugas,Nilai Harian,Nilai PTS,Nilai PAS,Nilai Akhir,Predikat\n";

      students.forEach(s => {
        const grd = grades.find(g => g.siswa_id === s.id && g.subject_id === selectedSubject);
        csvContent += `"${s.nama_lengkap}",${s.nis},${grd?.nilai_tugas || 0},${grd?.nilai_harian || 0},${grd?.nilai_pts || 0},${grd?.nilai_pas || 0},${grd?.nilai_akhir || 0},"${grd?.predikat || "E"}"\n`;
      });
    } else if (activeReport === "absensi") {
      const activeSubj = subjects.find(s => s.id === selectedSubject)?.nama || "Semua Mapel";
      const activeClass = classes.find(c => c.id === selectedClass)?.nama || "Semua Kelas";
      csvContent += `LAPORAN ABSENSI SISWA - ALIYAH AL-QAMAR\n`;
      csvContent += `Mata Pelajaran: ${activeSubj} | Kelas: ${activeClass}\n\n`;
      csvContent += "Nama Siswa,NIS,Total Hadir,Total Sakit,Total Izin,Total Alfa,Persentase (%)\n";

      students.forEach(s => {
        const sAtts = attendance.filter(a => a.siswa_id === s.id && a.subject_id === selectedSubject);
        const hadir = sAtts.filter(a => a.status === "Hadir").length;
        const sakit = sAtts.filter(a => a.status === "Sakit").length;
        const izin = sAtts.filter(a => a.status === "Izin").length;
        const alfa = sAtts.filter(a => a.status === "Alfa").length;
        const percent = sAtts.length > 0 ? Math.round((hadir / sAtts.length) * 100) : 100;

        csvContent += `"${s.nama_lengkap}",${s.nis},${hadir},${sakit},${izin},${alfa},${percent}%\n`;
      });
    } else {
      csvContent += `LAPORAN JURNAL MENGAJAR GURU - ALIYAH AL-QAMAR\n`;
      csvContent += `Rentang Tanggal: ${startDate} s/d ${endDate}\n\n`;
      csvContent += "Tanggal,Mata Pelajaran,Kelas,Jam Pelajaran,Materi Pembelajaran,Metode Pembelajaran,Siswa Hadir,Catatan Guru\n";

      const filteredJournals = journals.filter(j => {
        const isWithinDate = j.tanggal >= startDate && j.tanggal <= endDate;
        const isMapel = selectedSubject === "all" || j.subject_id === selectedSubject;
        const isClass = selectedClass === "all" || j.kelas_id === selectedClass;
        return isWithinDate && isMapel && isClass;
      });

      filteredJournals.forEach(j => {
        const subjName = subjects.find(s => s.id === j.subject_id)?.nama || "Mapel";
        const className = classes.find(c => c.id === j.kelas_id)?.nama || "Kelas";
        csvContent += `${j.tanggal},"${subjName}","${className}","${j.jam_pelajaran}","${j.materi_pembelajaran}","${j.metode_pembelajaran}",${j.jumlah_hadir},"${j.catatan_guru.replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${activeReport.toUpperCase()}_SIMAQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Report Type Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rekapitulasi Laporan Akademik</h2>
          <p className="text-xs text-gray-400">Unduh berkas PDF/Excel untuk berkas dinas pendidikan atau yayasan.</p>
        </div>

        {/* Report Tab buttons */}
        <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 w-full md:w-auto text-xs">
          <button
            onClick={() => setActiveReport("nilai")}
            className={`flex-1 md:flex-initial px-4 py-2 font-bold rounded-lg transition-all ${
              activeReport === "nilai" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Laporan Nilai
          </button>
          <button
            onClick={() => setActiveReport("absensi")}
            className={`flex-1 md:flex-initial px-4 py-2 font-bold rounded-lg transition-all ${
              activeReport === "absensi" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Laporan Absensi
          </button>
          <button
            onClick={() => setActiveReport("jurnal")}
            className={`flex-1 md:flex-initial px-4 py-2 font-bold rounded-lg transition-all ${
              activeReport === "jurnal" ? "bg-white dark:bg-[#1f202e] text-[#696cff] shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Jurnal Mengajar
          </button>
        </div>
      </div>

      {/* Filter Options Widget */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <Filter size={14} />
          <span>Filter Parameter Laporan</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {activeReport === "jurnal" ? (
            <>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Mulai Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
                />
              </div>
            </>
          ) : (
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
          )}

          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileDown size={14} />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-gray-800 dark:bg-slate-700 hover:bg-gray-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Laporan Content sheet */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm p-6 printable-area">
        
        {/* Printable report header */}
        <div className="text-center border-b-2 border-double border-gray-300 dark:border-gray-800 pb-5 mb-6">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">MADRASAH ALIYAH AL-QAMAR</h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider">Sistem Informasi Manajemen Madrasah (SIMAQ)</p>
          <p className="text-[10px] text-gray-400 mt-1">Alamat: Kampus Pendidikan Al-Qamar, Sulawesi Selatan • HP: 081241392708</p>
        </div>

        {activeReport === "nilai" && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
              <span>LAPORAN NILAI HASIL BELAJAR</span>
              <span>Mapel: {subjects.find(s => s.id === selectedSubject)?.nama || "Semua"} | Kelas: {classes.find(c => c.id === selectedClass)?.nama || "Semua"}</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3 text-center">Tugas</th>
                  <th className="p-3 text-center">Harian</th>
                  <th className="p-3 text-center">PTS</th>
                  <th className="p-3 text-center">PAS</th>
                  <th className="p-3 text-center bg-indigo-50/10 dark:bg-indigo-950/10">Nilai Akhir</th>
                  <th className="p-3 text-center bg-indigo-50/10 dark:bg-indigo-950/10">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map(s => {
                  const grd = grades.find(g => g.siswa_id === s.id && g.subject_id === selectedSubject);
                  return (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{s.nama_lengkap}</td>
                      <td className="p-3 font-mono">{s.nis}</td>
                      <td className="p-3 text-center">{grd?.nilai_tugas || 0}</td>
                      <td className="p-3 text-center">{grd?.nilai_harian || 0}</td>
                      <td className="p-3 text-center">{grd?.nilai_pts || 0}</td>
                      <td className="p-3 text-center">{grd?.nilai_pas || 0}</td>
                      <td className="p-3 text-center font-bold text-[#696cff] font-mono">{grd?.nilai_akhir || 0}</td>
                      <td className="p-3 text-center font-bold">{grd?.predikat || "E"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "absensi" && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
              <span>LAPORAN REKAPITULASI PRESENSI</span>
              <span>Mapel: {subjects.find(s => s.id === selectedSubject)?.nama || "Semua"} | Kelas: {classes.find(c => c.id === selectedClass)?.nama || "Semua"}</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3 text-center text-emerald-500">Hadir</th>
                  <th className="p-3 text-center text-blue-500">Izin</th>
                  <th className="p-3 text-center text-amber-500">Sakit</th>
                  <th className="p-3 text-center text-red-500">Alfa</th>
                  <th className="p-3 text-center font-bold">Rasio (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map(s => {
                  const sAtts = attendance.filter(a => a.siswa_id === s.id && a.subject_id === selectedSubject);
                  const hadir = sAtts.filter(a => a.status === "Hadir").length;
                  const sakit = sAtts.filter(a => a.status === "Sakit").length;
                  const izin = sAtts.filter(a => a.status === "Izin").length;
                  const alfa = sAtts.filter(a => a.status === "Alfa").length;
                  const percent = sAtts.length > 0 ? Math.round((hadir / sAtts.length) * 100) : 100;

                  return (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{s.nama_lengkap}</td>
                      <td className="p-3 font-mono">{s.nis}</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">{hadir}</td>
                      <td className="p-3 text-center text-blue-500 font-bold">{izin}</td>
                      <td className="p-3 text-center text-amber-500 font-bold">{sakit}</td>
                      <td className="p-3 text-center text-red-500 font-bold">{alfa}</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "jurnal" && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
              <span>LAPORAN JURNAL REKAP AGENDA MENGAJAR</span>
              <span>Periode: {startDate} s/d {endDate}</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-3 w-24">Tanggal</th>
                  <th className="p-3 w-32">Mapel</th>
                  <th className="p-3 w-20">Kelas</th>
                  <th className="p-3">Jam Ke-</th>
                  <th className="p-3">Rangkuman Pokok Bahasan</th>
                  <th className="p-3 text-center w-20">Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {journals.filter(j => j.tanggal >= startDate && j.tanggal <= endDate).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada jurnal mengajar dalam rentang tanggal yang dipilih.</td>
                  </tr>
                ) : (
                  journals.filter(j => j.tanggal >= startDate && j.tanggal <= endDate).map(j => {
                    return (
                      <tr key={j.id}>
                        <td className="p-3 font-mono font-bold">{j.tanggal}</td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">{subjects.find(s => s.id === j.subject_id)?.nama}</td>
                        <td className="p-3">{classes.find(c => c.id === j.kelas_id)?.nama}</td>
                        <td className="p-3">{j.jam_pelajaran}</td>
                        <td className="p-3">
                          <p className="font-semibold leading-snug">"{j.materi_pembelajaran}"</p>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Catatan: {j.catatan_guru}</span>
                        </td>
                        <td className="p-3 text-center font-bold font-mono">{j.jumlah_hadir}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
