import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini client setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  // API route
  app.post("/api/generate", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "需要提供會議內容。" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: "你是一個專業的會議祕書。請將使用者提供的「會議逐字稿」或「重點筆記」整理成結構化的「會議記錄」。\n\n請務必包含以下部分：\n1. 會議總結 (Meeting Summary)\n2. 討論重點 (Key Discussed Points)\n3. 待辦事項 (Action Items)\n4. 決策事項 (Decisions Made)\n\n此外，請將這份會議記錄翻譯成英文版本，呈現於中文版本之後。\n\n請以繁體中文輸出結構，並確保重點精煉，格式清晰。",
        }
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "無法生成會議記錄，請稍後再試。" });
    }
  });

  // Vite middleware
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
