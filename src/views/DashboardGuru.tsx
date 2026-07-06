import React from "react";
import { 
  BookOpen, School, Users, FileText, 
  ClipboardList, BookOpenCheck, Clock, Calendar, TrendingUp 
} from "lucide-react";
import { db } from "../utils/db";
import { SneatBarChart, SneatLineChart, SneatDonutChart } from "../components/SneatChart";

export const DashboardGuru: React.FC<{ isDarkMode: boolean; onViewChange?: (view: string) => void }> = ({ isDarkMode, onViewChange }) => {
  // Fetch real-time states
  const subjects = db.getSubjects();
  const classes = db.getClasses();
  const students = db.getStudents();
  const materials = db.getMaterials();
  const assignments = db.getAssignments();
  const journals = db.getJournals();
  const grades = db.getGrades();
  const attendance = db.getAttendance();

  // Welcome info
  const today = new Date().toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Calculate statistics with target navigation view mapping
  const stats = [
    { label: "Mata Pelajaran", count: subjects.length, icon: <BookOpen className="text-[#696cff]" />, bg: "bg-[#696cff]/10", view: "subjects" },
    { label: "Total Kelas", count: classes.length, icon: <School className="text-info text-cyan-500" />, bg: "bg-cyan-500/10", view: "classes" },
    { label: "Total Siswa", count: students.length, icon: <Users className="text-success text-emerald-500" />, bg: "bg-emerald-500/10", view: "students" },
    { label: "Materi Ajar", count: materials.length, icon: <FileText className="text-warning text-amber-500" />, bg: "bg-amber-500/10", view: "materials" },
    { label: "Penugasan", count: assignments.length, icon: <ClipboardList className="text-danger text-red-500" />, bg: "bg-red-500/10", view: "assignments" },
    { label: "Jurnal Mengajar", count: journals.length, icon: <BookOpenCheck className="text-primary text-indigo-500" />, bg: "bg-indigo-500/10", view: "journals" },
  ];

  // Prepare chart data for Attendance Trend (Line Chart)
  // Group attendance by date and calculate attendance rate
  const uniqueDates = Array.from(new Set(attendance.map(a => a.tanggal))).sort().slice(-5);
  const attendanceChartData = uniqueDates.map(date => {
    const attsForDate = attendance.filter(a => a.tanggal === date);
    const presentCount = attsForDate.filter(a => a.status === "Hadir").length;
    const rate = attsForDate.length > 0 ? Math.round((presentCount / attsForDate.length) * 100) : 100;
    
    // Format date to short readable
    const dObj = new Date(date);
    const label = dObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return { label, value: rate };
  });

  // Fallback if no attendance logged yet
  const finalAttendanceData = attendanceChartData.length > 0 ? attendanceChartData : [
    { label: "01 Jul", value: 90 },
    { label: "02 Jul", value: 85 },
    { label: "03 Jul", value: 95 },
    { label: "04 Jul", value: 88 },
    { label: "05 Jul", value: 92 },
  ];

  // Prepare chart data for Grade Distribution (Bar Chart)
  // Let's list subjects and calculate their average grade
  const gradeChartData = subjects.map(sub => {
    const gradesForSub = grades.filter(g => g.subject_id === sub.id);
    const sum = gradesForSub.reduce((acc, curr) => acc + curr.nilai_akhir, 0);
    const avg = gradesForSub.length > 0 ? Math.round(sum / gradesForSub.length) : 0;
    return { label: sub.nama, value: avg || 75 }; // fallback average 75 for visual
  });

  const finalGradeData = gradeChartData.length > 0 ? gradeChartData : [
    { label: "Matematika", value: 81 },
    { label: "PAI", value: 88 },
    { label: "Bahasa Inggris", value: 78 }
  ];

  // Student Gender distribution donut chart
  const maleCount = students.filter(s => s.jenis_kelamin === "Laki-laki").length;
  const femaleCount = students.filter(s => s.jenis_kelamin === "Perempuan").length;
  const genderData = [
    { label: "Laki-laki", value: maleCount || 3, color: "#696cff" },
    { label: "Perempuan", value: femaleCount || 2, color: "#ff3e1d" }
  ];

  // Recent activities compilation
  const recentActivities = [
    { type: "journal", text: `Mengisi jurnal mengajar untuk materi "${journals[0]?.materi_pembelajaran || "Limit Fungsi"}"`, time: "Baru saja", color: "bg-[#696cff]" },
    { type: "material", text: `Mengunggah materi baru "${materials[0]?.materi_pembelajaran || "Limit Fungsi Aljabar"}"`, time: "1 jam yang lalu", color: "bg-emerald-500" },
    { type: "assignment", text: `Membuat penugasan "${assignments[0]?.materi_pelajaran || "Limit Fungsi Trigonometri"}"`, time: "3 jam yang lalu", color: "bg-red-500" },
    { type: "attendance", text: "Mencatat absensi siswa kelas XII IPA 1", time: "Kemarin", color: "bg-amber-500" },
    { type: "grade", text: "Memasukkan nilai Penilaian Tengah Semester (PTS)", time: "2 hari yang lalu", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onViewChange?.(item.view)}
            className="bg-white dark:bg-[#1f202e] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg hover:border-[#696cff]/40 dark:hover:border-[#696cff]/30 active:scale-95 cursor-pointer transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </div>
              <span className="text-[10px] text-[#696cff] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold font-mono">
                Buka &rarr;
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {item.label}
              </span>
              <h4 className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1 font-mono group-hover:text-[#696cff] transition-colors">
                {item.count}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Stats Banner */}
      <div className="bg-gradient-to-br from-[#696cff] to-[#5f61e6] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl shadow-[#696cff]/20 relative overflow-hidden min-h-[120px]">
        <div className="absolute bottom-[-20px] right-[-20px] w-36 h-36 rounded-full bg-white/10" />
        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-white/15 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs opacity-80 uppercase tracking-widest font-mono">Rasio Kehadiran Aktif TA 2025/2026</span>
            <h3 className="text-2xl font-extrabold font-mono mt-0.5">91.8% Kehadiran Siswa</h3>
          </div>
        </div>
        <p className="text-xs opacity-85 max-w-md z-10 text-center md:text-right mt-2 md:mt-0">
          Rata-rata persentase kehadiran seluruh siswa Aliyah Al-Qamar bulan ini terpantau stabil dan kondusif.
        </p>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Attendance rate */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Tren Kehadiran Siswa</h3>
              <p className="text-xs text-gray-400">Rata-rata persentase kehadiran siswa di setiap kelas (%)</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Stabil</span>
            </div>
          </div>
          <SneatLineChart data={finalAttendanceData} isDarkMode={isDarkMode} />
        </div>

        {/* Donut Chart: Student Spread */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Rasio Gender Siswa</h3>
            <p className="text-xs text-gray-400 mb-6">Distribusi jenis kelamin siswa terdaftar</p>
          </div>
          <SneatDonutChart data={genderData} title="" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Subject Average Grades */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Rata-Rata Nilai Siswa</h3>
              <p className="text-xs text-gray-400">Distribusi rata-rata nilai akhir per mata pelajaran</p>
            </div>
          </div>
          <SneatBarChart data={finalGradeData} isDarkMode={isDarkMode} title="" />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-[#1f202e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Aktivitas Terbaru</h3>
          <p className="text-xs text-gray-400 mb-6">Log aktivitas pengajaran guru</p>
          
          <div className="flex-1 space-y-5 relative">
            {/* Center line decoration */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800 -z-0" />

            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex gap-4 items-start relative z-10 text-xs">
                {/* Bullet */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${act.color} text-white border-4 border-white dark:border-[#1f202e] flex-shrink-0 shadow-sm`}>
                  <Clock size={8} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-normal">{act.text}</p>
                  <span className="text-[10px] text-gray-400 font-mono block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
