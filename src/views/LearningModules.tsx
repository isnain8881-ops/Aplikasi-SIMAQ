import React, { useState } from "react";
import { Plus, Eye, Trash2, FileText, Download, Link2, Calendar, ClipboardList, Clock, AlertCircle } from "lucide-react";
import { db } from "../utils/db";
import { Material, Assignment } from "../types";

// =========================================================================
// 1. MATERI AJAR MODULE (MATERIALS)
// =========================================================================
export const MaterialsModule: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(db.getMaterials());
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [jamPelajaran, setJamPelajaran] = useState("I & II (07:30 - 09:00)");
  const [materiPembelajaran, setMateriPembelajaran] = useState("");
  const [metodePembelajaran, setMetodePembelajaran] = useState("Ceramah & Diskusi Kelompok");
  
  // simulated uploads
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileUrl, setFileUrl] = useState("");

  const handleOpenAdd = () => {
    setTanggal(new Date().toISOString().split("T")[0]);
    setSelectedSubject(subjects[0]?.id || "");
    setSelectedClass(classes[0]?.id || "");
    setJamPelajaran("I & II (07:30 - 09:00)");
    setMateriPembelajaran("");
    setMetodePembelajaran("Ceramah & Diskusi Kelompok");
    setFileName("");
    setFileType("PDF");
    setFileUrl("");
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!materiPembelajaran.trim()) {
      setError("Materi pembelajaran tidak boleh kosong.");
      return;
    }

    const payload: Material = {
      id: `mat-${Date.now()}`,
      tanggal,
      subject_id: selectedSubject,
      kelas_id: selectedClass,
      jam_pelajaran: jamPelajaran,
      materi_pembelajaran: materiPembelajaran.trim(),
      metode_pembelajaran: metodePembelajaran,
      file_name: fileName.trim() || undefined,
      file_type: fileType,
      file_url: fileUrl.trim() || "https://example.com/mock-download-file"
    };

    db.saveMaterial(payload);
    setMaterials(db.getMaterials());
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus materi ajar ini?")) {
      db.deleteMaterial(id);
      setMaterials(db.getMaterials());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bahan & Materi Ajar</h2>
          <p className="text-xs text-gray-400">Pengunggahan silabus, buku digital, modul PDF, presentasi PPT, video, dan link eksternal.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus size={16} />
          Unggah Materi
        </button>
      </div>

      {/* Form block */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Unggah Bahan Pembelajaran Baru
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Tanggal Posting</label>
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
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Jam Pertemuan</label>
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
                placeholder="Misal: Ceramah, Diskusi, Praktek"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Jenis Berkas (File Type)</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="PDF">Dokumen PDF</option>
                <option value="Word">Microsoft Word (.doc/docx)</option>
                <option value="PPT">PowerPoint Presentation (.ppt/pptx)</option>
                <option value="Video">Video Pembelajaran</option>
                <option value="Link">Tautan URL Eksternal</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Pokok Bahasan / Materi Pembelajaran</label>
              <input
                type="text"
                required
                value={materiPembelajaran}
                onChange={(e) => setMateriPembelajaran(e.target.value)}
                placeholder="Misal: Limit Fungsi Trigonometri, Hukum Fiqh Nikah, dll."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Nama Berkas Lampiran</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Buku_Saku_Limit.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Tautan/Link Unduhan (URL)</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
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
              Publikasikan Materi
            </button>
          </div>
        </form>
      )}

      {/* Grid view of posted materials */}
      {materials.length === 0 ? (
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
          Belum ada bahan ajar yang diunggah. Klik tombol di kanan atas untuk mempublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((m) => {
            const mSubj = subjects.find(s => s.id === m.subject_id);
            const mClass = classes.find(c => c.id === m.kelas_id);

            return (
              <div key={m.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-[#696cff] bg-[#696cff]/10 px-2 py-0.5 rounded">
                        {mSubj?.nama || "Mapel"}
                      </span>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded">
                        {mClass?.nama || "Kelas"}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(m.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/15 text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl flex-shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-snug">{m.materi_pembelajaran}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Jam: {m.jam_pelajaran} • Metode: {m.metode_pembelajaran}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[10px] text-gray-400">
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar size={11} />
                    <span>{new Date(m.tanggal).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
                  </div>

                  {m.file_name ? (
                    <a
                      href={m.file_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span className="truncate max-w-[120px]">{m.file_name}</span>
                    </a>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 font-mono italic">Tanpa Lampiran</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

// =========================================================================
// 2. PENUGASAN MODULE (ASSIGNMENTS)
// =========================================================================
export const AssignmentsModule: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments());
  const subjects = db.getSubjects();
  const classes = db.getClasses();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  // Submissions review overlay
  const [activeReviewAssignment, setActiveReviewAssignment] = useState<Assignment | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [materiPelajaran, setMateriPelajaran] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleOpenAdd = () => {
    setTanggal(new Date().toISOString().split("T")[0]);
    setSelectedSubject(subjects[0]?.id || "");
    setSelectedClass(classes[0]?.id || "");
    setMateriPelajaran("");
    setDeskripsi("");
    setDeadline("");
    setFileName("");
    setFileUrl("");
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!materiPelajaran.trim() || !deskripsi.trim()) {
      setError("Nama tugas (Materi Pelajaran) dan instruksi deskripsi tugas harus diisi.");
      return;
    }

    const payload: Assignment = {
      id: `asg-${Date.now()}`,
      tanggal,
      subject_id: selectedSubject,
      kelas_id: selectedClass,
      materi_pelajaran: materiPelajaran.trim(),
      deskripsi: deskripsi.trim(),
      deadline: deadline || undefined,
      file_name: fileName.trim() || undefined,
      file_url: fileUrl.trim() || undefined
    };

    db.saveAssignment(payload);
    setAssignments(db.getAssignments());
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Menghapus penugasan ini juga akan menghapus seluruh data pengerjaan tugas dari siswa. Yakin ingin melanjutkan?")) {
      db.deleteAssignment(id);
      setAssignments(db.getAssignments());
    }
  };

  // Grade/Save Submission Review
  const [reviewGrade, setReviewGrade] = useState<Record<string, { grade: string; feedback: string }>>({});

  const loadSubmissions = () => {
    if (!activeReviewAssignment) return [];
    return db.getSubmissions().filter(sub => sub.assignment_id === activeReviewAssignment.id);
  };

  const handleGradeChange = (submissionId: string, field: "grade" | "feedback", value: string) => {
    setReviewGrade(prev => ({
      ...prev,
      [submissionId]: {
        grade: prev[submissionId]?.grade || "0",
        feedback: prev[submissionId]?.feedback || "",
        [field]: value
      }
    }));
  };

  const handleSaveGradeReview = (subId: string) => {
    const input = reviewGrade[subId] || { grade: "0", feedback: "" };
    const score = parseFloat(input.grade) || 0;

    const allSubs = db.getSubmissions();
    const idx = allSubs.findIndex(s => s.id === subId);
    if (idx >= 0) {
      allSubs[idx] = {
        ...allSubs[idx],
        nilai: Math.min(Math.max(score, 0), 100),
        catatan_guru: input.feedback
      };
      localStorage.setItem("simaq_submissions", JSON.stringify(allSubs));
      alert("Nilai pengerjaan tugas siswa berhasil diunggah!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Penugasan & Homework</h2>
          <p className="text-xs text-gray-400">Pembuatan modul tugas siswa, penetapan tenggat waktu, serta penelaahan hasil pengerjaan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus size={16} />
          Buat Tugas Baru
        </button>
      </div>

      {/* Form block */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Rilis Agenda Penugasan Baru
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Tanggal Mulai</label>
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
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Target Kelas</label>
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
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Nama Tugas / Topik Pembelajaran</label>
              <input
                type="text"
                required
                value={materiPelajaran}
                onChange={(e) => setMateriPelajaran(e.target.value)}
                placeholder="Misal: Latihan Soal Bab 2 Limit Trigonometri"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Tenggat Waktu Kumpul (Deadline)</label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">Instruksi Lengkap Pengerjaan</label>
              <textarea
                required
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tulis instruksi pengerjaan tugas secara rinci di sini..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Nama Berkas Soal</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Lembar_Soal_Mtk_Trig.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 mb-1.5 font-semibold font-mono">Tautan/Link Berkas (URL)</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
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
              Rilis Penugasan
            </button>
          </div>
        </form>
      )}

      {/* Grid listing of assignments */}
      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
          Belum ada modul penugasan yang aktif. Klik "Buat Tugas Baru" di kanan atas untuk mempublikasikannya.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => {
            const aSubj = subjects.find(s => s.id === a.subject_id);
            const aClass = classes.find(c => c.id === a.kelas_id);
            const subsForAsg = db.getSubmissions().filter(s => s.assignment_id === a.id);
            const completedCount = subsForAsg.filter(s => s.status === "Selesai").length;

            return (
              <div key={a.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                        {aSubj?.nama || "Mapel"}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                        Kelas {aClass?.nama || "Kelas"}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(a.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/15 text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-xl flex-shrink-0">
                      <ClipboardList size={22} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-snug truncate">{a.materi_pelajaran}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{a.deskripsi}</p>
                    </div>
                  </div>
                </div>

                {/* Submissions count summary & Action */}
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[10px]">
                  <div className="flex flex-col font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Tenggat: {a.deadline ? new Date(a.deadline).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "Tidak ada"}
                    </span>
                    <span className="text-emerald-500 font-bold mt-1">
                      Mengumpulkan: {completedCount} / {subsForAsg.length} Siswa
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveReviewAssignment(a);
                      // Pre-fill existing submission reviews
                      const activeSubs = db.getSubmissions().filter(s => s.assignment_id === a.id);
                      const reviews: typeof reviewGrade = {};
                      activeSubs.forEach(s => {
                        reviews[s.id] = {
                          grade: s.nilai?.toString() || "",
                          feedback: s.catatan_guru || ""
                        };
                      });
                      setReviewGrade(reviews);
                    }}
                    className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Eye size={12} />
                    Periksa ({completedCount})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Submissions Drawer/Modal Overlay */}
      {activeReviewAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f202e] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Penilaian Hasil Tugas: "{activeReviewAssignment.materi_pelajaran}"
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  Kelas: {classes.find(c => c.id === activeReviewAssignment.kelas_id)?.nama} • Mapel: {subjects.find(s => s.id === activeReviewAssignment.subject_id)?.nama}
                </span>
              </div>
              <button 
                onClick={() => {
                  setActiveReviewAssignment(null);
                  setAssignments(db.getAssignments()); // sync counts
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* List of Student Submissions */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {loadSubmissions().length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">Belum ada siswa di kelas ini.</div>
              ) : (
                loadSubmissions().map((sub) => {
                  const student = db.getStudents().find(s => s.id === sub.siswa_id);
                  const isSubmitted = sub.status === "Selesai";
                  const rev = reviewGrade[sub.id] || { grade: "", feedback: "" };

                  return (
                    <div 
                      key={sub.id} 
                      className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
                        isSubmitted ? "bg-gray-50/50 dark:bg-slate-900/10 border-gray-100 dark:border-gray-800" : "bg-red-50/10 dark:bg-red-950/5 border-dashed border-red-100 dark:border-red-950/20"
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <p className="font-bold text-xs text-gray-900 dark:text-white">{student?.nama_lengkap || "Siswa"}</p>
                        <span className="text-[10px] text-gray-400 block font-mono">NIS: {student?.nis}</span>
                        {isSubmitted ? (
                          <div className="space-y-1.5 pt-1.5 text-[11px]">
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                              Diserahkan: {new Date(sub.tanggal_submit).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                            <a href={sub.file_url || "#"} target="_blank" rel="noopener noreferrer" className="text-[#696cff] hover:underline font-bold block truncate max-w-[200px]">
                              📁 {sub.file_name || "Jawaban_Tugas.pdf"}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded inline-block mt-1">
                            Belum Mengerjakan
                          </span>
                        )}
                      </div>

                      {/* Grading inputs */}
                      {isSubmitted && (
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                          <div>
                            <label className="block text-[10px] text-gray-400 font-bold mb-0.5">Nilai (0-100)</label>
                            <input
                              type="number"
                              required
                              value={rev.grade}
                              onChange={(e) => handleGradeChange(sub.id, "grade", e.target.value)}
                              placeholder="Nilai"
                              className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                            />
                          </div>
                          <div className="flex-1 md:w-48">
                            <label className="block text-[10px] text-gray-400 font-bold mb-0.5">Komentar/Saran Guru</label>
                            <input
                              type="text"
                              value={rev.feedback}
                              onChange={(e) => handleGradeChange(sub.id, "feedback", e.target.value)}
                              placeholder="Kerja bagus, dsb."
                              className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveGradeReview(sub.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] self-end h-[28px]"
                          >
                            Simpan Nilai
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
