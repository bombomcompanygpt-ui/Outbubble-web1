import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Heart, Sparkles, ShieldCheck, 
  Trash2, X, Send, Image as ImageIcon 
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

// --- PALET WARNA UNTUK PESAN ---
const BUBBLE_COLORS = [
  "bg-[#031466]", // Biru Tua Original
  "bg-[#1E3A8A]", // Blue 900
  "bg-[#312E81]", // Indigo 900
  "bg-[#4C1D95]", // Violet 900
  "bg-[#581C87]", // Purple 900
  "bg-[#1e1b4b]", // Deep Indigo
];

// --- ANIMASI BACKGROUND YANG TERLIHAT JELAS ---
const EnhancedBackground = () => {
  const [blobs, setBlobs] = useState<{ id: number; size: number; x: number; y: number; duration: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.2)', 'rgba(168, 85, 247, 0.15)'];
    const newBlobs = [...Array(10)].map((_, i) => ({
      id: i,
      size: Math.random() * 400 + 300, 
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20, 
      delay: Math.random() * -20,
      color: colors[i % colors.length]
    }));
    setBlobs(newBlobs);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#F0F4FF]">
      {/* Gelembung Cairan Background */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: blob.color,
            filter: 'blur(40px)', // Blur dikurangi agar bentuk gelembung nampak
            border: '1px solid rgba(255,255,255,0.3)'
          }}
          animate={{
            x: [0, 50, -50, 0], 
            y: [0, -50, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Overlay gradasi agar nampak "kedalaman" */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-blue-100/30" />
    </div>
  );
};

const Forum: React.FC = () => {
  const { topics, addTopic, toggleLikeTopic, deleteTopic, user, addReply } = useStore();
  const [newPost, setNewPost] = useState('');
  const [selectedLens, setSelectedLens] = useState<'Objektif' | 'Opini' | 'Eksperimen'>('Objektif');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [showCommentsId, setShowCommentsId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!newPost.trim() && !imagePreview) return;
    addTopic({
      id: Date.now().toString(),
      authorName: user?.username || "Explorer",
      authorId: user?.id || "uid-123",
      content: newPost,
      image: imagePreview || undefined,
      lens: selectedLens,
      likes: 0,
      replies: [],
      isLiked: false,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    setNewPost('');
    setImagePreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-32 font-sans relative px-4 overflow-x-hidden">
      <EnhancedBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="py-10 space-y-6 text-center md:text-left">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
            className="bg-[#031466] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <h2 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3 relative z-10">
              OutBubble <Sparkles className="text-yellow-400" />
            </h2>
            <p className="text-blue-200 font-medium relative z-10">Warna gelembungmu mencerminkan suaramu.</p>
          </motion.div>

          {/* Input */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[30px] p-6 shadow-xl border border-white">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Letupkan perspektifmu..."
              className="w-full text-lg bg-transparent outline-none resize-none text-[#031466] min-h-[60px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-xl text-slate-600 shadow-sm border">
                  <ImageIcon size={20} />
                </button>
                <input type="file" ref={fileInputRef} hidden accept=".jpg,.jpeg,.png" onChange={handleImageChange} />
              </div>
              <button onClick={handlePost} className="bg-[#031466] text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-transform">
                LETUPKAN!
              </button>
            </div>
          </div>
        </div>

        {/* Bubble Feed */}
        <div className="flex flex-col gap-12">
          {[...topics].reverse().map((topic, index) => {
            const isExpanded = expandedTopicId === topic.id;
            const isRight = index % 2 === 0;
            // Pilih warna berdasarkan index agar tiap pesan beda warna
            const bubbleColor = BUBBLE_COLORS[index % BUBBLE_COLORS.length];

            return (
              <div key={topic.id} className={cn("flex flex-col w-full", isRight ? "items-end" : "items-start")}>
                <motion.div
                  layout
                  onClick={() => !isExpanded && setExpandedTopicId(topic.id)}
                  className={cn(
                    "relative cursor-pointer transition-all duration-500 shadow-2xl border-[6px] border-white",
                    isExpanded 
                      ? "w-full rounded-[40px] p-8 bg-white text-[#031466]" 
                      : cn("w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center text-white", bubbleColor)
                  )}
                >
                  {!isExpanded ? (
                    <div className="text-center p-3">
                      <p className="text-[11px] font-bold line-clamp-2 italic px-2">"{topic.content}"</p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black">
                        <Heart size={12} fill="#ff4d4d" className="text-[#ff4d4d]" /> {topic.likes || 0}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full">{topic.lens}</span>
                        <button onClick={(e) => { e.stopPropagation(); setExpandedTopicId(null); }} className="text-slate-300 hover:text-red-500">
                          <X size={24} />
                        </button>
                      </div>
                      
                      {topic.image && <img src={topic.image} className="w-full max-h-80 object-cover rounded-[30px] mb-6 border shadow-sm" alt="post" />}
                      <p className="text-2xl font-bold leading-relaxed italic mb-8">"{topic.content}"</p>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <button onClick={(e) => { e.stopPropagation(); toggleLikeTopic(topic.id); }} className={cn("flex items-center gap-2 font-black", topic.isLiked ? "text-rose-500" : "text-slate-400")}>
                            <Heart size={26} fill={topic.isLiked ? "currentColor" : "none"} />
                            <span className="text-lg">{topic.likes || 0}</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setShowCommentsId(showCommentsId === topic.id ? null : topic.id); }} className="flex items-center gap-2 text-slate-400 font-black">
                            <MessageCircle size={26} />
                            <span className="text-lg">{topic.replies?.length || 0}</span>
                          </button>
                        </div>
                        {user?.id === topic.authorId && (
                          <button onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }} className="text-slate-300 hover:text-red-500"><Trash2 size={22} /></button>
                        )}
                      </div>

                      {/* Komentar Inline */}
                      <AnimatePresence>
                        {showCommentsId === topic.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 pt-6 border-t space-y-4">
                            {topic.replies?.map((reply: any) => (
                              <div key={reply.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ml-4 relative">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{reply.authorName}</p>
                                <p className="text-sm font-semibold">{reply.content}</p>
                              </div>
                            ))}
                            <div className="flex gap-2 pt-2">
                              <input 
                                value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Balas..." className="flex-1 bg-slate-100 px-4 py-2 rounded-xl outline-none text-sm font-bold" 
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if(!replyText.trim()) return;
                                  addReply(topic.id, { id: `r-${Date.now()}`, authorName: user?.username || "Explorer", content: replyText, createdAt: new Date().toISOString() });
                                  setReplyText('');
                                }}
                                className="bg-[#031466] text-white p-3 rounded-xl shadow-md"
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Forum;