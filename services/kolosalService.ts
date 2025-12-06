/**
 * Generates marketing copy using Kolosal AI (OpenAI-compatible endpoint).
 */
export const generateMarketingCopy = async (
  imageDescription: string, 
  apiKey: string
): Promise<string> => {
  const KOLOSAL_BASE_URL = "https://api.kolosal.ai/v1/chat/completions";

  if (!apiKey) {
    throw new Error("Kunci API Kolosal diperlukan.");
  }

  try {
    const response = await fetch(KOLOSAL_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "GLM 4.6",
        messages: [
          {
            role: "system",
            content: "Anda adalah 'Jago Konten AI'. Tugas Anda adalah membuat 3 variasi caption media sosial yang BERBEDA (misalnya: satu lucu, satu profesional, satu singkat) berdasarkan deskripsi visual produk. \n\nPENTING: Pisahkan setiap variasi konten dengan teks persis: '---BATAS_VARIASI---'. Jangan gunakan penomoran manual (1, 2, 3) di awal teks. Gunakan bahasa Indonesia yang menarik, emoji, dan hashtag."
          },
          {
            role: "user",
            content: `Buat materi pemasaran berdasarkan deskripsi visual ini: "${imageDescription}"`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      let errorMessage = `Status ${response.status}`;
      try {
        const rawText = await response.text();
        // Coba parse JSON error
        try {
            const errData = JSON.parse(rawText);
            if (errData?.error?.message) {
                errorMessage = errData.error.message;
            } else if (errData?.message) {
                errorMessage = errData.message;
            } else {
                // Jika JSON valid tapi tidak ada field error standar, gunakan raw jika pendek
                errorMessage = rawText.length < 200 ? rawText : `Error tidak diketahui (${response.status})`;
            }
        } catch {
            // Jika bukan JSON, gunakan raw text
            if (rawText) errorMessage = rawText.substring(0, 300); // Batasi panjang pesan
            else errorMessage = response.statusText || errorMessage;
        }
      } catch (e) {
          // Gagal membaca body
          errorMessage = response.statusText || errorMessage;
      }
      throw new Error(`Kolosal API Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Tidak ada konten yang dihasilkan.";

  } catch (error: any) {
    console.error("Kolosal Service Error:", error);
    // Lempar ulang error message saja agar bersih di UI
    throw new Error(error.message || "Gagal menghubungi layanan Kolosal AI.");
  }
};