import { createClient } from "@supabase/supabase-js";
import { 
  Profile, Subject, ClassRoom, Student, Grade, 
  Attendance, Material, Assignment, AssignmentSubmission, TeachingJournal 
} from "../types";

// Attempt to load Supabase config from environment variables
const getCleanEnvValue = (val: string): string => {
  if (!val) return "";
  return val.replace(/['"]/g, "").trim();
};

const SUPABASE_URL = getCleanEnvValue((import.meta as any).env.VITE_SUPABASE_URL || "");
const SUPABASE_ANON_KEY = getCleanEnvValue((import.meta as any).env.VITE_SUPABASE_ANON_KEY || "");

export const isSupabaseConfigured = (): boolean => {
  const isDefaultOrPlaceholder = (val: string) => {
    const clean = val.toLowerCase();
    return (
      clean === "" ||
      clean.includes("your-project-id") ||
      clean.includes("your-anon-public-key") ||
      clean.includes("placeholder")
    );
  };
  return (
    SUPABASE_URL.length > 0 &&
    SUPABASE_ANON_KEY.length > 0 &&
    !isDefaultOrPlaceholder(SUPABASE_URL) &&
    !isDefaultOrPlaceholder(SUPABASE_ANON_KEY)
  );
};

// Simple logger or client init
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// ==========================================
// PRE-SEEDED MOCK DATA (LOCAL STORAGE FALLBACK)
// ==========================================

const DEFAULT_GURU: Profile = {
  id: "guru-isnain",
  role: "guru",
  nama: "Isnain, S.Pd",
  email: "isnain8881@gmail.com",
  nip_nisn: "198108082007101002",
  hp: "081241392708",
  photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  created_at: new Date().toISOString()
};

const DEFAULT_SISWA_PROFILE: Profile = {
  id: "siswa-fatih",
  role: "siswa",
  nama: "Muhammad Al-Fatih",
  email: "isnain8881@gmail.com", // User asked to use this email for both teacher and student logins
  nip_nisn: "2007101002", // NISN
  hp: "081241392708", // same phone number
  photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
  created_at: new Date().toISOString()
};

const INITIAL_SUBJECTS: Subject[] = [
  { id: "sub-1", kode: "MTK-12", nama: "Matematika Aliyah" },
  { id: "sub-2", kode: "PAI-12", nama: "Pendidikan Agama Islam (Fiqih)" },
  { id: "sub-3", kode: "BING-12", nama: "Bahasa Inggris" },
  { id: "sub-4", kode: "FIS-12", nama: "Fisika" }
];

const INITIAL_CLASSES: ClassRoom[] = [
  { id: "class-1", nama: "XII IPA 1", tingkat: "12", tahun_ajaran: "2025/2026" },
  { id: "class-2", nama: "XII IPS 1", tingkat: "12", tahun_ajaran: "2025/2026" },
  { id: "class-3", nama: "XI IPA 1", tingkat: "11", tahun_ajaran: "2025/2026" }
];

const INITIAL_STUDENTS: Student[] = [
  { id: "stud-1", nis: "2007101002", nama_lengkap: "Muhammad Al-Fatih", jenis_kelamin: "Laki-laki", tempat_lahir: "Makassar", tanggal_lahir: "2008-01-15", alamat: "Jl. Al-Qamar No. 12, Makassar", hp_ortu: "081241392708", kelas_id: "class-1" },
  { id: "stud-2", nis: "2007101003", nama_lengkap: "Siti Aisyah", jenis_kelamin: "Perempuan", tempat_lahir: "Gowa", tanggal_lahir: "2008-05-20", alamat: "Perumahan Indah Gowa Block B", hp_ortu: "081234567890", kelas_id: "class-1" },
  { id: "stud-3", nis: "2007101004", nama_lengkap: "Ahmad Dani", jenis_kelamin: "Laki-laki", tempat_lahir: "Maros", tanggal_lahir: "2007-11-03", alamat: "Jl. Pendidikan Maros No. 5", hp_ortu: "085233221144", kelas_id: "class-1" },
  { id: "stud-4", nis: "2007101005", nama_lengkap: "Fatimah Az-Zahra", jenis_kelamin: "Perempuan", tempat_lahir: "Makassar", tanggal_lahir: "2008-02-14", alamat: "Kompleks Perhubungan Makassar", hp_ortu: "081344556677", kelas_id: "class-2" },
  { id: "stud-5", nis: "2007101006", nama_lengkap: "Yusuf Sulaiman", jenis_kelamin: "Laki-laki", tempat_lahir: "Takalar", tanggal_lahir: "2008-09-09", alamat: "Jl. Poros Takalar Km 2", hp_ortu: "082199887766", kelas_id: "class-2" }
];

const INITIAL_GRADES: Grade[] = [
  { id: "grd-1", siswa_id: "stud-1", kelas_id: "class-1", subject_id: "sub-1", nilai_tugas: 85, nilai_harian: 80, nilai_pts: 78, nilai_pas: 82, nilai_akhir: 81.1, predikat: "B" },
  { id: "grd-2", siswa_id: "stud-2", kelas_id: "class-1", subject_id: "sub-1", nilai_tugas: 95, nilai_harian: 90, nilai_pts: 88, nilai_pas: 92, nilai_akhir: 91.1, predikat: "A" },
  { id: "grd-3", siswa_id: "stud-3", kelas_id: "class-1", subject_id: "sub-1", nilai_tugas: 75, nilai_harian: 70, nilai_pts: 72, nilai_pas: 75, nilai_akhir: 72.9, predikat: "C" },
  { id: "grd-4", siswa_id: "stud-1", kelas_id: "class-1", subject_id: "sub-2", nilai_tugas: 90, nilai_harian: 92, nilai_pts: 85, nilai_pas: 88, nilai_akhir: 88.9, predikat: "A" },
  { id: "grd-5", siswa_id: "stud-2", kelas_id: "class-1", subject_id: "sub-2", nilai_tugas: 88, nilai_harian: 85, nilai_pts: 80, nilai_pas: 85, nilai_akhir: 84.4, predikat: "B" }
];

const INITIAL_ATTENDANCE: Attendance[] = [
  // XII IPA 1, sub-1 (MTK), 2026-07-01
  { id: "att-1", siswa_id: "stud-1", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-01", status: "Hadir" },
  { id: "att-2", siswa_id: "stud-2", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-01", status: "Hadir" },
  { id: "att-3", siswa_id: "stud-3", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-01", status: "Izin" },
  // XII IPA 1, sub-1 (MTK), 2026-07-02
  { id: "att-4", siswa_id: "stud-1", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-02", status: "Hadir" },
  { id: "att-5", siswa_id: "stud-2", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-02", status: "Sakit" },
  { id: "att-6", siswa_id: "stud-3", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-02", status: "Hadir" },
  // XII IPA 1, sub-1 (MTK), 2026-07-03
  { id: "att-7", siswa_id: "stud-1", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-03", status: "Hadir" },
  { id: "att-8", siswa_id: "stud-2", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-03", status: "Hadir" },
  { id: "att-9", siswa_id: "stud-3", kelas_id: "class-1", subject_id: "sub-1", tanggal: "2026-07-03", status: "Alfa" }
];

const INITIAL_MATERIALS: Material[] = [
  {
    id: "mat-1",
    tanggal: "2026-07-01",
    subject_id: "sub-1",
    kelas_id: "class-1",
    jam_pelajaran: "07:30 - 09:00",
    materi_pembelajaran: "Limit Fungsi Aljabar dan Trigonometri",
    metode_pembelajaran: "Ceramah dan Diskusi Kelompok",
    file_name: "Modul_Limit_Fungsi.pdf",
    file_type: "PDF",
    file_url: "https://example.com/files/Modul_Limit_Fungsi.pdf"
  },
  {
    id: "mat-2",
    tanggal: "2026-07-02",
    subject_id: "sub-2",
    kelas_id: "class-1",
    jam_pelajaran: "09:15 - 10:45",
    materi_pembelajaran: "Zakat Fitrah dan Zakat Mal",
    metode_pembelajaran: "Diskusi Interaktif & Pemecahan Kasus",
    file_name: "Panduan_Zakat_Praktis.pptx",
    file_type: "PPT",
    file_url: "https://example.com/files/Panduan_Zakat_Praktis.pptx"
  }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    tanggal: "2026-07-01",
    subject_id: "sub-1",
    kelas_id: "class-1",
    materi_pelajaran: "Latihan Soal Limit Fungsi Trigonometri",
    deskripsi: "Kerjakan soal Latihan 1.2 di Buku Paket halaman 25 nomor 1-10. Tulis tangan dan kumpulkan dalam format PDF.",
    deadline: "2026-07-10T23:59",
    file_name: "Latihan_Limit_Trig.pdf",
    file_url: "https://example.com/assignments/Latihan_Limit_Trig.pdf"
  },
  {
    id: "asg-2",
    tanggal: "2026-07-02",
    subject_id: "sub-2",
    kelas_id: "class-1",
    materi_pelajaran: "Analisis Ketentuan Zakat Mal Kontemporer",
    deskripsi: "Tulis esai singkat 2 halaman mengenai zakat profesi di era modern, kumpulkan dalam format Word atau PDF.",
    deadline: "2026-07-12T23:59",
    file_name: "Tugas_Zakat_Profesi.docx",
    file_url: "https://example.com/assignments/Tugas_Zakat_Profesi.docx"
  }
];

const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: "subm-1",
    assignment_id: "asg-1",
    siswa_id: "stud-1",
    tanggal_submit: "2026-07-03T14:20",
    file_name: "Jawaban_Limit_Trig_Fatih.pdf",
    file_url: "https://example.com/submissions/Jawaban_Limit_Trig_Fatih.pdf",
    status: "Selesai",
    nilai: 85,
    catatan_guru: "Kerja bagus, pengerjaan rapi dan tepat!"
  },
  {
    id: "subm-2",
    assignment_id: "asg-2",
    siswa_id: "stud-1",
    tanggal_submit: "",
    file_name: "",
    file_url: "",
    status: "Belum Dikerjakan"
  }
];

const INITIAL_JOURNALS: TeachingJournal[] = [
  {
    id: "jrnl-1",
    tanggal: "2026-07-01",
    subject_id: "sub-1",
    kelas_id: "class-1",
    jam_pelajaran: "I & II (07:30 - 09:00)",
    materi_pembelajaran: "Limit Fungsi Aljabar",
    metode_pembelajaran: "Problem Based Learning",
    jumlah_hadir: 2,
    catatan_guru: "Siswa sangat antusias. Ahmad Dani mengalami sedikit kendala pada faktorisasi kuadrat.",
    lampiran_name: "Foto_Kelas_Mtk_01072026.jpg",
    lampiran_url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=200",
    created_at: "2026-07-01T09:30:00Z"
  },
  {
    id: "jrnl-2",
    tanggal: "2026-07-02",
    subject_id: "sub-2",
    kelas_id: "class-1",
    jam_pelajaran: "III & IV (09:15 - 10:45)",
    materi_pembelajaran: "Zakat Fitrah",
    metode_pembelajaran: "Diskusi Kelompok",
    jumlah_hadir: 2,
    catatan_guru: "Siti Aisyah aktif memimpin kelompok diskusinya. Materi tersampaikan penuh.",
    lampiran_name: "Rencana_Belajar.pdf",
    lampiran_url: "https://example.com/Rencana_Belajar.pdf",
    created_at: "2026-07-02T11:00:00Z"
  }
];

// Ensure LS keys exist
const initLS = () => {
  const checkAndSet = (key: string, val: any) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  // Auth accounts
  checkAndSet("simaq_profile_guru", DEFAULT_GURU);
  checkAndSet("simaq_profile_siswa", DEFAULT_SISWA_PROFILE);
  checkAndSet("simaq_subjects", INITIAL_SUBJECTS);
  checkAndSet("simaq_classes", INITIAL_CLASSES);
  checkAndSet("simaq_students", INITIAL_STUDENTS);
  checkAndSet("simaq_grades", INITIAL_GRADES);
  checkAndSet("simaq_attendance", INITIAL_ATTENDANCE);
  checkAndSet("simaq_materials", INITIAL_MATERIALS);
  checkAndSet("simaq_assignments", INITIAL_ASSIGNMENTS);
  checkAndSet("simaq_submissions", INITIAL_SUBMISSIONS);
  checkAndSet("simaq_journals", INITIAL_JOURNALS);
  
  if (!localStorage.getItem("simaq_current_user")) {
    // default to empty
  }
};

// Initialize LS right away
if (typeof window !== "undefined") {
  initLS();
}

// ==========================================
// CENTRAL DATABASE DRIVER (CRUD WRAPPER)
// ==========================================

type ErrorListener = (message: string) => void;
let errorListeners: ErrorListener[] = [];

const handleSupabaseResult = (promise: Promise<{ error: any }>, actionDesc: string) => {
  promise.then(({ error }) => {
    if (error) {
      const errMsg = error.message || String(error);
      const detail = error.details || "";
      const hint = error.hint || "";
      const isRelationError = errMsg.toLowerCase().includes("relation") && errMsg.toLowerCase().includes("does not exist");
      const isUuidError = errMsg.toLowerCase().includes("uuid") || errMsg.toLowerCase().includes("invalid input syntax for type uuid");
      
      let fullError = `${actionDesc} gagal. Error: ${errMsg}.${detail ? ' Detail: ' + detail : ''}${hint ? ' Hint: ' + hint : ''}`;
      if (isRelationError) {
        fullError = `Gagal menyimpan data ke Supabase (${actionDesc}): Tabel belum dibuat di database Supabase Anda. Silakan buka ikon Database di navbar atas (Bantuan Supabase), lalu salin & jalankan Script SQL lengkap di SQL Editor Supabase Anda untuk membuat tabel yang dibutuhkan!`;
      } else if (isUuidError) {
        fullError = `Gagal menyimpan data ke Supabase (${actionDesc}): Terjadi kesalahan tipe data UUID. Tabel Anda di Supabase saat ini menggunakan tipe data UUID untuk kolom ID, sedangkan aplikasi ini membutuhkan tipe TEXT agar bisa mengelola kode ID kustom (seperti "sub-1", "cls-1"). Silakan klik ikon database di navbar atas ("Bantuan Supabase"), salin seluruh Script SQL, lalu jalankan di SQL Editor Supabase Anda untuk membuat ulang tabel dengan tipe yang benar!`;
      }
      
      console.error(fullError, error);
      db.notifyError(fullError);
    }
  }).catch(err => {
    const fullError = `${actionDesc} gagal. Exception: ${err.message || String(err)}`;
    console.error(fullError, err);
    db.notifyError(fullError);
  });
};

export const db = {
  isSupabaseConfigured: isSupabaseConfigured,
  
  // --- ERROR NOTIFICATION SERVICE ---
  addErrorListener: (listener: ErrorListener) => {
    errorListeners.push(listener);
    return () => {
      errorListeners = errorListeners.filter(l => l !== listener);
    };
  },
  
  notifyError: (message: string) => {
    errorListeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        console.error("Error invoking database error listener:", err);
      }
    });
  },

  // --- AUTH SERVICES ---
  login: async (email: string, password: string, role: "guru" | "siswa"): Promise<{ success: boolean; user?: Profile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Determine expected passwords
    const allowedGuruPasswords = ["isnain123", "admin123", "simaq123", "password"];
    const allowedSiswaPasswords = ["siswa123", "fatih123", "simaq123", "password"];

    // Simulation logic (Supabase is handled if configured, otherwise local fallback)
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Fetch profile
        const { data: prof, error: profErr } = await supabase!
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        
        if (profErr || !prof) {
          // If no profile, construct from email and role
          const newProf: Profile = {
            id: data.user.id,
            role: role,
            nama: role === "guru" ? "Isnain, S.Pd" : "Muhammad Al-Fatih",
            email: email,
            nip_nisn: role === "guru" ? "198108082007101002" : "2007101002",
            hp: role === "guru" ? "081241392708" : "081241392708",
          };
          localStorage.setItem("simaq_current_user", JSON.stringify(newProf));
          return { success: true, user: newProf };
        }
        
        localStorage.setItem("simaq_current_user", JSON.stringify(prof));
        return { success: true, user: prof };
      } catch (err: any) {
        console.warn("Supabase Auth failed, falling back to local simulation for demo accounts:", err.message);
        
        // Fallback to local login if using the demo credentials so they are NEVER locked out!
        if (role === "guru") {
          const storedGuruStr = localStorage.getItem("simaq_profile_guru");
          const guru: Profile = storedGuruStr ? JSON.parse(storedGuruStr) : DEFAULT_GURU;
          if (cleanEmail === guru.email.toLowerCase() && allowedGuruPasswords.includes(cleanPassword)) {
            localStorage.setItem("simaq_current_user", JSON.stringify(guru));
            return { success: true, user: guru };
          }
        } else {
          const storedSiswaStr = localStorage.getItem("simaq_profile_siswa");
          const siswa: Profile = storedSiswaStr ? JSON.parse(storedSiswaStr) : DEFAULT_SISWA_PROFILE;
          if ((cleanEmail === siswa.email.toLowerCase() || email === siswa.nip_nisn) && allowedSiswaPasswords.includes(cleanPassword)) {
            localStorage.setItem("simaq_current_user", JSON.stringify(siswa));
            return { success: true, user: siswa };
          }
        }
        
        return { 
          success: false, 
          error: `Koneksi Supabase gagal/Akun tidak ditemukan: ${err.message}. Namun, Anda tetap bisa masuk menggunakan database lokal dengan sandi: 'isnain123' (guru) atau 'siswa123' (siswa).` 
        };
      }
    } else {
      // Local Database Check
      if (role === "guru") {
        const storedGuruStr = localStorage.getItem("simaq_profile_guru");
        const guru: Profile = storedGuruStr ? JSON.parse(storedGuruStr) : DEFAULT_GURU;
        
        if (cleanEmail === guru.email.toLowerCase()) {
          if (allowedGuruPasswords.includes(cleanPassword)) {
            localStorage.setItem("simaq_current_user", JSON.stringify(guru));
            return { success: true, user: guru };
          } else {
            return { success: false, error: "Kata sandi Guru salah! Silakan gunakan sandi: 'isnain123'" };
          }
        } else {
          return { success: false, error: "Email Guru tidak terdaftar! Silakan gunakan: 'isnain8881@gmail.com'" };
        }
      } else {
        const storedSiswaStr = localStorage.getItem("simaq_profile_siswa");
        const siswa: Profile = storedSiswaStr ? JSON.parse(storedSiswaStr) : DEFAULT_SISWA_PROFILE;
        
        if (cleanEmail === siswa.email.toLowerCase() || email === siswa.nip_nisn) {
          if (allowedSiswaPasswords.includes(cleanPassword)) {
            localStorage.setItem("simaq_current_user", JSON.stringify(siswa));
            return { success: true, user: siswa };
          } else {
            return { success: false, error: "Kata sandi Siswa salah! Silakan gunakan sandi: 'siswa123'" };
          }
        } else {
          return { success: false, error: "Email/NISN Siswa tidak terdaftar! Silakan gunakan: 'isnain8881@gmail.com'" };
        }
      }
    }
  },

  logout: () => {
    localStorage.removeItem("simaq_current_user");
  },

  getCurrentUser: (): Profile | null => {
    const userStr = localStorage.getItem("simaq_current_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  updateCurrentUser: (updated: Partial<Profile>): Profile => {
    const curr = db.getCurrentUser();
    if (!curr) throw new Error("No logged in user");
    const next = { ...curr, ...updated };
    localStorage.setItem("simaq_current_user", JSON.stringify(next));
    
    // Save to respective role collection
    if (next.role === "guru") {
      localStorage.setItem("simaq_profile_guru", JSON.stringify(next));
    } else {
      localStorage.setItem("simaq_profile_siswa", JSON.stringify(next));
      // update student table as well
      const students = db.getStudents();
      const updatedStudents = students.map(s => {
        if (s.nis === next.nip_nisn) {
          return { ...s, nama_lengkap: next.nama, hp_ortu: next.hp };
        }
        return s;
      });
      localStorage.setItem("simaq_students", JSON.stringify(updatedStudents));
    }

    // Write through to Supabase
    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("profiles").upsert({
          id: next.id,
          role: next.role,
          nama: next.nama,
          email: next.email,
          nip_nisn: next.nip_nisn,
          hp: next.hp,
          photo_url: next.photo_url || ""
        }),
        "Menyimpan profil"
      );
    }

    return next;
  },

  // --- SUBJECTS (MATA PELAJARAN) ---
  getSubjects: (): Subject[] => {
    return JSON.parse(localStorage.getItem("simaq_subjects") || "[]");
  },
  saveSubject: (subj: Subject) => {
    const subjs = db.getSubjects();
    const index = subjs.findIndex(s => s.id === subj.id);
    if (index >= 0) subjs[index] = subj;
    else subjs.push(subj);
    localStorage.setItem("simaq_subjects", JSON.stringify(subjs));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("subjects").upsert({ id: subj.id, kode: subj.kode, nama: subj.nama }),
        "Menyimpan mata pelajaran"
      );
    }
  },
  deleteSubject: (id: string) => {
    const subjs = db.getSubjects().filter(s => s.id !== id);
    localStorage.setItem("simaq_subjects", JSON.stringify(subjs));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("subjects").delete().eq("id", id),
        "Menghapus mata pelajaran"
      );
    }
  },

  // --- CLASSES (KELAS) ---
  getClasses: (): ClassRoom[] => {
    return JSON.parse(localStorage.getItem("simaq_classes") || "[]");
  },
  saveClass: (cls: ClassRoom) => {
    const clss = db.getClasses();
    const index = clss.findIndex(c => c.id === cls.id);
    if (index >= 0) clss[index] = cls;
    else clss.push(cls);
    localStorage.setItem("simaq_classes", JSON.stringify(clss));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("classes").upsert({ id: cls.id, nama: cls.nama, tingkat: cls.tingkat, tahun_ajaran: cls.tahun_ajaran }),
        "Menyimpan kelas"
      );
    }
  },
  deleteClass: (id: string) => {
    const clss = db.getClasses().filter(c => c.id !== id);
    localStorage.setItem("simaq_classes", JSON.stringify(clss));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("classes").delete().eq("id", id),
        "Menghapus kelas"
      );
    }
  },

  // --- STUDENTS (SISWA) ---
  getStudents: (): Student[] => {
    return JSON.parse(localStorage.getItem("simaq_students") || "[]");
  },
  saveStudent: (stud: Student) => {
    const studs = db.getStudents();
    const index = studs.findIndex(s => s.id === stud.id);
    if (index >= 0) studs[index] = stud;
    else studs.push(stud);
    localStorage.setItem("simaq_students", JSON.stringify(studs));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("students").upsert({
          id: stud.id,
          nis: stud.nis,
          nama_lengkap: stud.nama_lengkap,
          jenis_kelamin: stud.jenis_kelamin,
          tempat_lahir: stud.tempat_lahir,
          tanggal_lahir: stud.tanggal_lahir,
          alamat: stud.alamat,
          hp_ortu: stud.hp_ortu,
          kelas_id: stud.kelas_id
        }),
        "Menyimpan data siswa"
      );
    }
  },
  deleteStudent: (id: string) => {
    const studs = db.getStudents().filter(s => s.id !== id);
    localStorage.setItem("simaq_students", JSON.stringify(studs));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("students").delete().eq("id", id),
        "Menghapus data siswa"
      );
    }
  },

  // --- GRADES (NILAI) ---
  getGrades: (): Grade[] => {
    return JSON.parse(localStorage.getItem("simaq_grades") || "[]");
  },
  saveGrade: (grd: Grade) => {
    const grds = db.getGrades();
    const index = grds.findIndex(g => g.id === grd.id);
    if (index >= 0) grds[index] = grd;
    else grds.push(grd);
    localStorage.setItem("simaq_grades", JSON.stringify(grds));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("grades").upsert({
          id: grd.id,
          siswa_id: grd.siswa_id,
          kelas_id: grd.kelas_id,
          subject_id: grd.subject_id,
          nilai_tugas: grd.nilai_tugas,
          nilai_harian: grd.nilai_harian,
          nilai_pts: grd.nilai_pts,
          nilai_pas: grd.nilai_pas,
          nilai_akhir: grd.nilai_akhir,
          predikat: grd.predikat
        }),
        "Menyimpan nilai siswa"
      );
    }
  },
  saveGradesBulk: (grdsToSave: Grade[]) => {
    const grds = db.getGrades();
    grdsToSave.forEach(gToSave => {
      const idx = grds.findIndex(g => g.siswa_id === gToSave.siswa_id && g.kelas_id === gToSave.kelas_id && g.subject_id === gToSave.subject_id);
      if (idx >= 0) grds[idx] = { ...grds[idx], ...gToSave };
      else grds.push(gToSave);
    });
    localStorage.setItem("simaq_grades", JSON.stringify(grds));

    if (isSupabaseConfigured()) {
      const rows = grdsToSave.map(g => ({
        id: g.id,
        siswa_id: g.siswa_id,
        kelas_id: g.kelas_id,
        subject_id: g.subject_id,
        nilai_tugas: g.nilai_tugas,
        nilai_harian: g.nilai_harian,
        nilai_pts: g.nilai_pts,
        nilai_pas: g.nilai_pas,
        nilai_akhir: g.nilai_akhir,
        predikat: g.predikat
      }));
      handleSupabaseResult(
        supabase!.from("grades").upsert(rows),
        "Menyimpan banyak nilai siswa"
      );
    }
  },

  // --- ATTENDANCE (ABSENSI) ---
  getAttendance: (): Attendance[] => {
    return JSON.parse(localStorage.getItem("simaq_attendance") || "[]");
  },
  saveAttendanceBulk: (attList: Attendance[]) => {
    const list = db.getAttendance();
    attList.forEach(a => {
      const idx = list.findIndex(l => l.siswa_id === a.siswa_id && l.kelas_id === a.kelas_id && l.subject_id === a.subject_id && l.tanggal === a.tanggal);
      if (idx >= 0) list[idx] = a;
      else list.push(a);
    });
    localStorage.setItem("simaq_attendance", JSON.stringify(list));

    if (isSupabaseConfigured()) {
      const rows = attList.map(a => ({
        id: a.id,
        siswa_id: a.siswa_id,
        kelas_id: a.kelas_id,
        subject_id: a.subject_id,
        tanggal: a.tanggal,
        status: a.status
      }));
      handleSupabaseResult(
        supabase!.from("attendance").upsert(rows),
        "Menyimpan data absensi"
      );
    }
  },

  // --- MATERIALS (MATERI AJAR) ---
  getMaterials: (): Material[] => {
    return JSON.parse(localStorage.getItem("simaq_materials") || "[]");
  },
  saveMaterial: (mat: Material) => {
    const mats = db.getMaterials();
    const index = mats.findIndex(m => m.id === mat.id);
    if (index >= 0) mats[index] = mat;
    else mats.push(mat);
    localStorage.setItem("simaq_materials", JSON.stringify(mats));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("materials").upsert({
          id: mat.id,
          tanggal: mat.tanggal,
          subject_id: mat.subject_id,
          kelas_id: mat.kelas_id,
          jam_pelajaran: mat.jam_pelajaran,
          materi_pembelajaran: mat.materi_pembelajaran,
          metode_pembelajaran: mat.metode_pembelajaran,
          file_name: mat.file_name,
          file_type: mat.file_type,
          file_url: mat.file_url
        }),
        "Menyimpan materi ajar"
      );
    }
  },
  deleteMaterial: (id: string) => {
    const mats = db.getMaterials().filter(m => m.id !== id);
    localStorage.setItem("simaq_materials", JSON.stringify(mats));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("materials").delete().eq("id", id),
        "Menghapus materi ajar"
      );
    }
  },

  // --- ASSIGNMENTS (PENUGASAN) ---
  getAssignments: (): Assignment[] => {
    return JSON.parse(localStorage.getItem("simaq_assignments") || "[]");
  },
  saveAssignment: (asg: Assignment) => {
    const asgs = db.getAssignments();
    const index = asgs.findIndex(a => a.id === asg.id);
    if (index >= 0) asgs[index] = asg;
    else asgs.push(asg);
    localStorage.setItem("simaq_assignments", JSON.stringify(asgs));

    // For any new assignment, initialize a submission for existing students in that class
    const students = db.getStudents().filter(s => s.kelas_id === asg.kelas_id);
    const submissions = db.getSubmissions();
    const submsToUpsert: any[] = [];

    students.forEach(st => {
      const exists = submissions.some(sub => sub.assignment_id === asg.id && sub.siswa_id === st.id);
      if (!exists) {
        const newSub: AssignmentSubmission = {
          id: `subm-${asg.id}-${st.id}`,
          assignment_id: asg.id,
          siswa_id: st.id,
          tanggal_submit: "",
          file_name: "",
          file_url: "",
          status: "Belum Dikerjakan"
        };
        submissions.push(newSub);
        submsToUpsert.push(newSub);
      }
    });
    localStorage.setItem("simaq_submissions", JSON.stringify(submissions));

    if (isSupabaseConfigured()) {
      // Save assignment
      handleSupabaseResult(
        supabase!.from("assignments").upsert({
          id: asg.id,
          tanggal: asg.tanggal,
          subject_id: asg.subject_id,
          kelas_id: asg.kelas_id,
          materi_pelajaran: asg.materi_pelajaran,
          deskripsi: asg.deskripsi,
          deadline: asg.deadline,
          file_name: asg.file_name,
          file_url: asg.file_url
        }),
        "Menyimpan tugas"
      );

      // Save initialized submissions
      if (submsToUpsert.length > 0) {
        const rows = submsToUpsert.map(s => ({
          id: s.id,
          assignment_id: s.assignment_id,
          siswa_id: s.siswa_id,
          tanggal_submit: null,
          file_name: "",
          file_url: "",
          status: s.status,
          nilai: null,
          catatan_guru: ""
        }));
        handleSupabaseResult(
          supabase!.from("assignment_submissions").upsert(rows),
          "Inisialisasi pengerjaan tugas"
        );
      }
    }
  },
  deleteAssignment: (id: string) => {
    const asgs = db.getAssignments().filter(a => a.id !== id);
    localStorage.setItem("simaq_assignments", JSON.stringify(asgs));
    // also clean submissions
    const subms = db.getSubmissions().filter(s => s.assignment_id !== id);
    localStorage.setItem("simaq_submissions", JSON.stringify(subms));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("assignments").delete().eq("id", id),
        "Menghapus tugas"
      );
    }
  },

  // --- SUBMISSIONS (PENGERJAAN TUGAS SISWA) ---
  getSubmissions: (): AssignmentSubmission[] => {
    return JSON.parse(localStorage.getItem("simaq_submissions") || "[]");
  },
  saveSubmission: (sub: AssignmentSubmission) => {
    const subs = db.getSubmissions();
    const index = subs.findIndex(s => s.id === sub.id);
    if (index >= 0) subs[index] = sub;
    else subs.push(sub);
    localStorage.setItem("simaq_submissions", JSON.stringify(subs));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("assignment_submissions").upsert({
          id: sub.id,
          assignment_id: sub.assignment_id,
          siswa_id: sub.siswa_id,
          tanggal_submit: sub.tanggal_submit || null,
          file_name: sub.file_name,
          file_url: sub.file_url,
          status: sub.status,
          nilai: sub.nilai || null,
          catatan_guru: sub.catatan_guru || ""
        }),
        "Menyimpan pengerjaan tugas"
      );
    }
  },

  // --- TEACHING JOURNALS (JURNAL MENGAJAR) ---
  getJournals: (): TeachingJournal[] => {
    return JSON.parse(localStorage.getItem("simaq_journals") || "[]");
  },
  saveJournal: (jrnl: TeachingJournal) => {
    const jrnls = db.getJournals();
    const index = jrnls.findIndex(j => j.id === jrnl.id);
    if (index >= 0) jrnls[index] = jrnl;
    else jrnls.push(jrnl);
    localStorage.setItem("simaq_journals", JSON.stringify(jrnls));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("teaching_journals").upsert({
          id: jrnl.id,
          tanggal: jrnl.tanggal,
          subject_id: jrnl.subject_id,
          kelas_id: jrnl.kelas_id,
          jam_pelajaran: jrnl.jam_pelajaran,
          materi_pembelajaran: jrnl.materi_pembelajaran,
          metode_pembelajaran: jrnl.metode_pembelajaran,
          jumlah_hadir: jrnl.jumlah_hadir,
          catatan_guru: jrnl.catatan_guru,
          lampiran_name: jrnl.lampiran_name,
          lampiran_url: jrnl.lampiran_url
        }),
        "Menyimpan jurnal mengajar"
      );
    }
  },
  deleteJournal: (id: string) => {
    const jrnls = db.getJournals().filter(j => j.id !== id);
    localStorage.setItem("simaq_journals", JSON.stringify(jrnls));

    if (isSupabaseConfigured()) {
      handleSupabaseResult(
        supabase!.from("teaching_journals").delete().eq("id", id),
        "Menghapus jurnal mengajar"
      );
    }
  },

  // --- BIDIRECTIONAL SYNC ENGINE ---
  syncBidirectional: async (): Promise<{ success: boolean; pushed: string[]; pulled: string[]; error?: string }> => {
    if (!isSupabaseConfigured()) return { success: false, pushed: [], pulled: [] };
    
    const pushed: string[] = [];
    const pulled: string[] = [];
    
    const checkSyncError = (error: any, tableName: string) => {
      if (error) {
        const errMsg = error.message || String(error);
        const isRelationError = errMsg.toLowerCase().includes("relation") && errMsg.toLowerCase().includes("does not exist");
        const isUuidError = errMsg.toLowerCase().includes("uuid") || errMsg.toLowerCase().includes("invalid input syntax for type uuid");
        let fullError = `Sinkronisasi tabel "${tableName}" gagal. Error: ${errMsg}`;
        if (isRelationError) {
          fullError = `Gagal sinkronisasi: Tabel "${tableName}" belum terdeteksi di database Supabase Anda. Silakan klik ikon database di navbar atas ("Bantuan Supabase"), salin Script SQL lengkap, lalu klik RUN di SQL Editor dashboard Supabase Anda!`;
        } else if (isUuidError) {
          fullError = `Gagal sinkronisasi tabel "${tableName}": Terjadi kesalahan tipe data UUID di database Supabase Anda. Kolom ID tabel saat ini menggunakan tipe data UUID, sedangkan aplikasi ini membutuhkan tipe TEXT agar bisa mengelola kode ID kustom (seperti "sub-1"). Silakan klik ikon database di navbar atas ("Bantuan Supabase"), salin seluruh Script SQL, lalu jalankan di SQL Editor Supabase Anda untuk membuat ulang semua tabel dengan tipe yang benar!`;
        }
        db.notifyError(fullError);
        throw new Error(fullError);
      }
    };

    try {
      // 1. Subjects
      const { data: sb, error: sbErr } = await supabase!.from("subjects").select("*");
      checkSyncError(sbErr, "Mata Pelajaran");
      if (sb && sb.length > 0) {
        localStorage.setItem("simaq_subjects", JSON.stringify(sb));
        pulled.push("Mata Pelajaran");
      } else {
        const local = db.getSubjects();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("subjects").upsert(local);
          checkSyncError(upsertErr, "Mata Pelajaran (Push)");
          pushed.push("Mata Pelajaran");
        }
      }

      // 2. Classes
      const { data: cl, error: clErr } = await supabase!.from("classes").select("*");
      checkSyncError(clErr, "Kelas");
      if (cl && cl.length > 0) {
        localStorage.setItem("simaq_classes", JSON.stringify(cl));
        pulled.push("Kelas");
      } else {
        const local = db.getClasses();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("classes").upsert(local);
          checkSyncError(upsertErr, "Kelas (Push)");
          pushed.push("Kelas");
        }
      }

      // 3. Students
      const { data: st, error: stErr } = await supabase!.from("students").select("*");
      checkSyncError(stErr, "Siswa");
      if (st && st.length > 0) {
        localStorage.setItem("simaq_students", JSON.stringify(st));
        pulled.push("Siswa");
      } else {
        const local = db.getStudents();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("students").upsert(local);
          checkSyncError(upsertErr, "Siswa (Push)");
          pushed.push("Siswa");
        }
      }

      // 4. Grades
      const { data: gd, error: gdErr } = await supabase!.from("grades").select("*");
      checkSyncError(gdErr, "Nilai");
      if (gd && gd.length > 0) {
        localStorage.setItem("simaq_grades", JSON.stringify(gd));
        pulled.push("Nilai");
      } else {
        const local = db.getGrades();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("grades").upsert(local);
          checkSyncError(upsertErr, "Nilai (Push)");
          pushed.push("Nilai");
        }
      }

      // 5. Attendance
      const { data: at, error: atErr } = await supabase!.from("attendance").select("*");
      checkSyncError(atErr, "Absensi");
      if (at && at.length > 0) {
        localStorage.setItem("simaq_attendance", JSON.stringify(at));
        pulled.push("Absensi");
      } else {
        const local = db.getAttendance();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("attendance").upsert(local);
          checkSyncError(upsertErr, "Absensi (Push)");
          pushed.push("Absensi");
        }
      }

      // 6. Materials
      const { data: mt, error: mtErr } = await supabase!.from("materials").select("*");
      checkSyncError(mtErr, "Materi Ajar");
      if (mt && mt.length > 0) {
        localStorage.setItem("simaq_materials", JSON.stringify(mt));
        pulled.push("Materi Ajar");
      } else {
        const local = db.getMaterials();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("materials").upsert(local);
          checkSyncError(upsertErr, "Materi Ajar (Push)");
          pushed.push("Materi Ajar");
        }
      }

      // 7. Assignments
      const { data: as, error: asErr } = await supabase!.from("assignments").select("*");
      checkSyncError(asErr, "Penugasan");
      if (as && as.length > 0) {
        localStorage.setItem("simaq_assignments", JSON.stringify(as));
        pulled.push("Penugasan");
      } else {
        const local = db.getAssignments();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("assignments").upsert(local);
          checkSyncError(upsertErr, "Penugasan (Push)");
          pushed.push("Penugasan");
        }
      }

      // 8. Submissions
      const { data: su, error: suErr } = await supabase!.from("assignment_submissions").select("*");
      checkSyncError(suErr, "Pengerjaan Tugas");
      if (su && su.length > 0) {
        localStorage.setItem("simaq_submissions", JSON.stringify(su));
        pulled.push("Pengerjaan Tugas");
      } else {
        const local = db.getSubmissions();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("assignment_submissions").upsert(local);
          checkSyncError(upsertErr, "Pengerjaan Tugas (Push)");
          pushed.push("Pengerjaan Tugas");
        }
      }

      // 9. Teaching Journals
      const { data: jr, error: jrErr } = await supabase!.from("teaching_journals").select("*");
      checkSyncError(jrErr, "Jurnal Mengajar");
      if (jr && jr.length > 0) {
        localStorage.setItem("simaq_journals", JSON.stringify(jr));
        pulled.push("Jurnal Mengajar");
      } else {
        const local = db.getJournals();
        if (local.length > 0) {
          const { error: upsertErr } = await supabase!.from("teaching_journals").upsert(local);
          checkSyncError(upsertErr, "Jurnal Mengajar (Push)");
          pushed.push("Jurnal Mengajar");
        }
      }

      return { success: true, pushed, pulled };
    } catch (err: any) {
      console.error("Error in bidirectional sync:", err);
      return { success: false, pushed, pulled, error: err.message };
    }
  }
};

// ==========================================
// SUPABASE POSTGRESQL SCHEMA SCRIPT
// ==========================================

export const SUPABASE_SQL_SCHEMA = `-- PostgreSQL SQL Schema for SIMAQ (Sistem Informasi dan Manajemen Aliyah Al-Qamar)
-- Copy and execute this code in your Supabase SQL Editor.
-- Using TEXT ids is fully compatible with custom local IDs.

-- Clean up existing tables to prevent mismatching types
DROP TABLE IF EXISTS public.teaching_journals CASCADE;
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Create Profiles Table (Guru and Siswa profiles)
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('guru', 'siswa')),
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  nip_nisn TEXT NOT NULL UNIQUE,
  hp TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Subjects Table (Mata Pelajaran)
CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Classes Table (Kelas)
CREATE TABLE public.classes (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tingkat TEXT NOT NULL,
  tahun_ajaran TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Students Table (Siswa)
CREATE TABLE public.students (
  id TEXT PRIMARY KEY,
  nis TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  tempat_lahir TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  hp_ortu TEXT NOT NULL,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Grades Table (Manajemen Nilai)
CREATE TABLE public.grades (
  id TEXT PRIMARY KEY,
  siswa_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  nilai_tugas NUMERIC(5,2) DEFAULT 0,
  nilai_harian NUMERIC(5,2) DEFAULT 0,
  nilai_pts NUMERIC(5,2) DEFAULT 0,
  nilai_pas NUMERIC(5,2) DEFAULT 0,
  nilai_akhir NUMERIC(5,2) DEFAULT 0,
  predikat VARCHAR(5) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(siswa_id, kelas_id, subject_id)
);

-- 6. Create Attendance Table (Absensi)
CREATE TABLE public.attendance (
  id TEXT PRIMARY KEY,
  siswa_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alfa')),
  UNIQUE(siswa_id, kelas_id, subject_id, tanggal)
);

-- 7. Create Materials Table (Materi Ajar)
CREATE TABLE public.materials (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  jam_pelajaran TEXT NOT NULL,
  materi_pembelajaran TEXT NOT NULL,
  metode_pembelajaran TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Assignments Table (Penugasan)
CREATE TABLE public.assignments (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  materi_pelajaran TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  file_name TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Assignment Submissions Table (Pengerjaan Tugas Siswa)
CREATE TABLE public.assignment_submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES public.assignments(id) ON DELETE CASCADE,
  siswa_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  tanggal_submit TIMESTAMP WITH TIME ZONE,
  file_name TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'Belum Dikerjakan' CHECK (status IN ('Belum Dikerjakan', 'Selesai')),
  nilai NUMERIC(5,2),
  catatan_guru TEXT,
  UNIQUE(assignment_id, siswa_id)
);

-- 10. Create Teaching Journals Table (Jurnal Mengajar)
CREATE TABLE public.teaching_journals (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  jam_pelajaran TEXT NOT NULL,
  materi_pembelajaran TEXT NOT NULL,
  metode_pembelajaran TEXT NOT NULL,
  jumlah_hadir INTEGER DEFAULT 0,
  catatan_guru TEXT,
  lampiran_name TEXT,
  lampiran_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set Row Level Security (RLS) to public/authenticated access as needed
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_journals ENABLE ROW LEVEL SECURITY;

-- Creating simple access policies (allow select, insert, update, delete for all)
CREATE POLICY "Allow select for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert for profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow delete for profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Allow select for subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow insert for subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Allow delete for subjects" ON public.subjects FOR DELETE USING (true);

CREATE POLICY "Allow select for classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow insert for classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Allow delete for classes" ON public.classes FOR DELETE USING (true);

CREATE POLICY "Allow select for students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow insert for students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow delete for students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow select for grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Allow insert for grades" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for grades" ON public.grades FOR UPDATE USING (true);
CREATE POLICY "Allow delete for grades" ON public.grades FOR DELETE USING (true);

CREATE POLICY "Allow select for attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow insert for attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow delete for attendance" ON public.attendance FOR DELETE USING (true);

CREATE POLICY "Allow select for materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Allow insert for materials" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for materials" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Allow delete for materials" ON public.materials FOR DELETE USING (true);

CREATE POLICY "Allow select for assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow insert for assignments" ON public.assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for assignments" ON public.assignments FOR UPDATE USING (true);
CREATE POLICY "Allow delete for assignments" ON public.assignments FOR DELETE USING (true);

CREATE POLICY "Allow select for submissions" ON public.assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert for submissions" ON public.assignment_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for submissions" ON public.assignment_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow delete for submissions" ON public.assignment_submissions FOR DELETE USING (true);

CREATE POLICY "Allow select for journals" ON public.teaching_journals FOR SELECT USING (true);
CREATE POLICY "Allow insert for journals" ON public.teaching_journals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for journals" ON public.teaching_journals FOR UPDATE USING (true);
CREATE POLICY "Allow delete for journals" ON public.teaching_journals FOR DELETE USING (true);
`;
