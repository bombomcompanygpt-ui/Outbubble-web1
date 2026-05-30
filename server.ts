import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // API Route for Gemini Proxy
  app.post("/api/chat", async (req, res) => {
    const { contents } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      // Return a professional, smart, Bubul-themed mock reply so the chatbot works immediately after offline download!
      const userMessage = contents && contents.length > 0 
        ? contents[contents.length - 1].parts[0].text 
        : "";
      
      const textLower = userMessage.toLowerCase();
      let responseText = "";

      if (textLower.includes("filter bubble") || textLower.includes("gelembung")) {
        responseText = `Wah, hebat sekali kamu menanyakan tentang **Filter Bubble**! Di kehidupan nyata, netizen sering terisolasi dalam linimasa searah (seperti FYP TikTok atau konten X) karena algoritme terus memanjakan bias batin kita.
- **Isolasi Lini Masa**: Algoritme menyensor sudut pandang lain yang tidak kamu sukai agar kamu betah berlama-lama scrolling.
- **Kecanduan Dopamin**: Jempol kita dirancang untuk langsung klik tombol 'Suka' tanpa meneliti kebenarannya.
Untuk belajar lebih mendalam, yuk intip **M02: Filter Bubble** di tab **Materi** kita!
🫧 OutBubble Action: Carilah minimal 3 akun opini yang bertolak belakang dengan pandanganmu hari ini untuk meremajakan algoritmamu! 🫧`;
      } else if (textLower.includes("fyp") || textLower.includes("ads") || textLower.includes("attention") || textLower.includes("adiktif")) {
        responseText = `Hmm, kenapa ya FYP TikTok atau Reels Instagram bisa bikin candu sampai larat doomscrolling tengah malam? Jawabannya ada di **Attention Economy**!
- **Sistem Dopamin**: Desain scroll-infinite menyadap senyawa biokimia di otak kita, membuat kita lapar akan kejutan visual berikutnya.
- **Komersialisasi Atensi**: Atensimu adalah ladang uang bagi korporasi teknologi iklan. Semakin lama kamu menatap layar, semakin melimpah pemasukan mereka.
Dalami konsep mematikan ini di **Materi M01: Algoritma & Attention Economy**!
🫧 OutBubble Action: Batasi waktu media sosialmu maksimal 30 menit per sesi dan matikan semua notifikasi non-esensial hari ini! 🫧`;
      } else if (textLower.includes("echo chamber") || textLower.includes("kubu") || textLower.includes("politik") || textLower.includes("berantem")) {
        responseText = `Ah, fenomena **Echo Chamber** alias Ruang Gema adalah biang keladi kenapa netizen di kolom komentar sering sekali berantem saling tuding!
- **Komunitas Baperan**: Kita hanya berkumpul dengan orang-orang se-ideologi dan saling menggaungkan bias batin yang sama, sementara suara alternatif dianggap musuh.
- **Polarisasi Akut**: Akibatnya masyarakat terpecah-belah menjadi kubu biner yang ekstrem tanpa ada dialog jalan tengah.
Yuk baca rahasianya di **M03: Echo Chamber** di tab **Materi**!
🫧 OutBubble Action: Mulailah menyapa perdebatan dari sudut pandang netral di **Perspective Garden (Forum)** dan latih nalarmu! 🫧`;
      } else if (textLower.includes("bias") || textLower.includes("konfirmasi")) {
        responseText = `Aha! **Bias Konfirmasi** adalah kecenderungan otak kita untuk hanya menerima informasi yang mendukung opini pribadi kita yang sudah ada sebelumnya.
- **Penyaring Otomatis**: Kita gercep percaya hoaks jika hoaks itu menjelek-jelekkan kubu lawan, dan langsung skeptis pada fakta valid jika fakta itu membela kubu lawan.
- **Perangkap Mental**: Ini adalah jebakan psikologis alami yang diglorifikasi oleh algoritme manipulatif kosmis.
Biasakan berpikir skeptis yang sehat, pelajari teorinya langsung di **Materi M04: Fragmentasi Sosial**!
🫧 OutBubble Action: Tulis refleksimu di tab **Refleksi** hari ini untuk menjernihkan pikiran dari bias konfirmasi yang terselubung! 🫧`;
      } else if (textLower.includes("algoritma") || textLower.includes("cara kerja")) {
        responseText = `Membahas **cara kerja algoritme** memang seru sekaligus bergidik! Algoritme mencatat setiap detik jarimu berhenti pada suatu video, riwayat pencarian, bahkan chat intimmu.
- **Profiling Sempurna**: Data itu diolah secara real-time untuk membangun kepribadian digitalmu sehingga mereka tahu apa tombol emosimu.
- **Labirin Eksplorasi**: Buktikan sendiri dengan bereksperimen di tab **Simulasi & Tes** kami untuk mengamati bagaimana rekomendasi konten membelokkan opini warga Indonesia!
🫧 OutBubble Action: Reset history pencarian media sosialmu atau gunakan mode penyamaran secara berkala untuk merusak tracker mereka! 🫧`;
      } else {
        responseText = `Halo! Aku Bubul si gelembung asisten virtualmu! Pertanyaanmu sangat menarik untuk diulas dari kacamata literasi digital digital.
- **Waspadai Algoritma**: Di era digital sekarang, apa yang kita lihat di layar HP dikoordinasikan penuh oleh kepentingan retensi atensi.
- **Pecahkan Gelembungmu**: Jangan pasif menerima asupan informasi. Selalu saring, cek lintas platform, dan berdiskusilah dengan saksama.
Kamu bisa melatih pemahamanmu di menu **Tes & Simulasi** lengkap dengan kuis interaktif seru!
🫧 OutBubble Action: Mari berdiskusi aktif di **Perspective Garden** dan asah terus literasi digitalmu bersama Bubul! 🫧`;
      }

      return res.json({ text: responseText });
    }

    try {
      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let lastError: any = null;
      let generatedText = "";
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting generation with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: { 
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            }
          });
          
          if (response && response.text) {
            generatedText = response.text;
            console.log(`Successfully generated content using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or was unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!generatedText && lastError) {
        throw lastError;
      }

      res.json({ text: generatedText || "Aduh, sistem analisisku sedikit tersendat. Bisa kamu ulangi gejalanya? 🫧" });
    } catch (error: any) {
      console.error("Gemini API Error after all fallbacks:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // --- REAL-TIME IN-MEMORY FORUM DATA & BROADCAST SYSTEM ---
  interface Reply {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    avatarSeed?: string;
  }

  interface DiscussionTopic {
    id: string;
    title: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    image?: string;
    lens?: string;
    likes: number;
    repliesCount: number;
    replies?: Reply[];
    repostsCount: number;
    isLiked?: boolean;
    timestamp: number;
    createdAt?: string;
  }

  let serverTopics: DiscussionTopic[] = [
    {
      id: "s1",
      title: "",
      authorId: "uid-budi",
      authorName: "Ksatria_BebasBubble 🛡️",
      authorAvatar: "Felix",
      content: "Capek banget tiap perhelatan pemilu, timeline sosmed isinya adu domba melulu. Berasa warga dipecah belah sama algoritma buzzer 😭. Kayak di-lock dalam gelembung amarah.",
      lens: "Kritik",
      likes: 18,
      repliesCount: 2,
      repostsCount: 3,
      timestamp: Date.now() - 3600000 * 5,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      replies: [
        { id: "sr-1", authorName: "Pendeteksi_Bias 🧠", content: "Sama kak, mending ganti tab ke luar gelembung biar pencerahan.", createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), avatarSeed: "Buster" },
        { id: "sr-2", authorName: "Logika_Murni ⚖️", content: "Ini contoh nyata Filter Bubble dikombinasiin sama Echo Chamber. Ngeri pol!", createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(), avatarSeed: "Leo" }
      ]
    },
    {
      id: "s2",
      title: "",
      authorId: "uid-lisa",
      authorName: "Skeptis_Muda 🔍",
      authorAvatar: "Anika",
      content: "Guys, coba buktiin filter bubble kalian sekarang! Cari satu kata kunci kontroversial di Google/TikTok pake HP kalian, trus bandingin sama hasil pencarian di HP temen kalian yang beda kubu politik. Hasilnya beneran beda 180 derajat! Kita disuapin kenyataan yang beda.",
      lens: "Fakta",
      likes: 29,
      repliesCount: 1,
      repostsCount: 5,
      timestamp: Date.now() - 3600000 * 2,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      replies: [
        { id: "sr-3", authorName: "Gelembung_Pecah 🫧", content: "Gila gw baru coba td sore, hasilnya jomplang banget! Serem juga ya cara kerja mesin rekomendasi.", createdAt: new Date(Date.now() - 3600000).toISOString(), avatarSeed: "Daisy" }
      ]
    },
    {
      id: "s3",
      title: "",
      authorId: "uid-outb",
      authorName: "OutBubble_Inspirator ✨",
      authorAvatar: "Jack",
      content: "Pondasi utama negara demokrasi yang sehat di era modern itu bukan cuma kebebasan berpendapat, tapi LITERASI DIGITAL kritis. Tanpa itu, kita cuma jadi bidak catur yang digerakin algoritma pembuat emosi.",
      lens: "Harapan",
      likes: 42,
      repliesCount: 0,
      repostsCount: 12,
      timestamp: Date.now() - 1800000,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      replies: []
    }
  ];

  let sseClients: { id: number; res: any }[] = [];

  function broadcastTopics() {
    const jsonString = JSON.stringify({ type: "update", topics: serverTopics });
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${jsonString}\n\n`);
      } catch (err) {
        console.error("Error writing to client SSE", err);
      }
    });
  }

  // SSE connection stream
  app.get("/api/forum/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Establish connection & send initial topics list
    res.write(`data: ${JSON.stringify({ type: "init", topics: serverTopics })}\n\n`);

    const clientId = Date.now() + Math.random();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);
    console.log(`SSE client connected. Total clients: ${sseClients.length}`);

    req.on("close", () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`SSE client disconnected. Total clients: ${sseClients.length}`);
    });
  });

  // REST endpoints for discussions
  app.get("/api/forum/topics", (req, res) => {
    res.json(serverTopics);
  });

  app.post("/api/forum/topics", (req, res) => {
    const topic = req.body;
    const newTopic: DiscussionTopic = {
      id: topic.id || `s-${Date.now()}`,
      title: topic.title || "",
      authorId: topic.authorId || "anon",
      authorName: topic.authorName || "Anonymous",
      authorAvatar: topic.authorAvatar || "Guest",
      content: topic.content || "",
      image: topic.image,
      lens: topic.lens || "Opini",
      likes: 0,
      repliesCount: 0,
      replies: [],
      repostsCount: 0,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };
    serverTopics.unshift(newTopic);
    res.status(201).json(newTopic);
    broadcastTopics();
  });

  app.post("/api/forum/topics/:id/like", (req, res) => {
    const { id } = req.params;
    const { isLikedByMe } = req.body; // boolean
    let found = false;
    serverTopics = serverTopics.map(t => {
      if (t.id === id) {
        found = true;
        const currentLikes = t.likes || 0;
        return {
          ...t,
          likes: isLikedByMe ? Math.max(0, currentLikes - 1) : currentLikes + 1
        };
      }
      return t;
    });
    res.json({ success: found });
    if (found) broadcastTopics();
  });

  app.post("/api/forum/topics/:id/repost", (req, res) => {
    const { id } = req.params;
    let found = false;
    serverTopics = serverTopics.map(t => {
      if (t.id === id) {
        found = true;
        return { ...t, repostsCount: (t.repostsCount || 0) + 1 };
      }
      return t;
    });
    res.json({ success: found });
    if (found) broadcastTopics();
  });

  app.delete("/api/forum/topics/:id", (req, res) => {
    const { id } = req.params;
    const beforeCount = serverTopics.length;
    serverTopics = serverTopics.filter(t => t.id !== id);
    const success = beforeCount !== serverTopics.length;
    res.json({ success });
    if (success) broadcastTopics();
  });

  app.post("/api/forum/topics/:id/replies", (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;
    let found = false;
    serverTopics = serverTopics.map(t => {
      if (t.id === id) {
        found = true;
        const replies = t.replies || [];
        const newReply: Reply = {
          id: reply.id || `r-${Date.now()}`,
          authorName: reply.authorName || "Anonym",
          content: reply.content || "",
          createdAt: reply.createdAt || new Date().toISOString(),
          avatarSeed: reply.avatarSeed || "Felix"
        };
        return {
          ...t,
          replies: [newReply, ...replies],
          repliesCount: replies.length + 1
        };
      }
      return t;
    });
    res.json({ success: found });
    if (found) broadcastTopics();
  });

  app.delete("/api/forum/topics/:id/replies/:replyId", (req, res) => {
    const { id, replyId } = req.params;
    let found = false;
    serverTopics = serverTopics.map(t => {
      if (t.id === id) {
        found = true;
        const replies = (t.replies || []).filter(r => r.id !== replyId);
        return {
          ...t,
          replies: replies,
          repliesCount: replies.length
        };
      }
      return t;
    });
    res.json({ success: found });
    if (found) broadcastTopics();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
