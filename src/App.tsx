import { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Bike, 
  Car, 
  Search, 
  Filter, 
  Activity, 
  ChevronRight, 
  MapPin, 
  ShieldCheck,
  X,
  Edit2,
  Moon,
  Sun
} from 'lucide-react';
import { Student, TransportMode, LicenseType } from './types';
import { studentService } from './services/studentService';
import { getInitialStudents } from './data/initialStudents';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'report'>('records');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    // Initialize data and subscription
    const initData = async () => {
      try {
        await studentService.seedInitialData(getInitialStudents());
        const unsubscribe = studentService.subscribeToStudents((updatedStudents) => {
          setStudents(updatedStudents);
          setLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Initialization error", error);
        setLoading(false);
      }
    };

    let unsubscribe: any;
    initData().then(unsub => unsubscribe = unsub);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const stats = useMemo(() => studentService.getStats(students), [students]);

  const forms = useMemo(() => {
    const uniqueForms = Array.from(new Set(students.map(s => s.form)));
    return uniqueForms.sort();
  }, [students]);

  const classes = useMemo(() => {
    if (!selectedForm) return [];
    const filteredByForm = students.filter(s => s.form === selectedForm);
    const uniqueClasses = Array.from(new Set(filteredByForm.map(s => s.className)));
    return uniqueClasses.sort();
  }, [students, selectedForm]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchForm = !selectedForm || s.form === selectedForm;
      const matchClass = !selectedClass || s.className === selectedClass;
      return matchSearch && matchForm && matchClass;
    });
  }, [students, searchTerm, selectedForm, selectedClass]);

  const handleUpdateStudent = async (updated: Student) => {
    try {
      await studentService.updateStudent(updated);
      setEditingStudent(null);
    } catch (error) {
      // Error is already logged in service
      alert('Gagal menyimpan rekod. Sila cuba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Activity className="animate-spin text-[var(--accent)]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-[var(--header-bg)] border-b border-[var(--border)] px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-[var(--text-heading)] leading-tight">SISTEM REKOD PENGANGKUTAN PELAJAR</h1>
            <p className="text-[9px] text-[var(--text-muted)] font-mono mt-1 uppercase tracking-widest hidden sm:block">SEKOLAH MENENGAH KEBANGSAAN SERI PERPATIH</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--secondary-bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"
            title={theme === 'light' ? 'Tukar ke Mod Gelap' : 'Tukar ke Mod Terang'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <div className="bg-[var(--secondary-bg)] border-b border-[var(--border)] px-8 py-2 overflow-x-auto">
        <nav className="flex items-center gap-6 whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('records')}
            className={`text-[10px] font-bold uppercase tracking-[0.15em] py-2 border-b-2 transition-all ${activeTab === 'records' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]'}`}
          >
            Perekodan Pelajar
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`text-[10px] font-bold uppercase tracking-[0.15em] py-2 border-b-2 transition-all ${activeTab === 'report' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]'}`}
          >
            Laporan Analisis
          </button>
        </nav>
      </div>

      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {activeTab === 'records' ? (
          <>
            {/* Statistics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <StatCard 
                title="Progress Perekodan" 
                value={stats.recordedCount} 
                subtitle={`${((stats.recordedCount / stats.totalStudents) * 100).toFixed(0)}% profil lengkap direkodkan`}
                icon={<ShieldCheck className="opacity-70" size={28} />}
                accentColor="text-emerald-500"
              />
              <StatCard 
                title="Lesen Pelajar" 
                value={stats.totalLicensed} 
                subtitle="Mempunyai Lesen Sah (B2/D)"
                icon={<Bike className="opacity-70" size={28} />}
                accentColor="text-[var(--accent)]"
              />
              <StatCard 
                title="Kapasiti Parkir" 
                value={stats.motorcycleLicensed + stats.carLicensed} 
                subtitle="Kenderaan diletakkan di sekolah"
                icon={<Car className="opacity-70" size={28} />}
                accentColor="text-orange-500"
              />
            </section>

            <div className="grid grid-cols-12 gap-8">
              {/* Main Records Table */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <section className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-serif font-bold text-[var(--text-heading)]">Rekod Pelajar</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari nama pelajar..." 
                        className="w-full bg-[var(--input-bg)] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-main)] font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filters for Table */}
                  <div className="px-6 py-5 bg-[var(--secondary-bg)] flex flex-wrap gap-4 border-b border-[var(--border)] items-center">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Sila Pilih:</span>
                    <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-full border border-[var(--border)] text-xs font-bold shadow-sm transition-all hover:border-[var(--accent)]">
                      <Filter size={14} className="text-[var(--text-muted)]" />
                      <select 
                        className="bg-transparent focus:outline-none cursor-pointer text-[var(--text-heading)]"
                        value={selectedForm}
                        onChange={(e) => { setSelectedForm(e.target.value); setSelectedClass(''); }}
                      >
                        <option value="" className="bg-[var(--card)]">Pilih Tingkatan</option>
                        {forms.map(f => <option key={f} value={f} className="bg-[var(--card)]">{f}</option>)}
                      </select>
                    </div>
                    <div className={`flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-full border border-[var(--border)] text-xs font-bold shadow-sm transition-all hover:border-[var(--accent)] ${!selectedForm ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <select 
                        className="bg-transparent focus:outline-none cursor-pointer text-[var(--text-heading)]"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                      >
                        <option value="" className="bg-[var(--card)]">Pilih Kelas</option>
                        {classes.map(c => <option key={c} value={c} className="bg-[var(--card)]">{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[300px] flex flex-col">
                    {(!selectedForm || !selectedClass) ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-[var(--input-bg)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
                          <Users size={32} />
                        </div>
                        <h4 className="text-[var(--text-heading)] font-serif font-bold text-lg">Pilih Tingkatan dan Kelas</h4>
                        <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto mt-2 leading-relaxed">Sila pilih tingkatan dan kelas terlebih dahulu untuk melihat senarai pelajar.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-[var(--secondary-bg)] border-b border-[var(--border)]">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Nama Pelajar</th>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Tindakan</th>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          <AnimatePresence mode='popLayout'>
                            {filteredStudents.map((student) => (
                              <motion.tr 
                                key={student.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-[var(--secondary-bg)] transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-bold text-[var(--text-heading)] max-w-[250px] truncate" title={student.name}>{student.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${student.transportMode === 'Tiada' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-[var(--input-bg)] text-[var(--accent)] border-[var(--border)]'} uppercase`}>
                                      {student.transportMode}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => setEditingStudent(student)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-full text-[10px] font-bold shadow-md hover:opacity-90 transition-all active:scale-95"
                                  >
                                    {student.transportMode === 'Tiada' ? 'Rekod Data' : 'Kemas Kini'}
                                    <Edit2 size={12} />
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${student.transportMode === 'Tiada' ? 'text-red-500' : 'text-green-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${student.transportMode === 'Tiada' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{student.transportMode === 'Tiada' ? 'Belum' : 'Selesai'}</span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    )}
                  </div>
                  {filteredStudents.length === 0 && (
                    <div className="p-12 text-center text-[var(--text-muted)] italic">Tiada rekod pelajar dijumpai.</div>
                  )}
                  {filteredStudents.length > 50 && (
                    <div className="p-4 bg-[var(--secondary-bg)] text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
                      Memaparkan 50 rekod teratas daripada {filteredStudents.length}
                    </div>
                  )}
                </section>
              </div>

              {/* Side Panel: Analysis */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <section className="bg-[var(--accent)] rounded-[32px] shadow-sm p-8 text-white flex flex-col justify-between h-[450px]">
                  <div>
                    <h3 className="text-2xl font-serif font-bold mb-3">Agihan Kenderaan</h3>
                    <p className="text-sm opacity-80 leading-relaxed">Pecahan mod pengangkutan pelajar bagi sesi pagi.</p>
                  </div>
                  
                  <div className="flex justify-center py-8">
                    <div className="w-40 h-40 rounded-full border-[14px] border-white/10 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-[14px] border-white border-r-transparent border-b-transparent -rotate-45" />
                      <div className="text-center group cursor-default">
                        <span className="text-4xl font-bold block">{((stats.motorcycleLicensed + stats.carLicensed) / Math.max(1, stats.totalStudents) * 100).toFixed(0)}%</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-widest font-medium">Mobiliti</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" /> Motosikal / Kereta</span>
                      <span className="font-bold underline decoration-white/20 underline-offset-4">{stats.motorcycleLicensed + stats.carLicensed} Unit</span>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-80">
                      <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-white/20 rounded-full" /> Lain-lain</span>
                      <span className="font-bold">{stats.totalStudents - (stats.motorcycleLicensed + stats.carLicensed)} Orang</span>
                    </div>
                  </div>
                </section>
                
                <section className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] p-6 space-y-6 shadow-sm overflow-hidden relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[var(--text-heading)]">Kelas Selesai</h4>
                    <div className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {stats.completedClasses.length} Kelas
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats.completedClasses.length > 0 ? (
                      stats.completedClasses.map(className => (
                        <div key={className} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border)]">
                          <ShieldCheck size={14} className="text-green-500" />
                          <span className="text-[10px] font-bold text-[var(--text-heading)] uppercase truncate">{className}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-[var(--text-muted)] text-[10px] italic">Belum ada kelas yang selesai sepenuhnya.</div>
                    )}
                  </div>

                  <div className="border-t border-[var(--border)] pt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Aktiviti Mingguan</span>
                      <span className="text-[10px] font-bold text-[var(--accent)]">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : (
          <ReportView stats={stats} />
        )}
      </main>

      {/* Footer */}
      <footer className="h-20 bg-[var(--secondary-bg)] border-t border-[var(--border)] px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase mt-auto py-4 gap-4 text-center sm:text-left">
        <div className="flex flex-col gap-1">
          <span>KEMASKINI: {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="font-bold text-[var(--accent)]">JAWATANKUASA PROGRAM SEKOLAH SELAMAT SMK SERI PERPATIH</span>
        </div>
        <span className="hidden lg:block text-[9px] opacity-70">Sistem Perekodan Pusat Pelajar SMK Seri Perpatih</span>
        <div className="flex gap-6 italic">
          <button className="hover:text-[var(--accent)] transition-all">Eksport</button>
          <button className="hover:text-[var(--accent)] transition-all">Tetapan</button>
        </div>
      </footer>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <EditModal 
            student={editingStudent} 
            onClose={() => setEditingStudent(null)} 
            onSave={handleUpdateStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, accentColor }: { title: string, value: number, subtitle: string, icon: ReactNode, accentColor: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[var(--card)] px-8 py-7 rounded-[32px] border border-[var(--border)] shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity text-[var(--text-muted)]">
        {icon}
      </div>
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">{title}</p>
      <h2 className={`text-5xl font-serif font-bold ${accentColor}`}>{value.toLocaleString()}</h2>
      <p className="text-[11px] text-[var(--text-muted)] mt-2 italic font-medium leading-tight">{subtitle}</p>
    </motion.div>
  );
}

function ReportView({ stats }: { stats: any }) {
  const modes = [
    { label: 'Motosikal', value: stats.motosikalCount, icon: <Bike size={18} />, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Kereta', value: stats.keretaCount, icon: <Car size={18} />, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Basikal', value: stats.basikalCount, icon: <Activity size={18} />, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Jalan Kaki', value: stats.jalanKakiCount, icon: <Users size={18} />, color: 'bg-slate-500/10 text-slate-500' },
    { label: 'Dihantar Penjaga', value: stats.dihantarPenjagaCount, icon: <MapPin size={18} />, color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] p-8 shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-[var(--text-heading)] mb-6 decoration-[var(--accent)] underline underline-offset-8">Ringkasan Keseluruhan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1 border-l-2 border-[var(--accent)] pl-4">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Jumlah Pelajar</p>
            <p className="text-3xl font-serif font-bold text-[var(--text-heading)]">{stats.totalStudents}</p>
          </div>
          <div className="space-y-1 border-l-2 border-emerald-500 pl-4">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Data Direkod</p>
            <p className="text-3xl font-serif font-bold text-emerald-500">{stats.recordedCount}</p>
          </div>
          <div className="space-y-1 border-l-2 border-orange-500 pl-4">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Mempunyai Lesen</p>
            <p className="text-3xl font-serif font-bold text-orange-500">{stats.totalLicensed}</p>
          </div>
          <div className="space-y-1 border-l-2 border-red-500 pl-4">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Kelas Selesai</p>
            <p className="text-3xl font-serif font-bold text-red-500">{stats.completedClasses.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] p-8 shadow-sm space-y-6">
          <h4 className="text-lg font-serif font-bold text-[var(--text-heading)]">Pecahan Mod Pengangkutan</h4>
          <div className="space-y-4">
            {modes.map((mode) => (
              <div key={mode.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${mode.color} transition-transform group-hover:scale-110`}>
                    {mode.icon}
                  </div>
                  <span className="text-sm font-bold text-[var(--text-main)]">{mode.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-[var(--input-bg)] rounded-full hidden sm:block overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(mode.value / Math.max(1, stats.recordedCount)) * 100}%` }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                  <span className="text-sm font-serif font-bold text-[var(--text-heading)] w-8 text-right">{mode.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-[var(--text-heading)] rounded-[32px] p-8 shadow-sm text-[var(--card)] space-y-6">
            <h4 className="text-lg font-serif font-bold">Analisis Pelesenan</h4>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 text-white">Motosikal</span>
                  <span className="text-xl font-serif font-bold text-white">{stats.motosikalCount} Pelajar</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1 text-white">Berlesen</p>
                    <p className="text-2xl font-serif font-bold text-emerald-400">{stats.motosikalWithLicense}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1 text-white">Tiada Lesen</p>
                    <p className="text-2xl font-serif font-bold text-red-400">{stats.motosikalNoLicense}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 text-white">Kereta</span>
                  <span className="text-xl font-serif font-bold text-white">{stats.keretaCount} Pelajar</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1 text-white">Berlesen</p>
                    <p className="text-2xl font-serif font-bold text-emerald-400">{stats.keretaWithLicense}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1 text-white">Tiada Lesen</p>
                    <p className="text-2xl font-serif font-bold text-red-400">{stats.keretaNoLicense}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[32px] p-6 shadow-sm text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Patuhan Undang-undang</p>
                <p className="text-lg font-serif font-bold italic">Status Audit: Hijau</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function EditModal({ student, onClose, onSave }: { student: Student, onClose: () => void, onSave: (s: Student) => void }) {
  const [transportMode, setTransportMode] = useState<TransportMode>(student.transportMode);
  const [licenseType, setLicenseType] = useState<LicenseType>(student.licenseType);

  const transportOptions: TransportMode[] = ['Motosikal', 'Kereta', 'Bas', 'Basikal', 'Jalan Kaki', 'Dihantar Penjaga', 'Lain-lain', 'Tiada'];
  const licenseOptions: LicenseType[] = ['Motosikal (B2/B)', 'Kereta (D/DA)', 'Tiada'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[var(--modal-bg)] rounded-[24px] w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--secondary-bg)] shrink-0">
          <div>
            <h3 className="text-lg font-serif font-bold text-[var(--text-heading)]">Rekod Data Pelajar</h3>
            <p className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest uppercase">{student.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--border)]">
            <p className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1">
              Profil Pelajar
            </p>
            <p className="text-lg font-serif font-bold text-[var(--text-heading)] leading-tight">{student.name}</p>
            <p className="text-xs text-[var(--text-muted)] font-medium">{student.form} • {student.className}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block pl-1">
                Mod Pengangkutan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {transportOptions.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border shadow-sm ${
                      transportMode === mode 
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                        : 'bg-[var(--card)] text-[var(--text-main)] border-[var(--border)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest block pl-1">
                Kategori Lesen
              </label>
              <div className="grid grid-cols-1 gap-2">
                {licenseOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => setLicenseType(type)}
                    className={`w-full px-4 py-2.5 rounded-lg text-[10px] text-left transition-all border flex items-center justify-between font-bold shadow-sm ${
                      licenseType === type 
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/40' 
                        : 'bg-[var(--card)] text-[var(--text-main)] border-[var(--border)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    <span>{type}</span>
                    {licenseType === type && <div className="w-2 h-2 bg-[var(--accent)] rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--secondary-bg)] border-t border-[var(--border)] flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--card)] border border-transparent hover:border-[var(--border)] transition-all"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave({
              ...student,
              transportMode,
              licenseType,
              hasLicense: licenseType !== 'Tiada'
            })}
            className="flex-[1.5] bg-[var(--accent)] text-white py-2.5 rounded-full text-[10px] font-bold hover:opacity-90 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Simpan Rekod
          </button>
        </div>
      </motion.div>
    </div>
  );
}
