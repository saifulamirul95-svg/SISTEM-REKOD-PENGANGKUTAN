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
  Edit2
} from 'lucide-react';
import { Student, TransportMode, LicenseType } from './types';
import { studentService } from './services/studentService';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'report'>('records');

  useEffect(() => {
    setStudents(studentService.getStudents());
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

  const handleUpdateStudent = (updated: Student) => {
    studentService.updateStudent(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f0]">
      {/* Header */}
      <header className="h-20 bg-white border-b border-[#e2e2d5] px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3a3a2a]">Sistem Rekod Pengangkutan Pelajar</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex bg-[#f0f0e8] p-1 rounded-full border border-[#e2e2d5] mr-2">
            <button 
              onClick={() => setActiveTab('records')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'records' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8a8a75] hover:text-[#3a3a2a]'}`}
            >
              Perekodan
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'report' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#8a8a75] hover:text-[#3a3a2a]'}`}
            >
              Laporan
            </button>
          </nav>
          <div className="hidden md:flex items-center gap-2 bg-[#f0f0e8] px-3 py-1.5 rounded-full text-xs font-medium border border-[#d6d6c2] text-[#424231]">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Sistem Aktif
          </div>
          <p className="text-xs font-mono text-[#8a8a75] hidden sm:block uppercase tracking-wider">{stats.totalStudents} PELAJAR BERDAFTAR</p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {activeTab === 'records' ? (
          <>
            {/* Statistics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <StatCard 
                title="Progress Perekodan" 
                value={stats.recordedCount} 
                subtitle={`${((stats.recordedCount / stats.totalStudents) * 100).toFixed(0)}% profil lengkap direkodkan`}
                icon={<ShieldCheck className="text-emerald-700" size={28} />}
                accentColor="text-emerald-700"
              />
              <StatCard 
                title="Lesen Pelajar" 
                value={stats.totalLicensed} 
                subtitle="Mempunyai Lesen Sah (B2/D)"
                icon={<Bike className="text-[#5A5A40]" size={28} />}
                accentColor="text-[#5A5A40]"
              />
              <StatCard 
                title="Kapasiti Parkir" 
                value={stats.motorcycleLicensed + stats.carLicensed} 
                subtitle="Kenderaan diletakkan di sekolah"
                icon={<Car className="text-[#7d5d40]" size={28} />}
                accentColor="text-[#7d5d40]"
              />
            </section>

            <div className="grid grid-cols-12 gap-8">
              {/* Main Records Table */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <section className="bg-white rounded-[32px] border border-[#e2e2d5] shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-[#f0f0e8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-serif font-bold text-[#3a3a2a]">Rekod Pelajar</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a75]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari nama pelajar..." 
                        className="w-full bg-[#f5f5f0] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#5A5A40] text-[#424231] font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filters for Table */}
                  <div className="px-6 py-5 bg-[#fafaf7] flex flex-wrap gap-4 border-b border-[#f0f0e8] items-center">
                    <span className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest">Sila Pilih:</span>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#e2e2d5] text-xs font-bold shadow-sm transition-all hover:border-[#5A5A40]">
                      <Filter size={14} className="text-[#8a8a75]" />
                      <select 
                        className="bg-transparent focus:outline-none cursor-pointer text-[#3a3a2a]"
                        value={selectedForm}
                        onChange={(e) => { setSelectedForm(e.target.value); setSelectedClass(''); }}
                      >
                        <option value="">Pilih Tingkatan</option>
                        {forms.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#e2e2d5] text-xs font-bold shadow-sm transition-all hover:border-[#5A5A40] ${!selectedForm ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <select 
                        className="bg-transparent focus:outline-none cursor-pointer text-[#3a3a2a]"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                      >
                        <option value="">Pilih Kelas</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[300px] flex flex-col">
                    {(!selectedForm || !selectedClass) ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-[#f5f5f0] rounded-full flex items-center justify-center text-[#8a8a75] mb-4">
                          <Users size={32} />
                        </div>
                        <h4 className="text-[#3a3a2a] font-serif font-bold text-lg">Pilih Tingkatan dan Kelas</h4>
                        <p className="text-[#8a8a75] text-sm max-w-xs mx-auto mt-2 leading-relaxed">Sila pilih tingkatan dan kelas terlebih dahulu untuk melihat senarai pelajar.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-[#fafaf7] border-b border-[#f0f0e8]">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-[#8a8a75] uppercase tracking-wider">Nama Pelajar</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8a8a75] uppercase tracking-wider">Tindakan</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8a8a75] uppercase tracking-wider text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f0e8]">
                          <AnimatePresence mode='popLayout'>
                            {filteredStudents.map((student) => (
                              <motion.tr 
                                key={student.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-[#fafaf7] transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-bold text-[#3a3a2a] max-w-[250px] truncate" title={student.name}>{student.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${student.transportMode === 'Tiada' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-[#f5f5f0] text-[#5A5A40] border-[#e2e2d5]'} uppercase`}>
                                      {student.transportMode}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => setEditingStudent(student)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5A5A40] text-white rounded-full text-[10px] font-bold shadow-md hover:bg-[#4a4a34] transition-all active:scale-95"
                                  >
                                    {student.transportMode === 'Tiada' ? 'Rekod Data' : 'Kemas Kini'}
                                    <Edit2 size={12} />
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${student.transportMode === 'Tiada' ? 'text-red-500' : 'text-green-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${student.transportMode === 'Tiada' ? 'bg-red-500' : 'bg-green-600'} animate-pulse`} />
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
                    <div className="p-12 text-center text-[#8a8a75] italic">Tiada rekod pelajar dijumpai.</div>
                  )}
                  {filteredStudents.length > 50 && (
                    <div className="p-4 bg-[#fafaf7] text-center text-xs text-[#8a8a75] border-t border-[#f0f0e8]">
                      Memaparkan 50 rekod teratas daripada {filteredStudents.length}
                    </div>
                  )}
                </section>
              </div>

              {/* Side Panel: Analysis */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <section className="bg-[#5A5A40] rounded-[32px] shadow-sm p-8 text-white flex flex-col justify-between h-[450px]">
                  <div>
                    <h3 className="text-2xl font-serif font-bold mb-3">Agihan Kenderaan</h3>
                    <p className="text-sm text-[#d6d6c2] leading-relaxed">Pecahan mod pengangkutan pelajar SMK Perdana bagi sesi pagi.</p>
                  </div>
                  
                  <div className="flex justify-center py-8">
                    <div className="w-40 h-40 rounded-full border-[14px] border-[#7d7d5d]/30 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-[14px] border-white border-r-transparent border-b-transparent -rotate-45" />
                      <div className="text-center group cursor-default">
                        <span className="text-4xl font-bold block">{((stats.motorcycleLicensed + stats.carLicensed) / Math.max(1, stats.totalStudents) * 100).toFixed(0)}%</span>
                        <span className="text-[10px] text-[#d6d6c2] uppercase tracking-widest font-medium">Mobiliti</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" /> Motosikal / Kereta</span>
                      <span className="font-bold underline decoration-[#7d7d5d] underline-offset-4">{stats.motorcycleLicensed + stats.carLicensed} Unit</span>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-80">
                      <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 bg-[#7d7d5d] rounded-full" /> Lain-lain</span>
                      <span className="font-bold">{stats.totalStudents - (stats.motorcycleLicensed + stats.carLicensed)} Orang</span>
                    </div>
                  </div>
                </section>
                
                <section className="bg-white rounded-[32px] border border-[#e2e2d5] p-6 space-y-6 shadow-sm overflow-hidden relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#3a3a2a]">Kelas Selesai</h4>
                    <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {stats.completedClasses.length} Kelas
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats.completedClasses.length > 0 ? (
                      stats.completedClasses.map(className => (
                        <div key={className} className="flex items-center gap-2 p-2 rounded-xl bg-green-50 border border-green-100">
                          <ShieldCheck size={14} className="text-green-600" />
                          <span className="text-[10px] font-bold text-green-800 uppercase truncate">{className}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-[#8a8a75] text-[10px] italic">Belum ada kelas yang selesai sepenuhnya.</div>
                    )}
                  </div>

                  <div className="border-t border-[#f0f0e8] pt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest">Aktiviti Mingguan</span>
                      <span className="text-[10px] font-bold text-[#5A5A40]">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f5f5f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5A5A40] rounded-full" style={{ width: '78%' }} />
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
      <footer className="h-14 bg-[#fafaf7] border-t border-[#e2e2d5] px-8 flex items-center justify-between text-[11px] text-[#8a8a75] font-medium tracking-widest uppercase mt-auto">
        <span>DIKEMASKINI: {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span className="hidden sm:block">Pangkalan Data Pusat Pelajar SMK Perdana</span>
        <div className="flex gap-6">
          <button className="hover:text-[#5A5A40] transition-colors">Eksport PDF</button>
          <button className="hover:text-[#5A5A40] transition-colors">Tetapan</button>
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
      className="bg-white px-8 py-7 rounded-[32px] border border-[#e2e2d5] shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <p className="text-xs font-bold text-[#8a8a75] uppercase tracking-widest mb-2">{title}</p>
      <h2 className={`text-5xl font-serif font-bold ${accentColor}`}>{value.toLocaleString()}</h2>
      <p className="text-[11px] text-[#8a8a75] mt-2 italic font-medium leading-tight">{subtitle}</p>
    </motion.div>
  );
}

function ReportView({ stats }: { stats: any }) {
  const modes = [
    { label: 'Motosikal', value: stats.motosikalCount, icon: <Bike size={18} />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Kereta', value: stats.keretaCount, icon: <Car size={18} />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Basikal', value: stats.basikalCount, icon: <Activity size={18} />, color: 'bg-orange-50 text-orange-700' },
    { label: 'Jalan Kaki', value: stats.jalanKakiCount, icon: <Users size={18} />, color: 'bg-slate-50 text-slate-700' },
    { label: 'Dihantar Penjaga', value: stats.dihantarPenjagaCount, icon: <MapPin size={18} />, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-[32px] border border-[#e2e2d5] p-8 shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-[#3a3a2a] mb-6 decoration-[#5A5A40] underline underline-offset-8">Ringkasan Keseluruhan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1 border-l-2 border-[#5A5A40] pl-4">
            <p className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest leading-none">Jumlah Pelajar</p>
            <p className="text-3xl font-serif font-bold text-[#3a3a2a]">{stats.totalStudents}</p>
          </div>
          <div className="space-y-1 border-l-2 border-emerald-600 pl-4">
            <p className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest leading-none">Data Direkod</p>
            <p className="text-3xl font-serif font-bold text-emerald-600">{stats.recordedCount}</p>
          </div>
          <div className="space-y-1 border-l-2 border-[#7d5d40] pl-4">
            <p className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest leading-none">Mempunyai Lesen</p>
            <p className="text-3xl font-serif font-bold text-[#7d5d40]">{stats.totalLicensed}</p>
          </div>
          <div className="space-y-1 border-l-2 border-red-500 pl-4">
            <p className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest leading-none">Kelas Selesai</p>
            <p className="text-3xl font-serif font-bold text-red-500">{stats.completedClasses.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-[32px] border border-[#e2e2d5] p-8 shadow-sm space-y-6">
          <h4 className="text-lg font-serif font-bold text-[#3a3a2a]">Pecahan Mod Pengangkutan</h4>
          <div className="space-y-4">
            {modes.map((mode) => (
              <div key={mode.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${mode.color} transition-transform group-hover:scale-110`}>
                    {mode.icon}
                  </div>
                  <span className="text-sm font-bold text-[#424231]">{mode.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-[#f5f5f0] rounded-full hidden sm:block overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(mode.value / Math.max(1, stats.recordedCount)) * 100}%` }}
                      className="h-full bg-[#5A5A40] rounded-full"
                    />
                  </div>
                  <span className="text-sm font-serif font-bold text-[#3a3a2a] w-8 text-right">{mode.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-[#3a3a2a] rounded-[32px] p-8 shadow-sm text-white space-y-6">
            <h4 className="text-lg font-serif font-bold">Analisis Pelesenan</h4>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Motosikal</span>
                  <span className="text-xl font-serif font-bold">{stats.motosikalCount} Pelajar</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1">Berlesen</p>
                    <p className="text-2xl font-serif font-bold text-emerald-400">{stats.motosikalWithLicense}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1">Tiada Lesen</p>
                    <p className="text-2xl font-serif font-bold text-red-400">{stats.motosikalNoLicense}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Kereta</span>
                  <span className="text-xl font-serif font-bold">{stats.keretaCount} Pelajar</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1">Berlesen</p>
                    <p className="text-2xl font-serif font-bold text-emerald-400">{stats.keretaWithLicense}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-60 mb-1">Tiada Lesen</p>
                    <p className="text-2xl font-serif font-bold text-red-400">{stats.keretaNoLicense}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-700 rounded-[32px] p-6 shadow-sm text-white flex items-center justify-between">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3a3a2a]/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-[#e2e2d5]"
      >
        <div className="bg-[#fafaf7] px-8 py-6 flex items-center justify-between border-b border-[#f0f0e8]">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#3a3a2a]">Maklumat Pelajar</h3>
            <p className="text-[10px] text-[#8a8a75] font-mono tracking-widest uppercase mt-0.5">{student.id}</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-[#8a8a75] hover:text-[#3a3a2a] hover:bg-white rounded-full transition-all border border-transparent hover:border-[#e2e2d5]">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-[#f5f5f0] p-6 rounded-[24px] border border-[#e2e2d5] relative group">
             <div className="absolute right-4 top-4 opacity-10">
               <Users size={48} className="text-[#5A5A40]" />
             </div>
            <p className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <ShieldCheck size={12} /> Profil Berdaftar
            </p>
            <p className="text-xl font-serif font-bold text-[#3a3a2a] leading-tight mb-1">{student.name}</p>
            <p className="text-sm text-[#8a8a75] font-medium">{student.form} • <span className="text-[#5A5A40]">{student.className}</span></p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest block pl-1">
                Mod Pengangkutan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {transportOptions.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                      transportMode === mode 
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]' 
                        : 'bg-white text-[#424231] border-[#f0f0e8] hover:border-[#5A5A40]/30'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#8a8a75] uppercase tracking-widest block pl-1">
                Kategori Lesen
              </label>
              <div className="grid grid-cols-1 gap-2">
                {licenseOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => setLicenseType(type)}
                    className={`w-full px-5 py-3.5 rounded-xl text-xs text-left transition-all border flex items-center justify-between font-bold shadow-sm ${
                      licenseType === type 
                        ? 'bg-[#f0f0e8] text-[#3a3a2a] border-[#5A5A40]/40' 
                        : 'bg-white text-[#424231] border-[#f0f0e8] hover:border-[#5A5A40]/30'
                    }`}
                  >
                    <span>{type}</span>
                    {licenseType === type && <div className="w-2.5 h-2.5 bg-[#5A5A40] rounded-full animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-[#fafaf7] border-t border-[#f0f0e8] flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full text-xs font-bold text-[#8a8a75] hover:bg-white hover:text-[#3a3a2a] transition-all border border-transparent hover:border-[#e2e2d5]"
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
            className="flex-[1.5] bg-[#5A5A40] text-white py-3.5 rounded-full text-xs font-bold hover:bg-[#4a4a34] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Simpan Perubahan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
