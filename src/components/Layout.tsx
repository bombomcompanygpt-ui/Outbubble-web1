import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home as HomeIcon,
  BookOpen,
  Zap,
  Layers,
  PenTool,
  MessageCircle,
  TrendingUp,
  User,
  MessageSquare,
  LogOut,
  Globe,
  X
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'framer-motion';

import Sidebar from './Sidebar';
import BubulChat from './BubulChat';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();
  const { user } = useStore();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#f8faff]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <motion.main 
        layout
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen relative"
      >
        {/* Floating Chatbot Bubul Toggle */}
        <div className="fixed bottom-8 right-28 z-50">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="w-16 h-16 bg-[#031466] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group relative"
          >
            {showChat ? <X size={28} /> : <MessageSquare size={28} />}
            <span className="absolute right-full mr-4 bg-white text-[#031466] px-4 py-2 rounded-2xl shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#b8c9ff]/30">
              {showChat ? 'Tutup Bubul' : 'Tanya Bubul! 🫧'}
            </span>
          </button>
        </div>

        {/* Chat Overlay */}
        <AnimatePresence>
          {showChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl"
              >
                <BubulChat onClose={() => setShowChat(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default Layout;
