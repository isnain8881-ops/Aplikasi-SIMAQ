export type UserRole = "guru" | "siswa";

export interface Profile {
  id: string;
  role: UserRole;
  nama: string;
  email: string;
  nip_nisn: string;
  hp: string;
  photo_url?: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  created_at?: string;
}

export interface ClassRoom {
  id: string;
  nama: string;
  tingkat: string;
  tahun_ajaran: string;
  created_at?: string;
}

export interface Student {
  id: string;
  nis: string;
  nama_lengkap: string;
  jenis_kelamin: "Laki-laki" | "Perempuan";
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  hp_ortu: string;
  kelas_id: string; // Foreign Key to ClassRoom
  created_at?: string;
}

export interface Grade {
  id: string;
  siswa_id: string;
  kelas_id: string;
  subject_id: string;
  nilai_tugas: number;
  nilai_harian: number;
  nilai_pts: number;
  nilai_pas: number;
  nilai_akhir: number;
  predikat: string;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  siswa_id: string;
  kelas_id: string;
  subject_id: string;
  tanggal: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alfa";
}

export interface Material {
  id: string;
  tanggal: string;
  subject_id: string;
  kelas_id: string;
  jam_pelajaran: string;
  materi_pembelajaran: string;
  metode_pembelajaran: string;
  file_name?: string;
  file_type?: string;
  file_url?: string; // Link or simulated uploaded file
}

export interface Assignment {
  id: string;
  tanggal: string;
  subject_id: string;
  kelas_id: string;
  materi_pelajaran: string;
  deskripsi: string;
  deadline?: string;
  file_name?: string;
  file_url?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  siswa_id: string;
  tanggal_submit: string;
  file_name?: string;
  file_url?: string;
  status: "Belum Dikerjakan" | "Selesai";
  nilai?: number;
  catatan_guru?: string;
}

export interface TeachingJournal {
  id: string;
  tanggal: string;
  subject_id: string;
  kelas_id: string;
  jam_pelajaran: string;
  materi_pembelajaran: string;
  metode_pembelajaran: string;
  jumlah_hadir: number;
  catatan_guru: string;
  lampiran_name?: string;
  lampiran_url?: string;
  created_at?: string;
}

export interface TeachingSchedule {
  id: string;
  subject_id: string;
  kelas_id: string;
  hari: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: string;
  created_at?: string;
}
