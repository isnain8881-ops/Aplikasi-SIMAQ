import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="footer bg-white dark:bg-[#1f202e] border-t border-gray-100 dark:border-gray-800 py-4 px-6 mt-auto">
      <div className="container-fluid flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-400 font-mono gap-2">
        <div>
          © {new Date().getFullYear()}{" "}
          <span className="font-extrabold text-[#696cff]">SIMAQ</span> • Sistem Informasi dan Manajemen Aliyah Al-Qamar.
        </div>
        <div className="flex gap-4">
          <span>Pengembang: <b>Isnain, S.Pd</b> (isnain8881@gmail.com)</span>
          <span className="hidden md:inline">•</span>
          <span>NIP: 198108082007101002</span>
        </div>
      </div>
    </footer>
  );
};
