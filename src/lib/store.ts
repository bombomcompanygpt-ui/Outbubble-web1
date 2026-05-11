import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  level: number; // 1-15
  icon: string;
  description: string;
}

export interface DailyChallenge {
  id: string;
  text: string;
  completed: boolean;
  xpReward: number;
}

export interface Reflection {
  id: number;
  date: string;
  question: string;
  answer: string;
  moodLevel: number;
}

export interface Reply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface QuizResult {
  type: 'pre' | 'post' | 'quiz';
  score: number;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
  bio: string;
  level: number; // 1-100
  xp: number;
  academicPoints: number;
  socialPoints: number;
  badges: Badge[];
  testStatus: {
    preTest: 'locked' | 'unlocked' | 'completed';
    assessment: 'locked' | 'unlocked' | 'completed';
    simulation: 'locked' | 'unlocked' | 'completed';
    postTest: 'locked' | 'unlocked' | 'completed';
  };
  scores: {
    testId: string;
    score: number;
    timestamp: number;
  }[];
  bookmarks: string[];
  dailyChallenges: DailyChallenge[];
  reflections: Reflection[];
  avatarColor?: string;
  avatarType?: 'happy' | 'cool' | 'legend';
  selectedTheme?: string;
  selectedOrnament?: string;
  inventory?: string[];
  quizResults?: QuizResult[];
}

export interface DiscussionTopic {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  content: string;
  image?: string;
  lens?: 'Objektif' | 'Opini' | 'Eksperimen';
  likes: number;
  repliesCount: number;
  replies?: Reply[];
  repostsCount: number;
  isLiked?: boolean;
  timestamp: number;
  createdAt?: string;
}

interface AppState {
  user: User | null;
  sidebarOpen: boolean;
  themeMode: 'light' | 'dark';
  topics: DiscussionTopic[];
  reflections: Reflection[];
  quizResults: QuizResult[]; // Global quiz results if needed, or derived from user
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  addXP: (xp: number) => void;
  updateBadge: (badgeId: string, points: number) => void;
  completeTest: (testId: keyof User['testStatus'], score: number) => void;
  toggleBookmark: (contentId: string) => void;
  completeChallenge: (challengeId: string) => void;
  addReflection: (reflection: Reflection) => void;
  addTopic: (topic: Partial<DiscussionTopic>) => void;
  toggleLikeTopic: (topicId: string) => void;
  deleteTopic: (topicId: string) => void;
  repostTopic: (topicId: string) => void;
  addReply: (topicId: string, reply: Reply) => void;
  deleteReply: (topicId: string, replyId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  buyItem: (item: any) => void;
  playSound: (type: string) => void;
}

const INITIAL_BADGES: Badge[] = [
  { id: 'bubble-breaker', name: 'Bubble Breaker', level: 1, icon: '🫧', description: 'Dari penyelesaian tes' },
  { id: 'open-mind', name: 'Open Mind', level: 1, icon: '🧠', description: 'Dari eksplorasi sisi Pro/Kontra' },
  { id: 'critical-thinker', name: 'Critical Thinker', level: 1, icon: '🧐', description: 'Dari kualitas jawaban refleksi' },
  { id: 'social-connector', name: 'Social Connector', level: 1, icon: '🤝', description: 'Dari keaktifan berdiskusi' },
  { id: 'anti-fragmenter', name: 'Anti-Fragmenter', level: 1, icon: '🛡️', description: 'Dari frekuensi bookmark' },
  { id: 'algorithm-aware', name: 'Algorithm Aware', level: 1, icon: '🤖', description: 'Dari skor simulasi algoritma' },
];

const INITIAL_USER: User = {
  id: 'user-123',
  username: 'Siswa Kritis',
  email: 'siswa@outbubble.id',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
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
  quizResults: [],
  avatarColor: '#60a5fa',
  avatarType: 'happy',
  selectedTheme: 'bg-white',
  selectedOrnament: '',
  inventory: ['av-1', 'bg-white', 'orn-none'],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, // Mulai dengan null (tidak login)
      sidebarOpen: true,
      themeMode: 'light',
      topics: [
        { id: 't1', title: 'Kenapa FYP-ku isinya ini terus?', authorId: '1', authorName: 'Budi', content: 'Aku baru sadar kalau algoritma bener-bener ngebentuk pandanganku...', likes: 12, repliesCount: 3, repostsCount: 1, timestamp: Date.now() - 3600000 },
      ],
      reflections: [],
      quizResults: [],
      setUser: (user) => set({ user }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      addXP: (xp) => set((state) => {
        if (!state.user) return state;
        const newXP = state.user.xp + xp;
        const newLevel = Math.min(100, Math.floor(newXP / 100) + 1);
        return { user: { ...state.user, xp: newXP, level: newLevel } };
      }),
      updateBadge: (badgeId, points) => set((state) => {
        if (!state.user) return state;
        const newBadges = state.user.badges.map((b) => {
          if (b.id === badgeId) {
            const currentTotalPoints = (b.level - 1) * 50 + points; 
            const newLevel = Math.min(15, Math.floor(currentTotalPoints / 50) + 1);
            return { ...b, level: newLevel };
          }
          return b;
        });
        return { user: { ...state.user, badges: newBadges } };
      }),
      completeTest: (testId, score) => set((state) => {
        if (!state.user) return state;
        
        const newStatus = { ...state.user.testStatus };
        newStatus[testId] = 'completed';
        
        if (testId === 'preTest') newStatus.assessment = 'unlocked';
        if (testId === 'assessment') newStatus.simulation = 'unlocked';
        if (testId === 'simulation') newStatus.postTest = 'unlocked';

        const newScores = [...state.user.scores, { testId, score, timestamp: Date.now() }];
        
        let newTheme = state.themeMode;
        if (score > 50) {
          newTheme = 'light';
        }

        return { 
          user: { ...state.user, testStatus: newStatus, scores: newScores },
          themeMode: newTheme
        };
      }),
      toggleBookmark: (contentId) => set((state) => {
        if (!state.user) return state;
        const isBookmarked = state.user.bookmarks.includes(contentId);
        const newBookmarks = isBookmarked 
          ? state.user.bookmarks.filter(id => id !== contentId)
          : [...state.user.bookmarks, contentId];

        return { user: { ...state.user, bookmarks: newBookmarks } };
      }),
      completeChallenge: (challengeId) => set((state) => {
        if (!state.user) return state;
        const challenge = state.user.dailyChallenges.find(c => c.id === challengeId);
        if (!challenge || challenge.completed) return state;

        const newChallenges = state.user.dailyChallenges.map(c => 
          c.id === challengeId ? { ...c, completed: true } : c
        );

        const newXP = state.user.xp + challenge.xpReward;
        const newLevel = Math.min(100, Math.floor(newXP / 100) + 1);

        return { user: { ...state.user, dailyChallenges: newChallenges, xp: newXP, level: newLevel } };
      }),
      addReflection: (reflection) => set((state) => {
        const newReflections = [reflection, ...state.reflections];
        if (!state.user) return { reflections: newReflections };
        return {
          reflections: newReflections,
          user: {
            ...state.user,
            reflections: [reflection, ...(state.user.reflections || [])]
          }
        };
      }),
      addTopic: (topic) => set((state) => ({
        topics: [
          {
            id: `t-${Date.now()}`,
            title: topic.title || '',
            authorId: state.user?.id || 'anon',
            authorName: topic.authorName || state.user?.username || 'Anonymous',
            content: topic.content || '',
            likes: 0,
            repliesCount: 0,
            repostsCount: 0,
            isLiked: false,
            timestamp: Date.now(),
            ...topic
          },
          ...state.topics
        ]
      })),
      toggleLikeTopic: (topicId) => set((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { 
            ...t, 
            likes: t.isLiked ? t.likes - 1 : t.likes + 1, 
            isLiked: !t.isLiked 
          } : t
        )
      })),
      deleteTopic: (topicId) => set((state) => ({
        topics: state.topics.filter((t) => t.id !== topicId)
      })),
      repostTopic: (topicId) => set((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { ...t, repostsCount: (t.repostsCount || 0) + 1 } : t
        )
      })),
      addReply: (topicId, reply) => set((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { 
            ...t, 
            replies: [reply, ...(t.replies || [])],
            repliesCount: (t.repliesCount || 0) + 1
          } : t
        )
      })),
      deleteReply: (topicId, replyId) => set((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? {
            ...t,
            replies: (t.replies || []).filter(r => r.id !== replyId),
            repliesCount: Math.max(0, (t.repliesCount || 0) - 1)
          } : t
        )
      })),
      updateProfile: (updates) => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, ...updates } };
      }),
      buyItem: (item) => set((state) => {
        if (!state.user) return state;
        
        const isOwned = state.user.inventory?.includes(item.id);
        
        // Logika: cek harga dan level (jika belum punya)
        if (!isOwned) {
          if (state.user.xp < item.price || state.user.level < item.minLevel) {
            return state;
          }
        }

        const newXP = isOwned ? state.user.xp : state.user.xp - item.price;
        const newInventory = isOwned ? state.user.inventory : [...(state.user.inventory || []), item.id];
        
        const updates: Partial<User> = { xp: newXP, inventory: newInventory };

        if (item.id.startsWith('av-') || item.id.startsWith('m-') || item.id.startsWith('fl-') || item.id.startsWith('fs-')) {
          updates.avatarColor = item.color || updates.avatarColor;
          updates.avatarType = item.type || updates.avatarType;
          if (item.src) updates.photoUrl = item.src; 
        } else if (item.id.startsWith('bg-') || item.id.startsWith('th-')) {
          updates.selectedTheme = item.color || item.id;
        } else if (item.id.startsWith('orn-')) {
          updates.selectedOrnament = item.icon || '';
        }

        return { user: { ...state.user, ...updates } };
      }),
      playSound: (type) => {
        console.log('Playing sound effect:', type);
        // Implement audio logic if needed
      },
    }),
    {
      name: 'outbubble-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          if (persistedState.user) {
            persistedState = {
              ...persistedState,
              user: {
                ...INITIAL_USER,
                ...persistedState.user,
                dailyChallenges: persistedState.user.dailyChallenges || INITIAL_USER.dailyChallenges,
                badges: persistedState.user.badges || INITIAL_USER.badges,
                scores: persistedState.user.scores || [],
                bookmarks: persistedState.user.bookmarks || [],
              }
            };
          }
        }
        if (version < 2) {
          if (persistedState.user && persistedState.user.dailyChallenges) {
            const hasC4 = persistedState.user.dailyChallenges.some((c: any) => c.id === 'c4');
            if (!hasC4) {
              persistedState.user.dailyChallenges.push({ id: 'c4', text: 'Tulis 1 refleksi harian', completed: false, xpReward: 35 });
            }
          }
        }
        return persistedState;
      }
    }
  )
);
