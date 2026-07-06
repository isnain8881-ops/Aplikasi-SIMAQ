import React, { useState } from "react";
import { User, ShieldCheck, Mail, Phone, Camera, Save, Lock } from "lucide-react";
import { db } from "../utils/db";
import { Profile } from "../types";

export const ProfileSiswa: React.FC = () => {
  const currentUser = db.getCurrentUser();
  if (!currentUser) return null;

  const [nama, setNama] = useState(currentUser.nama);
  const [email, setEmail] = useState(currentUser.email);
  const [nis, setNis] = useState(currentUser.nip_nisn);
  const [hp, setHp] = useState(currentUser.hp);
  const [photoUrl, setPhotoUrl] = useState(currentUser.photo_url || "");
  
  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pwStatusMsg, setPwStatusMsg] = useState("");
  const [pwErrorMsg, setPwErrorMsg] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");

    if (!nama.trim()) {
      setErrorMsg("Nama Lengkap tidak boleh kosong.");
      return;
    }
    if (!nis.trim()) {
      setErrorMsg("NIS / NISN tidak boleh kosong.");
      return;
    }

    try {
      db.updateCurrentUser({
        nama,
        email,
        nip_nisn: nis,
        hp,
        photo_url: photoUrl
      });
      setStatusMsg("Profil Siswa berhasil disimpan!");
    } catch (err: any) {
      setErrorMsg("Gagal menyimpan profil: " + err.message);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatusMsg("");
    setPwErrorMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwErrorMsg("Semua bidang kata sandi wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setPwErrorMsg("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    const studentNis = currentUser.nip_nisn;
    // Get currently stored password, falling back to either "siswa123" or student's own NIS
    const storedPw = (db as any).getStudentPassword(studentNis);
    const expectedOldPw = storedPw || "siswa123";
    const expectedAltOldPw = storedPw || studentNis;

    if (oldPassword !== expectedOldPw && oldPassword !== expectedAltOldPw) {
      setPwErrorMsg("Kata sandi lama yang Anda masukkan tidak sesuai.");
      return;
    }

    // Save the new password
    (db as any).setStudentPassword(studentNis, newPassword);

    setPwStatusMsg("Kata sandi berhasil diubah secara aman!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Profile Left Card */}
      <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"}
              alt={nama}
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-950 shadow-md"
            />
            <div className="absolute bottom-0 right-0 p-2 bg-[#696cff] rounded-full text-white cursor-pointer shadow-md hover:bg-[#5f61e6] transition-colors">
              <Camera size={14} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{nama}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px] mt-1.5">
            Siswa Al-Qamar
          </span>

          <div className="w-full border-t border-gray-100 dark:border-gray-800 my-5 pt-5 space-y-4 text-left text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span className="font-medium">NIS / NISN</span>
              <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">{nis}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span className="text-gray-800 dark:text-gray-200 font-semibold truncate max-w-[150px]">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nomor HP Orang Tua</span>
              <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">{hp}</span>
            </div>
          </div>
        </div>

        <div className="w-full text-[10px] text-gray-400 font-mono text-center pt-4 border-t border-gray-50 dark:border-gray-800/40">
          Status Akun: Aktif
        </div>
      </div>

      {/* Form Right Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Editing Form */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Pengaturan Profil Siswa</h3>
          <p className="text-xs text-gray-400 mb-6">Kelola data profil siswa Anda secara mandiri.</p>

          {statusMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              {statusMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nama Siswa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">NIS / NISN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email Utama</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Nomor HP Orang Tua</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Avatar URL (Foto Profil)</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                <Save size={14} />
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Keamanan (Ubah Password)</h3>
          <p className="text-xs text-gray-400 mb-6">Ubah password akun siswa Al-Qamar Anda secara berkala.</p>

          {pwStatusMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              {pwStatusMsg}
            </div>
          )}

          {pwErrorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
              {pwErrorMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sandi Lama</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Konfirmasi Sandi</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#696cff] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gray-800 dark:bg-slate-700 hover:bg-gray-900 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                <Lock size={14} />
                Perbarui Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
