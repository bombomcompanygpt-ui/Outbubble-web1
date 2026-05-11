import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, CheckCircle2, Award, RefreshCcw, Sparkles, ArrowRight, ChevronRight, X, Play, BookOpen, FileCheck, Map, Lock
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

// --- 1. SMART QUESTION ENGINE (RANDOMIZED OPTIONS & ACADEMIC EXPLANATIONS) ---
const generateQuestion = (level: number, index: number, mode: 'pre' | 'quiz' | 'post') => {
  const seed = (level * 10) + index;

  // Fungsi Helper untuk mengacak pilihan jawaban (Fisher-Yates)
  const shuffleArray = (array: string[], correctText: string) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      options: shuffled,
      correctIdx: shuffled.indexOf(correctText)
    };
  };
  
  const library = [
    { m: "M01", t: "Algoritma Feed", d: "instruksi matematis penentu konten berdasarkan perilaku", e: "Algoritma bekerja secara otomatis dengan menganalisis data perilaku pengguna seperti durasi tonton dan interaksi untuk menciptakan umpan balik yang personal." },
    { m: "M01", t: "Attention Economy", d: "perhatian sebagai komoditas yang dijual ke pengiklan", e: "Dalam attention economy, laba platform digital bergantung pada seberapa lama mereka bisa menahan perhatian pengguna agar nilai iklan semakin tinggi." },
    { m: "M02", t: "Filter Bubble", d: "isolasi informasi otomatis oleh algoritma", e: "Filter bubble menutup akses kita ke informasi yang berbeda, sehingga kita hanya melihat realitas yang mendukung pandangan kita saja." },
    { m: "M03", t: "Echo Chamber", d: "ruang gema yang memperkuat opini homogen secara aktif", e: "Echo chamber terjadi saat kita secara sadar memilih lingkungan sosial yang hanya berisi suara-suara yang mendukung opini kita sendiri." },
    { m: "M04", t: "Bias Konfirmasi", d: "kecenderungan otak mencari pembenaran keyakinan", e: "Otak manusia memiliki bias untuk lebih memercayai informasi yang mendukung keyakinannya dan menolak informasi yang membuktikannya salah." },
    { m: "M05", t: "Fragmentasi Sosial", d: "pecahnya ikatan antar kelompok masyarakat", e: "Fragmentasi sosial mengakibatkan kelompok masyarakat terpecah menjadi unit-kelompok kecil yang tidak lagi memiliki bahasa atau pemahaman bersama." },
    { m: "M06", t: "Post-Truth", d: "kondisi emosi lebih dipercaya daripada fakta objektif", e: "Di era post-truth, fakta ilmiah seringkali kalah telak dengan narasi yang menyentuh emosi atau identitas personal pengguna." },
    { m: "M07", t: "Polarisasi Afektif", d: "kebencian emosional antar kubu politik", e: "Polarisasi afektif membuat seseorang tidak hanya berbeda pendapat secara politik, tapi juga membenci orang dari kubu lawan secara pribadi." },
    { m: "M08", t: "Radikalisasi Online", d: "proses bertahap menuju paham ekstrem via algoritma", e: "Proses ini memanfaatkan algoritma yang terus menyajikan konten yang semakin provokatif untuk menjaga keterlibatan (engagement) pengguna." },
    { m: "M09", t: "Chat Chamber Effect", d: "AI yang hanya memantulkan keinginan pengguna", e: "AI chatbot seringkali menunjukkan sifat 'sycophancy' atau selalu menyetujui opini pengguna daripada memberikan fakta yang objektif namun tidak nyaman." },
    { m: "M10", t: "Literasi Digital", d: "kemampuan kritis mengevaluasi informasi", e: "Literasi digital bukan sekadar mahir teknologi, melainkan kemampuan untuk memverifikasi, menganalisis, dan mengevaluasi kebenaran informasi." }
  ];

  if (mode === 'pre' || mode === 'post') {
    const scenarios = [
      { q: "Apa yang paling tepat dilakukan saat menerima informasi yang memicu amarah?", o: ["Verifikasi sumber sebelum bereaksi", "Segera bagikan agar orang lain waspada", "Langsung percaya jika sesuai keyakinan", "Mengabaikannya tanpa peduli"], c: "Verifikasi sumber sebelum bereaksi", e: "Berhenti sejenak dan melakukan verifikasi adalah langkah kunci literasi digital untuk memutus rantai disinformasi." },
      { q: "Mengapa algoritma TikTok bisa membuat seseorang terpapar konten ekstrem?", o: ["Karena mengejar engagement/durasi tonton", "Karena sistem keamanan yang lemah", "Karena campur tangan manual admin", "Hanya terjadi jika kita mencarinya"], c: "Karena mengejar engagement/durasi tonton", e: "Algoritma dioptimalkan untuk Attention Economy, yang mana konten provokatif terbukti lebih lama menahan perhatian pengguna." },
      { q: "Kondisi di mana kita tidak tahu apa yang tidak kita ketahui karena disaring algoritma disebut...", o: ["Filter Bubble", "Echo Chamber", "Post-Truth", "Deepfake"], c: "Filter Bubble", e: "Filter bubble menyaring informasi secara pasif sehingga Anda tidak sadar telah kehilangan perspektif lain." },
      { q: "Fenomena 'Cebong vs Kampret' di Indonesia merupakan contoh nyata dari...", o: ["Fragmentasi Sosial & Polarisasi", "Kecanggihan Teknologi", "Literasi Digital Tinggi", "Sistem Rekomendasi AI"], c: "Fragmentasi Sosial & Polarisasi", e: "Konflik ini menunjukkan bagaimana ruang digital memecah masyarakat menjadi kubu identitas yang bermusuhan secara emosional." },
      { q: "Apa yang dimaksud dengan 'Dopamine Loop' di media sosial?", o: ["Siklus candu dari notifikasi dan likes", "Proses pembersihan data akun", "Sistem pengiriman pesan rahasia", "Algoritma pencarian kata kunci"], c: "Siklus candu dari notifikasi dan likes", e: "Interaksi sosial digital memicu pelepasan dopamin di otak, menciptakan ketergantungan mental untuk terus membuka aplikasi." },
      { q: "Mengapa berita palsu menyebar 6x lebih cepat dibanding berita benar?", o: ["Karena lebih mengejutkan dan provokatif", "Karena jumlah bot lebih banyak", "Karena berita benar sulit ditulis", "Karena internet terlalu lambat"], c: "Karena lebih mengejutkan dan provokatif", e: "Riset MIT menunjukkan bahwa emosi negatif dan unsur kebaruan pada hoaks memicu impuls manusia untuk berbagi lebih cepat." },
      { q: "Saat otak kita hanya mencari informasi yang membenarkan opini kita, kita mengalami...", o: ["Bias Konfirmasi", "Critical Thinking", "Digital Citizenship", "Selective Memory"], c: "Bias Konfirmasi", e: "Bias konfirmasi adalah filter kognitif yang membuat kita menutup diri dari kebenaran yang bertentangan dengan keyakinan kita." },
      { q: "Bahaya utama dari Deepfake dalam konteks politik adalah...", o: ["Runtuhnya kepercayaan pada bukti visual", "Kualitas video yang buruk", "Hanya bisa dibuat oleh ahli", "Tidak berpengaruh pada opini"], c: "Runtuhnya kepercayaan pada bukti visual", e: "Deepfake merusak epistemologi masyarakat; orang menjadi sulit membedakan mana bukti nyata dan mana rekayasa digital." },
      { q: "Echo Chamber berbeda dengan Filter Bubble karena...", o: ["Melibatkan pilihan aktif pengguna", "Bekerja secara otomatis oleh mesin", "Hanya terjadi di Google Search", "Tidak memiliki dampak negatif"], c: "Melibatkan pilihan aktif pengguna", e: "Echo chamber diperkuat oleh perilaku kita yang sengaja memilih lingkungan pertemanan yang hanya berisi satu pemikiran saja." },
      { q: "Apa inti dari solusi literasi digital menurut model Finlandia?", o: ["Integrasi berpikir kritis sejak dini", "Melarang penggunaan media sosial", "Menghapus semua akun anonim", "Membangun firewall nasional"], c: "Integrasi berpikir kritis sejak dini", e: "Finlandia melatih logika kritis sebagai pertahanan utama masyarakat dalam menghadapi manipulasi informasi." }
    ];
    const s = scenarios[index % scenarios.length];
    const randomized = shuffleArray(s.o, s.c);
    return { q: s.q, options: randomized.options, correct: randomized.correctIdx, explanation: s.e };
  }

  // LEVEL QUIZ LOGIC (5000+ VARIATIONS)
  const topic = library[seed % library.length];
  const templates = [
    { q: `Berdasarkan Modul ${topic.m}, apa bahaya utama dari ${topic.t}?`, a: `Dapat menjadi ${topic.d}` },
    { q: `Bagaimana ${topic.t} mempengaruhi cara masyarakat memproses informasi?`, a: `Dengan bertindak sebagai ${topic.d}` },
    { q: `Manakah yang mendefinisikan fenomena ${topic.t} di ruang digital?`, a: `Sebuah ${topic.d}` }
  ];
  const template = templates[seed % templates.length];
  
  const distractors = library
    .filter(item => item.t !== topic.t)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(item => `Proses ${item.d}`);

  const randomized = shuffleArray([template.a, ...distractors], template.a);

  return {
    q: template.q,
    options: randomized.options,
    correct: randomized.correctIdx,
    explanation: topic.e
  };
};

// --- 2. ASSETS ---
const Assets = {
  SolidStar: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} width="100%" height="100%">
      <polygon points="12,2 15,9 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,9" fill="#ffc107" stroke="#b45309" strokeWidth="1" />
    </svg>
  ),
  StoneBase: () => (
    <svg width="100" height="70" viewBox="0 0 100 70" className="drop-shadow-lg">
      <path d="M 10 30 C 10 10, 90 10, 90 30 C 90 40, 85 65, 70 70 C 50 75, 30 75, 10 65 Z" fill="#8d8c8a" />
      <path d="M 10 30 C 10 40, 30 50, 50 50 C 70 50, 90 40, 90 30 C 90 10, 10 10, 10 30 Z" fill="#a5a5a5" />
      <ellipse cx="50" cy="27" rx="35" ry="12" fill="#c4c4c4" />
    </svg>
  )
};

// --- 3. MAIN COMPONENT ---
const TesSimulasi: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(() => Number(localStorage.getItem('outbubble_level')) || 1);
  const [activeStage, setActiveStage] = useState<'pre' | 'quiz' | 'post' | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const questions = useMemo(() => 
    activeStage ? Array.from({ length: 10 }, (_, i) => generateQuestion(currentLevel, i, activeStage)) : [],
    [currentLevel, activeStage]
  );

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === questions[currentQuestionIdx].correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < 9) {
      setCurrentQuestionIdx(p => p + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      if (correctAnswers >= 8 && activeStage === 'quiz') {
        const nextLvl = currentLevel + 1;
        setCurrentLevel(nextLvl);
        localStorage.setItem('outbubble_level', nextLvl.toString());
      }
    }
  };

  const getLevelColor = (level: number) => {
    if (level > 400) return "from-red-500 to-orange-400";
    if (level > 200) return "from-violet-500 to-fuchsia-500";
    return "from-cyan-400 to-blue-500";
  };

  // MAP SETTINGS
  const TOTAL_LEVELS = 500;
  const NODE_SPACING = 250;
  const MAP_WIDTH = TOTAL_LEVELS * NODE_SPACING + 400; 
  const MAP_HEIGHT = 700;
  const AMPLITUDE = 180;

  useEffect(() => {
    if (isMapExpanded && mapRef.current) {
      const scrollPos = (currentLevel - 1) * NODE_SPACING - window.innerWidth / 2 + 150;
      mapRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [isMapExpanded, currentLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-[#031466] p-4 sm:p-6 md:p-12 font-sans overflow-x-hidden flex flex-col">
      
      {/* HEADER STATS - RESPONSIVE */}
      <div className="max-w-6xl mx-auto w-full bg-white/60 backdrop-blur-xl border border-white shadow-xl p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg text-white bg-gradient-to-br", getLevelColor(currentLevel))}>
            {currentLevel}
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-slate-400 uppercase">Rank Progress</p>
            <h2 className="text-xl sm:text-2xl font-black italic text-[#031466]">Level {currentLevel} Mastery</h2>
          </div>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">
            <span>Progress Quiz</span>
            <span className="text-blue-600 font-bold">{correctAnswers}/10 Benar</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-blue-900/10 rounded-full overflow-hidden border border-white shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(currentQuestionIdx + 1) * 10}%` }} className={cn("h-full bg-gradient-to-r", getLevelColor(currentLevel))} />
          </div>
        </div>
      </div>

      {/* STAGE SELECTOR */}
      <div className="max-w-6xl mx-auto w-full flex-1 relative z-10">
        {!activeStage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { id: 'pre', title: 'Pre-Test', icon: <Play />, desc: 'Diagnosis pengetahuan awal' },
              { id: 'quiz', title: 'Level Quiz', icon: <BookOpen />, desc: `Tantangan untuk naik level` },
              { id: 'post', title: 'Post-Test', icon: <FileCheck />, desc: 'Review pemahaman materi' }
            ].map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ y: -10, backgroundColor: "rgba(255,255,255,1)" }}
                onClick={() => { setActiveStage(mode.id as any); setIsFinished(false); setCurrentQuestionIdx(0); setCorrectAnswers(0); setSelectedAnswer(null); setShowExplanation(false); }}
                className="p-8 sm:p-10 rounded-[35px] sm:rounded-[50px] bg-white/60 border border-white shadow-xl text-left relative overflow-hidden transition-colors"
              >
                <div className={cn("absolute top-0 left-0 w-2 h-full bg-gradient-to-b", getLevelColor(currentLevel))} />
                <div className="text-blue-500 mb-4 sm:mb-6 scale-125 sm:scale-150 origin-left drop-shadow-sm">{mode.icon}</div>
                <h3 className="text-2xl sm:text-3xl font-black italic mb-2 uppercase text-[#031466]">{mode.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">{mode.desc}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          /* QUIZ INTERFACE */
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[40px] sm:rounded-[60px] border border-white p-6 sm:p-10 md:p-16 relative shadow-2xl">
                  <div className="flex justify-between items-center mb-8 md:mb-10 text-[10px] sm:text-sm font-black text-blue-400 uppercase tracking-widest">
                    <span>{activeStage.toUpperCase()} MODE</span>
                    <span>SOAL {currentQuestionIdx + 1} / 10</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 md:mb-12 leading-tight text-[#031466]">{questions[currentQuestionIdx].q}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {questions[currentQuestionIdx].options.map((opt, i) => (
                      <button key={i} disabled={selectedAnswer !== null} onClick={() => handleAnswer(i)} className={cn("w-full p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] border-2 text-left text-sm sm:text-base font-bold transition-all flex justify-between items-center", selectedAnswer === null ? "bg-white border-blue-100 hover:border-blue-400 hover:bg-blue-50 text-[#031466]" : i === questions[currentQuestionIdx].correct ? "bg-emerald-100 border-emerald-500 text-emerald-700 shadow-md" : i === selectedAnswer ? "bg-red-100 border-red-500 text-red-700" : "bg-white/50 text-slate-400 border-transparent")}>
                        <span className="flex-1 pr-4">{opt}</span> {selectedAnswer !== null && i === questions[currentQuestionIdx].correct && <CheckCircle2 className="shrink-0" size={20}/>}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 sm:mt-8 p-6 sm:p-8 bg-blue-50 rounded-[25px] sm:rounded-[35px] border border-blue-200 text-center shadow-inner">
                        <div className="bg-blue-600 inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase text-white mb-4 tracking-widest shadow-md">Analisis Akademik</div>
                        <p className="text-base sm:text-lg font-bold mb-6 italic text-blue-900 leading-relaxed">{questions[currentQuestionIdx].explanation}</p>
                        <button onClick={nextQuestion} className="w-full py-3 sm:py-4 bg-[#031466] text-white rounded-[15px] sm:rounded-[20px] font-black flex items-center justify-center gap-2 shadow-lg hover:bg-blue-800 transition-colors">
                          {currentQuestionIdx === 9 ? "CEK HASIL" : "LANJUT SOAL"} <ChevronRight />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center bg-white/80 rounded-[40px] sm:rounded-[60px] p-10 sm:p-20 border border-white backdrop-blur-xl max-w-2xl mx-auto shadow-2xl">
                <div className={cn("w-32 h-32 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center mx-auto border-[8px] sm:border-[10px] mb-8 bg-white shadow-xl", correctAnswers >= 8 ? "border-emerald-400 text-emerald-500" : "border-red-400 text-red-500")}>
                  <span className="text-5xl sm:text-7xl font-black">{correctAnswers * 10}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black italic mb-8 sm:mb-10 text-[#031466] uppercase tracking-tighter">{correctAnswers >= 8 ? "LEVEL BERHASIL DILEWATI!" : "BUTUH BELAJAR LAGI"}</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setActiveStage(null)} className="px-8 py-4 rounded-full bg-white border border-slate-200 font-black text-[#031466] uppercase text-[10px] sm:text-xs hover:bg-slate-50">Menu Utama</button>
                  <button onClick={() => { setIsFinished(false); setCurrentQuestionIdx(0); setCorrectAnswers(0); setSelectedAnswer(null); setShowExplanation(false); }} className={cn("px-8 py-4 rounded-full font-black text-white shadow-xl uppercase text-[10px] sm:text-xs", getLevelColor(currentLevel))}>
                    {correctAnswers >= 8 ? "Lanjut Level" : "Coba Ulang"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ROADMAP TRIGGER */}
        {!activeStage && (
          <motion.div whileHover={{ scale: 1.01 }} onClick={() => setIsMapExpanded(true)} className="mt-8 sm:mt-16 bg-gradient-to-r from-orange-400 to-amber-300 rounded-[35px] sm:rounded-[50px] p-6 sm:p-10 cursor-pointer shadow-2xl border-4 border-white flex items-center justify-between">
            <div className="text-[#031466]">
              <h3 className="text-2xl sm:text-4xl font-black italic mb-1 sm:mb-2 tracking-tighter uppercase">Peta Perjalanan</h3>
              <p className="text-xs sm:text-base font-bold flex items-center gap-2"><Map size={18}/> Lihat progres kamu di 500 Level</p>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/40 rounded-full flex items-center justify-center animate-bounce shadow-inner">
              <Sparkles className="text-[#031466]" size={36}/>
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= MODAL PETA 500 LEVEL ================= */}
      <AnimatePresence>
        {isMapExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8">
            <div className="absolute inset-0 bg-[#031466]/80 backdrop-blur-md" onClick={() => setIsMapExpanded(false)} />
            <div className="w-full h-full bg-[#8bc34a] sm:rounded-[60px] border-0 sm:border-[10px] border-white shadow-2xl relative overflow-hidden flex flex-col">
              <div className="p-6 sm:p-8 relative z-50 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b-4 border-white shadow-sm text-[#031466]">
                <h2 className="text-lg sm:text-3xl font-black italic flex items-center gap-2 sm:gap-3"><Map className="w-5 h-5 sm:w-8 sm:h-8" /> DESA BUBUL: 500 LEVELS</h2>
                <button onClick={() => setIsMapExpanded(false)} className="p-2 sm:p-3 bg-red-500 text-white rounded-full border-2 border-white shadow-lg hover:scale-110 transition-all"><X size={24} /></button>
              </div>
              <div ref={mapRef} className="flex-1 overflow-auto relative z-10 hide-scrollbar cursor-grab active:cursor-grabbing bg-[#aed581]">
                <div className="relative" style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}>
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                    <path d={`M 150,${MAP_HEIGHT / 2} ${Array.from({ length: TOTAL_LEVELS }).map((_, i) => `L ${i * NODE_SPACING + 150},${MAP_HEIGHT / 2 + Math.sin(i * 0.6) * AMPLITUDE}`).join(" ")}`} fill="none" stroke="#92400e" strokeWidth="60" strokeLinecap="round" opacity="0.3" />
                    <path d={`M 150,${MAP_HEIGHT / 2} ${Array.from({ length: TOTAL_LEVELS }).map((_, i) => `L ${i * NODE_SPACING + 150},${MAP_HEIGHT / 2 + Math.sin(i * 0.6) * AMPLITUDE}`).join(" ")}`} fill="none" stroke="#fcd34d" strokeWidth="15" strokeLinecap="round" strokeDasharray="20 20" />
                  </svg>
                  {Array.from({ length: TOTAL_LEVELS }).map((_, i) => {
                    const level = i + 1;
                    const xPos = i * NODE_SPACING + 150; 
                    const yPos = MAP_HEIGHT / 2 + Math.sin(i * 0.6) * AMPLITUDE;
                    const isReached = currentLevel >= level;
                    const isCurrent = currentLevel === level;
                    return (
                      <div key={level} className="absolute z-30" style={{ left: xPos, top: yPos, transform: 'translate(-50%, -50%)' }}>
                        <div className="relative flex flex-col items-center">
                          {currentLevel > level && (
                            <div className="absolute -top-12 flex gap-1 justify-center w-20">
                              <Assets.SolidStar className="w-5 h-5 drop-shadow-md" />
                              <Assets.SolidStar className="w-5 h-5 drop-shadow-md" />
                            </div>
                          )}
                          <div className={cn("relative transition-all duration-500", isReached ? "scale-100" : "scale-90 opacity-60")}>
                            <Assets.StoneBase />
                            <div className="absolute inset-0 flex items-center justify-center pt-2 font-black text-xl sm:text-2xl text-slate-700">
                              {isReached ? level : <Lock size={20} className="opacity-50" />}
                            </div>
                          </div>
                          {isCurrent && (
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-16 flex flex-col items-center">
                               <div className="bg-blue-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full shadow-lg border-2 border-white mb-2 uppercase tracking-tighter whitespace-nowrap">Posisi Kamu</div>
                               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-blue-400 shadow-xl flex items-center justify-center text-3xl sm:text-4xl">🫧</div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TesSimulasi;