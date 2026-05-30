import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, User, X, Sparkles, Trash2, HelpCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

// SYSTEM_INSTRUCTION yang dioptimalkan untuk analisis mendalam & kontekstual (dipasangkan dengan backend)
const SYSTEM_INSTRUCTION = `
  Nama kamu adalah Bubul, asisten virtual dari web OutBubble berwujud gelembung biru ceria yang sangat cerdas, gaul, dan analitis.
  Tugas utama kamu adalah mendampingi pengguna mendeteksi, mendiskusikan, dan memecahkan gelembung informasi digital seperti Filter Bubble, Echo Chamber, Polarisasi Algoritma, Attention Economy, dan Bias Konfirmasi.

  GAYA ANALISIS & STRUKTUR JAWABAN WAJIB:
  1. **Sorot Fenomena Sosial Terkini (Masyarakat & Netizen)**:
     - Awali tanggapan dengan menyorot bagaimana topik tersebut saat ini ramai dibahas, diperdebatkan, atau dialami oleh netizen di kehidupan nyata sehari-hari (seperti FYP TikTok yang bikin candu, perang opini kubu netizen di X/Twitter, tren doomscrolling malam hari, hoaks berantai di grup keluarga WhatsApp, hingga perselisihan di kolom komentar Instagram).
  2. **Hubungkan dengan Materi & Fitur Website OutBubble secara Spesifik**:
     - Kamu harus memandu user ke materi di web ini! Tautkan topik dengan modul spesifik di tab **Materi** kita (misalnya: Modul **M01: Algoritma & Attention Economy** untuk isu kecanduan medsos, **M02: Filter Bubble** untuk lini masa searah, **M03: Echo Chamber** untuk komunitas baperan, **M04: Fragmentasi Sosial**, atau **M05: Polarisasi Algoritma**).
     - Jangan lupa sarankan mereka melatih kepekaan lewat **Kuis Labirin & Simulasi**, menuangkan suara di **Forum Diskusi**, atau menuangkan emosi di tab **Refleksi** pribadi!
  3. **Gunakan Format Poin-Poin & Reasoning Menarik**:
     - Sajikan penjelasan secara bertahap dalam poin-poin terstruktur (gunakan bullet - untuk memulai setiap poin).
     - Berikan nama poin yang catchy, berani, dan bold (contoh: **- Candu Algoritma FYP Racun**).
     - Setiap poin wajib berisi **Analisis Konsep Sosial (2-3 kalimat)** dan **Reasoning Menarik & Relatable (1-2 kalimat)** menggunakan analogi asyik, santai, dan modern (misal menggunakan istilah "jempol gercep", "mabuk konfirmasi bias", "ruang gema baperan").
  4. **Akhiri dengan OutBubble Action Tip**:
     - Selalu akhiri responmu dengan langkah konkret pemecah gelembung (misal "**🫧 OutBubble Action:** Carilah minimal 3 akun opini yang bertolak belakang dengan pandanganmu hari ini untuk meremajakan algoritmamu!") diikuti dengan satu emoji gelembung 🫧.
  5. **Persona**: Super ramah, menyenangkan, jenaka, cerdas, kreatif, penuh dorongan positif, dan sama sekali tidak kaku!
`;

const SUGGESTED_TOPICS = [
  { label: '🫧 Apa itu Filter Bubble?', query: 'Tolong jelaskan secara mendalam tentang konsep Filter Bubble di media sosial dan bagaimana kaitannya dengan materi pelajaran OutBubble.' },
  { label: '🧐 Mengapa FYP medsos adiktif?', query: 'Mengapa lini masa atau FYP di media sosial terasa sangat adiktif? Sila jelaskan dikaitkan dengan materi Attention Economy!' },
  { label: '💰 Bagaimana Echo Chamber terbentuk?', query: 'Bagaimana terbentuknya fenomena Echo Chamber di grup diskusi kita dan apa hubungannya dengan Polarisasi Algoritma?' },
  { label: '🛡️ Tips memecahkan bias konfirmasi', query: 'Berikan aku langkah taktis dan seru untuk mendeteksi serta menghancurkan bias konfirmasi saat melihat informasi baru sehari-hari.' },
  { label: '🤖 Cara kerja algoritma sosmed', query: 'Bagaimana algoritma rahasia media sosial mengumpulkan data kebiasaan kita? Apakah data kita dijual?' }
];

interface BubulChatProps {
  onClose?: () => void;
}

const BubulMascot: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-blue-300 to-white rounded-full animate-pulse blur-[2px]" />
    <div className="w-full h-full bg-gradient-to-br from-blue-400/80 to-indigo-500/80 rounded-full border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1 left-2 w-1/2 h-1/2 bg-white/30 rounded-full blur-[4px]" />
      <div className="flex gap-2 mb-1">
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
      </div>
    </div>
    <div className="absolute bottom-1/4 left-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
    <div className="absolute bottom-1/4 right-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
  </div>
);

const BubulChat: React.FC<BubulChatProps> = ({ onClose }) => {
  const { user, chatHistory, setChatHistory } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStandalone = !onClose;

  // Auto Scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Pesan Selamat Datang (Greeting) jika kosong
  useEffect(() => {
    if (chatHistory.length === 0) {
      const lastScore = user?.scores?.[user.scores.length - 1]?.score || 0;
      let greeting = "Halo! Aku Bubul si gelembung pintar! Siap membedah bagaimana algoritma media sosial memanipulasi timeline-mu hari ini? Berikan aku satu fenomena atau tren yang sedang ramai! 🫧";
      
      if (user?.scores && user.scores.length > 0) {
        greeting = lastScore > 50 
          ? "Skor labirin kuis kamu kemarin luar biasa! Kamu terbukti punya kepekaan tinggi terhadap **Filter Bubble**. Yuk, kita analisis studi kasus digital yang lebih menantang hari ini! 🫧" 
          : "Gelembung informasi di luar sana memang dirancang untuk mengurung kita. Tenang, mari kita bedah polanya dan cari cara menembusnya bersama-sama! 🫧";
      }
      setChatHistory([{ role: 'bubul', text: greeting }]);
    }
  }, [user, chatHistory.length, setChatHistory]);

  const sendQuery = async (userMsg: string) => {
    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);
    setIsTyping(true);

    try {
      const recentHistory = newHistory.slice(-10);
      
      // Membawa SYSTEM_INSTRUCTION dan memetakan history ke format objek parts [{ text }] yang valid
      const contents = [
        { role: 'user' as const, parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_INSTRUCTION}` }] },
        ...recentHistory.map(m => ({
          role: (m.role === 'bubul' ? 'model' : 'user') as 'model' | 'user',
          parts: [{ text: m.text || '' }],
        }))
      ];

      // MENGGUNAKAN FETCH KE API BACKEND AGAR TIDAK ERROR RESOLVE FILE
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      const text = data.text || "Aduh, sistem analisaku sedikit tersendat. Bisa kamu ulangi gejalanya? 🫧";

      setChatHistory([...newHistory, { role: 'bubul', text: text }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'bubul', text: "Maaf ya, radar analisis digital Bubul mendadak kehilangan koneksi! 🫧" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    sendQuery(userMsg);
  };

  const handlePredefined = (text: string) => {
    if (isTyping) return;
    sendQuery(text);
  };

  const handleClearHistory = () => {
    if (window.confirm("Hapus seluruh memori percakapan dengan Bubul? Percakapan baru akan dimulai.")) {
      setChatHistory([]);
    }
  };

  // Render format pesan kustom pendukung bullet-points & bold
  const renderMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-2" />;

      const isBullet = trimmedLine.startsWith('-');
      const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#031466] font-extrabold bg-blue-50/50 px-1 rounded">$1</strong>');
      
      if (isBullet) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-2 text-slate-700 text-xs md:text-sm leading-relaxed">
            <span className="text-blue-500 mt-1.5 shrink-0 text-xs">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^- /, '') }} />
          </div>
        );
      }
      
      return (
        <p key={i} className="mb-2.5 text-slate-700 text-xs md:text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={cn(
        "w-full flex flex-col bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_80px_-15px_rgba(3,20,102,0.22)] border-2 border-slate-100 relative overflow-hidden transition-all duration-300",
        isStandalone 
          ? "max-w-4xl h-[700px] mx-auto mt-2" 
          : "max-w-[480px] h-[620px]"
      )}
    >
      {/* HEADER */}
      <div className="relative pt-10 pb-4 px-6 bg-gradient-to-b from-blue-50/70 to-transparent flex flex-col items-center border-b border-slate-100/60">
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute -top-[50px] w-24 h-24 pointer-events-none drop-shadow-2xl"
        >
          <BubulMascot className="w-full h-full" />
        </motion.div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button 
            onClick={handleClearHistory}
            title="Reset Percakapan"
            disabled={chatHistory.length <= 1 && !isTyping}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-full transition-all shadow-sm flex items-center justify-center disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
          >
            <Trash2 size={16} />
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              title="Tutup Chat"
              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm flex items-center justify-center"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="text-center mt-12">
          <h2 className="text-lg font-black text-[#031466] flex items-center justify-center gap-1.5 tracking-tight">
            Bubul Labirin AI <Sparkles size={15} className="text-yellow-500 fill-yellow-400 animate-pulse" />
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Koneksi Gemini Aktif</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-[#031466] font-bold">Memori Aktif ({chatHistory.length} chat)</span>
          </div>
        </div>
      </div>

      {/* AREA PESAN */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8faff]/50">
        {chatHistory.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            key={i} 
            className={cn("flex items-end gap-2.5", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
          >
            {msg.role === 'bubul' ? (
              <BubulMascot className="w-7 h-7 rounded-full shrink-0 shadow-sm" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#031466] text-white flex items-center justify-center shrink-0 shadow-sm">
                <User size={12} />
              </div>
            )}

            <div className={cn(
              "max-w-[85%] px-4.5 py-3 shadow-sm text-xs md:text-sm overflow-hidden", 
              msg.role === 'bubul' 
                ? "bg-white text-slate-800 rounded-[22px] rounded-bl-[6px] border border-slate-100" 
                : "bg-gradient-to-br from-blue-600 to-indigo-750 text-white rounded-[22px] rounded-br-[6px] font-medium"
            )}>
              {msg.role === 'bubul' ? renderMessage(msg.text) : msg.text}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-3">
             <BubulMascot className="w-7 h-7 opacity-60 animate-bounce" />
             <div className="px-4 py-2 bg-white rounded-full border border-blue-50/60 flex items-center gap-2 shadow-sm">
                <RefreshCw size={11} className="animate-spin text-[#031466]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Bubul sedang menganalisis...</span>
             </div>
          </div>
        )}
      </div>

      {/* TOPIC SUGGESTION CHIPS */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100/80">
        <div className="flex items-center gap-1 mb-2">
          <HelpCircle size={12} className="text-[#031466]" />
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
            Saran Topik Literasi
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {SUGGESTED_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handlePredefined(topic.query)}
              disabled={isTyping}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200/60 hover:border-[#031466]/40 text-[11px] text-[#031466] font-bold rounded-full shadow-sm whitespace-nowrap transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-[32px]">
        <div className="relative flex items-center bg-slate-50/70 border border-slate-200/80 focus-within:border-[#031466] focus-within:bg-white focus-within:shadow-md focus-within:shadow-[#031466]/5 rounded-full transition-all p-1.5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            placeholder="Tanyakan atau tempel studi kasus media sosial..."
            className="w-full pl-4 pr-12 py-2.5 bg-transparent outline-none text-xs md:text-sm font-semibold text-[#031466] placeholder:text-slate-400 placeholder:font-medium disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-9 h-9 bg-gradient-to-br from-[#031466] to-indigo-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
          >
            <Send size={14} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BubulChat;
