import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: In a real production app, ensure your API_KEY is restricted or proxy calls through a backend.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image using Gemini to produce a descriptive text.
 * Uses gemini-2.5-flash as the modern replacement for gemini-pro-vision.
 */
export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    // Extract the base64 data strictly (remove data:image/png;base64, prefix if present)
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Deskripsikan gambar ini secara detail dan objektif. Fokus pada fitur visual utama, warna, suasana, dan objek yang terlihat. Deskripsi ini akan digunakan sebagai dasar untuk menulis materi pemasaran."
          }
        ]
      }
    });

    if (!response.text) {
      throw new Error("Gemini tidak mengembalikan teks deskripsi.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Gagal menganalisis gambar: ${error.message || "Unknown error"}`);
  }
};