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

const getSupabaseKeys = () => {
  let url = "";
  let key = "";
  if (typeof window !== "undefined") {
    url = localStorage.getItem("simaq_supabase_url") || "";
    key = localStorage.getItem("simaq_supabase_anon_key") || "";
  }
  if (!url) {
    url = (import.meta as any).env.VITE_SUPABASE_URL || "";
  }
  if (!key) {
    key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";
  }
  return {
    url: getCleanEnvValue(url),
    key: getCleanEnvValue(key)
  };
};

const keys = getSupabaseKeys();
export const SUPABASE_URL = keys.url;
export const SUPABASE_ANON_KEY = keys.key;

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

// Helper functions for custom settings UI
export const saveCustomSupabaseKeys = (url: string, key: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("simaq_supabase_url", url.trim());
    localStorage.setItem("simaq_supabase_anon_key", key.trim());
    localStorage.removeItem("simaq_has_synced_supabase"); // Reset sync state to trigger a full pull-overwrite on next login
  }
};

export const clearCustomSupabaseKeys = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("simaq_supabase_url");
    localStorage.removeItem("simaq_supabase_anon_key");
    localStorage.removeItem("simaq_has_synced_supabase");
  }
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

const handleSupabaseResult = (promise: any, actionDesc: string) => {
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
  saveCustomSupabaseKeys: saveCustomSupabaseKeys,
  clearCustomSupabaseKeys: clearCustomSupabaseKeys,
  
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
  getStudentPassword: (nis: string): string => {
    if (typeof window === "undefined") return "siswa123";
    try {
      const passwordsRaw = localStorage.getItem("simaq_student_passwords");
      const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      return passwords[nis] || ""; // Returns empty if not set yet, so we can fallback to default
    } catch {
      return "";
    }
  },

  setStudentPassword: (nis: string, pw: string) => {
    if (typeof window === "undefined") return;
    try {
      const passwordsRaw = localStorage.getItem("simaq_student_passwords");
      const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      passwords[nis] = pw.trim();
      localStorage.setItem("simaq_student_passwords", JSON.stringify(passwords));
    } catch (e) {
      console.error("Gagal menyimpan password kustom siswa", e);
    }
  },

  getGuruPassword: (email: string): string => {
    if (typeof window === "undefined") return "isnain123";
    try {
      const passwordsRaw = localStorage.getItem("simaq_guru_passwords");
      const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      return passwords[email.trim().toLowerCase()] || "";
    } catch {
      return "";
    }
  },

  setGuruPassword: (email: string, pw: string) => {
    if (typeof window === "undefined") return;
    try {
      const passwordsRaw = localStorage.getItem("simaq_guru_passwords");
      const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      passwords[email.trim().toLowerCase()] = pw.trim();
      localStorage.setItem("simaq_guru_passwords", JSON.stringify(passwords));
    } catch (e) {
      console.error("Gagal menyimpan password kustom guru", e);
    }
  },

  login: async (email: string, password: string, role: "guru" | "siswa"): Promise<{ success: boolean; user?: Profile; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Determine expected passwords
    const allowedGuruPasswords = ["isnain123", "admin123", "simaq123", "password"];

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
        console.warn("Supabase Auth failed, falling back to local database lookups:", err.message);
        
        // Fallback to local lookup
        if (role === "guru") {
          const storedGuruStr = localStorage.getItem("simaq_profile_guru");
          const guru: Profile = storedGuruStr ? JSON.parse(storedGuruStr) : DEFAULT_GURU;
          const customPw = db.getGuruPassword(guru.email);
          const isMatch = customPw 
            ? (cleanPassword === customPw) 
            : allowedGuruPasswords.includes(cleanPassword);
          if (cleanEmail === guru.email.toLowerCase() && isMatch) {
            localStorage.setItem("simaq_current_user", JSON.stringify(guru));
            return { success: true, user: guru };
          }
        } else {
          // Individual Student Account lookup
          const studentsList = db.getStudents();
          const foundStudent = studentsList.find(s => 
            s.nis === email || 
            s.nis === cleanEmail ||
            (s.nis && cleanEmail === `${s.nis.toLowerCase()}@al-qamar.sch.id`)
          );

          if (foundStudent) {
            const customPw = db.getStudentPassword(foundStudent.nis);
            // Allow custom password OR default (NIS itself or 'siswa123')
            const isMatch = customPw 
              ? (cleanPassword === customPw) 
              : (cleanPassword === "siswa123" || cleanPassword === foundStudent.nis || cleanPassword === "fatih123" || cleanPassword === "simaq123");

            if (isMatch) {
              const siswaProfile: Profile = {
                id: foundStudent.id,
                role: "siswa",
                nama: foundStudent.nama_lengkap,
                email: `${foundStudent.nis}@al-qamar.sch.id`,
                nip_nisn: foundStudent.nis,
                hp: foundStudent.hp_ortu,
                photo_url: foundStudent.jenis_kelamin === "Perempuan"
                  ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200"
                  : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
              };
              localStorage.setItem("simaq_current_user", JSON.stringify(siswaProfile));
              return { success: true, user: siswaProfile };
            } else {
              return { success: false, error: "Kata sandi Siswa salah! Silakan hubungi Guru Anda untuk pengaturan ulang kata sandi." };
            }
          }
        }
        
        return { 
          success: false, 
          error: `Koneksi database gagal atau akun tidak ditemukan. Coba lagi dengan email/NISN yang terdaftar.` 
        };
      }
    } else {
      // Local Database Check
      if (role === "guru") {
        const storedGuruStr = localStorage.getItem("simaq_profile_guru");
        const guru: Profile = storedGuruStr ? JSON.parse(storedGuruStr) : DEFAULT_GURU;
        
        if (cleanEmail === guru.email.toLowerCase()) {
          const customPw = db.getGuruPassword(guru.email);
          const isMatch = customPw 
            ? (cleanPassword === customPw) 
            : allowedGuruPasswords.includes(cleanPassword);
          if (isMatch) {
            localStorage.setItem("simaq_current_user", JSON.stringify(guru));
            return { success: true, user: guru };
          } else {
            return { success: false, error: "Kata sandi Guru salah! Silakan gunakan kata sandi baru Anda atau 'isnain123'" };
          }
        } else {
          return { success: false, error: "Email Guru tidak terdaftar! Silakan gunakan: 'isnain8881@gmail.com'" };
        }
      } else {
        // Individual Student Account lookup
        const studentsList = db.getStudents();
        const foundStudent = studentsList.find(s => 
          s.nis === email || 
          s.nis === cleanEmail ||
          (s.nis && cleanEmail === `${s.nis.toLowerCase()}@al-qamar.sch.id`)
        );

        if (foundStudent) {
          const customPw = db.getStudentPassword(foundStudent.nis);
          // Allow custom password OR default (NIS itself or 'siswa123')
          const isMatch = customPw 
            ? (cleanPassword === customPw) 
            : (cleanPassword === "siswa123" || cleanPassword === foundStudent.nis || cleanPassword === "fatih123" || cleanPassword === "simaq123");

          if (isMatch) {
            const siswaProfile: Profile = {
              id: foundStudent.id,
              role: "siswa",
              nama: foundStudent.nama_lengkap,
              email: `${foundStudent.nis}@al-qamar.sch.id`,
              nip_nisn: foundStudent.nis,
              hp: foundStudent.hp_ortu,
              photo_url: foundStudent.jenis_kelamin === "Perempuan"
                ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200"
                : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
            };
            localStorage.setItem("simaq_current_user", JSON.stringify(siswaProfile));
            return { success: true, user: siswaProfile };
          } else {
            return { success: false, error: `Kata sandi Siswa salah! Default kata sandi siswa adalah NISN (${foundStudent.nis}) atau 'siswa123'.` };
          }
        } else {
          return { success: false, error: "Email/NISN Siswa tidak ditemukan atau tidak terdaftar! Hubungi guru untuk meregistrasi biodata Anda." };
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
  deleteSubject: async (id: string) => {
    // 1. Update/Delete in LocalStorage
    const subjs = db.getSubjects().filter(s => s.id !== id);
    localStorage.setItem("simaq_subjects", JSON.stringify(subjs));

    const grds = db.getGrades().filter(g => g.subject_id !== id);
    localStorage.setItem("simaq_grades", JSON.stringify(grds));

    const atts = db.getAttendance().filter(a => a.subject_id !== id);
    localStorage.setItem("simaq_attendance", JSON.stringify(atts));

    const mats = db.getMaterials().filter(m => m.subject_id !== id);
    localStorage.setItem("simaq_materials", JSON.stringify(mats));

    const asgsOfSubject = db.getAssignments().filter(a => a.subject_id === id);
    const asgIdsOfSubject = new Set(asgsOfSubject.map(a => a.id));

    const asgs = db.getAssignments().filter(a => a.subject_id !== id);
    localStorage.setItem("simaq_assignments", JSON.stringify(asgs));

    const subms = db.getSubmissions().filter(s => !asgIdsOfSubject.has(s.assignment_id));
    localStorage.setItem("simaq_submissions", JSON.stringify(subms));

    const jrs = db.getJournals().filter(j => j.subject_id !== id);
    localStorage.setItem("simaq_journals", JSON.stringify(jrs));

    // 2. Perform deletions on Supabase in correct order to avoid Foreign Key violations
    if (isSupabaseConfigured()) {
      try {
        // Find all assignment IDs of this subject directly on Supabase to ensure clean cascade
        const { data: dbAsgs, error: asgQueryErr } = await supabase!
          .from("assignments")
          .select("id")
          .eq("subject_id", id);
        
        if (asgQueryErr) throw asgQueryErr;

        if (dbAsgs && dbAsgs.length > 0) {
          const dbAsgIds = dbAsgs.map(a => a.id);
          const { error: subErr } = await supabase!
            .from("assignment_submissions")
            .delete()
            .in("assignment_id", dbAsgIds);
          if (subErr) throw subErr;
        }

        const resAsg = await supabase!.from("assignments").delete().eq("subject_id", id);
        if (resAsg.error) throw resAsg.error;

        const resGrd = await supabase!.from("grades").delete().eq("subject_id", id);
        if (resGrd.error) throw resGrd.error;

        const resAtt = await supabase!.from("attendance").delete().eq("subject_id", id);
        if (resAtt.error) throw resAtt.error;

        const resMat = await supabase!.from("materials").delete().eq("subject_id", id);
        if (resMat.error) throw resMat.error;

        const resJr = await supabase!.from("teaching_journals").delete().eq("subject_id", id);
        if (resJr.error) throw resJr.error;
        
        const { error: finalErr } = await supabase!.from("subjects").delete().eq("id", id);
        if (finalErr) throw finalErr;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus mata pelajaran dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
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
  deleteClass: async (id: string) => {
    // 1. Update/Delete in LocalStorage
    const clss = db.getClasses().filter(c => c.id !== id);
    localStorage.setItem("simaq_classes", JSON.stringify(clss));

    const studs = db.getStudents().map(s => {
      if (s.kelas_id === id) {
        return { ...s, kelas_id: "" };
      }
      return s;
    });
    localStorage.setItem("simaq_students", JSON.stringify(studs));

    const grds = db.getGrades().filter(g => g.kelas_id !== id);
    localStorage.setItem("simaq_grades", JSON.stringify(grds));

    const atts = db.getAttendance().filter(a => a.kelas_id !== id);
    localStorage.setItem("simaq_attendance", JSON.stringify(atts));

    const mats = db.getMaterials().filter(m => m.kelas_id !== id);
    localStorage.setItem("simaq_materials", JSON.stringify(mats));

    const asgsOfClass = db.getAssignments().filter(a => a.kelas_id === id);
    const asgIdsOfClass = new Set(asgsOfClass.map(a => a.id));

    const asgs = db.getAssignments().filter(a => a.kelas_id !== id);
    localStorage.setItem("simaq_assignments", JSON.stringify(asgs));

    const subms = db.getSubmissions().filter(s => !asgIdsOfClass.has(s.assignment_id));
    localStorage.setItem("simaq_submissions", JSON.stringify(subms));

    const jrs = db.getJournals().filter(j => j.kelas_id !== id);
    localStorage.setItem("simaq_journals", JSON.stringify(jrs));

    // 2. Perform deletions on Supabase in correct order to avoid Foreign Key violations
    if (isSupabaseConfigured()) {
      try {
        // Find all assignment IDs of this class directly on Supabase to ensure clean cascade
        const { data: dbAsgs, error: asgQueryErr } = await supabase!
          .from("assignments")
          .select("id")
          .eq("kelas_id", id);
        
        if (asgQueryErr) throw asgQueryErr;

        if (dbAsgs && dbAsgs.length > 0) {
          const dbAsgIds = dbAsgs.map(a => a.id);
          const { error: subErr } = await supabase!
            .from("assignment_submissions")
            .delete()
            .in("assignment_id", dbAsgIds);
          if (subErr) throw subErr;
        }

        const resAsg = await supabase!.from("assignments").delete().eq("kelas_id", id);
        if (resAsg.error) throw resAsg.error;

        const resGrd = await supabase!.from("grades").delete().eq("kelas_id", id);
        if (resGrd.error) throw resGrd.error;

        const resAtt = await supabase!.from("attendance").delete().eq("kelas_id", id);
        if (resAtt.error) throw resAtt.error;

        const resMat = await supabase!.from("materials").delete().eq("kelas_id", id);
        if (resMat.error) throw resMat.error;

        const resJr = await supabase!.from("teaching_journals").delete().eq("kelas_id", id);
        if (resJr.error) throw resJr.error;

        const resStud = await supabase!.from("students").update({ kelas_id: null }).eq("kelas_id", id);
        if (resStud.error) throw resStud.error;
        
        const { error: finalErr } = await supabase!.from("classes").delete().eq("id", id);
        if (finalErr) throw finalErr;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus kelas dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
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
  deleteStudent: async (id: string) => {
    // 1. Update/Delete in LocalStorage
    const studs = db.getStudents().filter(s => s.id !== id);
    localStorage.setItem("simaq_students", JSON.stringify(studs));

    const grds = db.getGrades().filter(g => g.siswa_id !== id);
    localStorage.setItem("simaq_grades", JSON.stringify(grds));

    const atts = db.getAttendance().filter(a => a.siswa_id !== id);
    localStorage.setItem("simaq_attendance", JSON.stringify(atts));

    const subms = db.getSubmissions().filter(s => s.siswa_id !== id);
    localStorage.setItem("simaq_submissions", JSON.stringify(subms));

    // 2. Perform deletions on Supabase in correct order to avoid Foreign Key violations
    if (isSupabaseConfigured()) {
      try {
        const resGrd = await supabase!.from("grades").delete().eq("siswa_id", id);
        if (resGrd.error) throw resGrd.error;

        const resAtt = await supabase!.from("attendance").delete().eq("siswa_id", id);
        if (resAtt.error) throw resAtt.error;

        const resSub = await supabase!.from("assignment_submissions").delete().eq("siswa_id", id);
        if (resSub.error) throw resSub.error;
        
        const { error } = await supabase!.from("students").delete().eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus data siswa dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
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
  deleteMaterial: async (id: string) => {
    const mats = db.getMaterials().filter(m => m.id !== id);
    localStorage.setItem("simaq_materials", JSON.stringify(mats));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!.from("materials").delete().eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus materi ajar dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
    }
  },

  // --- ASSIGNMENTS (PENUGASAN) ---
  getAssignments: (): Assignment[] => {
    return JSON.parse(localStorage.getItem("simaq_assignments") || "[]");
  },
  saveAssignment: async (asg: Assignment) => {
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
      try {
        // Save assignment FIRST, wait for database write
        const { error: asgError } = await supabase!.from("assignments").upsert({
          id: asg.id,
          tanggal: asg.tanggal,
          subject_id: asg.subject_id,
          kelas_id: asg.kelas_id,
          materi_pelajaran: asg.materi_pelajaran,
          deskripsi: asg.deskripsi,
          deadline: asg.deadline,
          file_name: asg.file_name,
          file_url: asg.file_url
        });

        if (asgError) {
          const errMsg = asgError.message || String(asgError);
          const fullError = `Menyimpan tugas gagal. Error: ${errMsg}. Detail: ${asgError.details || ""}`;
          console.error(fullError, asgError);
          db.notifyError(fullError);
          return;
        }

        // Save initialized submissions only after assignment has been successfully created
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
          const { error: submError } = await supabase!.from("assignment_submissions").upsert(rows);
          if (submError) {
            const errMsg = submError.message || String(submError);
            const fullError = `Inisialisasi pengerjaan tugas gagal. Error: ${errMsg}. Detail: ${submError.details || ""}`;
            console.error(fullError, submError);
            db.notifyError(fullError);
          }
        }
      } catch (err: any) {
        const fullError = `Menyimpan tugas gagal. Exception: ${err.message || String(err)}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
    }
  },
  deleteAssignment: async (id: string) => {
    // 1. Update/Delete in LocalStorage
    const asgs = db.getAssignments().filter(a => a.id !== id);
    localStorage.setItem("simaq_assignments", JSON.stringify(asgs));
    // also clean submissions
    const subms = db.getSubmissions().filter(s => s.assignment_id !== id);
    localStorage.setItem("simaq_submissions", JSON.stringify(subms));

    if (isSupabaseConfigured()) {
      try {
        const resSub = await supabase!.from("assignment_submissions").delete().eq("assignment_id", id);
        if (resSub.error) throw resSub.error;
        const { error } = await supabase!.from("assignments").delete().eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus tugas dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
    }
  },

  // --- SUBMISSIONS (PENGERJAAN TUGAS SISWA) ---
  getSubmissions: (): AssignmentSubmission[] => {
    return JSON.parse(localStorage.getItem("simaq_submissions") || "[]");
  },
  saveSubmission: async (sub: AssignmentSubmission) => {
    const subs = db.getSubmissions();
    const index = subs.findIndex(s => s.id === sub.id);
    if (index >= 0) subs[index] = sub;
    else subs.push(sub);
    localStorage.setItem("simaq_submissions", JSON.stringify(subs));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!.from("assignment_submissions").upsert({
          id: sub.id,
          assignment_id: sub.assignment_id,
          siswa_id: sub.siswa_id,
          tanggal_submit: sub.tanggal_submit || null,
          file_name: sub.file_name || "",
          file_url: sub.file_url || "",
          status: sub.status,
          nilai: (sub.nilai !== undefined && sub.nilai !== null) ? sub.nilai : null,
          catatan_guru: sub.catatan_guru || ""
        });
        if (error) {
          const errMsg = error.message || String(error);
          const fullError = `Menyimpan pengerjaan tugas gagal. Error: ${errMsg}. Detail: ${error.details || ""}`;
          console.error(fullError, error);
          db.notifyError(fullError);
        }
      } catch (err: any) {
        const fullError = `Menyimpan pengerjaan tugas gagal. Exception: ${err.message || String(err)}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
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
  deleteJournal: async (id: string) => {
    const jrnls = db.getJournals().filter(j => j.id !== id);
    localStorage.setItem("simaq_journals", JSON.stringify(jrnls));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!.from("teaching_journals").delete().eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const fullError = `Gagal menghapus jurnal mengajar dari Supabase. Error: ${errMsg}`;
        console.error(fullError, err);
        db.notifyError(fullError);
      }
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

    // Check if this is the first sync on this device/browser
    const hasSyncedFlag = localStorage.getItem("simaq_has_synced_supabase") === "true";
    let isPullOnlyOverride = false;
    
    if (!hasSyncedFlag) {
      try {
        // Query to check if Supabase already has real subjects or classes created by other devices
        const { data: testSubjects, error: checkErr1 } = await supabase!.from("subjects").select("id").limit(1);
        const { data: testClasses, error: checkErr2 } = await supabase!.from("classes").select("id").limit(1);
        
        if (!checkErr1 && !checkErr2) {
          const remoteHasData = (testSubjects && testSubjects.length > 0) || (testClasses && testClasses.length > 0);
          if (remoteHasData) {
            isPullOnlyOverride = true;
            console.log("Supabase already contains remote data. Overwriting local mock data to prevent duplicate/stale state upload.");
          }
        }
      } catch (e) {
        console.warn("Could not test remote database presence", e);
      }
    }

    const syncTable = async (
      tableName: string,
      localKey: string,
      label: string,
      sanitizeBeforePush?: (item: any) => any | null
    ): Promise<any[]> => {
      // 1. Ambil data dari Supabase
      const { data: remote, error: fetchErr } = await supabase!.from(tableName).select("*");
      checkSyncError(fetchErr, label);

      // 2. If we need to pull and overwrite entirely (first sync on device with existing data)
      if (isPullOnlyOverride) {
        const remoteList = remote || [];
        localStorage.setItem(localKey, JSON.stringify(remoteList));
        pulled.push(label);
        return remoteList;
      }

      // 3. Ambil data dari Local Storage
      const localRaw = localStorage.getItem(localKey);
      const local: any[] = localRaw ? JSON.parse(localRaw) : [];

      // 4. Gabungkan data (Merge)
      // Gunakan ID unik untuk memetakan item dari remote
      const remoteMap = new Map<string, any>();
      if (remote) {
        remote.forEach((item: any) => remoteMap.set(item.id, item));
      }

      const merged: any[] = [...(remote || [])];
      const toPush: any[] = [];

      // Cari data lokal yang belum ada di remote untuk di-push
      for (const item of local) {
        if (!remoteMap.has(item.id)) {
          let itemToPush = { ...item };
          if (sanitizeBeforePush) {
            const sanitized = sanitizeBeforePush(itemToPush);
            if (sanitized === null) {
              continue; // Skip pushing this item and omit from merged (cleanup orphaned data)
            }
            itemToPush = sanitized;
          }

          // Bersihkan string kosong ("") menjadi null untuk menghindari kesalahan konversi tipe data PostgreSQL (seperti timestamp, date, numeric, dll)
          Object.keys(itemToPush).forEach((key) => {
            if (itemToPush[key] === "") {
              itemToPush[key] = null;
            }
          });

          merged.push(itemToPush);
          toPush.push(itemToPush);
        }
      }

      // 5. Simpan hasil gabungan kembali ke Local Storage
      localStorage.setItem(localKey, JSON.stringify(merged));

      // 6. Upload data baru dari lokal ke Supabase
      if (toPush.length > 0) {
        const { error: upsertErr } = await supabase!.from(tableName).upsert(toPush);
        checkSyncError(upsertErr, `${label} (Push)`);
        pushed.push(label);
      }

      // 7. Cek apakah ada data dari remote yang baru ditarik ke lokal
      const localMap = new Map<string, any>();
      local.forEach((item: any) => localMap.set(item.id, item));

      const hasPulledItems = remote && remote.some((item: any) => !localMap.has(item.id));
      if (hasPulledItems) {
        pulled.push(label);
      }

      return merged;
    };

    try {
      // Jalankan sinkronisasi secara teratur berurutan sesuai relasi Foreign Key:
      
      // 1. Mata Pelajaran (Tanpa dependensi)
      const subjects = await syncTable("subjects", "simaq_subjects", "Mata Pelajaran");
      const validSubjectIds = new Set(subjects.map(s => s.id));

      // 2. Kelas (Tanpa dependensi)
      const classes = await syncTable("classes", "simaq_classes", "Kelas");
      const validClassIds = new Set(classes.map(c => c.id));

      // 3. Siswa (Tergantung pada tabel Kelas)
      const students = await syncTable("students", "simaq_students", "Siswa", (stud) => {
        if (!stud.kelas_id || !validClassIds.has(stud.kelas_id)) {
          stud.kelas_id = null; // Set to null if class reference is invalid or missing
        }
        return stud;
      });
      const validStudentIds = new Set(students.map(s => s.id));

      // 4. Nilai (Tergantung pada Siswa, Kelas, Mata Pelajaran)
      await syncTable("grades", "simaq_grades", "Nilai", (grade) => {
        if (!grade.siswa_id || !validStudentIds.has(grade.siswa_id)) return null;
        if (!grade.kelas_id || !validClassIds.has(grade.kelas_id)) return null;
        if (!grade.subject_id || !validSubjectIds.has(grade.subject_id)) return null;
        return grade;
      });

      // 5. Absensi (Tergantung pada Siswa, Kelas, Mata Pelajaran)
      await syncTable("attendance", "simaq_attendance", "Absensi", (att) => {
        if (!att.siswa_id || !validStudentIds.has(att.siswa_id)) return null;
        if (!att.kelas_id || !validClassIds.has(att.kelas_id)) return null;
        if (!att.subject_id || !validSubjectIds.has(att.subject_id)) return null;
        return att;
      });

      // 6. Materi Ajar (Tergantung pada Mata Pelajaran, Kelas)
      await syncTable("materials", "simaq_materials", "Materi Ajar", (mat) => {
        if (!mat.subject_id || !validSubjectIds.has(mat.subject_id)) return null;
        if (!mat.kelas_id || !validClassIds.has(mat.kelas_id)) return null;
        return mat;
      });

      // 7. Penugasan (Tergantung pada Mata Pelajaran, Kelas)
      const assignments = await syncTable("assignments", "simaq_assignments", "Penugasan", (asg) => {
        if (!asg.subject_id || !validSubjectIds.has(asg.subject_id)) return null;
        if (!asg.kelas_id || !validClassIds.has(asg.kelas_id)) return null;
        return asg;
      });
      const validAssignmentIds = new Set(assignments.map(a => a.id));

      // 8. Pengerjaan Tugas (Tergantung pada Penugasan, Siswa)
      await syncTable("assignment_submissions", "simaq_submissions", "Pengerjaan Tugas", (subm) => {
        if (!subm.assignment_id || !validAssignmentIds.has(subm.assignment_id)) return null;
        if (!subm.siswa_id || !validStudentIds.has(subm.siswa_id)) return null;
        return subm;
      });

      // 9. Jurnal Mengajar (Tergantung pada Mata Pelajaran, Kelas)
      await syncTable("teaching_journals", "simaq_journals", "Jurnal Mengajar", (jr) => {
        if (!jr.subject_id || !validSubjectIds.has(jr.subject_id)) return null;
        if (!jr.kelas_id || !validClassIds.has(jr.kelas_id)) return null;
        return jr;
      });

      // Set the sync flag so future syncs are fully bidirectional
      localStorage.setItem("simaq_has_synced_supabase", "true");
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
