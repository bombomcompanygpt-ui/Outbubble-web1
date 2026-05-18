import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, User, X, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

// BubulChat is now a client component calling a server API proxy

const SYSTEM_INSTRUCTION = `
  Nama kamu adalah Bubul, asisten virtual dari OutBubble berwujud gelembung ceria. 
  Tugas utama kamu membantu user memahami literasi digital (Filter Bubble, Echo Chamber, Fragmentasi Sosial).
  
  FORMAT JAWABAN:
  1. JANGAN gunakan paragraf panjang. Max 2-3 kalimat per pesan.
  2. Gunakan BULLET POINTS (-) jika ada poin penting.
  3. Gunakan BOLD (**) untuk kata kunci utama.
  4. Selalu akhiri kalimat yang antusias dengan emoji gelembung 🫧.
  5. Sapa user dengan ramah dan energik.
`;

interface BubulChatProps {
  onClose?: () => void;
}

const BubulMascot: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    {/* Body - Multi-layered bubble with glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-blue-300 to-white rounded-full animate-pulse blur-[2px]" />
    <div className="w-full h-full bg-gradient-to-br from-blue-400/80 to-indigo-500/80 rounded-full border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
      {/* Glossy highlight */}
      <div className="absolute top-1 left-2 w-1/2 h-1/2 bg-white/30 rounded-full blur-[4px]" />
      
      {/* Face */}
      <div className="flex gap-2 mb-1">
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
        <div className="w-3 h-3 bg-[#031466] rounded-full" />
      </div>
    </div>
    {/* Blushed cheeks */}
    <div className="absolute bottom-1/4 left-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
    <div className="absolute bottom-1/4 right-1/4 w-3 h-1.5 bg-pink-300/50 rounded-full blur-[1px]" />
  </div>
);

const BubulChat: React.FC<BubulChatProps> = ({ onClose }) => {
  const { user } = useStore();
  const [messages, setMessages] = useState<{ role: 'bubul' | 'user'; text: string }[]>(() => {
    const saved = localStorage.getItem('bubul_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto Scroll ke bawah
  useEffect(() => {
    localStorage.setItem('bubul_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Pesan Selamat Datang (Greeting)
  useEffect(() => {
    if (messages.length === 0) {
      const lastScore = user?.scores?.[user.scores.length - 1]?.score || 0;
      let greeting = "Halo! Aku Bubul si gelembung pintar! Siap bantu kamu pecahin gelembung filter hari ini? 🫧";
      
      if (user?.scores && user.scores.length > 0) {
        greeting = lastScore > 50 
          ? "Wah, skor kuis kamu kemarin keren banget! Kamu udah mulai kebal sama **filter bubble**. Ada yang mau diobrolin lagi? ✨" 
          : "Gelembung informasi emang kuat banget bikin kita bingung. Yuk, sini kita obrolin cara ngatasinnya! 🫧";
      }
      setMessages([{ role: 'bubul', text: greeting }]);
    }
  }, [user, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const contents = [...messages, { role: 'user', text: userMsg }].map(m => ({
        role: m.role === 'bubul' ? 'model' as const : 'user' as const,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const text = data.text || "Aduh, kepalaku pusing. Ulangi lagi dong... 🫧";
      setMessages(prev => [...prev, { role: 'bubul', text: text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bubul', text: "Maaf ya, koneksiku ke pusat pengetahuan sedang terputus! 🫧" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-[400px] h-[600px] flex flex-col bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_20px_60px_-15px_rgba(3,20,102,0.3)] border-4 border-white/50 relative overflow-visible mt-16"
    >
      {/* HEADER MELAYANG DENGAN MASKOT 
        Maskot menyembul keluar batas kotak
      */}
      <div className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-blue-100/50 to-transparent rounded-t-[36px] flex flex-col items-center">
        {/* Gambar Maskot Tanpa Background */}
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute -top-[70px] w-[120px] h-[120px] pointer-events-none drop-shadow-xl"
        >
          <BubulMascot className="w-full h-full" />
        </motion.div>

        {/* Tombol Close */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}

        <div className="text-center mt-2">
          <h2 className="text-xl font-black text-[#031466] flex items-center justify-center gap-1.5">
            Bubul AI <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Online & Siap Membantu</span>
          </div>
        </div>
      </div>

      {/* AREA PESAN */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={cn("flex items-end gap-2.5", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
          >
            {/* Ikon Pengguna / Maskot Kecil */}
            {msg.role === 'bubul' ? (
              <BubulMascot className="w-8 h-8 rounded-full shrink-0 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#031466] text-white flex items-center justify-center shrink-0 shadow-sm">
                <User size={14} />
              </div>
            )}

            {/* Bubble Pesan */}
            <div className={cn(
              "max-w-[75%] px-5 py-3.5 text-sm leading-relaxed shadow-md whitespace-pre-wrap font-medium", 
              msg.role === 'bubul' 
                ? "bg-white text-[#031466] rounded-[24px] rounded-bl-[8px] border border-blue-100" 
                : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[24px] rounded-br-[8px]"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        
        {/* Indikator Typing */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
               <BubulMascot className="w-8 h-8 opacity-50" />
               <div className="px-5 py-3 bg-white rounded-full border border-blue-100 flex items-center gap-2 shadow-sm">
                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Memproses...</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AREA INPUT (Gaya Modern) */}
      <div className="p-4 bg-white/50 backdrop-blur-md border-t border-slate-100 rounded-b-[36px]">
        <div className="relative flex items-center bg-white border-2 border-slate-100 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10 rounded-full transition-all p-1.5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanyakan sesuatu pada Bubul..."
            className="w-full pl-5 pr-14 py-3 bg-transparent outline-none text-sm font-semibold text-[#031466] placeholder:text-slate-300 placeholder:font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-gradient-to-br from-[#031466] to-blue-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Send size={16} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BubulChat;