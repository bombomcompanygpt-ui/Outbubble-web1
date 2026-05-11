import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Mail, Lock, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, User as UserType } from '../lib/store';
import { cn } from '../lib/utils';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const INITIAL_BADGES = [
    { id: 'bubble-breaker', name: 'Bubble Breaker', level: 1, icon: '🫧', description: 'Dari penyelesaian tes' },
    { id: 'open-mind', name: 'Open Mind', level: 1, icon: '🧠', description: 'Dari eksplorasi sisi Pro/Kontra' },
    { id: 'critical-thinker', name: 'Critical Thinker', level: 1, icon: '🧐', description: 'Dari kualitas jawaban refleksi' },
    { id: 'social-connector', name: 'Social Connector', level: 1, icon: '🤝', description: 'Dari keaktifan berdiskusi' },
    { id: 'anti-fragmenter', name: 'Anti-Fragmenter', level: 1, icon: '🛡️', description: 'Dari frekuensi bookmark' },
    { id: 'algorithm-aware', name: 'Algorithm Aware', level: 1, icon: '🤖', description: 'Dari skor simulasi algoritma' },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi loading
    setTimeout(() => {
      const mockUser: UserType = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: email.split('@')[0] || 'Siswa Kritis',
        email: email,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        bio: 'Siap memecahkan gelembung informasi!',
        level: 1,
        xp: 0,
        academicPoints: 0,
        socialPoints: 0,
        badges: INITIAL_BADGES,
        testStatus: {
          preTest: 'unlocked',
          assessment: 'locked',
          simulation: 'locked',
          postTest: 'locked',
        },
        scores: [],
        bookmarks: [],
        dailyChallenges: [
          { id: 'c1', text: 'Baca 1 modul materi', completed: false, xpReward: 20 },
          { id: 'c2', text: 'Eksplorasi 3 konten digital baru', completed: false, xpReward: 30 },
          { id: 'c3', text: 'Balas 1 diskusi di forum', completed: false, xpReward: 25 },
          { id: 'c4', text: 'Tulis 1 refleksi harian', completed: false, xpReward: 35 },
        ],
        reflections: [],
      };

      setUser(mockUser);
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#f8faff] overflow-hidden">
      {/* Background Animated Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, Math.sin(i) * 50, 0],
              y: [0, Math.cos(i) * 50, 0]
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute rounded-full bg-[#031466]/5 border border-[#031466]/10 backdrop-blur-sm"
            style={{ 
              width: 200 + i * 100, 
              height: 200 + i * 100,
              top: `${20 + i * 10}%`,
              left: `${10 + i * 15}%`
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(3,20,102,0.1)] border border-white p-8 md:p-10 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#b8c9ff] to-[#9ccfff] rounded-3xl flex items-center justify-center shadow-xl shadow-[#b8c9ff]/40 mb-6">
            <Globe className="text-[#031466] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[#031466] tracking-tight mb-2">
            {mode === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
          </h1>
          <p className="text-slate-500 text-center font-medium">
            {mode === 'login' 
              ? 'Masuk untuk lanjut memecahkan gelembung informasimu.' 
              : 'Daftar sekarang untuk memulai perjalanan literasi digitalmu.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#b8c9ff]/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold text-[#031466] outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Kata Sandi</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#b8c9ff]/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold text-[#031466] outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#031466] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#031466]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-center text-sm font-bold text-[#031466] hover:text-blue-600 transition-colors"
          >
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
          <Sparkles size={20} />
          <ShieldCheck size={20} />
          <User size={20} />
        </div>
        
        <p className="text-center text-[10px] text-slate-300 mt-6 font-bold uppercase tracking-[0.2em] opacity-60">
          Powered by OutBubble Literacy
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
