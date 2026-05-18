import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Proxy
  app.post("/api/chat", async (req, res) => {
    const { contents } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
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
