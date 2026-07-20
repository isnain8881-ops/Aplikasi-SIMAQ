import React, { useState } from "react";
import { Plus, Edit2, Trash2, Search, Filter, BookOpen, School, Users, Check, AlertCircle, Key, RefreshCw } from "lucide-react";
import { db } from "../utils/db";
import { Subject, ClassRoom, Student } from "../types";

// =========================================================================
// 1. MATA PELAJARAN MODULE (SUBJECTS)
// =========================================================================
export const SubjectsModule: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<Subject | null>(null);

  // Form Fields
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");

  const handleOpenAdd = () => {
    setEditingSubj(null);
    setKode("");
    setNama("");
    setError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setEditingSubj(subj);
    setKode(subj.kode);
    setNama(subj.nama);
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!kode.trim() || !nama.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    const payload: Subject = {
      id: editingSubj?.id || `sub-${Date.now()}`,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim()
    };

    // Duplicate Check
    const exists = subjects.some(s => s.kode === payload.kode && s.id !== payload.id);
    if (exists) {
      setError("Kode Mata Pelajaran sudah terdaftar!");
      return;
    }

    db.saveSubject(payload);
    setSubjects(db.getSubjects());
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) {
      await db.deleteSubject(id);
      setSubjects(db.getSubjects());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mata Pelajaran</h2>
          <p className="text-xs text-gray-400">Kelola kurikulum mata pelajaran Aliyah Al-Qamar.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#696cff]20"
        >
          <Plus size={16} />
          Tambah Mapel
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {editingSubj ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Kode Mapel</label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="Misal: MTK-12"
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nama Mapel</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Matematika Aliyah"
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#696cff] text-white text-xs font-bold rounded-xl"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <div key={s.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:translate-y-[-2px] transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] rounded-xl">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 block font-bold">{s.kode}</span>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{s.nama}</h4>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleOpenEdit(s)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors">
                <Edit2 size={13} />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 2. KELAS MODULE (CLASSES)
// =========================================================================
export const ClassesModule: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>(db.getClasses());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // Form Fields
  const [nama, setNama] = useState("");
  const [tingkat, setTingkat] = useState("12");
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [error, setError] = useState("");

  const handleOpenAdd = () => {
    setEditingClass(null);
    setNama("");
    setTingkat("12");
    setTahunAjaran("2025/2026");
    setError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setNama(cls.nama);
    setTingkat(cls.tingkat);
    setTahunAjaran(cls.tahun_ajaran);
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama Kelas wajib diisi.");
      return;
    }

    const payload: ClassRoom = {
      id: editingClass?.id || `class-${Date.now()}`,
      nama: nama.trim(),
      tingkat,
      tahun_ajaran: tahunAjaran
    };

    db.saveClass(payload);
    setClasses(db.getClasses());
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin menghapus kelas ini? Menghapus kelas mungkin mempengaruhi penempatan siswa.")) {
      await db.deleteClass(id);
      setClasses(db.getClasses());
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA kelas? Tindakan ini juga akan mengosongkan relasi jadwal mengajar, absensi, tugas, jurnal, dan penempatan kelas para siswa.")) {
      await db.deleteAllClasses();
      setClasses([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Kelas</h2>
          <p className="text-xs text-gray-400">Kelola pembagian kelas dan tahun ajaran siswa.</p>
        </div>
        <div className="flex items-center gap-2">
          {classes.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-rose-500/10 cursor-pointer"
            >
              <Trash2 size={16} />
              Kosongkan Kelas
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#696cff]20"
          >
            <Plus size={16} />
            Tambah Kelas
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {editingClass ? "Edit Informasi Kelas" : "Tambah Kelas Baru"}
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nama Kelas</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: XII IPA 1"
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Tingkat</label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="10">Kelas 10 (Sepuluh)</option>
                <option value="11">Kelas 11 (Sebelas)</option>
                <option value="12">Kelas 12 (Dua Belas)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Tahun Ajaran</label>
              <input
                type="text"
                required
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="Misal: 2025/2026"
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#696cff] text-white text-xs font-bold rounded-xl"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => {
          const classStudents = db.getStudents().filter(s => s.kelas_id === c.id);
          return (
            <div key={c.id} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#696cff]/10 text-[#696cff] rounded-xl">
                    <School size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white">{c.nama}</h4>
                    <span className="text-[10px] text-gray-400 block font-mono">Tahun Ajaran: {c.tahun_ajaran}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(c)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400">
                    <Edit2 size={11} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[11px] text-gray-500">
                <span>Tingkat Aliyah: {c.tingkat}</span>
                <span className="font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                  {classStudents.length} Siswa
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// 3. SISWA MODULE (STUDENTS)
// =========================================================================
export const StudentsModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const classes = db.getClasses();
  
  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  // Form Fields
  const [nis, setNis] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [hpOrtu, setHpOrtu] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [error, setError] = useState("");

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNis("");
    setNamaLengkap("");
    setJenisKelamin("Laki-laki");
    setTempatLahir("");
    setTanggalLahir("");
    setAlamat("");
    setHpOrtu("");
    setKelasId(classes[0]?.id || "");
    setError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stud: Student) => {
    setEditingStudent(stud);
    setNis(stud.nis);
    setNamaLengkap(stud.nama_lengkap);
    setJenisKelamin(stud.jenis_kelamin);
    setTempatLahir(stud.tempat_lahir);
    setTanggalLahir(stud.tanggal_lahir);
    setAlamat(stud.alamat);
    setHpOrtu(stud.hp_ortu);
    setKelasId(stud.kelas_id);
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nis.trim() || !namaLengkap.trim() || !tempatLahir.trim() || !tanggalLahir.trim() || !alamat.trim() || !hpOrtu.trim() || !kelasId) {
      setError("Semua kolom isian wajib dilengkapi.");
      return;
    }

    const payload: Student = {
      id: editingStudent?.id || `stud-${Date.now()}`,
      nis: nis.trim(),
      nama_lengkap: namaLengkap.trim(),
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir.trim(),
      tanggal_lahir: tanggalLahir,
      alamat: alamat.trim(),
      hp_ortu: hpOrtu.trim(),
      kelas_id: kelasId
    };

    // NIS Duplicate check
    const exists = students.some(s => s.nis === payload.nis && s.id !== payload.id);
    if (exists) {
      setError("NIS/NISN sudah terdaftar pada siswa lain!");
      return;
    }

    db.saveStudent(payload);
    setStudents(db.getStudents());
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus data siswa ini? Ini akan menghapus nilai dan presensi terkait.")) {
      await db.deleteStudent(id);
      setStudents(db.getStudents());
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SELURUH nama siswa yang terdaftar dalam aplikasi? Tindakan ini juga akan mengosongkan data nilai, kehadiran, dan pengerjaan tugas para siswa.")) {
      await (db as any).deleteAllStudents();
      setStudents([]);
    }
  };

  const handleResetPassword = (student: Student) => {
    const confirm = window.confirm(`Reset kata sandi siswa "${student.nama_lengkap}" kembali ke default ("siswa123" atau NISN)?`);
    if (confirm) {
      (db as any).setStudentPassword(student.nis, "");
      setStudents(db.getStudents());
    }
  };

  const handleSetCustomPassword = (student: Student) => {
    const newPw = window.prompt(`Masukkan kata sandi baru untuk siswa "${student.nama_lengkap}" (minimal 6 karakter):`);
    if (newPw !== null) {
      if (newPw.trim().length < 6) {
        alert("Sandi baru harus minimal 6 karakter!");
        return;
      }
      (db as any).setStudentPassword(student.nis, newPw.trim());
      setStudents(db.getStudents());
      alert(`Sandi untuk "${student.nama_lengkap}" berhasil diperbarui menjadi: "${newPw.trim()}"`);
    }
  };

  // Search & Filter computation
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nis.includes(searchQuery) ||
                          s.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === "all" || s.kelas_id === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1f202e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Data Induk Siswa</h2>
          <p className="text-xs text-gray-400">Pengelolaan profil, biodata, dan kelas siswa Madrasah Aliyah.</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {students.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Trash2 size={15} />
              Kosongkan Semua Siswa
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin mereset semua nama siswa kembali ke daftar bawaan simulasi? Tindakan ini akan mengembalikan data awal.")) {
                db.resetStudents();
                setStudents(db.getStudents());
                alert("Semua nama siswa berhasil direset ke daftar bawaan!");
              }
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw size={15} />
            Reset Nama Siswa
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus size={16} />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* CRUD Form overlay or block */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            {editingStudent ? "Edit Biodata Siswa" : "Registrasi Siswa Baru"}
          </h3>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">NIS / NISN</label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Nomor Induk Siswa"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Nama Lengkap</label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Sesuai Ijazah"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as "Laki-laki" | "Perempuan")}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Tempat Lahir</label>
              <input
                type="text"
                required
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                placeholder="Kota Kelahiran"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Tanggal Lahir</label>
              <input
                type="date"
                required
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Hubungkan Kelas</label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="">Pilih Kelas...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nama} ({c.tahun_ajaran})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">Alamat Lengkap Rumah</label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jalan, RT/RW, Kecamatan, Kabupaten/Kota"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1 font-semibold">No. HP Orang Tua / Wali</label>
              <input
                type="text"
                required
                value={hpOrtu}
                onChange={(e) => setHpOrtu(e.target.value)}
                placeholder="0812xxxxxxxx"
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
              Simpan Data Siswa
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NISN, atau alamat..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={15} className="text-gray-400" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          >
            <option value="all">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-4">Biodata Siswa</th>
                <th className="p-4">NIS / NISN</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Sandi Akun</th>
                <th className="p-4">Kontak Ortu</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Siswa tidak ditemukan atau data masih kosong.</td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sClass = classes.find(c => c.id === s.kelas_id);
                  const customPw = (db as any).getStudentPassword(s.nis);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/10 text-gray-700 dark:text-gray-300">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{s.nama_lengkap}</p>
                          <span className="text-[10px] text-gray-400 font-mono">{s.tempat_lahir}, {new Date(s.tanggal_lahir).toLocaleDateString("id-ID")}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium">{s.nis}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.jenis_kelamin === "Laki-laki" ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" : "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400"}`}>
                          {s.jenis_kelamin}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {sClass?.nama || "Unassigned"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold ${customPw ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            {customPw ? customPw : "Default (Sandi: siswa123 / NISN)"}
                          </span>
                          <button 
                            onClick={() => handleSetCustomPassword(s)}
                            title="Atur Sandi Kustom Baru"
                            className="p-1 rounded bg-gray-50 dark:bg-slate-850 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <Key size={11} />
                          </button>
                          {customPw && (
                            <button 
                              onClick={() => handleResetPassword(s)}
                              title="Reset Sandi ke Default"
                              className="p-1 rounded bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <RefreshCw size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono">{s.hp_ortu}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleOpenEdit(s)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                            <Trash2 size={13} />
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
      </div>

    </div>
  );
};
